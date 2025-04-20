'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlock from '@tiptap/extension-code-block';
import DiffOverlay from '@/components/DiffOverlay';
import { JSONContent } from '@tiptap/core';
import Highlight from '@tiptap/extension-highlight'; // Import Highlight extension

interface EditorProps {
  initialContent?: JSONContent;
  onContentChange: (content: JSONContent) => void;
  onTextSelect: (selectedText: string | null) => void;
  aiSuggestion?: string; // AI suggested change (stringified JSON)
  onAcceptSuggestion: () => void;
  onRejectSuggestion: () => void;
  onModifySelectedText: (selectedText: string) => void; // New prop
}

const Editor: React.FC<EditorProps> = React.forwardRef(
  ({
    initialContent,
    onContentChange,
    onTextSelect,
    aiSuggestion,
    onAcceptSuggestion,
    onRejectSuggestion,
    onModifySelectedText, // Destructure new prop
  }, ref) => {
    const [mounted, setMounted] = useState(false); // Ensure Tiptap is only initialized client-side
    const [editorContent, setEditorContent] =
      useState<JSONContent | null>(initialContent || null);
    const [selectionCoords, setSelectionCoords] = useState<{
      x: number;
      y: number;
    } | null>(null); // State for button position
    const [showModifyButton, setShowModifyButton] = useState(false);
    const [selectedTextEditor, setSelectedTextEditor] = useState<string | null>(null);

    const editorContainerRef = useRef<HTMLDivElement | null>(null);

    const extensions = useMemo(
      () => [
        StarterKit.configure({
          history: true,
        }),
        Image,
        Link,
        Underline,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        CodeBlock,
        Highlight, // Add Highlight extension here
      ],
      []
    );

    const editor = useEditor({
      extensions: extensions,
      content: editorContent,
      onUpdate: ({ editor }) => {
        const jsonContent = editor.getJSON();
        setEditorContent(jsonContent);
        onContentChange(jsonContent);
      },
      onSelectionUpdate: ({ editor }) => {
        const selection = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(selection.from, selection.to, "\n"); // Corrected line
        onTextSelect(selectedText || null);
        setSelectedTextEditor(selectedText || null);

        if (selectedText && selectedText.length > 0) {
          // Get selection coordinates
          const { from, to } = selection;
          if (from !== to) {
            try {
              // Use the editorContainerRef to get the relative position
              if (editorContainerRef.current) {
                const editorContainerRect = editorContainerRef.current.getBoundingClientRect();
                const start = editor.view.coordsAtPos(from);
                const x = start.left - editorContainerRect.left;
                const y = start.top - editorContainerRect.top - 20; // Adjust as needed

                setSelectionCoords({ x, y });
                setShowModifyButton(true);
              }

            } catch (e) {
              console.warn("can't get coordinate in this selection", e);
              setShowModifyButton(false);
              setSelectionCoords(null);
            }
          } else {
            setShowModifyButton(false);
            setSelectionCoords(null);
          }
        } else {
          setShowModifyButton(false);
          setSelectionCoords(null);
        }
      },
    });

    // Expose editor object to parent component
    React.useImperativeHandle(
      ref,
      () => ({
        editor: editor,
      }),
      [editor]
    );

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      // Update Tiptap content when initialContent prop changes
      if (editor && initialContent) {
        editor.commands.setContent(initialContent);
        setEditorContent(initialContent);
      }
    }, [editor, initialContent]);

    if (!mounted) {
      return <p>Loading editor...</p>;
    }

    const handleAccept = () => {
      onAcceptSuggestion();
    };

    const handleReject = () => {
      onRejectSuggestion();
    };

    const handleModifyClick = () => {
      if (editor && selectedTextEditor) {
        onModifySelectedText(selectedTextEditor);
        setShowModifyButton(false);
        setSelectionCoords(null);
      }
    };

    return (
      <div className="border rounded-md shadow-sm relative" ref={editorContainerRef}>
        {editor && showModifyButton && selectionCoords && (
          <button
            onClick={handleModifyClick}
            className="absolute bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm"
            style={{
              top: selectionCoords.y,
              left: selectionCoords.x,
              zIndex: 100,
            }}
          >
            Modify This
          </button>
        )}
        {editor ? (
          <>
            <EditorContent
              editor={editor}
              className="p-4 prose prose-stone max-w-none"
            />

            {aiSuggestion && (
              <div className="p-4 bg-gray-100 border-t">
                <p>AI Suggestion:</p>
                {/* Display diff overlay here */}
                <DiffOverlay
                  oldText={selectedTextEditor ? selectedTextEditor : editor.getText()}
                  newText={aiSuggestion}
                />

                <button
                  onClick={handleAccept}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Accept
                </button>
                <button
                  onClick={handleReject}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Reject
                </button>
              </div>
            )}
          </>
        ) : (
          <div>Editor loading...</div>
        )}
      </div>
    );
  }
);

Editor.displayName = 'Editor';

export default Editor;