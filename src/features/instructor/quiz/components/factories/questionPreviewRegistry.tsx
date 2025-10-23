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
    <div className="mt-2">
      <ul className="grid gap-2 sm:grid-cols-2">
        {toShow.map((a, idx) => {
          const isCorrect = showCorrect && !!a.correct;
          const marker = String.fromCharCode(65 + idx); // A, B, C...
          return (
            <li
              key={a.id ?? a.order ?? idx}
              className={`text-sm flex items-start gap-2 ${isCorrect ? 'bg-green-100 dark:bg-green-900/20 rounded-md p-1.5' : 'p-0.5'}`}
            >
              <span className="inline-flex items-center justify-center size-5 rounded-full text-[0.7rem] font-medium bg-muted text-muted-foreground shrink-0 mt-0.5">
                {marker}
              </span>
              <div className="flex-1 min-w-0">
                <div className="line-clamp-2 break-words text-sm">
                  <RichTextDisplay content={a.content} className="text-sm [&_*]:break-words" />
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
