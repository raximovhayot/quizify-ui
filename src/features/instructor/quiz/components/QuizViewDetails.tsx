'use client';

import { FileText } from 'lucide-react';

import { useTranslations } from 'next-intl';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { QuizDataDTO } from '../types/quiz';

export interface QuizViewDetailsProps {
  quiz: QuizDataDTO;
}

export function QuizViewDetails({ quiz }: QuizViewDetailsProps) {
  const t = useTranslations();

  if (!quiz.description) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          {t('instructor.quiz.view.details.title', {
            fallback: 'Description',
          })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base leading-relaxed whitespace-pre-wrap">
          {quiz.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
