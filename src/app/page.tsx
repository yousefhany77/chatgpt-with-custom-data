'use client';
import Resources from '@/components/Resources';
import { Answer } from '@/utils';
import { useRef, useState } from 'react';

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLSpanElement>(null);
  const [chat, setChat] = useState<
    {
      name: string;
      content: string;
      sourceDocuments?: Answer['sourceDocuments'];
    }[]
  >([
    {
      name: 'AI',
      content: `Hello, I can answer questions about the Data in the AI Data tab
      `,
    },
  ]);
  async function ask(question: string) {
    if (!question) return;
    if (!inputRef.current) return;
    inputRef.current?.blur();
    inputRef.current.value = '';
    setChat((prev) => [
      ...prev,
      {
        name: 'Human',
        content: question,
      },
    ]);

    const res = await fetch('/api/ask', {
      method: 'POST',
      body: JSON.stringify({
        question,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    const answer: Answer = await res.json();
    console.log('🚀 ~ file: page.tsx:45 ~ ask ~ answer:', answer);
    setChat((prev) => [
      ...prev,
      {
        name: 'AI',
        content: answer.text,
        sourceDocuments: answer.sourceDocuments,
      },
    ]);
    chatRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-8 p-10 max-w-5xl mx-auto w-full relative">
      <div className="flex flex-col space-y-4 bg-slate-200 w-full px-10 pb-0 pt-6 rounded-xl h-full   max-h-[85vh] overflow-auto ">
        {chat.map((message, i) => {
          if (message.name === 'AI') {
            return (
              <div key={i}>
                <AiMessage message={message.content} />
                {message?.sourceDocuments?.length && (
                  <h2 className="text-xl font-bold text-gray-800 mt-4 mb-2">resources</h2>
                )}
                {message?.sourceDocuments?.map((doc, i) => {
                  return <Resources key={'doc' + i} source={doc} />;
                })}
                <span ref={chatRef} className="sr-only w-full h-1 block"></span>
              </div>
            );
          } else {
            return <HumanMessage message={message.content} key={i} />;
          }
        })}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (inputRef.current) {
              await ask(inputRef.current.value);
              inputRef.current.value = '';
            }
          }}
          className="w-full flex gap-1 sticky bottom-0 p-3 rounded-lg backdrop-blur"
        >
          <input
            type="text"
            name="question"
            placeholder="Ask a question"
            className="border-2 w-full border-gray-300 rounded-lg p-2 py-3"
            ref={inputRef}
          />
          <button type="submit" className="bg-blue-500 text-white rounded-lg p-2">
            Ask
          </button>
        </form>
      </div>
    </main>
  );
}

const HumanMessage: React.FC<{
  message: string;
}> = ({ message }) => {
  return (
    <div className="flex justify-end ">
      <div className="bg-blue-500 text-white rounded-lg p-3 max-w-[90%]">{message}</div>
    </div>
  );
};

const AiMessage: React.FC<{
  message: string;
}> = ({ message }) => {
  // format text new line each dot
  const sentences = message.split('. ');
  return (
    <div className="flex justify-start ">
      <p className="bg-slate-500 text-white rounded-lg p-3 leading-6 max-w-[90%]">{message}</p>
    </div>
  );
};
