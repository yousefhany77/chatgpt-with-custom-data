'use client';
import classNames from 'classnames';
import React from 'react';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
export const Markdown: React.FC<{ md: string; type?: 'message' | 'blog'; className?: string }> = ({
  md,
  className,
  type = 'blog',
}) => {
  return (
    <ReactMarkdown
      className={classNames(
        'prose',
        {
          'prose-md': type === 'message',
          'prose-lg': type === 'blog',
          'prose-headings:text-white': type === 'message',
        },
        className
      )}
    >
      {md}
    </ReactMarkdown>
  );
};
