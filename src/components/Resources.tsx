'use client';
import { Answer } from '@/utils';
import { useState } from 'react';

const Resources = ({ source: { pageContent, metadata } }: { source: Answer['sourceDocuments'][number] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleCollapse = () => {
    setIsExpanded(!isExpanded);
  };
  const titleEndIndex = pageContent.indexOf('\n');
  const title = pageContent.substring(0, titleEndIndex).replaceAll(/#/g, '')
  const path = metadata.source
    .split('/')
    .slice(metadata.source.split('/').length - 3)
    .join('/');
  const pageContentText = pageContent.substring(titleEndIndex + 1);

  return (
    <div
      className={`border border-slate-400  ${
        isExpanded ? 'bg-slate-400 text-white' : ''
      } my-2  transition-colors ease-in-out duration-500 rounded-lg overflow-hidden`}
    >
      <div className="flex flex-col justify-between cursor-pointer p-3 flex-wrap" onClick={toggleCollapse}>
        <h3 className=" flex items-center justify-between text-lg font-semibold w-full p-3">
          {title.length ? title :`From: ${ path}`}
          <span
            className={`text-2xl font-bold
        ${isExpanded ? 'transform rotate-180' : 'transform rotate-0'}
        transition-transform ease-in-out duration-500
        `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </span>
        </h3>
        {isExpanded && (
          <p className=" w-full block flex-1 p-4 bg-slate-100 text-black rounded-xl ">
            {pageContentText}
            <br />
            <br />
            <span className={`text-sm font-normal text-gray-400`}>{path}</span>
            <br />
            <i className="text-sm font-normal text-gray-400">
              {/* @ts-ignore */}
              lines:{metadata['loc.lines.from'] as number} - {metadata['loc.lines.to'] as number}
            </i>
          </p>
        )}
      </div>
    </div>
  );
};

export default Resources;
