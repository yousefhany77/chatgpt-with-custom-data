import { createPineconeIndex, splitIntoChunks, updatePinecone } from '@/utils';
import { PineconeClient } from '@pinecone-database/pinecone';
import { NextResponse } from 'next/server';
export const revalidate = 0;

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      {
        data: 'this route is only available in development mode',
      },
      {
        status: 403,
      }
    );
  }
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || '',
  });

  try {
    await createPineconeIndex(client);
    const docs = await splitIntoChunks('src/blogs');
    await updatePinecone(client, docs);
  } catch (err) {
    console.log('error: ', err);
  }

  return NextResponse.json({
    data: 'successfully created index and loaded data into pinecone...',
  });
}
