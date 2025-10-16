import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next-intl useTranslations to just return fallback or key
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: { fallback?: string; [k: string]: unknown }) => {
    if (params && typeof params.fallback === 'string') return params.fallback as string;
    return key;
  },
}));

import { QuestionsListView } from '../QuestionsListView';
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

describe('QuestionsListView', () => {
  const commonProps = {
    quizId: 77,
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
  } as const;

  it('renders loading skeleton', () => {
    const { container } = render(
      <QuestionsListView
        {...commonProps}
        questions={[]}
        isLoading
        error={undefined}
        showAnswers={false}
      />
    );
    // Ensure at least one skeleton block exists
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders error state', () => {
    render(
      <QuestionsListView
        {...commonProps}
        questions={[]}
        isLoading={false}
        error={{ message: 'boom' }}
        showAnswers={false}
      />
    );
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });

  it('renders empty state with Add Question CTA', async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();

    render(
      <QuestionsListView
        {...commonProps}
        onAddQuestion={onAdd}
        questions={[]}
        isLoading={false}
        error={undefined}
        showAnswers={false}
      />
    );

    const btn = screen.getByRole('button', { name: /Add Question/i });
    expect(btn).toBeInTheDocument();
    await user.click(btn);
    expect(onAdd).toHaveBeenCalled();
  });

  it('renders populated list with ARIA roles and controls', () => {
    const questions = [createQuestion(1), createQuestion(2)];

    render(
      <QuestionsListView
        {...commonProps}
        questions={questions}
        isLoading={false}
        error={undefined}
        showAnswers={false}
      />
    );

    const list = screen.getByRole('list', { name: /Questions/i });
    expect(list).toBeInTheDocument();

    const items = screen.getAllByRole('listitem');
    expect(items.length).toBe(2);

    // Check presence of action buttons (Edit/Delete via menu trigger and Up/Down controls)
    // Up/Down buttons have aria-labels with "Up"/"Down" fallbacks
    expect(screen.getAllByRole('button', { name: /Up/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /Down/i }).length).toBeGreaterThan(0);
  });
});
