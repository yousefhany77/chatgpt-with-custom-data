'use client';
import React from 'react';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

export const Markdown: React.FC<{ md: string }> = ({ md }) => {
  return <ReactMarkdown className="prose lg:prose-xl">{md}</ReactMarkdown>;
};
