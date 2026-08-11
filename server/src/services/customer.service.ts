import { customerRepo } from '../repositories/customer.repo.js';
import { CustomerStatus, CustomerType } from '../types/index.js';

export class CustomerService {
  async getCustomers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: CustomerStatus;
    type?: CustomerType;
  }) {
    return customerRepo.findAll(params);
  }

  async getCustomerById(id: string) {
    const customer = await customerRepo.findById(id);
    if (!customer) {
      throw { statusCode: 404, message: 'Customer not found', code: 'NOT_FOUND' };
    }
    return customer;
  }

  async createCustomer(data: any) {
    if (data.followUpDate) {
      data.followUpDate = new Date(data.followUpDate);
    }
    return customerRepo.create(data);
  }

  async updateCustomer(id: string, data: any) {
    await this.getCustomerById(id);
    if (data.followUpDate) {
      data.followUpDate = new Date(data.followUpDate);
    }
    return customerRepo.update(id, data);
  }

  async addFollowUp(customerId: string, note: string, followUpDateStr: string, userId: string) {
    await this.getCustomerById(customerId);
    const followUpDate = new Date(followUpDateStr);

    return customerRepo.addFollowUp({
      customerId,
      note,
      followUpDate,
      createdBy: userId,
    });
  }
}

export const customerService = new CustomerService();
