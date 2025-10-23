'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { MathfieldElement } from 'mathlive';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Import MathLive CSS
import 'mathlive/static.css';

export interface MathLiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (latex: string) => void;
  mode?: 'inline' | 'block';
  initialLatex?: string;
}

export function MathLiveDialog({
  open,
  onOpenChange,
  onInsert,
  mode = 'inline',
  initialLatex = '',
}: MathLiveDialogProps) {
  const t = useTranslations();
  const mathfieldRef = useRef<MathfieldElement | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize MathLive when dialog opens
  useEffect(() => {
    if (!isClient || !open) return;

    const initMathLive = async () => {
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
            
            // Listen for virtual keyboard visibility changes
            mathfieldRef.current.addEventListener(
              'virtual-keyboard-toggle',
              (evt: Event) => {
                const customEvt = evt as CustomEvent;
                setIsKeyboardVisible(customEvt.detail.visible);
              }
            );
            
            // Focus the mathfield
            mathfieldRef.current.focus();
          }
        }, 0);
      } catch (error) {
        console.error('Failed to initialize MathLive:', error);
      }
    };

    initMathLive();

    return () => {
      // Clean up keyboard visibility listener
      if (mathfieldRef.current) {
        setIsKeyboardVisible(false);
      }
    };
  }, [open, isClient, initialLatex]);

  const handleInsert = () => {
    if (mathfieldRef.current) {
      const latex = mathfieldRef.current.value;
      if (latex.trim()) {
        onInsert(latex.trim());
        onOpenChange(false);
      }
    }
  };

  const handleClear = () => {
    if (mathfieldRef.current) {
      mathfieldRef.current.value = '';
      mathfieldRef.current.focus();
    }
  };

  const showVirtualKeyboard = () => {
    if (mathfieldRef.current) {
      mathfieldRef.current.executeCommand('showVirtualKeyboard');
    }
  };

  const hideVirtualKeyboard = () => {
    if (mathfieldRef.current) {
      mathfieldRef.current.executeCommand('hideVirtualKeyboard');
      setIsKeyboardVisible(false);
    }
  };

  if (!isClient) {
    return null; // Don't render anything on server
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {t('editor.mathEditor.title', { fallback: 'Math Editor' })}
            {mode === 'block' && (
              <span className="ml-2 text-xs sm:text-sm font-normal text-muted-foreground">
                ({t('editor.mathEditor.displayMode', { fallback: 'Display mode' })})
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {t('editor.mathEditor.mathLiveDescription', {
              fallback: 'Edit mathematical expressions with visual editing and LaTeX support',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* MathLive Editor */}
          <div className="border rounded-lg p-4 bg-background min-h-[200px] flex items-center justify-center">
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
              className="w-full"
              dangerouslySetInnerHTML={{
                __html: `<math-field class="w-full" style="font-size: ${mode === 'block' ? '2rem' : '1.5rem'}; padding: 1rem; border: none; outline: none;"></math-field>`,
              }}
            />
          </div>

          {/* Virtual Keyboard Button */}
          <div className="flex justify-center gap-2">
            {!isKeyboardVisible ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={showVirtualKeyboard}
              >
                ⌨️ {t('editor.mathEditor.showKeyboard', { fallback: 'Show Virtual Keyboard' })}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={hideVirtualKeyboard}
              >
                <X className="h-4 w-4 mr-1" />
                {t('editor.mathEditor.hideKeyboard', { fallback: 'Hide Virtual Keyboard' })}
              </Button>
            )}
          </div>

          {/* Quick Help */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>{t('editor.mathEditor.tips', { fallback: 'Tips' })}:</strong>
            </p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Type naturally: "x^2" for superscript, "x_i" for subscript</li>
              <li>Use "/" for fractions: "1/2" becomes ½</li>
              <li>Type "\sqrt" for square root, "\sum" for summation</li>
              <li>Use arrow keys to navigate, Esc to exit</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClear}>
            {t('editor.mathEditor.clear', { fallback: 'Clear' })}
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel', { fallback: 'Cancel' })}
          </Button>
          <Button type="button" onClick={handleInsert}>
            {t('editor.mathEditor.insert', { fallback: 'Insert' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
