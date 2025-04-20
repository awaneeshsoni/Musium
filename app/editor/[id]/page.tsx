'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Editor from '@/components/Editor';
import WritingSidebar from '@/components/WritingSidebar';
import AIChatSidebar from '@/components/AIChatSidebar';
import { WritingType } from '@/types';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { JSONContent } from '@tiptap/core';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditorToolbar from '@/components/EditorToolbar';
import { Editor as TiptapEditor } from '@tiptap/core';

interface ChatMessage {
  role: string;
  content: string;
}

const EditorPage = () => {
  const [writing, setWriting] = useState<WritingType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string>(''); // Store stringified JSON
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [useSelectedTextAsContext, setUseSelectedTextAsContext] = useState(false);
  const [isPublished, setIsPublished] = useState(false); // Corrected: Initialize as boolean
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const editorRef = useRef<any>(null);
  const [currentContext, setCurrentContext] = useState<string | null>(null);
    const [isModifyingSelectedText, setIsModifyingSelectedText] = useState(false);


    const handleModifySelectedText = (text: string) => {
        setCurrentContext(text);
        setUseSelectedTextAsContext(true); // Enable selected text as context
        setIsModifyingSelectedText(true);
        console.log("Selected text to modify:", text);
    };


    const handleCopyLink = (e: React.MouseEvent<HTMLButtonElement>) => {
        const link = `${window.location.origin}/posts/${id}`;
        navigator.clipboard.writeText(link);

        // Capture cursor position
        setCursorPos({ x: e.clientX, y: e.clientY });
        setCopiedLink(link);

        // Hide after 5s
        setTimeout(() => setCopiedLink(null), 5000);
    };

    useEffect(() => {
        const fetchWriting = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/writings?id=${id}`);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("API Error:", errorText);
                    toast.error(`Failed to fetch writing: ${response.status} - ${errorText}`);
                    setLoading(false);
                    return;
                }
                const data = await response.json();
                setWriting(data);
                setContent(data.content);
                console.log(data)
                setIsPublished(data.is_published);
                setChatHistory(Array.isArray(data.ai_chat_history) ? data.ai_chat_history : []);
                setTitle(data.title || '');
            } catch (error: any) {
                console.error('Error fetching writing:', error);
                toast.error('Failed to load writing. Please try again.');
                setChatHistory([]);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchWriting();
        }
    }, [id]);

    // useEffect(() => {
    //   setUseSelectedTextAsContext(false);
    // }, [selectedText]);

    const handleContentChange = useCallback((content: JSONContent) => {
        setContent(content as any)
        if (writing) {
            setWriting((prevWriting) => ({ ...prevWriting!, title: title, content: content, is_published: isPublished, updated_at: new Date() }));
        }
    }, [title, isPublished, writing]);

    const saveContent = useCallback(async () => {
        if (writing?._id) {
            setIsSaving(true);
            try {
                const response = await fetch('/api/writings', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: writing._id,
                        title: title,
                        content: content,
                        is_published: isPublished,
                        ai_chat_history: chatHistory,
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("API Error:", errorText);
                    toast.error(`Failed to fetch writing: ${response.status} - ${errorText}`);
                    return;
                }
                toast.success('Writing saved successfully!');
            } catch (error: any) {
                console.error('Error saving writing:', error);
                toast.error('Failed to save writing. Please try again.');
            } finally {
                setIsSaving(false);
            }
        }
    }, [writing?._id, chatHistory, title, content, isPublished]);

    useEffect(() => {
        if (writing?._id) {
            const timer = setTimeout(() => {
                saveContent();
            }, 100000);
            return () => clearTimeout(timer);
        }
    }, [saveContent, writing?._id]);

    const handleNewWriting = async () => {
        try {
            const response = await fetch('/api/writings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: 'New Writing' }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create new writing');
            }

            const data = await response.json();
            router.push(`/editor/${data.id}`);
        } catch (error: any) {
            console.error('Error creating new writing:', error);
            toast.error(error.message);
        }
    };

    const handleTextSelect = (text: string | null) => {
        setSelectedText(text);
        // setUseSelectedTextAsContext(false); // Removed this line
    };

    const handleSendPrompt = async (prompt: string, context: string | null) => {
        if (!writing) return;

        let formattedPrompt: string = "";
        if (context) {
            formattedPrompt = `Context: ${context}\n\nInstructions: ${prompt}\n\nModified Text:`;
        } else {
            formattedPrompt = `Instructions: ${prompt}\n\nNew Story:`;
        }

        const requestBody = {
            prompt: formattedPrompt,
        };

        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("API Error:", errorText);
                toast.error(`Failed to get AI suggestion: ${response.status} - ${errorText}`);
                return;
            }

            const data = await response.json();

            if (!data.content || typeof data.content !== 'object') {
                console.error("AI Suggestion Invalid Format:", data);
                toast.error("Received AI suggestion in unexpected format. Please try again.");
                return;
            }

            setAiSuggestion(JSON.stringify(data.content));

            setChatHistory((prevHistory) => [
                ...prevHistory,
                { role: 'user', content: prompt },
                { role: 'ai', content: data.content.chatSummary || "Click accept to see modifications" }
            ]);

        } catch (error: any) {
            console.error('Error getting AI suggestion:', error);
            toast.error(error.message);
        }
    };

    const handleAcceptSuggestion = () => {
        if (!writing || !editorRef.current?.editor) return;

        try {
            const parsedSuggestion = JSON.parse(aiSuggestion);

            if (!parsedSuggestion || typeof parsedSuggestion !== 'object' || !parsedSuggestion.editorContent) {
                console.error("Invalid AI suggestion format:", parsedSuggestion);
                toast.error("Invalid AI suggestion format. Cannot update content.");
                return;
            }

            const newText = parsedSuggestion.editorContent;

            if (useSelectedTextAsContext && selectedText && isModifyingSelectedText) {
                // Replace only the selected text
                const { from, to } = editorRef.current.editor.state.selection;
                editorRef.current.editor.commands.insertContentAt(
                    { from, to },
                    newText
                );
                toast.success("Selected Text Modified");
            } else {
                // Replace the entire content
                let editorContentJSON: JSONContent;
                try {
                    editorContentJSON = JSON.parse(parsedSuggestion.editorContent);
                } catch (e) {
                    console.log("AI suggestion was not valid JSON, treating as plain text.", e);
                    editorContentJSON = {
                        type: 'doc',
                        content: [{
                            type: 'paragraph',
                            content: [{
                                type: 'text',
                                text: parsedSuggestion.editorContent
                            }]
                        }]
                    } as JSONContent;
                }

                setContent(editorContentJSON);
                setWriting({ ...writing, content: editorContentJSON });
                toast.success("Full Text Modified");
            }
            setIsModifyingSelectedText(false);
            setAiSuggestion('');
        } catch (jsonError) {
            console.warn("AI suggestion was not valid JSON, treating as plain text.", jsonError);
            toast.error("The text is not valid JSON make sure there is context, or the AI response was invalid.");
        }
    };

    const handleRejectSuggestion = () => {
        setAiSuggestion('');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        if (writing) {
            setWriting((prevWriting) => ({ ...prevWriting!, title: e.target.value }));
        }
    };

    const handleUseSelectedTextContext = () => {
        setUseSelectedTextAsContext(!useSelectedTextAsContext);
    };

    const handleIsPublishedChange = (value: boolean) => {
        setIsPublished(value);
        if (writing) {
            setWriting((prevWriting) => ({ ...prevWriting!, is_published: value }));
        }
    };

    const getWritingContent = () => {
        return writing?.content ? editorRef?.current?.editor?.getText() : null;
    };

    const getCurrentContext = () => {
        if (useSelectedTextAsContext && currentContext) {
            return currentContext;
        } else {
            return getWritingContent();
        }
    };

    if (loading) {
        return <div className="container mx-auto p-4">Loading editor...</div>;
    }

    if (!writing) {
        return <div className="container mx-auto p-4">Writing not found.</div>;
    }

    return (
        <div className="container mx-auto p-4 flex h-screen">
            <div className="w-64 overflow-y-auto">
                <WritingSidebar onNewWriting={handleNewWriting} currentWritingId={writing.id} />
            </div>
            <div className="flex-1 flex flex-col">
                <div className="sticky top-0 bg-white z-10 p-4 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            className="w-full border rounded py-2 px-3 text-lg font-semibold mr-4"
                            placeholder="Enter title..."
                        />

                        <div className="flex items-center gap-2">
                            {/* Dropdown */}
                            <select
                                value={isPublished ? 'public' : 'private'}
                                onChange={(e) => {
                                    const value = e.target.value as 'private' | 'public';
                                    handleIsPublishedChange(e.target.value === 'public');
                                    saveContent(); // pass the latest value
                                }}
                                className="border rounded px-3 py-2"
                            >
                                <option value="private">Private</option>
                                <option value="public">Public</option>
                            </select>

                            {/* Share Button (only active if public) */}
                            <button
                                onClick={handleCopyLink}
                               disabled={!isPublished}
                                className={`px-4 py-2 rounded text-white transition-all duration-200
    ${isPublished ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
                            >
                                Share
                            </button>
                            {copiedLink && (
                                <div
                                    className="fixed bg-black text-white px-3 py-2 rounded shadow-lg text-sm z-50 pointer-events-none"
                                    style={{ top: cursorPos.y + 10, left: cursorPos.x + 10 }}
                                >
                                    Copied: {copiedLink}
                                </div>
                            )}

                            {/* Save Button */}
                            <button
                                onClick={saveContent}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-60"
                            >
                                {isSaving && (
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                                        ></path>
                                    </svg>
                                )}
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>

                    {/* Editor Toolbar */}
                    <EditorToolbar editor={editorRef.current?.editor || null} />
                </div>
                <div className="overflow-y-auto"> {/* Scrollable Content Area */}
                    <Editor
                        initialContent={writing.content}
                        onContentChange={handleContentChange}
                        onTextSelect={handleTextSelect}
                        aiSuggestion={aiSuggestion}
                        onModifySelectedText={handleModifySelectedText}
                        onAcceptSuggestion={handleAcceptSuggestion}
                        onRejectSuggestion={handleRejectSuggestion}
                        ref={editorRef}
                    />
                </div>
            </div>

            {writing && Array.isArray(chatHistory) ? (
                <div className="w-96 overflow-y-auto">
                    <AIChatSidebar
                        onSendPrompt={handleSendPrompt}
                        chatHistory={chatHistory}
                        selectedText={selectedText}
                        useSelectedTextAsContext={useSelectedTextAsContext}
                        onUseSelectedTextContext={handleUseSelectedTextContext}
                        writingContent={getWritingContent()}
                        currentContext={getCurrentContext()}
                    />
                </div>
            ) : (
                <div className="w-96 overflow-y-auto">
                    <p>Loading AI Chat...</p>
                </div>
            )}
        </div>
    );
};

export default EditorPage;