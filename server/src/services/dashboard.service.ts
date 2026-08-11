import { prisma } from '../config/database.js';
import { CustomerStatus, ChallanStatus } from '../types/index.js';

export class DashboardService {
  async getDashboardStats() {
    const [
      totalCustomers,
      activeCustomers,
      totalProducts,
      allProducts,
      totalChallans,
      draftChallans,
      confirmedChallans,
      recentChallans,
      upcomingFollowUps,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: CustomerStatus.ACTIVE } }),
      prisma.product.count(),
      prisma.product.findMany({ select: { id: true, name: true, sku: true, currentStock: true, minimumStock: true, warehouseLocation: true } }),
      prisma.salesChallan.count(),
      prisma.salesChallan.count({ where: { status: ChallanStatus.DRAFT } }),
      prisma.salesChallan.count({ where: { status: ChallanStatus.CONFIRMED } }),
      prisma.salesChallan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, customerName: true, businessName: true } },
        },
      }),
      prisma.customer.findMany({
        where: {
          followUpDate: {
            not: null,
            gte: new Date(),
          },
        },
        take: 5,
        orderBy: { followUpDate: 'asc' },
        select: {
          id: true,
          customerName: true,
          businessName: true,
          mobile: true,
          followUpDate: true,
          status: true,
        },
      }),
    ]);

    const lowStockProducts = allProducts.filter((p) => p.currentStock <= p.minimumStock);

    return {
      stats: {
        totalCustomers,
        activeCustomers,
        totalProducts,
        lowStockProductsCount: lowStockProducts.length,
        totalChallans,
        draftChallans,
        confirmedChallans,
      },
      recentChallans,
      lowStockProducts: lowStockProducts.slice(0, 5),
      upcomingFollowUps,
    };
  }
}

export const dashboardService = new DashboardService();
