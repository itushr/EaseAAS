import { authenticateRequest, AuthenticatedUser } from '@/src/middleware/auth';
import { getDomainFromRequest } from '@/src/utils/domain';
import prisma from '@/src/db';
import { PrismaClient } from '@prisma/client';

export interface GraphQLContext {
  request?: Request;
  user: AuthenticatedUser | null;
  token: string | null;
  domain: string;
  prisma: PrismaClient;
}

export async function createContext(initialContext: { request?: Request }): Promise<GraphQLContext> {
  const request = initialContext.request;
  const domain = getDomainFromRequest(request);
  const session = await authenticateRequest(request);

  return {
    request,
    user: session.user,
    token: session.token,
    domain,
    prisma,
  };
}
