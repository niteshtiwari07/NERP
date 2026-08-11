import { prisma } from '../config/database.js';
import { Product, Prisma } from '@prisma/client';
import { MovementType } from '../types/index.js';

export class ProductRepository {
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    lowStockOnly?: boolean;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { sku: { contains: params.search } },
        { category: { contains: params.search } },
        { warehouseLocation: { contains: params.search } },
      ];
    }

    if (params.category) {
      where.category = params.category;
    }

    const items = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    let filteredItems = items;
    if (params.lowStockOnly) {
      filteredItems = items.filter((p) => p.currentStock <= p.minimumStock);
    }

    const total = filteredItems.length;
    const paginatedItems = filteredItems.slice(skip, skip + limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          include: {
            creator: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
  }

  async findBySku(sku: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { sku },
    });
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({
      data,
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  async addStockMovement(data: {
    productId: string;
    quantity: number;
    movementType: MovementType;
    reason: string;
    createdBy: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        throw { statusCode: 404, message: 'Product not found', code: 'NOT_FOUND' };
      }

      let newStock = product.currentStock;
      if (data.movementType === MovementType.IN) {
        newStock += data.quantity;
      } else {
        if (product.currentStock < data.quantity) {
          throw {
            statusCode: 400,
            message: `Insufficient stock for product ${product.name} (SKU: ${product.sku}). Available: ${product.currentStock}, Requested OUT: ${data.quantity}`,
            code: 'INSUFFICIENT_STOCK',
          };
        }
        newStock -= data.quantity;
      }

      const updatedProduct = await tx.product.update({
        where: { id: data.productId },
        data: { currentStock: newStock },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId: data.productId,
          quantity: data.quantity,
          movementType: data.movementType,
          reason: data.reason,
          createdBy: data.createdBy,
        },
        include: {
          creator: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return { product: updatedProduct, movement };
    });
  }

  async getStockMovements(productId: string) {
    return prisma.stockMovement.findMany({
      where: { productId },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const productRepo = new ProductRepository();
