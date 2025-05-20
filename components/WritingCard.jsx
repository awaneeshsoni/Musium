import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

const extractPlainText = (content) => {
  if (!content || !Array.isArray(content.content)) return '';
  return content.content
    .map(paragraph => {
      if (!Array.isArray(paragraph.content)) return '';
      return paragraph.content.map(node => node.text || '').join('');
    })
    .join(' ')
    .slice(0, 100);
};

const WritingCard = ({ writing }) => {
  const snippet = writing.content ? extractPlainText(writing.content) + "..." : "No content yet.";

  return (
    <Link href={`/editor/${writing._id}`} className="block bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-md font-semibold mb-2">{writing.title}</h3>
      <p className="text-gray-600 text-sm">{snippet}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-gray-500 text-xs">Created: {format(new Date(writing.created_at), 'MMM dd, yyyy')}</span>
        {writing.isPublished ? (
          <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">Published</span>
        ) : (
          <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">Private</span>
        )}
      </div>
    </Link>
  );
};

export default WritingCard;
