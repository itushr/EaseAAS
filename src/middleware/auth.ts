import { verifyToken, TokenPayload } from '@/src/lib/jwt';
import { getAuthCookie, COOKIE_NAME } from '@/src/lib/cookie';
import prisma from '@/src/db';
import { User, Tenant } from '@prisma/client';

export interface AuthenticatedUser extends User {
  tenant?: Tenant | null;
}

export interface AuthSession {
  user: AuthenticatedUser | null;
  token: string | null;
  tokenPayload: TokenPayload | null;
}

function parseCookieHeader(cookieHeader: string | null, key: string): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${key}=`));
  return match ? match.substring(key.length + 1) : undefined;
}

export async function authenticateRequest(request?: Request | null): Promise<AuthSession> {
  let token: string | undefined;

  const authHeader = request?.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.substring(7).trim();
  }

  if (!token && request) {
    const cookieHeader = request.headers.get('cookie');
    token = parseCookieHeader(cookieHeader, COOKIE_NAME);
  }

  if (!token) {
    token = await getAuthCookie();
  }

  if (!token) {
    return { user: null, token: null, tokenPayload: null };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return { user: null, token: null, tokenPayload: null };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { tenant: true },
  });

  if (!user) {
    return { user: null, token: null, tokenPayload: null };
  }

  return {
    user,
    token,
    tokenPayload: payload,
  };
}

export function requireAuth(user: AuthenticatedUser | null | undefined): AuthenticatedUser {
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
