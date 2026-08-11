import { prisma } from '../config/database.js';

export const generateChallanNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = `SC-${year}-`;

  const latestChallan = await prisma.salesChallan.findFirst({
    where: {
      challanNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      challanNumber: true,
    },
  });

  if (!latestChallan) {
    return `${prefix}0001`;
  }

  const parts = latestChallan.challanNumber.split('-');
  const lastSeqStr = parts[parts.length - 1];
  const lastSeq = parseInt(lastSeqStr, 10);
  const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;

  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
};
