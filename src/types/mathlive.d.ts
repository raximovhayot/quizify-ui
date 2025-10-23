// TypeScript declarations for MathLive custom element

import type { MathfieldElement } from 'mathlive';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<MathfieldElement>, MathfieldElement> & {
        ref?: React.Ref<MathfieldElement>;
      };
    }
  }
}

export {};
