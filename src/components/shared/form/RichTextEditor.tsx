'use client';

import Mathematics from '@tiptap/extension-mathematics';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Code,
  Eye,
  EyeOff,
  Italic,
  List,
  ListOrdered,
  Redo,
  Undo,
} from 'lucide-react';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { sanitizeHtml } from '@/lib/sanitize';
import { cn } from '@/lib/utils';

import { useIsHydrated } from '../hooks/useIsHydrated';
import { MathLiveDialogLazy as MathLiveDialog } from './lazy';

// Dynamic import for KaTeX to avoid SSR issues
let katex: typeof import('katex').default | null = null;
if (typeof window !== 'undefined') {
  import('katex').then((module) => {
    katex = module.default;
  });
}

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
  const isHydrated = useIsHydrated();
  const t = useTranslations();
  const [showMathSource, setShowMathSource] = useState(false);
  const [mathEditorOpen, setMathEditorOpen] = useState(false);
  const [mathEditorMode, setMathEditorMode] = useState<'inline' | 'block'>('inline');

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
      Mathematics,
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
          disabled && 'opacity-50 cursor-not-allowed',
          showMathSource && 'math-source-mode'
        ),
        ...(id && { id }),
      },
    },
  });

  // Render math formulas when editor updates
  useEffect(() => {
    if (!editor || !isHydrated || showMathSource) return;
    
    const renderMath = async () => {
      if (!katex) return;
      
      const editorElement = editor.view.dom;
      const mathElements = editorElement.querySelectorAll('.math-inline, .math-display');
      
      mathElements.forEach((element) => {
        const latex = element.textContent || '';
        const displayMode = element.classList.contains('math-display');
        
        try {
          if (katex) {
            katex.render(latex, element as HTMLElement, {
              throwOnError: false,
              displayMode,
            });
          }
        } catch {
          // Silently fail - KaTeX render error
        }
      });
    };
    
    renderMath();
  }, [editor, isHydrated, showMathSource, content]);

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

  // Show loading state during SSR/hydration
  if (!isHydrated || !editor) {
    return (
      <div
        className={cn(
          'border rounded-xl overflow-hidden bg-background',
          disabled && 'opacity-60',
          className
        )}
      >
        <div className="border-b bg-muted/20 p-2 flex flex-wrap items-center gap-1">
          <div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="p-3" style={{ minHeight }}>
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  const insertInlineFormula = () => {
    setMathEditorMode('inline');
    setMathEditorOpen(true);
  };

  const insertBlockFormula = () => {
    setMathEditorMode('block');
    setMathEditorOpen(true);
  };

  const handleMathInsert = (latex: string) => {
    if (!editor) return;
    
    if (mathEditorMode === 'inline') {
      editor.chain().focus().insertContent(`$${latex}$`).run();
    } else {
      editor.chain().focus().insertContent(`$$${latex}$$`).run();
    }
  };

  const insertSymbol = (symbol: string) => {
    editor.chain().focus().insertContent(symbol).run();
  };

  const toggleMathSource = () => {
    setShowMathSource(!showMathSource);
  };

  return (
    <div
      className={cn(
        'border rounded-xl overflow-hidden bg-background transition-all hover:border-primary/50',
        disabled && 'opacity-60',
        className
      )}
    >
      {/* Math Editor Dialog - Now with MathLive! */}
      <MathLiveDialog
        open={mathEditorOpen}
        onOpenChange={setMathEditorOpen}
        onInsert={handleMathInsert}
        mode={mathEditorMode}
      />

      {/* Toolbar */}
      <div className="border-b bg-muted/20 p-1.5 sm:p-2 flex flex-wrap items-center gap-0.5 sm:gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={
            disabled || !editor.can().chain().focus().toggleBold().run()
          }
          className={cn(
            'h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg',
            editor.isActive('bold') && 'bg-accent'
          )}
          aria-label={t('editor.toolbar.bold', { fallback: 'Bold' })}
          title={t('editor.toolbar.bold', { fallback: 'Bold' })}
        >
          <Bold className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
            'h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg',
            editor.isActive('italic') && 'bg-accent'
          )}
          aria-label={t('editor.toolbar.italic', { fallback: 'Italic' })}
          title={t('editor.toolbar.italic', { fallback: 'Italic' })}
        >
          <Italic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={
            disabled || !editor.can().chain().focus().toggleCode().run()
          }
          className={cn(
            'h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg',
            editor.isActive('code') && 'bg-accent'
          )}
          aria-label={t('editor.toolbar.code', { fallback: 'Code' })}
          title={t('editor.toolbar.code', { fallback: 'Code' })}
        >
          <Code className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>

        <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={
            disabled || !editor.can().chain().focus().toggleBulletList().run()
          }
          className={cn(
            'h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg',
            editor.isActive('bulletList') && 'bg-accent'
          )}
          aria-label={t('editor.toolbar.bulletList', { fallback: 'Bullet List' })}
          title={t('editor.toolbar.bulletList', { fallback: 'Bullet List' })}
        >
          <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
            'h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg',
            editor.isActive('orderedList') && 'bg-accent'
          )}
          aria-label={t('editor.toolbar.orderedList', { fallback: 'Ordered List' })}
          title={t('editor.toolbar.orderedList', { fallback: 'Ordered List' })}
        >
          <ListOrdered className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>

        <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1" />

        {/* Math & Symbols */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertInlineFormula}
          className="h-7 sm:h-8 px-1.5 sm:px-2 rounded-lg text-sm sm:text-base font-semibold"
          aria-label={t('editor.toolbar.insertInlineFormula', { fallback: 'Insert inline formula' })}
          title={t('editor.toolbar.insertInlineFormulaHint', { fallback: 'Insert inline formula $...$ (LaTeX)' })}
        >
          𝑥²
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertBlockFormula}
          className="h-7 sm:h-8 px-1.5 sm:px-2 rounded-lg text-sm sm:text-base font-semibold"
          aria-label={t('editor.toolbar.insertBlockFormula', { fallback: 'Insert block formula' })}
          title={t('editor.toolbar.insertBlockFormulaHint', { fallback: 'Insert block formula $$...$$ (LaTeX)' })}
        >
          ∑
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleMathSource}
          className={cn(
            'h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg',
            showMathSource && 'bg-accent'
          )}
          aria-label={t('editor.toolbar.toggleMathSource', { fallback: 'Toggle LaTeX source' })}
          title={t('editor.toolbar.toggleMathSourceHint', { fallback: 'Toggle between rendered and LaTeX source' })}
        >
          {showMathSource ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
        </Button>
        <div className="hidden lg:flex items-center gap-0.5 sm:gap-1">
          {['Ω','π','±','×','÷','≤','≥','≈','√','∑','∫','∞','→','↔','α','β','γ'].map((s) => (
            <Button
              key={s}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertSymbol(s)}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg text-sm sm:text-base"
              aria-label={t('editor.toolbar.insertSymbol', { fallback: 'Insert {symbol}', symbol: s })}
              title={t('editor.toolbar.insertSymbol', { fallback: 'Insert {symbol}', symbol: s })}
            >
              {s}
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().chain().focus().undo().run()}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg"
          aria-label={t('editor.toolbar.undo', { fallback: 'Undo' })}
          title={t('editor.toolbar.undo', { fallback: 'Undo' })}
        >
          <Undo className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().chain().focus().redo().run()}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg"
          aria-label={t('editor.toolbar.redo', { fallback: 'Redo' })}
          title={t('editor.toolbar.redo', { fallback: 'Redo' })}
        >
          <Redo className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
 *
 * This component sanitizes HTML content before rendering to prevent XSS attacks.
 * It uses DOMPurify to remove potentially dangerous HTML/JS while preserving
 * safe formatting tags.
 */
export function RichTextDisplay({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = sanitizeHtml(content);

  return (
    <div
      className={cn('prose prose-sm max-w-none', className)}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
