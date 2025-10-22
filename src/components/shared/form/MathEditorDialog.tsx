'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// Dynamic import for KaTeX to avoid SSR issues
let katex: typeof import('katex').default | null = null;
if (typeof window !== 'undefined') {
  import('katex').then((module) => {
    katex = module.default;
  });
}

export interface MathEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (latex: string) => void;
  mode?: 'inline' | 'block';
  initialLatex?: string;
}

// Math symbol categories
const MATH_SYMBOLS = {
  basic: [
    { symbol: '+', latex: '+', label: 'Plus' },
    { symbol: '-', latex: '-', label: 'Minus' },
    { symbol: '×', latex: '\\times', label: 'Times' },
    { symbol: '÷', latex: '\\div', label: 'Divide' },
    { symbol: '=', latex: '=', label: 'Equals' },
    { symbol: '≠', latex: '\\neq', label: 'Not equal' },
    { symbol: '≈', latex: '\\approx', label: 'Approximately' },
    { symbol: '±', latex: '\\pm', label: 'Plus-minus' },
    { symbol: '∓', latex: '\\mp', label: 'Minus-plus' },
    { symbol: '<', latex: '<', label: 'Less than' },
    { symbol: '>', latex: '>', label: 'Greater than' },
    { symbol: '≤', latex: '\\leq', label: 'Less or equal' },
    { symbol: '≥', latex: '\\geq', label: 'Greater or equal' },
  ],
  greek: [
    { symbol: 'α', latex: '\\alpha', label: 'Alpha' },
    { symbol: 'β', latex: '\\beta', label: 'Beta' },
    { symbol: 'γ', latex: '\\gamma', label: 'Gamma' },
    { symbol: 'δ', latex: '\\delta', label: 'Delta' },
    { symbol: 'ε', latex: '\\epsilon', label: 'Epsilon' },
    { symbol: 'θ', latex: '\\theta', label: 'Theta' },
    { symbol: 'λ', latex: '\\lambda', label: 'Lambda' },
    { symbol: 'μ', latex: '\\mu', label: 'Mu' },
    { symbol: 'π', latex: '\\pi', label: 'Pi' },
    { symbol: 'σ', latex: '\\sigma', label: 'Sigma' },
    { symbol: 'φ', latex: '\\phi', label: 'Phi' },
    { symbol: 'ω', latex: '\\omega', label: 'Omega' },
  ],
  operators: [
    { symbol: '∑', latex: '\\sum', label: 'Sum' },
    { symbol: '∏', latex: '\\prod', label: 'Product' },
    { symbol: '∫', latex: '\\int', label: 'Integral' },
    { symbol: '∮', latex: '\\oint', label: 'Contour integral' },
    { symbol: '∂', latex: '\\partial', label: 'Partial derivative' },
    { symbol: '∇', latex: '\\nabla', label: 'Nabla' },
    { symbol: '√', latex: '\\sqrt{}', label: 'Square root' },
    { symbol: '∞', latex: '\\infty', label: 'Infinity' },
    { symbol: '∀', latex: '\\forall', label: 'For all' },
    { symbol: '∃', latex: '\\exists', label: 'Exists' },
    { symbol: '∈', latex: '\\in', label: 'Element of' },
    { symbol: '∉', latex: '\\notin', label: 'Not element of' },
  ],
  arrows: [
    { symbol: '→', latex: '\\rightarrow', label: 'Right arrow' },
    { symbol: '←', latex: '\\leftarrow', label: 'Left arrow' },
    { symbol: '↔', latex: '\\leftrightarrow', label: 'Left-right arrow' },
    { symbol: '⇒', latex: '\\Rightarrow', label: 'Implies' },
    { symbol: '⇐', latex: '\\Leftarrow', label: 'Implied by' },
    { symbol: '⇔', latex: '\\Leftrightarrow', label: 'If and only if' },
    { symbol: '↑', latex: '\\uparrow', label: 'Up arrow' },
    { symbol: '↓', latex: '\\downarrow', label: 'Down arrow' },
  ],
  sets: [
    { symbol: '∪', latex: '\\cup', label: 'Union' },
    { symbol: '∩', latex: '\\cap', label: 'Intersection' },
    { symbol: '⊂', latex: '\\subset', label: 'Subset' },
    { symbol: '⊃', latex: '\\supset', label: 'Superset' },
    { symbol: '⊆', latex: '\\subseteq', label: 'Subset or equal' },
    { symbol: '⊇', latex: '\\supseteq', label: 'Superset or equal' },
    { symbol: '∅', latex: '\\emptyset', label: 'Empty set' },
    { symbol: 'ℕ', latex: '\\mathbb{N}', label: 'Natural numbers' },
    { symbol: 'ℤ', latex: '\\mathbb{Z}', label: 'Integers' },
    { symbol: 'ℚ', latex: '\\mathbb{Q}', label: 'Rational numbers' },
    { symbol: 'ℝ', latex: '\\mathbb{R}', label: 'Real numbers' },
    { symbol: 'ℂ', latex: '\\mathbb{C}', label: 'Complex numbers' },
  ],
};

// Math templates organized by category
const MATH_TEMPLATES = {
  basic: [
    { label: 'Fraction', latex: '\\frac{a}{b}', preview: 'a/b' },
    { label: 'Superscript', latex: 'x^{2}', preview: 'x²' },
    { label: 'Subscript', latex: 'x_{i}', preview: 'xᵢ' },
    { label: 'Square root', latex: '\\sqrt{x}', preview: '√x' },
    { label: 'Nth root', latex: '\\sqrt[n]{x}', preview: 'ⁿ√x' },
    { label: 'Absolute value', latex: '|x|', preview: '|x|' },
    { label: 'Binomial', latex: '\\binom{n}{k}', preview: '(n k)' },
    { label: 'Vector', latex: '\\vec{v}', preview: 'v⃗' },
  ],
  calculus: [
    { label: 'Sum', latex: '\\sum_{i=1}^{n}', preview: '∑' },
    { label: 'Product', latex: '\\prod_{i=1}^{n}', preview: '∏' },
    { label: 'Integral', latex: '\\int_{a}^{b}', preview: '∫' },
    { label: 'Double integral', latex: '\\iint_{D}', preview: '∬' },
    { label: 'Triple integral', latex: '\\iiint_{V}', preview: '∭' },
    { label: 'Limit', latex: '\\lim_{x \\to \\infty}', preview: 'lim' },
    { label: 'Derivative', latex: '\\frac{d}{dx}', preview: 'd/dx' },
    { label: 'Partial derivative', latex: '\\frac{\\partial}{\\partial x}', preview: '∂/∂x' },
  ],
  trigonometry: [
    { label: 'Sine', latex: '\\sin(x)', preview: 'sin(x)' },
    { label: 'Cosine', latex: '\\cos(x)', preview: 'cos(x)' },
    { label: 'Tangent', latex: '\\tan(x)', preview: 'tan(x)' },
    { label: 'Arcsine', latex: '\\arcsin(x)', preview: 'arcsin(x)' },
    { label: 'Arccosine', latex: '\\arccos(x)', preview: 'arccos(x)' },
    { label: 'Arctangent', latex: '\\arctan(x)', preview: 'arctan(x)' },
    { label: 'Secant', latex: '\\sec(x)', preview: 'sec(x)' },
    { label: 'Cosecant', latex: '\\csc(x)', preview: 'csc(x)' },
  ],
  matrices: [
    { label: 'Matrix 2×2', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', preview: '[2×2]' },
    { label: 'Matrix 3×3', latex: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}', preview: '[3×3]' },
    { label: 'Determinant 2×2', latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', preview: '|2×2|' },
    { label: 'Determinant 3×3', latex: '\\begin{vmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{vmatrix}', preview: '|3×3|' },
    { label: 'Bracket matrix', latex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}', preview: '[a b; c d]' },
    { label: 'Curly matrix', latex: '\\begin{Bmatrix} a & b \\\\ c & d \\end{Bmatrix}', preview: '{a b; c d}' },
  ],
  equations: [
    { label: 'System of equations', latex: '\\begin{cases} x + y = 1 \\\\ x - y = 0 \\end{cases}', preview: 'system' },
    { label: 'Quadratic formula', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', preview: 'quadratic' },
    { label: 'Pythagorean', latex: 'a^2 + b^2 = c^2', preview: 'a²+b²=c²' },
    { label: 'Equation alignment', latex: '\\begin{aligned} y &= mx + b \\\\ &= 2x + 3 \\end{aligned}', preview: 'aligned' },
  ],
  logic: [
    { label: 'And', latex: '\\land', preview: '∧' },
    { label: 'Or', latex: '\\lor', preview: '∨' },
    { label: 'Not', latex: '\\neg', preview: '¬' },
    { label: 'Implies', latex: '\\implies', preview: '⇒' },
    { label: 'If and only if', latex: '\\iff', preview: '⇔' },
    { label: 'Therefore', latex: '\\therefore', preview: '∴' },
    { label: 'Because', latex: '\\because', preview: '∵' },
  ],
};

export function MathEditorDialog({
  open,
  onOpenChange,
  onInsert,
  mode = 'inline',
  initialLatex = '',
}: MathEditorDialogProps) {
  const t = useTranslations();
  const [latex, setLatex] = useState(initialLatex);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(0);

  useEffect(() => {
    if (open) {
      setLatex(initialLatex);
      setPreviewError(null);
      setCursorPosition(initialLatex.length);
    }
  }, [open, initialLatex]);

  const insertSymbol = (symbolLatex: string) => {
    // Insert at current cursor position
    const newLatex = latex.slice(0, cursorPosition) + symbolLatex + latex.slice(cursorPosition);
    setLatex(newLatex);
    // Move cursor after inserted symbol
    setCursorPosition(cursorPosition + symbolLatex.length);
  };

  const handleInsert = () => {
    if (latex.trim()) {
      onInsert(latex.trim());
      onOpenChange(false);
    }
  };

  const handleClear = () => {
    setLatex('');
    setPreviewError(null);
  };

  // Render preview
  const renderPreview = () => {
    if (!latex.trim()) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          {t('editor.mathEditor.emptyPreview', { fallback: 'Preview will appear here' })}
        </div>
      );
    }

    if (!katex) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          {t('editor.mathEditor.loading', { fallback: 'Loading preview...' })}
        </div>
      );
    }

    try {
      const html = katex.renderToString(latex, {
        throwOnError: true,
        displayMode: mode === 'block',
      });
      setPreviewError(null);
      return (
        <div
          className="flex items-center justify-center h-full"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Invalid LaTeX';
      if (previewError !== errorMsg) {
        setPreviewError(errorMsg);
      }
      return (
        <div className="flex items-center justify-center h-full text-destructive text-sm">
          {errorMsg}
        </div>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-full flex flex-col">
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
            {t('editor.mathEditor.description', {
              fallback: 'Create mathematical expressions using LaTeX syntax',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* LaTeX Input */}
          <div className="space-y-2">
            <Label htmlFor="latex-input">
              {t('editor.mathEditor.latexInput', { fallback: 'LaTeX Input' })}
            </Label>
            <div className="flex gap-2">
              <Input
                id="latex-input"
                value={latex}
                onChange={(e) => {
                  setLatex(e.target.value);
                  setCursorPosition(e.target.selectionStart || 0);
                }}
                onSelect={(e) => {
                  const target = e.target as HTMLInputElement;
                  setCursorPosition(target.selectionStart || 0);
                }}
                placeholder={t('editor.mathEditor.placeholder', {
                  fallback: 'Enter LaTeX here, e.g., x^2 + y^2 = z^2',
                })}
                className="font-mono"
                autoFocus
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleClear}
                title={t('editor.mathEditor.clear', { fallback: 'Clear' })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>{t('editor.mathEditor.preview', { fallback: 'Preview' })}</Label>
            <div className="border rounded-lg p-4 bg-muted/20 min-h-[100px] max-h-[150px] overflow-auto">
              {renderPreview()}
            </div>
          </div>

          {/* Symbols and Templates */}
          <Tabs defaultValue="basic-templates" className="flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="w-full">
              <TabsList className="inline-flex w-full min-w-max gap-1 p-1">
                <TabsTrigger value="basic-templates" className="text-xs sm:text-sm whitespace-nowrap">
                  {t('editor.mathEditor.basicTemplates', { fallback: 'Basic' })}
                </TabsTrigger>
                <TabsTrigger value="calculus" className="text-xs sm:text-sm whitespace-nowrap">
                  {t('editor.mathEditor.calculus', { fallback: 'Calculus' })}
                </TabsTrigger>
                <TabsTrigger value="trigonometry" className="text-xs sm:text-sm whitespace-nowrap">
                  {t('editor.mathEditor.trigonometry', { fallback: 'Trig' })}
                </TabsTrigger>
                <TabsTrigger value="matrices" className="text-xs sm:text-sm whitespace-nowrap">
                  {t('editor.mathEditor.matrices', { fallback: 'Matrices' })}
                </TabsTrigger>
                <TabsTrigger value="equations" className="text-xs sm:text-sm whitespace-nowrap">
                  {t('editor.mathEditor.equations', { fallback: 'Equations' })}
                </TabsTrigger>
                <TabsTrigger value="logic" className="text-xs sm:text-sm whitespace-nowrap">
                  {t('editor.mathEditor.logic', { fallback: 'Logic' })}
                </TabsTrigger>
                <TabsTrigger value="symbols-basic" className="text-xs sm:text-sm whitespace-nowrap">
                  {t('editor.mathEditor.symbolsBasic', { fallback: 'Symbols' })}
                </TabsTrigger>
                <TabsTrigger value="greek" className="text-xs sm:text-sm whitespace-nowrap">
                  {t('editor.mathEditor.greek', { fallback: 'Greek' })}
                </TabsTrigger>
                <TabsTrigger value="operators" className="text-xs sm:text-sm whitespace-nowrap">
                  {t('editor.mathEditor.operators', { fallback: 'Operators' })}
                </TabsTrigger>
                <TabsTrigger value="arrows" className="text-xs sm:text-sm whitespace-nowrap">
                  {t('editor.mathEditor.arrows', { fallback: 'Arrows' })}
                </TabsTrigger>
                <TabsTrigger value="sets" className="text-xs sm:text-sm whitespace-nowrap">
                  {t('editor.mathEditor.sets', { fallback: 'Sets' })}
                </TabsTrigger>
              </TabsList>
            </ScrollArea>

            {/* Template categories */}
            {Object.entries(MATH_TEMPLATES).map(([category, templates]) => (
              <TabsContent key={`${category}-templates`} value={category === 'basic' ? 'basic-templates' : category} className="flex-1 mt-2">
                <ScrollArea className="h-[200px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pr-4">
                    {templates.map((template, idx) => (
                      <Button
                        key={idx}
                        type="button"
                        variant="outline"
                        className="h-auto flex flex-col items-start p-2 sm:p-3"
                        onClick={() => insertSymbol(template.latex)}
                      >
                        <span className="text-xs font-medium mb-1 truncate w-full">{template.label}</span>
                        <code className="text-[10px] text-muted-foreground font-mono break-all w-full line-clamp-2">
                          {template.latex}
                        </code>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}

            {/* Symbol categories */}
            {Object.entries(MATH_SYMBOLS).map(([category, symbols]) => (
              <TabsContent key={category} value={category === 'basic' ? 'symbols-basic' : category} className="flex-1 mt-2">
                <ScrollArea className="h-[200px]">
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 pr-4">
                    {symbols.map((item, idx) => (
                      <Button
                        key={idx}
                        type="button"
                        variant="outline"
                        className="h-14 sm:h-16 flex flex-col items-center justify-center p-1 sm:p-2"
                        onClick={() => insertSymbol(item.latex)}
                        title={item.label}
                      >
                        <span className="text-xl sm:text-2xl mb-0.5 sm:mb-1">{item.symbol}</span>
                        <code className="text-[9px] sm:text-[10px] text-muted-foreground font-mono truncate w-full text-center">
                          {item.latex}
                        </code>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel', { fallback: 'Cancel' })}
          </Button>
          <Button type="button" onClick={handleInsert} disabled={!latex.trim()}>
            {t('editor.mathEditor.insert', { fallback: 'Insert' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
