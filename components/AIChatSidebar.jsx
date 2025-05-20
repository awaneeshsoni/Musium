'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

const AIChatSidebar = ({
  onSendPrompt,
  chatHistory,
  selectedText,
  writingContent,
  useSelectedTextAsContext,
  onUseSelectedTextContext,
  currentContext,
}) => {
  const [prompt, setPrompt] = useState(''); 
  const [isLoading, setIsLoading] = useState(false); 
  const chatContainerRef = useRef(null); 

  const handleSubmit = async (e) => { 
    e.preventDefault();
    if (prompt.trim() !== '') {
      setIsLoading(true);
      await onSendPrompt(prompt, currentContext);
      setIsLoading(false);
      setPrompt('');
    }
  };

  const truncateContext = useCallback((text, front = 15, back = 15) => { 
    if (!text) return '';
    const words = text?.split(' ') || [];
    if (words.length <= front + back) return text;
    return `${words.slice(0, front).join(' ')} ... ${words.slice(-back).join(' ')}`;
  }, []);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop <= container.clientHeight + 100;

    if (isNearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }, [chatHistory, isLoading]);


  const contextDisplay = currentContext; 

  return (
    <div className="w-full h-[85vh] flex flex-col bg-white border-l border-gray-200">

      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium text-gray-700">Context</span>
          <button
            onClick={onUseSelectedTextContext}
            className="text-blue-500 hover:underline text-xs"
          >
            Use {useSelectedTextAsContext ? 'Full Writing' : 'Selected Text'}
          </button>
        </div>
        <div className="text-xs italic text-gray-600">
          {truncateContext(contextDisplay)}
        </div>
      </div>


      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50"
      >
        {chatHistory.map((entry, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg max-w-xs whitespace-pre-wrap ${entry.role === 'user'
              ? 'bg-blue-100 self-end ml-auto text-right'
              : 'bg-gray-100 self-start mr-auto'
              }`}
          >
            {entry.content}
          </div>
        ))}
        {isLoading && (
          <div className="p-2 rounded-lg bg-gray-200 italic text-gray-600 w-fit">
            Thinking...
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Ask AI something..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-4 py-2 text-sm rounded-lg ${prompt.trim() === '' || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            disabled={prompt.trim() === '' || isLoading}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};
export default AIChatSidebar;