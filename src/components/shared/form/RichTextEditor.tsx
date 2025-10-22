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
    const formula = prompt(
      t('editor.toolbar.insertFormulaPrompt', { 
        fallback: 'Enter LaTeX formula (e.g., x^2, \\frac{a}{b}, \\sqrt{x})' 
      }), 
      'x^2 + y^2 = z^2'
    );
    if (formula == null) return;
    // Insert inline math using $...$
    editor.chain().focus().insertContent(`$${formula}$`).run();
  };

  const insertBlockFormula = () => {
    const formula = prompt(
      t('editor.toolbar.insertBlockFormulaPrompt', { 
        fallback: 'Enter LaTeX formula for display mode' 
      }), 
      '\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}'
    );
    if (formula == null) return;
    // Insert block math using $$...$$
    editor.chain().focus().insertContent(`$$${formula}$$`).run();
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
      {/* Toolbar */}
      <div className="border-b bg-muted/20 p-2 flex flex-wrap items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={
            disabled || !editor.can().chain().focus().toggleBold().run()
          }
          className={cn(
            'h-8 w-8 p-0 rounded-lg',
            editor.isActive('bold') && 'bg-accent'
          )}
          aria-label={t('editor.toolbar.bold', { fallback: 'Bold' })}
          title={t('editor.toolbar.bold', { fallback: 'Bold' })}
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
            'h-8 w-8 p-0 rounded-lg',
            editor.isActive('italic') && 'bg-accent'
          )}
          aria-label={t('editor.toolbar.italic', { fallback: 'Italic' })}
          title={t('editor.toolbar.italic', { fallback: 'Italic' })}
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
          className={cn(
            'h-8 w-8 p-0 rounded-lg',
            editor.isActive('code') && 'bg-accent'
          )}
          aria-label={t('editor.toolbar.code', { fallback: 'Code' })}
          title={t('editor.toolbar.code', { fallback: 'Code' })}
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
            'h-8 w-8 p-0 rounded-lg',
            editor.isActive('bulletList') && 'bg-accent'
          )}
          aria-label={t('editor.toolbar.bulletList', { fallback: 'Bullet List' })}
          title={t('editor.toolbar.bulletList', { fallback: 'Bullet List' })}
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
            'h-8 w-8 p-0 rounded-lg',
            editor.isActive('orderedList') && 'bg-accent'
          )}
          aria-label={t('editor.toolbar.orderedList', { fallback: 'Ordered List' })}
          title={t('editor.toolbar.orderedList', { fallback: 'Ordered List' })}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Math & Symbols */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertInlineFormula}
          className="h-8 px-2 rounded-lg text-base font-semibold"
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
          className="h-8 px-2 rounded-lg text-base font-semibold"
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
            'h-8 w-8 p-0 rounded-lg',
            showMathSource && 'bg-accent'
          )}
          aria-label={t('editor.toolbar.toggleMathSource', { fallback: 'Toggle LaTeX source' })}
          title={t('editor.toolbar.toggleMathSourceHint', { fallback: 'Toggle between rendered and LaTeX source' })}
        >
          {showMathSource ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <div className="flex items-center gap-1">
          {['Ω','π','±','×','÷','≤','≥','≈','√','∑','∫','∞','→','↔','α','β','γ'].map((s) => (
            <Button
              key={s}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertSymbol(s)}
              className="h-8 w-8 p-0 rounded-lg"
              aria-label={t('editor.toolbar.insertSymbol', { fallback: 'Insert {symbol}', symbol: s })}
              title={t('editor.toolbar.insertSymbol', { fallback: 'Insert {symbol}', symbol: s })}
            >
              {s}
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().chain().focus().undo().run()}
          className="h-8 w-8 p-0 rounded-lg"
          aria-label={t('editor.toolbar.undo', { fallback: 'Undo' })}
          title={t('editor.toolbar.undo', { fallback: 'Undo' })}
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().chain().focus().redo().run()}
          className="h-8 w-8 p-0 rounded-lg"
          aria-label={t('editor.toolbar.redo', { fallback: 'Redo' })}
          title={t('editor.toolbar.redo', { fallback: 'Redo' })}
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
