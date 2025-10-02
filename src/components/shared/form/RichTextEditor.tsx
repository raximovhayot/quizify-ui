'use client';

import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Code,
  Italic,
  List,
  ListOrdered,
  Redo,
  Undo,
} from 'lucide-react';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: string;
  id?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start typing...',
  disabled = false,
  className,
  minHeight = '120px',
  id,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable: !disabled,
    immediatelyRender: false, // Fix SSR hydration mismatch
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2',
          disabled && 'opacity-50 cursor-not-allowed'
        ),
        ...(id && { id }),
      },
    },
  });

  // Update editor content when prop changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        'border rounded-md overflow-hidden bg-background',
        disabled && 'opacity-60',
        className
      )}
    >
      {/* Toolbar */}
      <div className="border-b bg-muted/30 p-2 flex flex-wrap items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={
            disabled || !editor.can().chain().focus().toggleBold().run()
          }
          className={cn('h-8 w-8 p-0', editor.isActive('bold') && 'bg-accent')}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={
            disabled || !editor.can().chain().focus().toggleItalic().run()
          }
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('italic') && 'bg-accent'
          )}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={
            disabled || !editor.can().chain().focus().toggleCode().run()
          }
          className={cn('h-8 w-8 p-0', editor.isActive('code') && 'bg-accent')}
          aria-label="Code"
        >
          <Code className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={
            disabled || !editor.can().chain().focus().toggleBulletList().run()
          }
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('bulletList') && 'bg-accent'
          )}
          aria-label="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={
            disabled || !editor.can().chain().focus().toggleOrderedList().run()
          }
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('orderedList') && 'bg-accent'
          )}
          aria-label="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().chain().focus().undo().run()}
          className="h-8 w-8 p-0"
          aria-label="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().chain().focus().redo().run()}
          className="h-8 w-8 p-0"
          aria-label="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div className="overflow-y-auto" style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

/**
 * Helper to extract plain text from HTML (for previews)
 */
export function stripHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: simple regex strip
    return html.replace(/<[^>]*>/g, '');
  }
  // Client-side: use DOM parser
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * Component to render rich text content (read-only)
 */
export function RichTextDisplay({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn('prose prose-sm max-w-none', className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
