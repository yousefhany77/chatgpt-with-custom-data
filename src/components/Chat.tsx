'use client';
import { Markdown } from '@/components/Markdown';
import { Answer } from '@/utils';
import React, { useEffect, useRef, useState } from 'react';
import Resources from './Resources';

const answer = {
  text: '### Blockchain and Healthcare\nBlockchain technology has the potential to revolutionize healthcare record-keeping by ensuring the integrity and security of sensitive patient data. By storing patient records on a blockchain, patients can have greater control over their medical information and grant access to specific providers when needed. Interoperability between different healthcare systems can also be improved, facilitating seamless sharing of patient data.\n\n### AI and Healthcare\nArtificial intelligence (AI) has the potential to revolutionize patient care, diagnosis, and treatment in healthcare. With the ability to analyze vast amounts of data and identify patterns, AI can help healthcare providers make more accurate diagnoses and develop personalized treatment plans for patients.\n\n### Author\nThe author of the blog post is not provided in the given context.',
  sourceDocuments: [
    {
      pageContent:
        '### Healthcare Records\n\nBlockchain technology has the potential to revolutionize healthcare record-keeping. By storing patient records on a blockchain, healthcare providers can ensure the integrity and security of sensitive data. Patients can have greater control over their medical information and grant access to specific providers when needed. Interoperability between different healthcare systems can also be improved, facilitating seamless sharing of patient data.',
      metadata: {
        'loc.lines.from': 23,
        'loc.lines.to': 25,
        source: '/Users/yousef/search-engine/src/blogs/blog2.txt',
      },
    },
    {
      pageContent:
        '### Healthcare Records\n\nBlockchain technology has the potential to revolutionize healthcare record-keeping. By storing patient records on a blockchain, healthcare providers can ensure the integrity and security of sensitive data. Patients can have greater control over their medical information and grant access to specific providers when needed. Interoperability between different healthcare systems can also be improved, facilitating seamless sharing of patient data.',
      metadata: {
        'loc.lines.from': 23,
        'loc.lines.to': 25,
        source: '/Users/yousef/search-engine/src/blogs/blog2.txt',
      },
    },
    {
      pageContent:
        '### Conclusion\n\nBlockchain technology has the potential to transform industries by enhancing security, transparency, and efficiency. From supply chain management and financial services to healthcare records and intellectual property protection, blockchain offers innovative solutions to longstanding challenges. As scalability and regulatory concerns are addressed, we can expect to see wider adoption of blockchain technology and its continued impact on various sectors.',
      metadata: {
        'loc.lines.from': 39,
        'loc.lines.to': 41,
        source: '/Users/yousef/search-engine/src/blogs/blog2.txt',
      },
    },
    {
      pageContent:
        '### Conclusion\n\nBlockchain technology has the potential to transform industries by enhancing security, transparency, and efficiency. From supply chain management and financial services to healthcare records and intellectual property protection, blockchain offers innovative solutions to longstanding challenges. As scalability and regulatory concerns are addressed, we can expect to see wider adoption of blockchain technology and its continued impact on various sectors.',
      metadata: {
        'loc.lines.from': 39,
        'loc.lines.to': 41,
        source: '/Users/yousef/search-engine/src/blogs/blog2.txt',
      },
    },
    {
      pageContent:
        '# The Rise of Artificial Intelligence in Healthcare\n\nArtificial intelligence (AI) has been making significant strides in various industries, and one field that has witnessed its remarkable impact is healthcare. With the ability to analyze vast amounts of data and identify patterns, AI has the potential to revolutionize patient care, diagnosis, and treatment. In this blog post, we will explore the rise of AI in healthcare and its implications for the future.',
      metadata: {
        'loc.lines.from': 1,
        'loc.lines.to': 3,
        source: '/Users/yousef/search-engine/src/blogs/blog1.txt',
      },
    },
  ],
};

function Chat() {
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLSpanElement>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<number | null>(null);
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
    {
      name: 'Human',
      content: `What is Blockchain?`,
    },
    {
      name: 'AI',
      content: answer.text,
      // example of the response
      sourceDocuments: answer.sourceDocuments as unknown as Answer['sourceDocuments'],
    },
  ]);
  async function ask(question: string) {
    if (!question) return;
    if (!inputRef.current) return;
    setLoading(true);
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
      if (res.status === 429) {
        window.location.href = '/no-tokens';
      }
      setChat((prev) => [
        ...prev,
        {
          name: 'AI',
          content: 'Something went wrong',
        },
      ]);
      setLoading(false);
      return;
    }
    const answer: Answer = await res.json();
    setChat((prev) => [
      ...prev,
      {
        name: 'AI',
        content: answer.text,
        sourceDocuments: answer.sourceDocuments,
      },
    ]);
    setLoading(false);
  }
  useEffect(() => {
    chatRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
    const getTokens = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tokens`, {
        next: {
          tags: ['tokens'],
        },
      });
      const data = await res.json();
      const { token } = data;
      setToken(token);
    };
    getTokens();
    inputRef.current?.focus();
  }, [chat]);
  return (
    <>
      <div className="p-4 text-white text-center w-full bg-slate-800">
        Remaining Tokens: {token ?? 4}/{4}
      </div>
      <div className="flex flex-col w-full space-y-4 bg-slate-200  pb-0 pt-6 h-[70vh]  overflow-y-auto  overflow-x-hidden">
        {chat.map((message, i) => {
          if (message.name === 'AI') {
            return (
              <div className="px-10" key={i}>
                <AiMessage message={message.content} />
                {message?.sourceDocuments?.length && (
                  <h2 className="text-xl font-bold text-gray-800 mt-4 mb-2">resources</h2>
                )}
                {message?.sourceDocuments?.map((doc, i) => {
                  return <Resources key={'doc' + i} source={doc} />;
                })}
              </div>
            );
          } else {
            return <HumanMessage message={message.content} key={i} />;
          }
        })}
        {loading && (
          <div className="px-10">
            <AiMessage message="Thinking..." />
          </div>
        )}
        <span ref={chatRef} className="opacity-0 w-fit h-2 block">
          scroll to here
        </span>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (inputRef.current) {
            await ask(inputRef.current.value);
            inputRef.current.value = '';
          }
        }}
        className="w-full flex gap-1 p-3 rounded-lg"
      >
        <input
          type="text"
          name="question"
          placeholder="Ask a question"
          className="border-2 w-full border-gray-300 rounded-lg p-2 py-3"
          ref={inputRef}
          disabled={loading}
        />
        <button disabled={loading} type="submit" className="bg-blue-500 text-white rounded-lg p-2">
          Ask
        </button>
      </form>
    </>
  );
}

export default Chat;

const HumanMessage: React.FC<{
  message: string;
}> = ({ message }) => {
  return (
    <div className="flex justify-end px-10 ">
      <div className="bg-blue-500 text-white rounded-lg p-3 prose lg:prose-md w-auto">{message}</div>
    </div>
  );
};

const AiMessage: React.FC<{
  message: string;
}> = ({ message }) => {
  return (
    <div className="flex justify-start">
      <Markdown type={'message'} md={message} className="bg-slate-500 text-white rounded-lg p-3 " />
    </div>
  );
};
