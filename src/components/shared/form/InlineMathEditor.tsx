'use client';

import { useEffect, useRef, useState } from 'react';
import type { MathfieldElement } from 'mathlive';
import { Maximize2, X, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Import MathLive CSS
import 'mathlive/static.css';

export interface InlineMathEditorProps {
  initialLatex: string;
  onSave: (latex: string) => void;
  onCancel: () => void;
  onExpand?: () => void;
  mode?: 'inline' | 'block';
  className?: string;
}

/**
 * Inline MathLive editor component
 * 
 * A compact, popover-style math editor that appears inline in the document.
 * Used for quick edits of existing formulas without opening a full dialog.
 * 
 * Features:
 * - WYSIWYG editing with MathLive
 * - Compact inline display
 * - Option to expand to full dialog
 * - Keyboard navigation (Enter to save, Escape to cancel)
 */
export function InlineMathEditor({
  initialLatex,
  onSave,
  onCancel,
  onExpand,
  mode = 'inline',
  className,
}: InlineMathEditorProps) {
  const mathfieldRef = useRef<MathfieldElement | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize MathLive
  useEffect(() => {
    if (!isClient) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    const initMathField = async () => {
      try {
        // Dynamically import MathLive to avoid SSR issues
        const { MathfieldElement } = await import('mathlive');

        // Register custom element if not already registered
        if (!customElements.get('math-field')) {
          customElements.define('math-field', MathfieldElement);
        }

        // Wait for next tick to ensure element is in DOM
        setTimeout(() => {
          if (mathfieldRef.current) {
            mathfieldRef.current.value = initialLatex;
            mathfieldRef.current.mathModeSpace = '\\:';
            
            // Configure virtual keyboard
            mathfieldRef.current.mathVirtualKeyboardPolicy = 'manual';
            
            // Focus the mathfield
            mathfieldRef.current.focus();

            // Handle keyboard shortcuts
            mathfieldRef.current.addEventListener('keydown', handleKeyDown);
          }
        }, 0);
      } catch (error) {
        console.error('Failed to initialize MathLive:', error);
      }
    };

    initMathField();

    return () => {
      if (mathfieldRef.current) {
        mathfieldRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, initialLatex]);

  const handleSave = () => {
    if (mathfieldRef.current) {
      const latex = mathfieldRef.current.value;
      if (latex.trim()) {
        onSave(latex.trim());
      } else {
        onCancel();
      }
    }
  };

  const handleExpandClick = () => {
    if (onExpand) {
      onExpand();
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div
      className={cn(
        'inline-block border-2 border-primary rounded-lg p-3 bg-background shadow-lg',
        'min-w-[280px] max-w-[600px] z-50',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Math Editor */}
      <div
        ref={(el) => {
          if (el) {
            // Create and attach math-field element
            const mathField = el.querySelector('math-field') as MathfieldElement | null;
            if (mathField && mathfieldRef.current !== mathField) {
              mathfieldRef.current = mathField;
            }
          }
        }}
        className="mb-3"
        dangerouslySetInnerHTML={{
          __html: `<math-field class="w-full" style="font-size: ${mode === 'block' ? '1.5rem' : '1.25rem'}; padding: 0.5rem; border: 1px solid hsl(var(--border)); border-radius: 0.375rem; min-height: 60px;"></math-field>`,
        }}
      />

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          Press Enter to save, Esc to cancel
        </div>
        <div className="flex items-center gap-1">
          {onExpand && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleExpandClick}
              title="Expand to full editor"
              className="h-7 w-7 p-0"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onCancel}
            className="h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className="h-7 px-3"
          >
            <Check className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
