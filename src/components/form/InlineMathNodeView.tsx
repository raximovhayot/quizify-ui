'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';

import { InlineMathEditor } from './InlineMathEditor';

/**
 * TipTap NodeView component for inline math editing
 * 
 * This component renders math formulas as clickable elements that open
 * an inline editor when clicked. It integrates with the TipTap editor
 * to provide seamless inline editing of mathematical expressions.
 * 
 * Features:
 * - Click to edit formulas inline
 * - Visual rendering with KaTeX
 * - Inline editor for quick edits
 * - Option to expand to full dialog
 */
export function InlineMathNodeView({
  node,
  updateAttributes,
  deleteNode,
  editor,
}: NodeViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  const latex = node.attrs.latex || '';
  const isDisplayMode = node.type.name === 'mathDisplay' || node.attrs.display;

  // Render math formula with KaTeX
  useEffect(() => {
    const renderMath = async () => {
      try {
        const katex = await import('katex');
        const html = katex.default.renderToString(latex, {
          throwOnError: false,
          displayMode: isDisplayMode,
        });
        setRenderedHtml(html);
      } catch {
        // Fallback to plain text if KaTeX fails
        setRenderedHtml(latex);
      }
    };

    if (latex && !isEditing) {
      renderMath();
    }
  }, [latex, isDisplayMode, isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only allow editing if editor is editable
    if (editor.isEditable) {
      setIsEditing(true);
    }
  };

  const handleSave = (newLatex: string) => {
    if (newLatex !== latex) {
      updateAttributes({ latex: newLatex });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleExpand = () => {
    // This will be handled by the parent editor component
    // We'll emit a custom event that the editor can listen to
    const event = new CustomEvent('expandMathEditor', {
      detail: {
        latex,
        mode: isDisplayMode ? 'block' : 'inline',
        updateAttributes,
      },
      bubbles: true,
    });
    containerRef.current?.dispatchEvent(event);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteNode();
  };

  return (
    <NodeViewWrapper
      ref={containerRef}
      className={isDisplayMode ? 'math-node-display' : 'math-node-inline'}
      data-drag-handle
    >
      {isEditing ? (
        <div className="relative inline-block">
          <InlineMathEditor
            initialLatex={latex}
            onSave={handleSave}
            onCancel={handleCancel}
            onExpand={handleExpand}
            mode={isDisplayMode ? 'block' : 'inline'}
          />
        </div>
      ) : (
        <span
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick(e as unknown as React.MouseEvent);
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
              e.preventDefault();
              handleDelete();
            }
          }}
          role="button"
          tabIndex={0}
          className={`
            math-formula cursor-pointer
            inline-flex items-center
            px-1 py-0.5 mx-0.5
            rounded
            hover:bg-accent
            hover:ring-2 hover:ring-primary/50
            transition-all
            ${isDisplayMode ? 'block my-2' : 'inline-block'}
          `}
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      )}
    </NodeViewWrapper>
  );
}
