import { PrismaClient, Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data in reverse order of dependencies
  await prisma.salesChallanItem.deleteMany();
  await prisma.salesChallan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.customerFollowUp.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const commonPasswordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Users for all 4 Roles
  console.log('👤 Creating users...');
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: commonPasswordHash,
      role: Role.ADMIN,
    },
  });

  const sales = await prisma.user.create({
    data: {
      name: 'Sales Manager',
      email: 'sales@example.com',
      passwordHash: commonPasswordHash,
      role: Role.SALES,
    },
  });

  const warehouse = await prisma.user.create({
    data: {
      name: 'Warehouse Supervisor',
      email: 'warehouse@example.com',
      passwordHash: commonPasswordHash,
      role: Role.WAREHOUSE,
    },
  });

  const accounts = await prisma.user.create({
    data: {
      name: 'Accounts Specialist',
      email: 'accounts@example.com',
      passwordHash: commonPasswordHash,
      role: Role.ACCOUNTS,
    },
  });

  // 2. Create Customers
  console.log('🏢 Creating customers...');
  const customer1 = await prisma.customer.create({
    data: {
      customerName: 'Rajesh Sharma',
      mobile: '+919876543210',
      email: 'rajesh@apexdistributors.com',
      businessName: 'Apex Distributors Ltd',
      gstNumber: '27AABCA12341Z1',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Plot 45, Industrial Area Phase 1, Mumbai, Maharashtra 400001',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() + 86400000 * 3), // 3 days in future
      notes: 'Key distributor interested in bulk industrial power tools.',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      customerName: 'Priya Patel',
      mobile: '+919812345678',
      email: 'priya@techmart.in',
      businessName: 'TechMart Wholesale Solutions',
      gstNumber: '24BBBCD56782Z2',
      customerType: CustomerType.WHOLESALE,
      address: 'Unit 12, Commerce Tower, Ahmedabad, Gujarat 380009',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() + 86400000 * 1), // Tomorrow
      notes: 'Requires weekly supply of electronic components.',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      customerName: 'Suresh Kumar',
      mobile: '+919711223344',
      email: 'suresh@cityhardware.com',
      businessName: 'City Retail Hardware',
      gstNumber: '07CCCDE90123Z3',
      customerType: CustomerType.RETAIL,
      address: 'Shop 8, Main Market, Lajpat Nagar, New Delhi 110024',
      status: CustomerStatus.LEAD,
      followUpDate: new Date(Date.now() + 86400000 * 5),
      notes: 'Lead requested catalog and discount tier matrix.',
    },
  });

  // 3. Create Follow-up records
  console.log('📞 Creating customer follow-ups...');
  await prisma.customerFollowUp.create({
    data: {
      customerId: customer1.id,
      note: 'Initial phone call completed. Shared standard rate card.',
      followUpDate: new Date(Date.now() - 86400000 * 2),
      createdBy: sales.id,
    },
  });

  await prisma.customerFollowUp.create({
    data: {
      customerId: customer1.id,
      note: 'Scheduled site visit for next quarter procurement discussion.',
      followUpDate: new Date(Date.now() + 86400000 * 3),
      createdBy: sales.id,
    },
  });

  // 4. Create Products
  console.log('📦 Creating products & inventory...');
  const prod1 = await prisma.product.create({
    data: {
      name: 'Industrial Heavy-Duty Drill 800W',
      sku: 'SKU-DRL-800',
      category: 'Power Tools',
      unitPrice: 3499.50,
      currentStock: 45,
      minimumStock: 10,
      warehouseLocation: 'Bay A-12',
    },
  });

  const prod2 = await prisma.product.create({
    data: {
      name: 'Precision Digital Multimeter Pro',
      sku: 'SKU-MM-PRO',
      category: 'Electronics',
      unitPrice: 1250.00,
      currentStock: 3, // LOW STOCK TRIGGER!
      minimumStock: 15,
      warehouseLocation: 'Bay B-04',
    },
  });

  const prod3 = await prisma.product.create({
    data: {
      name: 'High-Impact Safety Helmet (Yellow)',
      sku: 'SKU-SF-HLM',
      category: 'Safety Equipment',
      unitPrice: 450.00,
      currentStock: 120,
      minimumStock: 25,
      warehouseLocation: 'Rack C-01',
    },
  });

  const prod4 = await prisma.product.create({
    data: {
      name: 'Stainless Steel Angle Grinder 4-Inch',
      sku: 'SKU-GRD-100',
      category: 'Power Tools',
      unitPrice: 2890.00,
      currentStock: 2, // LOW STOCK TRIGGER!
      minimumStock: 5,
      warehouseLocation: 'Bay A-18',
    },
  });

  // 5. Create Stock Movement History
  console.log('🔄 Creating initial stock movements...');
  await prisma.stockMovement.create({
    data: {
      productId: prod1.id,
      quantity: 50,
      movementType: MovementType.IN,
      reason: 'Initial Vendor Shipment Batch #89',
      createdBy: warehouse.id,
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: prod2.id,
      quantity: 15,
      movementType: MovementType.IN,
      reason: 'Opening Inventory Stock',
      createdBy: warehouse.id,
    },
  });

  // 6. Create Sales Challans (One Confirmed, One Draft)
  console.log('📋 Creating sales challans...');
  
  // Confirmed Challan
  const challan1 = await prisma.salesChallan.create({
    data: {
      challanNumber: 'SC-2026-0001',
      customerId: customer1.id,
      status: ChallanStatus.CONFIRMED,
      totalQuantity: 5,
      totalAmount: 17497.50,
      createdBy: sales.id,
      items: {
        create: [
          {
            productId: prod1.id,
            productNameSnapshot: prod1.name,
            skuSnapshot: prod1.sku,
            unitPriceSnapshot: prod1.unitPrice,
            quantity: 5,
            total: 17497.50,
          },
        ],
      },
    },
  });

  // Log movement for confirmed challan
  await prisma.stockMovement.create({
    data: {
      productId: prod1.id,
      quantity: 5,
      movementType: MovementType.OUT,
      reason: `Sales Challan Confirmation (${challan1.challanNumber})`,
      createdBy: sales.id,
    },
  });

  // Draft Challan
  await prisma.salesChallan.create({
    data: {
      challanNumber: 'SC-2026-0002',
      customerId: customer2.id,
      status: ChallanStatus.DRAFT,
      totalQuantity: 10,
      totalAmount: 12500.00,
      createdBy: sales.id,
      items: {
        create: [
          {
            productId: prod2.id,
            productNameSnapshot: prod2.name,
            skuSnapshot: prod2.sku,
            unitPriceSnapshot: prod2.unitPrice,
            quantity: 10,
            total: 12500.00,
          },
        ],
      },
    },
  });

  console.log('✅ Database seeding finished successfully!');
  console.log('🔑 Test Credentials:');
  console.log('   Admin:      admin@example.com     / Password123!');
  console.log('   Sales:      sales@example.com     / Password123!');
  console.log('   Warehouse:  warehouse@example.com / Password123!');
  console.log('   Accounts:   accounts@example.com  / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
