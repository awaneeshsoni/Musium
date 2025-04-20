// app/dashboard/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import StartPromptBox from '@/components/StartPromptBox';
import WritingCard from '@/components/WritingCard';
import { WritingType } from '@/types';
import { useRouter } from 'next/navigation';

const DashboardPage = () => {
  const [writings, setWritings] = useState<WritingType[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWritings = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/writings');
        if (!response.ok) {
          throw new Error('Failed to fetch writings');
        }
        const data = await response.json();
        setWritings(data);
      } catch (error) {
        console.error('Error fetching writings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWritings();
  }, []);

  const handleStartWithAI = async (prompt: string) => {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get AI prompt');
      }

      // Create a new writing with the AI-generated content
      const createWritingResponse = await fetch('/api/writings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'AI-Generated Writing', content: data.content }), // Use the AI's response as content
      });

      const createWritingData = await createWritingResponse.json();
      if (!createWritingResponse.ok) {
        throw new Error(createWritingData.message || 'Failed to create new writing');
      }
      router.push(`/editor/${createWritingData.id}`);
    } catch (error: any) {
      console.error('Error getting AI prompt:', error);
      alert(error.message);
    }
  };

  const handleStartBlank = async () => {
    try {
      const response = await fetch('/api/writings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'New Writing' }), // You can add more default data here
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create new writing');
      }
      router.push(`/editor/${data.id}`);
    } catch (error: any) {
      console.error('Error creating new writing:', error);
      alert(error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      <StartPromptBox onStartWithAI={handleStartWithAI} onStartBlank={handleStartBlank} />

      <h2 className="text-lg font-semibold mb-2">Your Writings</h2>
      {loading ? (
        <p>Loading...</p>
      ) : writings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {writings.map((writing) => (
            <WritingCard key={writing.id}  writing={writing} />
          ))}
        </div>
      ) : (
        <p>No writings yet. Start writing!</p>
      )}
    </div>
  );
};

export default DashboardPage;