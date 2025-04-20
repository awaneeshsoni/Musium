// components/WritingCard.tsx

import React from 'react';
import { WritingType } from '@/types';
import Link from 'next/link';
import { format } from 'date-fns';

interface WritingCardProps {
  writing: WritingType;
}

const WritingCard: React.FC<WritingCardProps> = ({ writing }) => {
  const snippet = writing.content ? JSON.stringify(writing.content).substring(0, 100) + "..." : "No content yet.";

  return (
    <Link href={`/editor/${writing._id}`} className="block bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-md font-semibold mb-2">{writing.title}</h3>
      <p className="text-gray-600 text-sm">{snippet}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-gray-500 text-xs">Created: {format(new Date(writing.created_at), 'MMM dd, yyyy')}</span>
        {writing.is_published ? (
          <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">Published</span>
        ) : (
          <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">Private</span>
        )}
      </div>
    </Link>
  );
};

export default WritingCard;