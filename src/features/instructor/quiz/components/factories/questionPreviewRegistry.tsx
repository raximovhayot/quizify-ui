'use client';

import { ReactNode } from 'react';

import { RichTextDisplay } from '@/components/shared/form/RichTextEditor';

import { QuestionDataDto, QuestionType } from '../../types/question';
import type { TranslateFn } from './questionFormRegistry';

export interface OptionsPreviewProps {
  q: QuestionDataDto;
  showCorrect: boolean;
  t: TranslateFn;
}

type OptionsPreviewFn = (props: OptionsPreviewProps) => ReactNode;

// --- Strategy implementations per QuestionType ---



const defaultAnswersPreview: OptionsPreviewFn = ({ q, showCorrect }) => {
  const answers = Array.isArray(q.answers) ? q.answers : [];
  if (answers.length === 0) return null;
  const toShow = answers
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="mt-3">
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {toShow.map((a, idx) => {
          const isCorrect = showCorrect && !!a.correct;
          const marker = String.fromCharCode(65 + idx); // A, B, C...
          return (
            <li
              key={a.id ?? a.order ?? idx}
              className={`text-sm flex items-start gap-2.5 rounded-lg p-2.5 transition-all ${
                isCorrect 
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 shadow-sm' 
                  : 'bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-border'
              }`}
            >
              <span className={`inline-flex items-center justify-center size-6 rounded-full text-xs font-semibold shrink-0 ${
                isCorrect 
                  ? 'bg-emerald-500 text-white dark:bg-emerald-600'
                  : 'bg-muted-foreground/20 text-muted-foreground'
              }`}>
                {marker}
              </span>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="line-clamp-2 break-words text-sm leading-relaxed">
                  <RichTextDisplay content={a.content} className="text-sm [&_*]:break-words [&_p]:m-0" />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const registry: Record<QuestionType, OptionsPreviewFn> = {
  [QuestionType.MULTIPLE_CHOICE]: defaultAnswersPreview,
};

export function getOptionsPreviewRenderer(
  type: QuestionType
): OptionsPreviewFn {
  return registry[type] ?? defaultAnswersPreview;
}

export function QuestionOptionsPreview({
  q,
  showCorrect,
  t,
}: OptionsPreviewProps) {
  const renderer = getOptionsPreviewRenderer(q.questionType);
  return <>{renderer({ q, showCorrect, t })}</>;
}
