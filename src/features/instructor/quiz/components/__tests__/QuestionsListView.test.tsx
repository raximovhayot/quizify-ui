import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next-intl useTranslations to just return fallback or key
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: { fallback?: string; count?: number; [k: string]: unknown }) => {
    if (params && typeof params.fallback === 'string') {
      // Replace {count} placeholder if count is provided
      if (typeof params.count === 'number') {
        let result = params.fallback.replace(/\{count\}/g, String(params.count));
        // Handle plural forms: {count, plural, one {question} other {questions}}
        const pluralMatch = result.match(/\{count,\s*plural,\s*one\s*\{([^}]+)\}\s*other\s*\{([^}]+)\}\}/);
        if (pluralMatch && pluralMatch[1] && pluralMatch[2]) {
          const pluralForm = params.count === 1 ? pluralMatch[1] : pluralMatch[2];
          result = result.replace(/\{count,\s*plural,\s*one\s*\{[^}]+\}\s*other\s*\{[^}]+\}\}/, pluralForm);
        }
        return result;
      }
      return params.fallback as string;
    }
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
    currentPage: 0,
    totalPages: 1,
    totalElements: 0,
    pageSize: 10,
    onPageChange: jest.fn(),
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
        totalElements={2}
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

  it('displays total question count from totalElements, not page size', () => {
    // Simulate a paginated scenario: page 1 has 10 questions but total is 25
    const questions = Array.from({ length: 10 }, (_, i) => createQuestion(i + 1));

    render(
      <QuestionsListView
        {...commonProps}
        questions={questions}
        totalElements={25}
        currentPage={0}
        totalPages={3}
        isLoading={false}
        error={undefined}
        showAnswers={false}
      />
    );

    // The header should show "25 questions" not "10 questions"
    expect(screen.getByText(/25 questions in this quiz/i)).toBeInTheDocument();
  });

  it('shows pagination when totalPages > 1', () => {
    const questions = Array.from({ length: 10 }, (_, i) => createQuestion(i + 1));

    render(
      <QuestionsListView
        {...commonProps}
        questions={questions}
        totalElements={25}
        currentPage={0}
        totalPages={3}
        isLoading={false}
        error={undefined}
        showAnswers={false}
      />
    );

    // Pagination should be visible
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('hides pagination when totalPages <= 1 and totalElements <= pageSize', () => {
    const questions = [createQuestion(1), createQuestion(2)];

    render(
      <QuestionsListView
        {...commonProps}
        questions={questions}
        totalElements={2}
        currentPage={0}
        totalPages={1}
        pageSize={10}
        isLoading={false}
        error={undefined}
        showAnswers={false}
      />
    );

    // Pagination should not be visible
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('shows pagination when totalElements > pageSize even if totalPages is incorrect', () => {
    // Simulate backend not returning correct totalPages but we have totalElements
    const questions = Array.from({ length: 10 }, (_, i) => createQuestion(i + 1));

    render(
      <QuestionsListView
        {...commonProps}
        questions={questions}
        totalElements={25}
        currentPage={0}
        totalPages={1} // Backend incorrectly reports 1 page
        pageSize={10}
        isLoading={false}
        error={undefined}
        showAnswers={false}
      />
    );

    // Pagination should still be visible because totalElements > pageSize
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
