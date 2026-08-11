import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/database.js';

const PORT = parseInt(env.PORT, 10) || 5000;

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to PostgreSQL database via Prisma');

    app.listen(PORT, () => {
      console.log(`ERP Backend Server listening on http://localhost:${PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();
