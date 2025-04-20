'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Writing {
  _id: string;
  title: string;
  content: any; // Tiptap JSON content or other format
  isPublished: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  ai_chat_history: { role: string; content: string }[];
  streak_day: number;
}

// Helper function to extract text from the Tiptap JSON content
const extractTextFromContent = (content: any): string => {
  if (!content) {
    return '';
  }

  if (typeof content === 'string') {
    return content; // Base case: if it's a string, return it
  }

  if (Array.isArray(content)) {
    let text = '';
    content.forEach((item: any) => {
      text += extractTextFromContent(item); // Recursive call
    });
    return text;
  }

  if (typeof content === 'object' && content !== null) {
    if (typeof content.text === 'string') {
      return content.text;
    }
    if (content.content) {
      return extractTextFromContent(content.content);  // Dive deeper if there's a 'content' property
    }
  }

  return ''; // Default case: if nothing else matches, return an empty string
};

export default function PostPage() {
  const { id } = useParams();
  const [writing, setWriting] = useState<Writing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWriting = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/writings/share?id=${id}`);
        console.log("Response Status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setWriting(data);
        console.log("Writing Content:", data.content); // ***CRITICAL: Inspect this in the console***
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || 'Failed to fetch writing.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchWriting();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-red-500">
        <div className="text-lg">{error}</div>
      </div>
    );
  }

  if (!writing) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <div className="text-lg">Writing not found.</div>
      </div>
    );
  }

  const extractedText = extractTextFromContent(writing.content);
  const formattedDate = new Date(writing.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
   <div className="bg-black text-white min-h-screen py-12">
  <div className="max-w-3xl mx-auto px-4 md:px-6">
    <header className="mb-10">
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        {writing.title}
      </h1>
      <div className="text-gray-400 mt-3 flex items-center space-x-4 text-sm">
        <p className="uppercase font-medium">Published: {writing.isPublished ? 'Yes' : 'No'}</p>
        <span className="text-gray-600">•</span>
        <time dateTime={writing.created_at} className="font-medium">
          {formattedDate}
        </time>
      </div>
    </header>

    <article className="prose prose-invert text-gray-300 max-w-none leading-relaxed">
      <p>{extractedText}</p>
    </article>
  </div>
</div>

  );
}
