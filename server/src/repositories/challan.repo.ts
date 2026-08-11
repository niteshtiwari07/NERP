import { prisma } from '../config/database.js';
import { Prisma } from '@prisma/client';
import { ChallanStatus, MovementType } from '../types/index.js';
import { generateChallanNumber } from '../utils/challanNumber.utils.js';

export class ChallanRepository {
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: ChallanStatus;
    customerId?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SalesChallanWhereInput = {};

    if (params.search) {
      where.OR = [
        { challanNumber: { contains: params.search } },
        { customer: { customerName: { contains: params.search } } },
        { customer: { businessName: { contains: params.search } } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    const [items, total] = await Promise.all([
      prisma.salesChallan.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: { id: true, customerName: true, businessName: true, mobile: true, email: true },
          },
          creator: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.salesChallan.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    return prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: true,
        creator: {
          select: { id: true, name: true, email: true, role: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, currentStock: true, warehouseLocation: true },
            },
          },
        },
      },
    });
  }

  async create(data: {
    customerId: string;
    createdBy: string;
    items: Array<{ productId: string; quantity: number }>;
  }) {
    return prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: data.customerId } });
      if (!customer) {
        throw { statusCode: 404, message: 'Customer not found', code: 'NOT_FOUND' };
      }

      const productIds = data.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        throw { statusCode: 400, message: 'One or more products were not found', code: 'PRODUCT_NOT_FOUND' };
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      let totalQuantity = 0;
      let totalAmount = 0;

      const itemsToCreate = data.items.map((item) => {
        const product = productMap.get(item.productId)!;
        const unitPriceNum = Number(product.unitPrice);
        const itemTotal = unitPriceNum * item.quantity;

        totalQuantity += item.quantity;
        totalAmount += itemTotal;

        return {
          productId: product.id,
          productNameSnapshot: product.name,
          skuSnapshot: product.sku,
          unitPriceSnapshot: product.unitPrice,
          quantity: item.quantity,
          total: itemTotal,
        };
      });

      const challanNumber = await generateChallanNumber();

      const challan = await tx.salesChallan.create({
        data: {
          challanNumber,
          customerId: data.customerId,
          status: ChallanStatus.DRAFT,
          totalQuantity,
          totalAmount,
          createdBy: data.createdBy,
          items: {
            create: itemsToCreate,
          },
        },
        include: {
          customer: true,
          creator: { select: { id: true, name: true, email: true } },
          items: true,
        },
      });

      return challan;
    });
  }

  async confirmChallan(id: string) {
    return prisma.$transaction(async (tx) => {
      const challan = await tx.salesChallan.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!challan) {
        throw { statusCode: 404, message: 'Sales Challan not found', code: 'NOT_FOUND' };
      }

      if (challan.status !== ChallanStatus.DRAFT) {
        throw {
          statusCode: 400,
          message: `Only DRAFT challans can be confirmed. Current status: ${challan.status}`,
          code: 'INVALID_STATUS',
        };
      }

      const stockErrors: string[] = [];

      for (const item of challan.items) {
        const freshProduct = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!freshProduct) {
          stockErrors.push(`Product ${item.productNameSnapshot} (SKU: ${item.skuSnapshot}) does not exist.`);
          continue;
        }

        if (freshProduct.currentStock < item.quantity) {
          stockErrors.push(
            `Insufficient stock for ${freshProduct.name} (SKU: ${freshProduct.sku}). Required: ${item.quantity}, Available: ${freshProduct.currentStock}`
          );
        }
      }

      if (stockErrors.length > 0) {
        throw {
          statusCode: 400,
          message: stockErrors.join('; '),
          code: 'INSUFFICIENT_STOCK',
        };
      }

      for (const item of challan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            movementType: MovementType.OUT,
            reason: `Sales Challan Confirmation (${challan.challanNumber})`,
            createdBy: challan.createdBy,
          },
        });
      }

      const updatedChallan = await tx.salesChallan.update({
        where: { id },
        data: {
          status: ChallanStatus.CONFIRMED,
        },
        include: {
          customer: true,
          creator: { select: { id: true, name: true, email: true } },
          items: true,
        },
      });

      return updatedChallan;
    });
  }

  async cancelChallan(id: string) {
    const challan = await prisma.salesChallan.findUnique({ where: { id } });
    if (!challan) {
      throw { statusCode: 404, message: 'Sales Challan not found', code: 'NOT_FOUND' };
    }

    if (challan.status === ChallanStatus.CANCELLED) {
      throw { statusCode: 400, message: 'Challan is already cancelled', code: 'ALREADY_CANCELLED' };
    }

    return prisma.salesChallan.update({
      where: { id },
      data: { status: ChallanStatus.CANCELLED },
      include: {
        customer: true,
        creator: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });
  }
}

export const challanRepo = new ChallanRepository();
