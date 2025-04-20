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
  const [isSaving, setIsSaving] = useState(false);
  const [useSelectedTextAsContext, setUseSelectedTextAsContext] = useState(false);

  const editorRef = useRef<any>(null);

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

  useEffect(() => {
    setUseSelectedTextAsContext(false);
  }, [selectedText]);

  const handleContentChange = useCallback((content: JSONContent) => {
    if (writing) {
      setWriting((prevWriting) => ({ ...prevWriting!, content: content, updated_at: new Date() }));
    }
  }, [writing]);

  const saveContent = useCallback(async () => {
    if (writing?.id) {
      setIsSaving(true);
      try {
        const response = await fetch('/api/writings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: writing.id,
            title: title,
            content: writing.content,
            ai_chat_history: chatHistory,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", errorText);
          toast.error(`Failed to save writing: ${response.status} - ${errorText}`);
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
  }, [writing?.id, chatHistory, title]);

  useEffect(() => {
    if (writing?.id) {
      const timer = setTimeout(() => {
        saveContent();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [saveContent, writing?.id]);

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
    setUseSelectedTextAsContext(false);
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

      setAiSuggestion(JSON.stringify(data.content)); // Store it as string

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
    if (!writing) return;

    try {
      const parsedSuggestion = JSON.parse(aiSuggestion);

      if (!parsedSuggestion || typeof parsedSuggestion !== 'object' || !parsedSuggestion.editorContent) {
        console.error("Invalid AI suggestion format:", parsedSuggestion);
        toast.error("Invalid AI suggestion format. Cannot update content.");
        return;
      }

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

      setWriting({ ...writing, content: editorContentJSON });

      if (selectedText) {
        toast.success("Text Modified");
      }
      else {
        toast.success("Full Text Modified");
      }
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
  };

  const handleUseSelectedTextContext = () => {
    setUseSelectedTextAsContext(true);
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
      <div className="flex-1 overflow-y-auto">
        <h1 className="text-2xl font-semibold mb-4">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="w-full border rounded py-2 px-3 text-lg"
          />
        </h1>
        <Editor
          initialContent={writing.content}
          onContentChange={handleContentChange}
          onTextSelect={handleTextSelect}
          aiSuggestion={aiSuggestion}
          onAcceptSuggestion={handleAcceptSuggestion}
          onRejectSuggestion={handleRejectSuggestion}
          ref={editorRef}
        />
      </div>

      {writing && Array.isArray(chatHistory) ? (
        <div className="w-96 overflow-y-auto">
          <AIChatSidebar
            onSendPrompt={handleSendPrompt}
            chatHistory={chatHistory}
            selectedText={selectedText}
            useSelectedTextAsContext={useSelectedTextAsContext}
            onUseSelectedTextContext={handleUseSelectedTextContext}
            writingContent={writing.content ? editorRef?.current?.editor?.getText() : null}
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