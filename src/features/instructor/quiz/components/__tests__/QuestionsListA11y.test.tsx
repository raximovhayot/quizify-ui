import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next-intl to use fallbacks
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: { fallback?: string; [k: string]: unknown }) => {
    if (params && typeof params.fallback === 'string') return params.fallback as string;
    return key;
  },
}));

import { QuestionsListView } from '../QuestionsListView';
import { DeleteQuestionDialog } from '../questions-list/DeleteQuestionDialog';
import { QuestionType } from '../../types/question';
import type { QuestionDataDto } from '../../types/question';

function createQuestion(id = 1): QuestionDataDto {
  return {
    id,
    questionType: QuestionType.MULTIPLE_CHOICE,
    content: `Question ${id}`,
    order: id - 1,
    points: 1,
    answers: [],
  };
}

describe('QuestionsListView accessibility', () => {
  const baseProps = {
    quizId: 77,
    isLoading: false,
    error: undefined as unknown,
    showAnswers: false,
    onToggleShowAnswers: jest.fn(),
    onAddQuestion: jest.fn(),
    onReorder: jest.fn(),
    isReorderPending: false,
    editingQuestion: null,
    deletingQuestion: null,
    onRequestEdit: jest.fn(),
    onRequestDelete: jest.fn(),
    onCloseEdit: jest.fn(),
    onCloseDelete: jest.fn(),
    onSubmitEdit: jest.fn(),
    onConfirmDelete: jest.fn(),
    isUpdatePending: false,
    isDeletePending: false,
    currentPage: 0,
    totalPages: 1,
    onPageChange: jest.fn(),
  } as const;

  it('renders an aria-live polite region for announcements', () => {
    render(
      <QuestionsListView
        {...baseProps}
        questions={[createQuestion(1)]}
      />
    );

    const live = document.querySelector('[aria-live="polite"]');
    expect(live).toBeInTheDocument();
  });

  it('disables the Up button for the first item and enables Down by default', () => {
    render(
      <QuestionsListView
        {...baseProps}
        questions={[createQuestion(1), createQuestion(2)]}
      />
    );

    const firstItem = screen.getAllByRole('listitem')[0]!;
    const upBtn = within(firstItem).getByRole('button', { name: /up/i });
    const downBtn = within(firstItem).getByRole('button', { name: /down/i });

    expect(upBtn).toBeDisabled();
    expect(downBtn).not.toBeDisabled();
  });

  it('disables both Up and Down when isReorderPending is true', () => {
    render(
      <QuestionsListView
        {...baseProps}
        isReorderPending
        questions={[createQuestion(1), createQuestion(2)]}
      />
    );

    const firstItem = screen.getAllByRole('listitem')[0]!;
    const upBtn = within(firstItem).getByRole('button', { name: /up/i });
    const downBtn = within(firstItem).getByRole('button', { name: /down/i });

    expect(upBtn).toBeDisabled();
    expect(downBtn).toBeDisabled();
  });
});

describe('DeleteQuestionDialog accessibility', () => {
  it('renders dialog with title and action buttons', async () => {
    const user = userEvent.setup();

    render(
      <DeleteQuestionDialog
        open
        isSubmitting={false}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    );

    // Role dialog should be present (Radix Dialog)
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Title and buttons should be accessible
    expect(screen.getByText(/Delete Question/i)).toBeInTheDocument();
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    const deleteBtn = screen.getByRole('button', { name: /Delete/i });
    expect(cancelBtn).toBeInTheDocument();
    expect(deleteBtn).toBeInTheDocument();

    // Interact to ensure buttons are operable
    await user.click(cancelBtn);
    // No assertion on close side-effect here; focus is on accessibility presence
  });
});
