// import { PineconeClient } from '@pinecone-database/pinecone';
import { PineconeClient } from '@pinecone-database/pinecone';
import { VectorOperationsApi } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';
import { PromptTemplate } from 'langchain';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { Document } from 'langchain/document';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { BufferMemory } from 'langchain/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PineconeStore } from 'langchain/vectorstores/pinecone';

const INDEX_NAME = 'blog-index';

interface Metadata {
  source: string;
  loc: {
    lines: {
      from: number;
      to: number;
    };
  };
}

export const createPineconeIndex = async (client: PineconeClient, indexName = INDEX_NAME, vectorDimension = 1536) => {
  const existingIndexes = await client.listIndexes();
  if (!existingIndexes.includes(indexName)) {
    console.log('🚀 ~ Creating pinecone index...');
    const index = await client.createIndex({
      createRequest: {
        name: indexName,
        dimension: vectorDimension,
        metric: 'cosine',
      },
    });
    // the index is created asynchronously, so we need to wait for it to be ready
    // there is no way for now to check if the index is ready, so we just wait for 60 seconds
    await new Promise((resolve) => setTimeout(resolve, 60000));
    return console.log('🚀 ~ Created Index:', indexName);
  }

  return console.log(`🚀 ~ Index ${indexName} already exist `);
};

export const updatePinecone = async (client: PineconeClient, docs: Document<Metadata>[][], indexName = INDEX_NAME) => {
  const index = client.Index(indexName);
  if (!index) return console.log('🚀 ~ Index does not exist');
  console.log('🚀 ~ Updating pinecone index...');
  await createAndSaveEmbeddings(docs, index);
  return console.log('🚀 ~ Updated Index:', indexName);
};

/**
 *  Split text files into chunks of 500 characters with 100 character overlap
 *  the text files should be written in markdown format
 *
 * @param path  - path to the directory containing the text files to be split into chunks
 * @returns   - an array of chunks as Document<Metadata>[]
 *
 */
export const splitIntoChunks = async (path: string) => {
  const loader = new DirectoryLoader('src/blogs', {
    '.txt': (path) => new TextLoader(path),
  });
  const docs = await loader.load();
  const splitter = async (text: string, metadata: Record<'source', string>) => {
    const splitter = RecursiveCharacterTextSplitter.fromLanguage('markdown', {
      chunkSize: 500,
      chunkOverlap: 100,
    });
    const docOutput = await splitter.createDocuments([text], [metadata]);
    return docOutput as Document<Metadata>[];
  };

  const chunks = await Promise.all(docs.map((doc) => splitter(doc.pageContent, doc.metadata)));
  return chunks;
};

const createAndSaveEmbeddings = async (docs: Document<Metadata>[][], index: VectorOperationsApi) => {
  const chunks = docs.flat();
  const embeddings = new OpenAIEmbeddings({
    maxConcurrency: 5,
  });
  console.log('🚀 ~ chunks size:', chunks.length);
  await PineconeStore.fromDocuments(chunks, embeddings, {
    pineconeIndex: index,
  });
  return;
};

// working version
// export const askAI = async (question: string, client: PineconeClient) => {
//   const pineconeIndex = client.Index(INDEX_NAME);
//   const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings(), { pineconeIndex });
//   // OpenAI recommends replacing newlines with spaces for best results
//   const sanitizedQuestion = question.trim().replaceAll('\n', ' ');
//   const context = (await vectorStore.similaritySearch(sanitizedQuestion, 3)) as unknown as { metadata: Metadata }[];
//   const docs = context.map(
//     ({ metadata: { pageContent, source } }) => new Document({ pageContent, metadata: { source } })
//   );

//   const llm = new OpenAI({ temperature: 0 });
//   const chain = loadQAStuffChain(llm, {
//     prompt: QA_PROMPT,
//   });
//   const { text } = await chain.call({
//     question: sanitizedQuestion,
//     input_documents: docs,
//   });
//   return {
//     answer: text,
//     docs,
//   };
//   return docs;
// };
export const askAI = async (question: string, client: PineconeClient) => {
  const pineconeIndex = client.Index(INDEX_NAME);
  const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings(), { pineconeIndex });
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  const llm = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0,
    cache: true,
  });
  const qa_template = `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say "Sorry I dont know, don't try to make up an answer.
  {context}

  Question: {question}
  Helpful Answer In markdown format. If the answer consists of multiple parts add relevant title to each section the title should size be only like h6 or h5:`;
  const chain = ConversationalRetrievalQAChain.fromLLM(llm, vectorStore.asRetriever(), {
    returnSourceDocuments: true,
    memory: new BufferMemory({
      memoryKey: 'chat_history',
      inputKey: 'question', // The key for the input to the chain
      outputKey: 'text', // The key for the final conversational output of the chain
      returnMessages: true, // If using with a chat model
    }),
    verbose: true,
    qaChainOptions: {
      type: 'stuff',
      prompt: PromptTemplate.fromTemplate(qa_template),
    },
  });

  const answer = (await chain.call({
    question: sanitizedQuestion,
  })) as Answer;
  return answer;
};

export interface Answer {
  text: string;
  sourceDocuments: {
    pageContent: Metadata['pageContent'];
    metadata: {
      source: Metadata['source'];
      loc: Metadata['loc'];
    };
  }[];
}

interface Metadata {
  source: string;
  loc: {
    lines: {
      from: number;
      to: number;
    };
  };
  pageContent: string;
}
