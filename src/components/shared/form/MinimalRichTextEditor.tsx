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
} from 'lucide-react';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useIsHydrated } from '../hooks/useIsHydrated';
import { MathLiveDialogLazy as MathLiveDialog } from './lazy';
import { MathInlineWithEditing, MathDisplayWithEditing } from './extensions';

export interface MinimalRichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: string;
  id?: string;
}

export function MinimalRichTextEditor({
  content,
  onChange,
  placeholder = 'Start typing...',
  disabled = false,
  className,
  minHeight = '120px',
  id,
}: MinimalRichTextEditorProps) {
  const isHydrated = useIsHydrated();
  const t = useTranslations();
  const [mathEditorOpen, setMathEditorOpen] = useState(false);
  const [mathEditorMode, setMathEditorMode] = useState<'inline' | 'block'>('inline');
  const [initialLatexForDialog, setInitialLatexForDialog] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable headings for simplicity
        codeBlock: false, // Disable code blocks
      }),
      Placeholder.configure({
        placeholder,
      }),
      MathInlineWithEditing,
      MathDisplayWithEditing,
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

  // Listen for expand events from inline math editor
  useEffect(() => {
    const currentRef = editorRef.current;
    if (!currentRef) return;

    const handleExpandMath = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { latex, mode, updateAttributes } = customEvent.detail;
      
      setInitialLatexForDialog(latex);
      setMathEditorMode(mode);
      setMathEditorOpen(true);

      // Store the updateAttributes function for when the dialog saves
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (currentRef as any).__mathUpdateAttributes = updateAttributes;
    };

    currentRef.addEventListener('expandMathEditor', handleExpandMath);

    return () => {
      currentRef.removeEventListener('expandMathEditor', handleExpandMath);
    };
  }, []);

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
          'border rounded-lg overflow-hidden bg-background',
          disabled && 'opacity-60',
          className
        )}
      >
        <div className="border-b bg-muted/20 p-2 flex items-center gap-1">
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
        </div>
        <div className="p-3" style={{ minHeight }}>
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  const insertInlineFormula = () => {
    setMathEditorMode('inline');
    setInitialLatexForDialog('');
    setMathEditorOpen(true);
  };

  const insertBlockFormula = () => {
    setMathEditorMode('block');
    setInitialLatexForDialog('');
    setMathEditorOpen(true);
  };

  const handleMathInsert = (latex: string) => {
    if (!editor) return;

    // Check if this is an update from expanded inline editor
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateAttributes = (editorRef.current as any)?.__mathUpdateAttributes;
    
    if (updateAttributes) {
      // Update existing formula
      updateAttributes({ latex });
      // Clear the stored function
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (editorRef.current as any).__mathUpdateAttributes;
    } else {
      // Insert new formula
      if (mathEditorMode === 'inline') {
        editor.chain().focus().insertContent({
          type: 'mathInline',
          attrs: { latex },
        }).run();
      } else {
        editor.chain().focus().insertContent({
          type: 'mathDisplay',
          attrs: { latex },
        }).run();
      }
    }
    
    // Clear initial latex
    setInitialLatexForDialog('');
  };

  return (
    <div
      ref={editorRef}
      className={cn(
        'border rounded-lg overflow-hidden bg-background transition-all',
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
        initialLatex={initialLatexForDialog}
      />

      {/* Minimal Toolbar - Essential formatting with code and math */}
      <div className="border-b bg-muted/20 px-2 py-1.5 flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={
            disabled || !editor.can().chain().focus().toggleBold().run()
          }
          className={cn(
            'h-7 w-7 p-0',
            editor.isActive('bold') && 'bg-accent'
          )}
          aria-label={t('editor.toolbar.bold', { fallback: 'Bold' })}
          title={t('editor.toolbar.bold', { fallback: 'Bold' })}
        >
          <Bold className="h-3.5 w-3.5" />
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
            'h-7 w-7 p-0',
            editor.isActive('italic') && 'bg-accent'
          )}
          aria-label={t('editor.toolbar.italic', { fallback: 'Italic' })}
          title={t('editor.toolbar.italic', { fallback: 'Italic' })}
        >
          <Italic className="h-3.5 w-3.5" />
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
            'h-7 w-7 p-0',
            editor.isActive('code') && 'bg-accent'
          )}
          aria-label={t('editor.toolbar.code', { fallback: 'Code' })}
          title={t('editor.toolbar.code', { fallback: 'Code' })}
        >
          <Code className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={
            disabled || !editor.can().chain().focus().toggleBulletList().run()
          }
          className={cn(
            'h-7 w-7 p-0',
            editor.isActive('bulletList') && 'bg-accent'
          )}
          aria-label={t('editor.toolbar.bulletList', { fallback: 'Bullet List' })}
          title={t('editor.toolbar.bulletList', { fallback: 'Bullet List' })}
        >
          <List className="h-3.5 w-3.5" />
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
            'h-7 w-7 p-0',
            editor.isActive('orderedList') && 'bg-accent'
          )}
          aria-label={t('editor.toolbar.orderedList', { fallback: 'Ordered List' })}
          title={t('editor.toolbar.orderedList', { fallback: 'Ordered List' })}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Button>

        {/* Math buttons */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertInlineFormula}
          disabled={disabled}
          className="h-7 px-1.5 text-sm font-semibold"
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
          disabled={disabled}
          className="h-7 px-1.5 text-sm font-semibold"
          aria-label={t('editor.toolbar.insertBlockFormula', { fallback: 'Insert block formula' })}
          title={t('editor.toolbar.insertBlockFormulaHint', { fallback: 'Insert block formula $$...$$ (LaTeX)' })}
        >
          ∑
        </Button>
      </div>

      {/* Editor */}
      <div className="overflow-y-auto" style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
