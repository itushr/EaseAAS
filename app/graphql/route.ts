import { server } from '@/src/graphql/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest): Promise<Response> {
  return server.fetch(request);
}

export async function POST(request: NextRequest): Promise<Response> {
  return server.fetch(request);
}

export async function OPTIONS(request: NextRequest): Promise<Response> {
  return server.fetch(request);
}
