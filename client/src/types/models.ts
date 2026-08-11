import type { Role } from './auth';

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface CustomerFollowUp {
  id: string;
  customerId: string;
  note: string;
  followUpDate: string;
  createdBy: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface Customer {
  id: string;
  customerName: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  followUps?: CustomerFollowUp[];
  challans?: Array<{
    id: string;
    challanNumber: string;
    status: ChallanStatus;
    totalQuantity: number;
    totalAmount: number;
    createdAt: string;
  }>;
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  movementType: MovementType;
  reason: string;
  createdBy: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouseLocation: string;
  createdAt: string;
  updatedAt: string;
  stockMovements?: StockMovement[];
}

export interface SalesChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  total: number;
  product?: Product;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer?: Customer;
  status: ChallanStatus;
  totalQuantity: number;
  totalAmount: number;
  createdBy: string;
  creator?: {
    id: string;
    name: string;
    email: string;
    role?: Role;
  };
  items?: SalesChallanItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  stats: {
    totalCustomers: number;
    activeCustomers: number;
    totalProducts: number;
    lowStockProductsCount: number;
    totalChallans: number;
    draftChallans: number;
    confirmedChallans: number;
  };
  recentChallans: SalesChallan[];
  lowStockProducts: Product[];
  upcomingFollowUps: Customer[];
}
