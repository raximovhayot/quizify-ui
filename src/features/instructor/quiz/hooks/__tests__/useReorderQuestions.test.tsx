/* eslint-disable react/display-name */
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock API client to avoid loading env and real networking
jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import { useReorderQuestions } from '../useReorderQuestions';
import { questionKeys } from '../../keys';
import type { IPageableList } from '@/types/common';
import type { QuestionDataDto, QuestionFilter } from '../../types/question';
import { QuestionType } from '../../types/question';
import * as QuestionServiceModule from '../../services/questionService';

const createWrapper = (client: QueryClient) =>
  ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

describe('useReorderQuestions', () => {
  const quizId = 77;
  const filter: QuestionFilter = { quizId, page: 0, size: 10 };
  const q1: QuestionDataDto = {
    id: 1,
    questionType: QuestionType.MULTIPLE_CHOICE,
    content: 'Q1',
    order: 0,
    points: 1,
    answers: [],
  };
  const q2: QuestionDataDto = {
    id: 2,
    questionType: QuestionType.MULTIPLE_CHOICE,
    content: 'Q2',
    order: 1,
    points: 1,
    answers: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('optimistically reorders cache content on mutate and invalidates on settle', async () => {
    const client = createClient();
    const page: IPageableList<QuestionDataDto> = {
      content: [q1, q2],
      totalElements: 2,
      totalPages: 1,
      size: 10,
      page: 0,
    };
    client.setQueryData(questionKeys.list(filter), page);

    const invalidateSpy = jest.spyOn(client, 'invalidateQueries');
    const reorderSpy = jest
      .spyOn(QuestionServiceModule.QuestionService, 'reorderQuestions')
      .mockResolvedValue(undefined);

    const { result } = renderHook(() => useReorderQuestions(quizId, filter), {
      wrapper: createWrapper(client),
    });

    const next = [q2, q1];
    result.current.mutate(next);

    await waitFor(() => {
      const updated = client.getQueryData<IPageableList<QuestionDataDto>>(questionKeys.list(filter));
      expect(updated?.content?.map((q) => q.id)).toEqual([2, 1]);
      expect(updated?.content?.map((q) => q.order)).toEqual([0, 1]);
    });

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalled());
    expect(reorderSpy).toHaveBeenCalledWith(quizId, [
      { id: 2, order: 0 },
      { id: 1, order: 1 },
    ]);
  });

  it('rolls back to previous cache on error', async () => {
    const client = createClient();
    const page: IPageableList<QuestionDataDto> = {
      content: [q1, q2],
      totalElements: 2,
      totalPages: 1,
      size: 10,
      page: 0,
    };
    client.setQueryData(questionKeys.list(filter), page);

    jest
      .spyOn(QuestionServiceModule.QuestionService, 'reorderQuestions')
      .mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useReorderQuestions(quizId, filter), {
      wrapper: createWrapper(client),
    });

    const next = [q2, q1];
    await expect(result.current.mutateAsync(next)).rejects.toThrow('fail');

    const rolledBack = client.getQueryData<IPageableList<QuestionDataDto>>(questionKeys.list(filter));
    expect(rolledBack?.content?.map((q) => q.id)).toEqual([1, 2]);
    expect(rolledBack?.content?.map((q) => q.order)).toEqual([0, 1]);
  });
});
