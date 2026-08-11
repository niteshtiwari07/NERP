import { challanRepo } from '../repositories/challan.repo.js';
import { ChallanStatus } from '../types/index.js';

export class ChallanService {
  async getChallans(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: ChallanStatus;
    customerId?: string;
  }) {
    return challanRepo.findAll(params);
  }

  async getChallanById(id: string) {
    const challan = await challanRepo.findById(id);
    if (!challan) {
      throw { statusCode: 404, message: 'Sales Challan not found', code: 'NOT_FOUND' };
    }
    return challan;
  }

  async createChallan(data: {
    customerId: string;
    createdBy: string;
    items: Array<{ productId: string; quantity: number }>;
  }) {
    return challanRepo.create(data);
  }

  async confirmChallan(id: string) {
    return challanRepo.confirmChallan(id);
  }

  async cancelChallan(id: string) {
    return challanRepo.cancelChallan(id);
  }
}

export const challanService = new ChallanService();
