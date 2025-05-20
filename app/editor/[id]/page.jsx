'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Editor from '@/components/Editor';
import WritingSidebar from '@/components/WritingSidebar';
import AIChatSidebar from '@/components/AIChatSidebar';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import EditorToolbar from '@/components/EditorToolbar';
import Navbar from '@/components/Navbar';

const EditorPage = () => {
  const [writing, setWriting] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();
  const [selectedText, setSelectedText] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [useSelectedTextAsContext, setUseSelectedTextAsContext] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const editorRef = useRef(null);
  const [currentContext, setCurrentContext] = useState(null);
  const [isModifyingSelectedText, setIsModifyingSelectedText] = useState(false);

  const handleModifySelectedText = (text) => {
    setCurrentContext(text);
    setUseSelectedTextAsContext(true);
    setIsModifyingSelectedText(true);
  };

  const handleCopyLink = (e) => {
    const link = `${window.location.origin}/posts/${id}`;
    navigator.clipboard.writeText(link);
    setCursorPos({ x: e.clientX, y: e.clientY });
    setCopiedLink(link);
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
        setIsPublished(data.is_published);
        setChatHistory(Array.isArray(data.ai_chat_history) ? data.ai_chat_history : []);
        setTitle(data.title || '');
      } catch (error) {
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

  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
    console.log(newContent)
    if (writing) {
      setWriting((prevWriting) => ({ ...prevWriting, title: title, content: newContent, is_published: isPublished, updated_at: new Date().toISOString() }));
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
          toast.error(`Failed to save writing: ${response.status} - ${errorText}`);
          return;
        }
        toast.success('Writing saved successfully!');
      } catch (error) {
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
    } catch (error) {
      console.error('Error creating new writing:', error);
      toast.error(error.message);
    }
  };

  const handleTextSelect = (text) => {
    setSelectedText(text);
  };

  const handleSendPrompt = async (prompt, context) => {
    if (!writing) return;

    let formattedPrompt = "";
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
      console.log

      if (!data.content || typeof data.content !== 'object') {
        console.error("AI Suggestion Invalid Format:", data);
        toast.error("Received AI suggestion in unexpected format. Please try again.");
        return;
      }

      setAiSuggestion(data.content.editorContent); 


      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: 'user', content: prompt },
        { role: 'ai', content: data.content.chatSummary || "Click accept to see modifications" }
      ]);

    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      toast.error(error.message);
    }
  };

  const handleAcceptSuggestion = () => {
    if (!writing || !editorRef.current?.editor) return;

    try {
      const newText = aiSuggestion;

      if (useSelectedTextAsContext && selectedText && isModifyingSelectedText) {
        const { from, to } = editorRef.current.editor.state.selection;
        editorRef.current.editor.commands.insertContentAt(
          { from, to },
          newText
        );
        toast.success("Selected Text Modified");
      } else {
          let editorContentJSON;
          try {
              editorContentJSON = JSON.parse(newText);
          } catch (e) {
              console.log("AI suggestion was not valid JSON, treating as plain text.", e);
              editorContentJSON = {
                  type: 'doc',
                  content: [{
                      type: 'paragraph',
                      content: [{
                          type: 'text',
                          text: typeof newText === 'string' ? newText : JSON.stringify(newText)
                      }]
                  }]
              };
          }
          setContent(editorContentJSON);
          setWriting({ ...writing, content: editorContentJSON });
          toast.success("Full Text Modified");
      }

      setIsModifyingSelectedText(false);
      setAiSuggestion('');
    } catch (jsonError) {
      console.warn("AI suggestion (outer structure) was not valid JSON.", jsonError);
      if (typeof aiSuggestion === 'string') {
        if (useSelectedTextAsContext && selectedText && isModifyingSelectedText) {
          const { from, to } = editorRef.current.editor.state.selection;
          editorRef.current.editor.commands.insertContentAt({ from, to }, aiSuggestion);
        } else {
          const plainTextContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: aiSuggestion }] }]
          };
          setContent(plainTextContent);
          setWriting({ ...writing, content: plainTextContent });
        }
        toast.info("Applied suggestion as plain text.");
        setIsModifyingSelectedText(false);
        setAiSuggestion('');
      } else {
        toast.error("The AI response was invalid. Could not apply changes.");
      }
    }
  };


  const handleRejectSuggestion = () => {
    setAiSuggestion('');
    setIsModifyingSelectedText(false);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    if (writing) {
      setWriting((prevWriting) => ({ ...prevWriting, title: e.target.value }));
    }
  };

  const handleUseSelectedTextContext = () => {
    setUseSelectedTextAsContext(!useSelectedTextAsContext);
  };

  const handleIsPublishedChange = (value) => {
    setIsPublished(value);
    if (writing) {
      setWriting((prevWriting) => ({ ...prevWriting, is_published: value }));
    }
  };

  const getWritingContent = () => {
    return writing?.content && editorRef?.current?.editor ? editorRef.current.editor.getText() : null;
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
    <div className='flex flex-col bg-gray-100'>
      <Navbar />
      <div className="container mx-auto p-4 flex max-h-[90vh] " >
        <div className="w-64 overflow-y-auto">
          <WritingSidebar onNewWriting={handleNewWriting} currentWritingId={writing._id} />
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
                <select
                  value={isPublished ? 'public' : 'private'}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleIsPublishedChange(value === 'public');
                    saveContent();
                  }}
                  className="border rounded px-3 py-2"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>

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

                <button
                  onClick={saveContent}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            {/* <EditorToolbar editor={editorRef.current?.editor || null} /> */}
          </div>
          <div className="flex-grow overflow-y-auto">
            <Editor
              initialContent={content}
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
    </div>
  );
};

export default EditorPage;