/* eslint-disable @typescript-eslint/no-explicit-any, react/display-name */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock i18n to simplify text lookups (use fallbacks)
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, any>) => {
    if (typeof key === 'string') return (params as any)?.fallback ?? key;
    return key as any;
  },
}));

// Mock the EditQuestionDialog to provide a simple submit button that triggers onSubmit with a valid payload
jest.mock('../questions-list/EditQuestionDialog', () => ({
  EditQuestionDialog: ({ open, onSubmit, onClose, quizId, question }: any) => {
    if (!open) return null;
    const handleClick = () => {
      // Minimal valid MULTIPLE_CHOICE form payload
      const payload = {
        quizId,
        questionType: question?.questionType ?? 'multiple_choice',
        content: (question?.content ?? 'Edited') + ' (edited)',
        explanation: undefined,
        points: question?.points ?? 1,
        order: question?.order ?? 0,
        answers: [
          { content: 'Option A', correct: true, order: 0 },
          { content: 'Option B', correct: false, order: 1 },
        ],
      };
      onSubmit(payload);
      onClose?.();
    };
    return (
      <div data-testid="edit-dialog">
        <button onClick={handleClick}>Submit Edited Question</button>
      </div>
    );
  },
}));

// Use real view but mock hooks to control behavior
jest.mock('../../hooks/useQuestions');
jest.mock('../../hooks/useReorderQuestions');

// Mock API client to prevent env.mjs ESM import during tests
jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import { QuestionsListContainer } from '../QuestionsListContainer';
import * as useQuestionsModule from '../../hooks/useQuestions';
import * as useReorderModule from '../../hooks/useReorderQuestions';
import type { QuestionDataDto } from '../../types/question';
import { QuestionType } from '../../types/question';

const createWrapper = (client: QueryClient) =>
  ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

describe('QuestionsListContainer', () => {
  const quizId = 101;
  const q1: QuestionDataDto = {
    id: 1,
    questionType: QuestionType.MULTIPLE_CHOICE,
    content: 'First question',
    order: 0,
    points: 1,
    answers: [],
  };
  const q2: QuestionDataDto = {
    id: 2,
    questionType: QuestionType.MULTIPLE_CHOICE,
    content: 'Second question',
    order: 1,
    points: 1,
    answers: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockQueries({ isLoading = false, error = undefined, content = [q1, q2] as QuestionDataDto[] } = {}) {
    (useQuestionsModule as any).useQuestions = jest.fn().mockReturnValue({
      data: { content, totalElements: content.length, totalPages: 1, page: 0, size: 100 },
      isLoading,
      error,
    });
  }

  function mockMutations() {
    const update = { mutateAsync: jest.fn(), isPending: false } as any;
    const del = { mutateAsync: jest.fn(), isPending: false } as any;
    (useQuestionsModule as any).useUpdateQuestion = jest.fn(() => update);
    (useQuestionsModule as any).useDeleteQuestion = jest.fn(() => del);
    return { update, del };
  }

  function mockReorder() {
    const reorder = { mutate: jest.fn(), isPending: false } as any;
    (useReorderModule as any).useReorderQuestions = jest.fn(() => reorder);
    return reorder;
  }

  it('reorders items when Down is clicked on the first item', async () => {
    const user = userEvent.setup();
    const client = createClient();
    mockQueries();
    const reorder = mockReorder();
    mockMutations();

    render(<QuestionsListContainer quizId={quizId} onAddQuestion={jest.fn()} />, {
      wrapper: createWrapper(client),
    });

    // Find the first list item (index displayed as #1 badge)
    const firstBadge = await screen.findByText('#1');
    const item = (firstBadge.closest('[role="listitem"]') as HTMLElement) || (screen.getAllByRole('listitem')[0] as HTMLElement)!;

    // Within this item, find the Down button by aria-label
    const downBtn = within(item).getByRole('button', { name: /down/i });
    await user.click(downBtn);

    // Expect reorder.mutate called with normalized array [q2, q1] and normalized order
    expect(reorder.mutate).toHaveBeenCalledTimes(1);
    const arg = reorder.mutate.mock.calls[0][0] as QuestionDataDto[];
    expect(arg.map((q) => q.id)).toEqual([2, 1]);
    expect(arg.map((q) => q.order)).toEqual([0, 1]);
  });

  it('edits an item via action menu and submit in dialog', async () => {
    const user = userEvent.setup();
    const client = createClient();
    mockQueries();
    mockReorder();
    const { update } = mockMutations();
    (update.mutateAsync as jest.Mock).mockResolvedValue({});

    render(<QuestionsListContainer quizId={quizId} onAddQuestion={jest.fn()} />, {
      wrapper: createWrapper(client),
    });

    // Open actions menu on the first item
    const firstItem = screen.getAllByRole('listitem')[0]!;
    const actionsBtn = within(firstItem).getByRole('button', { name: /actions/i });
    await user.click(actionsBtn);

    // Click Edit in dropdown
    const editItem = await screen.findByRole('menuitem', { name: /edit/i });
    await user.click(editItem);

    // Dialog should open (mocked) with a submit button; click it to submit edited payload
    const submitBtn = await screen.findByRole('button', { name: /Submit Edited Question/i });
    await user.click(submitBtn);

    // Expect update mutation to be called with correct shape
    expect(update.mutateAsync).toHaveBeenCalledTimes(1);
    const arg = (update.mutateAsync as jest.Mock).mock.calls[0][0];
    expect(arg).toEqual(
      expect.objectContaining({
        questionId: 1,
        data: expect.objectContaining({
          quizId,
          content: expect.stringContaining('(edited)'),
        }),
      })
    );
  });

  it('deletes an item via action menu and confirm dialog', async () => {
    const user = userEvent.setup();
    const client = createClient();
    mockQueries();
    mockReorder();
    const { del } = mockMutations();

    render(<QuestionsListContainer quizId={quizId} onAddQuestion={jest.fn()} />, {
      wrapper: createWrapper(client),
    });

    // Open actions menu on the first item (MoreVertical icon button has aria-label "Actions")
    const firstItem = screen.getAllByRole('listitem')[0]!;
    const actionsBtn = within(firstItem).getByRole('button', { name: /actions/i });
    await user.click(actionsBtn);

    // Click Delete in dropdown (translated with fallback 'Delete')
    const deleteItem = await screen.findByRole('menuitem', { name: /delete/i });
    await user.click(deleteItem);

    // Confirm dialog should open with Cancel/Delete buttons; click Delete
    const confirmBtn = await screen.findByRole('button', { name: /delete/i });
    await user.click(confirmBtn);

    expect(del.mutateAsync).toHaveBeenCalledWith({ quizId, questionId: 1 });
  });
});
