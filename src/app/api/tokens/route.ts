import { Redis } from '@upstash/redis/nodejs';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? '';
  const token = (await Redis.fromEnv().get(ip)) as number | null;
  const reset = (await Redis.fromEnv().get(`${ip}:reset`)) as number | null;

  return NextResponse.json(
    { token, reset },
    {
      status: 200,
    }
  );
}
