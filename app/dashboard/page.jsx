'use client';

import React, { useState, useEffect } from 'react';
import StartPromptBox from '@/components/StartPromptBox';
import WritingCard from '@/components/WritingCard';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';



const DashboardPage = () => {
    const [writings, setWritings] = useState([]);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [buttonLoading, setButtonLoading] = useState(false);

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
                console.log(data)
            } catch (error) {
                console.error('Error fetching writings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWritings();
    }, []);

    const handleStartWithAI = async (prompt) => {
        try {
            setButtonLoading(true);
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

            const contentToSave = {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: data.content?.editorContent,
                            },
                        ],
                    },
                ],
            };
            const createWritingResponse = await fetch('/api/writings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: 'AI-Generated Writing', content: contentToSave }),
            });

            const createWritingData = await createWritingResponse.json();
            if (!createWritingResponse.ok) {
                throw new Error(createWritingData.message || 'Failed to create new writing');
            }
            router.push(`/editor/${createWritingData.id}`);
        } catch (error) {
            console.error('Error getting AI prompt:', error);
            alert(error.message);
        }
        finally { setButtonLoading(false) }
    };

    const handleStartBlank = async () => {
        try {
            setButtonLoading(true)
            const blankContent = {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: '',
                            },
                        ],
                    },
                ],
            };
            const response = await fetch('/api/writings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: 'New Writing', content: blankContent }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create new writing');
            }
            router.push(`/editor/${data.id}`);
        } catch (error) {
            console.error('Error creating new writing:', error);
            alert(error.message);
        }
        finally { setButtonLoading(false) }
    };

    return (
        <div className='flex flex-col bg-gray-100'>
            <Navbar />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
                <div className='flex flex-col justify-center items-center '>
                    <StartPromptBox onStartWithAI={handleStartWithAI} onStartBlank={handleStartBlank} />
                    {buttonLoading && <p className='text-yellow-700'>Loading...</p>}
                </div>
                <h2 className="text-lg font-semibold mt-6 mb-2">Your Writings</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : writings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {writings.map((writing) => (
                            <WritingCard key={writing._id} writing={writing} />
                        ))}
                    </div>
                ) : (
                    <p>No writings yet. Start writing!</p>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;