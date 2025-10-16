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

    // Ensure deprecated/UI-only fields are not present
    expect((payload as any).blankTemplate).toBeUndefined();
    expect((payload as any).matchingConfig).toBeUndefined();
    expect((payload as any).correctOrder).toBeUndefined();
  });

  it('maps True/False to trueFalseAnswer and empty answers', () => {
    const form: TInstructorQuestionForm = base({
      questionType: QuestionType.TRUE_FALSE,
      trueFalseAnswer: true,
    });

    const payload = buildQuestionSaveRequest(form);

    expect(payload).toEqual(
      expect.objectContaining({
        questionType: QuestionType.TRUE_FALSE,
        trueFalseAnswer: true,
        answers: [],
      })
    );
  });

  it('maps Short Answer answers with order', () => {
    const form: TInstructorQuestionForm = base({
      questionType: QuestionType.SHORT_ANSWER,
      answers: [
        { content: 'Ans1', correct: true },
        { content: 'Ans2', correct: false },
      ],
    });

    const payload = buildQuestionSaveRequest(form);

    expect(payload.answers).toEqual([
      { id: undefined, content: 'Ans1', correct: true, order: 0 },
      { id: undefined, content: 'Ans2', correct: false, order: 1 },
    ]);
  });

  it('maps Fill in Blank answers, omitting blankTemplate from payload', () => {
    const form: TInstructorQuestionForm = base({
      questionType: QuestionType.FILL_IN_BLANK,
      blankTemplate: 'The capital of France is ___.',
      answers: [
        { content: 'Paris', correct: true },
        { content: 'London', correct: false },
      ],
    });

    const payload = buildQuestionSaveRequest(form);

    expect(payload.answers?.map((a) => a.content)).toEqual(['Paris', 'London']);
    expect((payload as any).blankTemplate).toBeUndefined();
  });

  it('maps Matching pairs into answers with shared matchingKey', () => {
    const form: TInstructorQuestionForm = base({
      questionType: QuestionType.MATCHING,
      matchingPairs: [
        { left: 'Apple', right: 'Fruit' },
        { left: 'Carrot', right: 'Vegetable' },
      ],
    });

    const payload = buildQuestionSaveRequest(form);

    expect(payload.answers?.length).toBe(4);
    // Expect two answers per pair with the same matchingKey
    const mk1 = payload.answers![0]!.matchingKey;
    const mk2 = payload.answers![2]!.matchingKey;

    expect(payload.answers?.slice(0, 2)).toEqual([
      { content: 'Apple', order: 0, matchingKey: mk1 },
      { content: 'Fruit', order: 1, matchingKey: mk1 },
    ]);
    expect(payload.answers?.slice(2, 4)).toEqual([
      { content: 'Carrot', order: 2, matchingKey: mk2 },
      { content: 'Vegetable', order: 3, matchingKey: mk2 },
    ]);

    // Keys should be stable in the form of pair-1, pair-2 ... as per implementation
    expect(mk1).toBe('pair-1');
    expect(mk2).toBe('pair-2');
  });

  it('maps Ranking items into answers with correctPosition = index', () => {
    const form: TInstructorQuestionForm = base({
      questionType: QuestionType.RANKING,
      rankingItems: ['First', 'Second', 'Third'],
    });

    const payload = buildQuestionSaveRequest(form);

    expect(payload.answers).toEqual([
      { content: 'First', order: 0, correctPosition: 0 },
      { content: 'Second', order: 1, correctPosition: 1 },
      { content: 'Third', order: 2, correctPosition: 2 },
    ]);

    // Ensure no deprecated fields
    expect((payload as any).correctOrder).toBeUndefined();
  });
});
