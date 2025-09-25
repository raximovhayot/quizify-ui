import { useCallback, useMemo, useState } from 'react';

import { QuizDataDTO } from '../types/quiz';

type SortField = 'title' | 'status' | 'numberOfQuestions';
type SortDirection = 'asc' | 'desc';

export interface UseQuizTableSortingProps {
  quizzes: QuizDataDTO[];
  searchQuery?: string;
}

export interface UseQuizTableSortingReturn {
  sortField: SortField;
  sortDirection: SortDirection;
  processedQuizzes: QuizDataDTO[];
  handleSort: (field: SortField) => void;
}

export function useQuizTableSorting({
  quizzes,
  searchQuery = '',
}: UseQuizTableSortingProps): UseQuizTableSortingReturn {
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Memoized filtered and sorted quizzes
  const processedQuizzes = useMemo(() => {
    let filtered = quizzes;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(query) ||
          (quiz.description && quiz.description.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'numberOfQuestions':
          aValue = a.numberOfQuestions;
          bValue = b.numberOfQuestions;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [quizzes, searchQuery, sortField, sortDirection]);

  // Sorting handler
  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    },
    [sortField]
  );

  return {
    sortField,
    sortDirection,
    processedQuizzes,
    handleSort,
  };
}
