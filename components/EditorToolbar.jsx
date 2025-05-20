'use client';

import React from 'react';
const EditorToolbar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    return (
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
            <button onClick={() => editor.chain().focus().toggleHighlight().run()} className="mr-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">
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
        </div>
    );
};

export default EditorToolbar;