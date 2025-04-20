'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
}

const Editor: React.FC<EditorProps> = ({
    initialContent,
    onContentChange,
    onTextSelect,
    aiSuggestion,
    onAcceptSuggestion,
    onRejectSuggestion,
}) => {
    const [mounted, setMounted] = useState(false); // Ensure Tiptap is only initialized client-side
    const [editorContent, setEditorContent] = useState<JSONContent | null>(initialContent || null);

    const extensions = useMemo(() => [
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
    ], []);

    const editor = useEditor({
        extensions: extensions,
        content: editorContent,
        onUpdate: ({ editor }) => {
            const jsonContent = editor.getJSON();
            setEditorContent(jsonContent);
            onContentChange(jsonContent);
        },
        onSelectionUpdate: ({ editor }) => {
            const selectedText = editor.getText();
            onTextSelect(selectedText || null);
        },
    });

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

    // Highlight handler function
    const handleHighlight = () => {
        if (editor) {
            editor.chain().focus().toggleHighlight().run();
        }
    };

    return (
        <div className="border rounded-md shadow-sm">
            {editor ? (
                <>
                    <div className="p-2 border-b">
                        <button onClick={() => editor.chain().focus().toggleBold().run()} className="mr-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">
                            Bold
                        </button>
                        <button onClick={() => editor.chain().focus().toggleItalic().run()} className="mr-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">
                            Italic
                        </button>
                        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className="mr-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">
                            Underline
                        </button>
                        {/* Added Highlight button */}
                        <button onClick={handleHighlight} className="mr-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">
                            Highlight
                        </button>
                        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="mr-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">
                            Code Block
                        </button>
                        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="mr-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">
                            H1
                        </button>
                        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="mr-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">
                            H2
                        </button>
                        <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className="mr-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">
                            Left
                        </button>
                        <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className="mr-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">
                            Center
                        </button>
                        <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className="mr-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">
                            Right
                        </button>
                        <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className="mr-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">
                            Justify
                        </button>
                        {/* Add more buttons for other formatting options */}
                    </div>
                    <EditorContent editor={editor} className="p-4 prose prose-stone max-w-none" />

                    {aiSuggestion && (
                        <div className="p-4 bg-gray-100 border-t">
                            <p>AI Suggestion:</p>
                            {/* Display diff overlay here */}
                            <DiffOverlay oldText={editor.getText()} newText={aiSuggestion} />

                            <button onClick={handleAccept} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">
                                Accept
                            </button>
                            <button onClick={handleReject} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
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
};

export default Editor;