import { cookies } from 'next/headers';

export const COOKIE_NAME = process.env.COOKIE_NAME || 'token';

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAuthCookie(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAME)?.value;
  } catch {
    return undefined;
  }
}
