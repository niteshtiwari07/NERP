import { prisma } from '../config/database.js';
import { Customer, Prisma } from '@prisma/client';
import { CustomerType, CustomerStatus } from '../types/index.js';

export class CustomerRepository {
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: CustomerStatus;
    type?: CustomerType;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};

    if (params.search) {
      where.OR = [
        { customerName: { contains: params.search } },
        { businessName: { contains: params.search } },
        { email: { contains: params.search } },
        { mobile: { contains: params.search } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.type) {
      where.customerType = params.type;
    }

    const [items, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
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
    return prisma.customer.findUnique({
      where: { id },
      include: {
        followUps: {
          include: {
            creator: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        challans: {
          select: {
            id: true,
            challanNumber: true,
            status: true,
            totalQuantity: true,
            totalAmount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
    return prisma.customer.create({
      data,
    });
  }

  async update(id: string, data: Prisma.CustomerUpdateInput): Promise<Customer> {
    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  async addFollowUp(data: {
    customerId: string;
    note: string;
    followUpDate: Date;
    createdBy: string;
  }) {
    const [followUp] = await prisma.$transaction([
      prisma.customerFollowUp.create({
        data,
        include: {
          creator: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.customer.update({
        where: { id: data.customerId },
        data: { followUpDate: data.followUpDate },
      }),
    ]);
    return followUp;
  }
}

export const customerRepo = new CustomerRepository();
