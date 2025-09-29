'use client';

import { QuizDataDTO } from '../types/quiz';

export interface QuizViewDetailsProps {
  quiz: QuizDataDTO;
}

export function QuizViewDetails({ quiz }: QuizViewDetailsProps) {
  if (!quiz.description) {
    return null;
  }

  return (
    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
      {quiz.description}
    </p>
  );
}
