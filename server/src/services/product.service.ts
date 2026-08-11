import { productRepo } from '../repositories/product.repo.js';
import { MovementType } from '../types/index.js';

export class ProductService {
  async getProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    lowStockOnly?: boolean;
  }) {
    return productRepo.findAll(params);
  }

  async getProductById(id: string) {
    const product = await productRepo.findById(id);
    if (!product) {
      throw { statusCode: 404, message: 'Product not found', code: 'NOT_FOUND' };
    }
    return product;
  }

  async createProduct(data: any) {
    const existing = await productRepo.findBySku(data.sku);
    if (existing) {
      throw { statusCode: 400, message: `Product with SKU '${data.sku}' already exists`, code: 'DUPLICATE_SKU' };
    }
    return productRepo.create(data);
  }

  async updateProduct(id: string, data: any) {
    await this.getProductById(id);
    if (data.sku) {
      const existing = await productRepo.findBySku(data.sku);
      if (existing && existing.id !== id) {
        throw { statusCode: 400, message: `Product with SKU '${data.sku}' already exists`, code: 'DUPLICATE_SKU' };
      }
    }
    return productRepo.update(id, data);
  }

  async recordStockMovement(
    productId: string,
    quantity: number,
    movementType: MovementType,
    reason: string,
    userId: string
  ) {
    return productRepo.addStockMovement({
      productId,
      quantity,
      movementType,
      reason,
      createdBy: userId,
    });
  }

  async getStockMovements(productId: string) {
    await this.getProductById(productId);
    return productRepo.getStockMovements(productId);
  }
}

export const productService = new ProductService();
