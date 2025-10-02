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

const trueFalsePreview: OptionsPreviewFn = ({ q, showCorrect, t }) => {
  const answers = Array.isArray(q.answers) ? q.answers : [];
  if (answers.length > 0) return defaultAnswersPreview({ q, showCorrect, t });

  const items = [
    {
      key: 'true',
      label: t('common.true', { fallback: 'True' }),
      correct: q.trueFalseAnswer === true,
    },
    {
      key: 'false',
      label: t('common.false', { fallback: 'False' }),
      correct: q.trueFalseAnswer === false,
    },
  ];

  return (
    <div className="mt-2">
      <ul className="grid gap-1 sm:grid-cols-2">
        {items.map((item, idx) => {
          const isCorrect = showCorrect && item.correct;
          const marker =
            (item.label || '').trim().charAt(0) ||
            String.fromCharCode(65 + idx);
          return (
            <li
              key={item.key}
              className={`text-sm flex items-center gap-2 ${isCorrect ? 'bg-green-100 dark:bg-green-900/20 rounded-md' : ''}`}
            >
              <span className="inline-flex items-center justify-center size-5 rounded-full text-[0.7rem] font-medium bg-muted text-muted-foreground">
                {marker.toUpperCase()}
              </span>
              <span className="line-clamp-1 flex-1">{item.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const rankingPreview: OptionsPreviewFn = ({ q, showCorrect }) => {
  const rawAnswers = Array.isArray(q.answers) ? q.answers : [];
  let items: string[] = rawAnswers.length
    ? rawAnswers
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((a) => a.content)
    : [];
  let orderArr: string[] = [];
  try {
    if (
      typeof q.correctOrder === 'string' &&
      q.correctOrder.trim().length > 0
    ) {
      const parsed = JSON.parse(q.correctOrder);
      if (Array.isArray(parsed)) {
        orderArr = parsed.map(String);
      }
    }
  } catch {}
  if (items.length === 0 && orderArr.length > 0) {
    items = orderArr.slice();
  }
  const positionMap = new Map<string, number>();
  orderArr.forEach((val, idx) => positionMap.set(String(val), idx));
  if (items.length === 0) return null;
  return (
    <div className="mt-2">
      <ul className="grid gap-1 sm:grid-cols-2">
        {items.map((content, idx) => {
          const correctPos = positionMap.has(content)
            ? (positionMap.get(content) as number)
            : undefined;
          const isCorrect = showCorrect && typeof correctPos === 'number';
          return (
            <li
              key={`${content}-${idx}`}
              className={`text-sm flex items-center gap-2 ${isCorrect ? 'bg-green-100 dark:bg-green-900/20 rounded-md' : ''}`}
            >
              <span className="inline-flex items-center justify-center size-5 rounded-full text-[0.7rem] font-medium bg-muted text-muted-foreground">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="line-clamp-1 flex-1">{content}</span>
              {showCorrect && typeof correctPos === 'number' && (
                <span className="text-xs text-muted-foreground">
                  {correctPos + 1}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const matchingPreview: OptionsPreviewFn = ({ q, showCorrect }) => {
  const rawAnswers = Array.isArray(q.answers) ? q.answers : [];
  let pairs: { left: string; right?: string }[] = [];
  try {
    if (
      typeof q.matchingConfig === 'string' &&
      q.matchingConfig.trim().length > 0
    ) {
      const parsed = JSON.parse(q.matchingConfig);
      if (Array.isArray(parsed)) {
        pairs = parsed.map((p: unknown) => {
          if (Array.isArray(p) && p.length >= 2)
            return { left: String(p[0]), right: String(p[1]) };
          if (p && typeof p === 'object')
            return {
              left: String((p as Record<string, unknown>).left ?? ''),
              right:
                (p as Record<string, unknown>).right != null
                  ? String((p as Record<string, unknown>).right)
                  : undefined,
            };
          return { left: String(p) };
        });
      }
    }
  } catch {}
  if (pairs.length === 0 && rawAnswers.length > 0) {
    pairs = rawAnswers
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((a) => ({ left: a.content }));
  }
  if (pairs.length === 0) return null;
  return (
    <div className="mt-2">
      <ul className="grid gap-1 sm:grid-cols-2">
        {pairs.map((pair, idx) => {
          const showPair =
            showCorrect && pair.right != null && String(pair.right).length > 0;
          const isCorrect = showCorrect && showPair;
          return (
            <li
              key={`${pair.left}-${idx}`}
              className={`text-sm flex items-center gap-2 ${isCorrect ? 'bg-green-100 dark:bg-green-900/20 rounded-md' : ''}`}
            >
              <span className="inline-flex items-center justify-center size-5 rounded-full text-[0.7rem] font-medium bg-muted text-muted-foreground">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="line-clamp-1 flex-1">
                {pair.left}
                {showPair && (
                  <span className="text-muted-foreground">
                    {' '}
                    → {String(pair.right)}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const fillInBlankPreview: OptionsPreviewFn = ({ q }) => {
  const tpl = q.blankTemplate || '';
  if (!tpl) return null;
  return (
    <div className="mt-2">
      <div className="text-sm text-muted-foreground font-mono whitespace-pre-wrap">
        {tpl}
      </div>
    </div>
  );
};

const shortAnswerPreview: OptionsPreviewFn = ({ q, showCorrect }) => {
  if (!showCorrect) return null;
  const answers = Array.isArray(q.answers) ? q.answers : [];
  if (answers.length === 0) return null;
  const toShow = answers
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return (
    <div className="mt-2">
      <ul className="grid gap-1 sm:grid-cols-2">
        {toShow.map((a, idx) => {
          const isCorrect = !!a.correct; // when toggle is ON, highlight correct ones
          const marker = String.fromCharCode(65 + idx);
          return (
            <li
              key={a.id ?? a.order ?? idx}
              className={`text-sm flex items-center gap-2 ${isCorrect ? 'bg-green-100 dark:bg-green-900/20 rounded-md p-1' : ''}`}
            >
              <span className="inline-flex items-center justify-center size-5 rounded-full text-[0.7rem] font-medium bg-muted text-muted-foreground shrink-0">
                {marker}
              </span>
              <div className="line-clamp-2 flex-1 overflow-hidden">
                <RichTextDisplay content={a.content} className="text-sm" />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const defaultAnswersPreview: OptionsPreviewFn = ({ q, showCorrect }) => {
  const answers = Array.isArray(q.answers) ? q.answers : [];
  if (answers.length === 0) return null;
  const toShow = answers
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="mt-2">
      <ul className="grid gap-1 sm:grid-cols-2">
        {toShow.map((a, idx) => {
          const isCorrect = showCorrect && !!a.correct;
          const marker = String.fromCharCode(65 + idx); // A, B, C...
          return (
            <li
              key={a.id ?? a.order ?? idx}
              className={`text-sm flex items-center gap-2 ${isCorrect ? 'bg-green-100 dark:bg-green-900/20 rounded-md p-1' : ''}`}
            >
              <span className="inline-flex items-center justify-center size-5 rounded-full text-[0.7rem] font-medium bg-muted text-muted-foreground shrink-0">
                {marker}
              </span>
              <div className="line-clamp-2 flex-1 overflow-hidden">
                <RichTextDisplay content={a.content} className="text-sm" />
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
  [QuestionType.TRUE_FALSE]: trueFalsePreview,
  [QuestionType.SHORT_ANSWER]: shortAnswerPreview,
  [QuestionType.FILL_IN_BLANK]: fillInBlankPreview,
  [QuestionType.ESSAY]: defaultAnswersPreview,
  [QuestionType.MATCHING]: matchingPreview,
  [QuestionType.RANKING]: rankingPreview,
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
