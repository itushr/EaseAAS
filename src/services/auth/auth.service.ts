import bcrypt from 'bcryptjs';
import { authRepository, AuthRepository } from './auth.repository';
import {
  validateRegister,
  validateLogin,
  validateSetUsername,
  RegisterInput,
  LoginInput,
} from './auth.validator';
import { signToken } from '@/src/lib/jwt';
import { setAuthCookie, removeAuthCookie } from '@/src/lib/cookie';
import { User, Tenant } from '@prisma/client';

export interface AuthResult {
  user: User & { tenant?: Tenant | null };
  token: string;
}

export class AuthService {
  constructor(private readonly repository: AuthRepository = authRepository) {}

  async register(
    input: RegisterInput,
    rawDomain?: string | null
  ): Promise<AuthResult> {
    const validated = validateRegister(input);
    const domain = (rawDomain || 'localhost').toLowerCase().trim();

    const tenant = await this.repository.findOrCreateTenant(domain);

    if (validated.email) {
      const existingEmail = await this.repository.findUserByEmail(validated.email);
      if (existingEmail) {
        throw new Error('Email is already registered');
      }
    }

    if (validated.username) {
      const existingUsername = await this.repository.findUserByUsername(validated.username);
      if (existingUsername) {
        throw new Error('Username is already taken');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    const user = await this.repository.createUser({
      tenantId: tenant.id,
      email: validated.email,
      username: validated.username ?? null,
      passwordHash,
      domain: tenant.domain,
      emailVerified: true,
      data: {},
    });

    const token = signToken({
      userId: user.id,
      tenantId: user.tenantId,
      domain: user.domain,
    });

    try {
      await setAuthCookie(token);
    } catch {}

    return { user, token };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const validated = validateLogin(input);

    const user = await this.repository.findUserByIdentifier(validated.identifier);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    await this.repository.updateLastLogin(user.id);

    const token = signToken({
      userId: user.id,
      tenantId: user.tenantId,
      domain: user.domain,
    });

    try {
      await setAuthCookie(token);
    } catch {}

    return { user, token };
  }

  async logout(): Promise<boolean> {
    try {
      await removeAuthCookie();
    } catch {}
    return true;
  }

  async me(userId: string | null | undefined): Promise<(User & { tenant?: Tenant | null }) | null> {
    if (!userId) {
      return null;
    }
    return this.repository.findUserById(userId);
  }

  async setUsername(userId: string, rawUsername: string): Promise<User & { tenant?: Tenant | null }> {
    const validated = validateSetUsername({ username: rawUsername });

    const existing = await this.repository.findUserByUsername(validated.username);
    if (existing && existing.id !== userId) {
      throw new Error('Username is already taken');
    }

    return this.repository.updateUser(userId, {
      username: validated.username,
    });
  }
}

export const authService = new AuthService();
