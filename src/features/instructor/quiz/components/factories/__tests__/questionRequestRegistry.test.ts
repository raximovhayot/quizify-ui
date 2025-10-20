/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildQuestionSaveRequest } from '../questionRequestRegistry';
import type { TInstructorQuestionForm } from '../../../schemas/questionSchema';
import { QuestionType } from '../../../types/question';

// Helper to create a minimal base form
const base = (overrides: Partial<TInstructorQuestionForm> = {}): any => ({
  quizId: 1,
  content: 'Q',
  explanation: '',
  order: 0,
  points: 1,
  ...overrides,
});

describe('buildQuestionSaveRequest', () => {
  it('maps Multiple Choice answers with order and no deprecated fields', () => {
    const form: TInstructorQuestionForm = base({
      questionType: QuestionType.MULTIPLE_CHOICE,
      answers: [
        { content: 'A', correct: true },
        { content: 'B', correct: false },
      ],
    });

    const payload = buildQuestionSaveRequest(form);

    expect(payload).toEqual(
      expect.objectContaining({
        quizId: 1,
        questionType: QuestionType.MULTIPLE_CHOICE,
        content: 'Q',
        answers: [
          { id: undefined, content: 'A', correct: true, order: 0 },
          { id: undefined, content: 'B', correct: false, order: 1 },
        ],
      })
    );
  });
});
