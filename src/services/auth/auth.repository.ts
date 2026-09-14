import prisma from '@/src/db';
import { User, Tenant, Prisma } from '@prisma/client';

export class AuthRepository {
  async findTenantById(id: string): Promise<Tenant | null> {
    return prisma.tenant.findUnique({
      where: { id },
    });
  }

  async findTenantByDomain(domain: string): Promise<Tenant | null> {
    return prisma.tenant.findUnique({
      where: { domain },
    });
  }

  async createTenant(domain: string, settings: Prisma.InputJsonValue = {}): Promise<Tenant> {
    return prisma.tenant.create({
      data: {
        domain,
        settings,
      },
    });
  }

  async findOrCreateTenant(domain: string): Promise<Tenant> {
    const existing = await this.findTenantByDomain(domain);
    if (existing) {
      return existing;
    }
    try {
      return await this.createTenant(domain);
    } catch {
      const tenant = await this.findTenantByDomain(domain);
      if (tenant) {
        return tenant;
      }
      throw new Error(`Failed to create or resolve tenant for domain: ${domain}`);
    }
  }

  async findUserById(id: string): Promise<(User & { tenant?: Tenant | null }) | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { tenant: true },
    });
  }

  async findUserByEmail(email: string): Promise<(User & { tenant?: Tenant | null }) | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });
  }

  async findUserByUsername(username: string): Promise<(User & { tenant?: Tenant | null }) | null> {
    return prisma.user.findUnique({
      where: { username },
      include: { tenant: true },
    });
  }

  async findUserByIdentifier(identifier: string): Promise<(User & { tenant?: Tenant | null }) | null> {
    const userByEmail = await this.findUserByEmail(identifier.toLowerCase());
    if (userByEmail) {
      return userByEmail;
    }
    return this.findUserByUsername(identifier);
  }

  async createUser(data: {
    tenantId: string;
    email?: string | null;
    username?: string | null;
    passwordHash: string;
    domain: string;
    emailVerified?: boolean;
    data?: Prisma.InputJsonValue;
  }): Promise<User & { tenant: Tenant }> {
    return prisma.user.create({
      data: {
        tenantId: data.tenantId,
        email: data.email ?? null,
        username: data.username ?? null,
        passwordHash: data.passwordHash,
        domain: data.domain,
        emailVerified: data.emailVerified ?? true,
        data: data.data ?? {},
      },
      include: { tenant: true },
    });
  }

  async updateUser(
    id: string,
    data: Prisma.UserUpdateInput
  ): Promise<User & { tenant: Tenant }> {
    return prisma.user.update({
      where: { id },
      data,
      include: { tenant: true },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}

export const authRepository = new AuthRepository();
