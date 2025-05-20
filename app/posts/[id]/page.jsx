'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

const renderTiptapContent = (content) => {
  if (!content || !Array.isArray(content)) {
    return <p className="italic text-gray-500">No content to display.</p>;
  }

  return content.map((item, index) => {
    if (item.type === 'paragraph' && item.content && Array.isArray(item.content)) {
      return <p key={index}>{extractText(item.content)}</p>;
    }
    return null;
  });
};

const extractText = (content) => {
  let text = '';
  content.forEach(item => {
    if (item.type === 'text' && typeof item.text === 'string') {
      text += item.text;
    }
  });
  return text;
};

export default function PostPage() {
  const params = useParams();
  const id = params?.id;
  const [writing, setWriting] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWriting = async () => {
      if (!id) {
        setIsLoading(false);
        setError("No writing ID provided.");
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/writings/share?id=${id}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setWriting(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || 'Failed to fetch writing.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWriting();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <div className="text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-red-500">
        <div className="text-lg p-4 border border-red-500 rounded">Error: {error}</div>
      </div>
    );
  }

  if (!writing || !writing.content || !writing.content.content) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <div className="text-lg">Writing not found or has no content.</div>
      </div>
    );
  }

  const { title, created_at, content } = writing;
  const formattedDate = new Date(created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className='flex flex-col bg-gray-100'>
      <Navbar />
      <div className=" text-white min-h-screen py-12 font-sans">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-10 border-b border-gray-700 pb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-black b-3">
              {title}
            </h1>
            <div className="text-gray-400 mt-3 flex flex-wrap items-center space-x-4 text-sm">
              <time dateTime={created_at} className="font-medium">
                Created: {formattedDate}
              </time>
            </div>
          </header>

          <article className="prose prose-invert prose-lg text-black">
            {renderTiptapContent(content.content)}
          </article>
        </div>
      </div>
    </div>
  );
}