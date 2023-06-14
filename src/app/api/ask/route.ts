import { askAI } from '@/utils';
import { RATE_LIMIT_WINDOW, ratelimit } from '@/utils/rateLimiter';
import { PineconeClient } from '@pinecone-database/pinecone';
import { Redis } from '@upstash/redis/nodejs';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { cache } from 'react';

export const revalidate = 0;

const askAIWithCache = cache(async (q: string) => {
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || '',
  });
  const answer = await askAI(q, client);
  return answer;
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? '';
  const { success, remaining, reset } = await ratelimit.limit(`${ip}`);

  const redis = Redis.fromEnv();
  await redis.set(`${ip}`, remaining, {
    ex: RATE_LIMIT_WINDOW,
  });
  if (!success) {
    await redis.set(`${ip}:reset`, reset, {
      ex: RATE_LIMIT_WINDOW,
    });

    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
      }
    );
  }

  const body = await request.json();
  const question = body.question;
  if (!question) {
    return NextResponse.json(
      { error: 'No question provided' },
      {
        status: 400,
      }
    );
  }
  try {
    const answer = await askAIWithCache(question);
    revalidateTag('tokens');
    revalidatePath('/');
    return NextResponse.json(answer);
  } catch (error) {
    console.log('🚀 ~ file: route.ts:30 ~ GET ~ error:', error);
  }
}
