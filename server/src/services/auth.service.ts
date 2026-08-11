import { userRepo } from '../repositories/user.repo.js';
import { hashPassword, comparePassword } from '../utils/password.utils.js';
import { generateToken } from '../utils/jwt.utils.js';
import { Role } from '../types/index.js';

export class AuthService {
  async register(data: { name: string; email: string; password: string; role?: Role }) {
    const existingUser = await userRepo.findByEmail(data.email);
    if (existingUser) {
      throw { statusCode: 400, message: 'Email already registered', code: 'DUPLICATE_EMAIL' };
    }

    const passwordHash = await hashPassword(data.password);
    const user = await userRepo.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role || Role.SALES,
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await userRepo.findByEmail(data.email);
    if (!user) {
      throw { statusCode: 401, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' };
    }

    const isMatch = await comparePassword(data.password, user.passwordHash);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' };
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async getCurrentUser(id: string) {
    const user = await userRepo.findById(id);
    if (!user) {
      throw { statusCode: 404, message: 'User not found', code: 'NOT_FOUND' };
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
