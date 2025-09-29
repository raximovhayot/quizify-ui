'use client';

import React from 'react';

import { AppPagination } from '@/components/shared/ui/AppPagination';

import { QuizDataDTO, QuizStatus } from '../types/quiz';
import { QuizTable } from './QuizTable';
import { QuizTableSkeleton } from './QuizTableSkeleton';

interface QuizzesListSectionProps {
  loading: boolean;
  quizzes: QuizDataDTO[] | undefined;
  onDelete: (id: number) => void;
  onUpdateStatus: (id: number, status: QuizStatus) => void;
  searchQuery: string;
  isDeleting?: boolean;
  isUpdatingStatus?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function QuizzesListSection({
  loading,
  quizzes,
  onDelete,
  onUpdateStatus,
  searchQuery,
  isDeleting = false,
  isUpdatingStatus = false,
  currentPage,
  totalPages,
  onPageChange,
}: Readonly<QuizzesListSectionProps>) {
  if (loading) {
    return <QuizTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <QuizTable
        quizzes={quizzes || []}
        onDelete={onDelete}
        onUpdateStatus={onUpdateStatus}
        searchQuery={searchQuery}
        isDeleting={isDeleting}
        isUpdatingStatus={isUpdatingStatus}
      />

      <AppPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export default QuizzesListSection;
