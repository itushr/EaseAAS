import { authService } from '@/src/services/auth/auth.service';
import { requireAuth } from '@/src/middleware/auth';
import { GraphQLContext } from '@/src/graphql/context';
import { User, Tenant } from '@prisma/client';
import prisma from '@/src/db';

export const authResolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.user) {
        return null;
      }
      return authService.me(context.user.id);
    },
    check: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.user) {
        return null;
      }
      return authService.me(context.user.id);
    },
  },
  Mutation: {
    register: async (
      _parent: unknown,
      args: { email: string; password: string; username?: string | null },
      context: GraphQLContext
    ) => {
      return authService.register(
        {
          email: args.email,
          password: args.password,
          username: args.username,
        },
        context.domain
      );
    },
    login: async (
      _parent: unknown,
      args: { identifier: string; password: string }
    ) => {
      return authService.login({
        identifier: args.identifier,
        password: args.password,
      });
    },
    logout: async () => {
      return authService.logout();
    },
    setUsername: async (
      _parent: unknown,
      args: { username: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context.user);
      return authService.setUsername(user.id, args.username);
    },
  },
  User: {
    createdAt: (user: User) => {
      return user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt;
    },
    updatedAt: (user: User) => {
      return user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt;
    },
    lastLoginAt: (user: User) => {
      if (!user.lastLoginAt) return null;
      return user.lastLoginAt instanceof Date ? user.lastLoginAt.toISOString() : user.lastLoginAt;
    },
    tenant: async (user: User & { tenant?: Tenant | null }) => {
      if (user.tenant) {
        return user.tenant;
      }
      return prisma.tenant.findUnique({
        where: { id: user.tenantId },
      });
    },
  },
  Tenant: {
    createdAt: (tenant: Tenant) => {
      return tenant.createdAt instanceof Date ? tenant.createdAt.toISOString() : tenant.createdAt;
    },
    updatedAt: (tenant: Tenant) => {
      return tenant.updatedAt instanceof Date ? tenant.updatedAt.toISOString() : tenant.updatedAt;
    },
  },
};
