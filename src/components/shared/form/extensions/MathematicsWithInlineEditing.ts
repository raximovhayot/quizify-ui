import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { InlineMathNodeView } from '../InlineMathNodeView';

/**
 * Custom TipTap extension for inline math editing
 * 
 * Extends the standard Mathematics extension to support inline editing.
 * When a math formula is clicked, it opens an inline editor instead of
 * requiring a dialog for edits.
 * 
 * This extension handles both inline ($...$) and display ($$...$$) math modes.
 */

// Inline math node
export const MathInlineWithEditing = Node.create({
  name: 'mathInline',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element) => element.textContent || '',
        renderHTML: (attributes) => {
          return {
            'data-latex': attributes.latex,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="mathInline"]',
      },
      {
        tag: 'span.math-inline',
      },
      // Also parse the $ delimited format from editor content
      {
        tag: 'span',
        getAttrs: (node) => {
          const content = (node as HTMLElement).textContent || '';
          if (content.startsWith('$') && content.endsWith('$') && content.length > 2) {
            return { latex: content.slice(1, -1) };
          }
          return false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        {
          'data-type': 'mathInline',
          class: 'math-inline',
        },
        HTMLAttributes
      ),
      HTMLAttributes.latex || '',
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineMathNodeView);
  },
});

// Display math node
export const MathDisplayWithEditing = Node.create({
  name: 'mathDisplay',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element) => element.textContent || '',
        renderHTML: (attributes) => {
          return {
            'data-latex': attributes.latex,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="mathDisplay"]',
      },
      {
        tag: 'div.math-display',
      },
      // Also parse the $$ delimited format from editor content
      {
        tag: 'div',
        getAttrs: (node) => {
          const content = (node as HTMLElement).textContent || '';
          if (content.startsWith('$$') && content.endsWith('$$') && content.length > 4) {
            return { latex: content.slice(2, -2) };
          }
          return false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        {
          'data-type': 'mathDisplay',
          class: 'math-display',
        },
        HTMLAttributes
      ),
      HTMLAttributes.latex || '',
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineMathNodeView);
  },
});
