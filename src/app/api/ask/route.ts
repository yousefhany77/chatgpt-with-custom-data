import { askAI } from '@/utils';
import { PineconeClient } from '@pinecone-database/pinecone';
import { NextResponse } from 'next/server';

export const revalidate = 0;
export async function POST(request: Request) {
  const body = await request.json();
  const question = body.question;
  console.log('🚀 ~ file: route.ts:9 ~ POST ~ question:', question);
  if (!question) {
    return NextResponse.json(
      { error: 'No question provided' },
      {
        status: 400,
      }
    );
  }
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || '',
  });
  try {
    const answer = await askAI(question, client);
  
    return NextResponse.json(answer);
  } catch (error) {
    console.log('🚀 ~ file: route.ts:30 ~ GET ~ error:', error);
  }
}
