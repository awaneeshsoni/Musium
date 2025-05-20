import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlock from '@tiptap/extension-code-block';
import DiffOverlay from '@/components/DiffOverlay';
import Highlight from '@tiptap/extension-highlight';

const Editor = React.forwardRef(
    ({
        initialContent,
        onContentChange,
        onTextSelect,
        aiSuggestion,
        onAcceptSuggestion,
        onRejectSuggestion,
        onModifySelectedText,
    }, ref) => {
        const [mounted, setMounted] = useState(false);
        const [editorContent, setEditorContent] =
            useState(initialContent || null);
        const [selectionCoords, setSelectionCoords] = useState(null);
        const [showModifyButton, setShowModifyButton] = useState(false);
        const [selectedTextEditor, setSelectedTextEditor] = useState(null);
        const editorContainerRef = useRef(null);
        const editorRef = useRef(null);  // Ref to store the editor instance

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
                Highlight,
            ],
            []
        );

        const editor = useEditor({
            extensions: extensions,
            content: initialContent, // Set initial content ONCE
            onUpdate: ({ editor }) => {
                const jsonContent = editor.getJSON();
                setEditorContent(jsonContent);
                onContentChange(jsonContent);
            },
            onSelectionUpdate: ({ editor }) => {
                const selection = editor.state.selection;
                const selectedText = editor.state.doc.textBetween(selection.from, selection.to, "\n");
                onTextSelect(selectedText || null);
                setSelectedTextEditor(selectedText || null);

                if (selectedText && selectedText.length > 0) {
                    const { from, to } = selection;
                    if (from !== to) {
                        try {
                            if (editorContainerRef.current) {
                                const editorContainerRect = editorContainerRef.current.getBoundingClientRect();
                                const start = editor.view.coordsAtPos(from);
                                const x = start.left - editorContainerRect.left;
                                const y = start.top - editorContainerRect.top - 20;

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

        React.useImperativeHandle(
            ref,
            () => ({
                editor: editor,
            }),
            [editor]
        );

        useEffect(() => {
            setMounted(true);
            editorRef.current = editor; // Store the editor instance
        }, [editor]);  // Include `editor` in the dependency array

        // REMOVE this useEffect.  It's causing the reset.
        // useEffect(() => {
        //     if (editor && initialContent) {
        //         editor.commands.setContent(initialContent);
        //         setEditorContent(initialContent);
        //     }
        // }, [editor, initialContent]);

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
                            className="p-4 prose prose-stone max-w-none proseMirror bg-white "
                        />

                        {aiSuggestion && (
                            <div className="p-4 bg-gray-100 border-t ">
                                <p>AI Suggestion:</p>
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