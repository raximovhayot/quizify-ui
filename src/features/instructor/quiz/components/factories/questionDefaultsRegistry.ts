'use client';

import {TInstructorQuestionForm} from '../../schemas/questionSchema';
import {
    AnswerDataDto,
    QuestionDataDto,
    QuestionType,
} from '../../types/question';

// Discriminated union variant helpers for cleaner typing
type TMultipleChoiceForm = Extract<TInstructorQuestionForm, { questionType: QuestionType.MULTIPLE_CHOICE }>
type TTrueFalseForm = Extract<TInstructorQuestionForm, { questionType: QuestionType.TRUE_FALSE }>
type TShortAnswerForm = Extract<TInstructorQuestionForm, { questionType: QuestionType.SHORT_ANSWER }>
type TFillInBlankForm = Extract<TInstructorQuestionForm, { questionType: QuestionType.FILL_IN_BLANK }>
type TEssayForm = Extract<TInstructorQuestionForm, { questionType: QuestionType.ESSAY }>
type TMatchingForm = Extract<TInstructorQuestionForm, { questionType: QuestionType.MATCHING }>
type TRankingForm = Extract<TInstructorQuestionForm, { questionType: QuestionType.RANKING }>


// Narrowed answer form shape used by the form state (no 'order' at form level)
type TAnswerForm = { id?: number; content: string; correct: boolean; attachmentId?: number };

// Helpers
const mapAnswers = (answers?: AnswerDataDto[]): TAnswerForm[] =>
    (answers ?? []).map((a) => ({
        id: a.id,
        content: a.content,
        // Coerce nullable/optional backend boolean to strict boolean for form state
        correct: !!a.correct,
    }));

type TMatchingPair = { left: string; right: string };

const parseMatchingPairs = (matchingConfig?: string): TMatchingPair[] => {
    if (!matchingConfig) return [{left: '', right: ''}];
    try {
        const parsed = JSON.parse(matchingConfig);
        if (Array.isArray(parsed)) {
            return parsed.map((p): TMatchingPair => {
                const obj: Record<string, unknown> =
                    typeof p === 'object' && p !== null
                        ? (p as Record<string, unknown>)
                        : {};
                const leftVal = obj.left;
                const rightVal = obj.right;
                return {
                    left: typeof leftVal === 'string' ? leftVal : String(leftVal ?? ''),
                    right:
                        typeof rightVal === 'string' ? rightVal : String(rightVal ?? ''),
                };
            });
        }
    } catch {
        // noop – fall through to default
    }
    return [{left: '', right: ''}];
};

const parseRankingItems = (correctOrder?: string): string[] => {
    if (!correctOrder) return [];
    try {
        const parsed = JSON.parse(correctOrder);
        return Array.isArray(parsed)
            ? parsed.map((x) => (typeof x === 'string' ? x : String(x)))
            : [];
    } catch {
        return [];
    }
};

// Create-mode defaults per type
function createDefaults(
    type: QuestionType,
    quizId: number
): TInstructorQuestionForm {
    const base = {
        quizId,
        questionType: type,
        content: '',
        explanation: '',
        order: 0,
        points: 1,
    } as const;

    switch (type) {
        case QuestionType.MULTIPLE_CHOICE:
            return {
                ...base,
                questionType: QuestionType.MULTIPLE_CHOICE,
                answers: [
                    {content: '', correct: true},
                    {content: '', correct: false},
                ],
            } satisfies TMultipleChoiceForm;
        case QuestionType.TRUE_FALSE:
            return {
                ...base,
                questionType: QuestionType.TRUE_FALSE,
                trueFalseAnswer: false,
            } satisfies TTrueFalseForm;
        case QuestionType.SHORT_ANSWER:
            return {
                ...base,
                questionType: QuestionType.SHORT_ANSWER,
                answers: [{content: '', correct: true}],
            } satisfies TShortAnswerForm;
        case QuestionType.FILL_IN_BLANK:
            return {
                ...base,
                questionType: QuestionType.FILL_IN_BLANK,
                blankTemplate: '',
                answers: [],
            } satisfies TFillInBlankForm;
        case QuestionType.ESSAY:
            return {
                ...base,
                questionType: QuestionType.ESSAY,
                gradingCriteria: '',
            } satisfies TEssayForm;
        case QuestionType.MATCHING:
            return {
                ...base,
                questionType: QuestionType.MATCHING,
                matchingPairs: [{left: '', right: ''}],
            } satisfies TMatchingForm;
        case QuestionType.RANKING:
            return {
                ...base,
                questionType: QuestionType.RANKING,
                rankingItems: ['', ''],
            } satisfies TRankingForm;
    }
}

// Edit-mode defaults per type
function editDefaults(
    type: QuestionType,
    quizId: number,
    data: QuestionDataDto
): TInstructorQuestionForm {
    const base = {
        quizId,
        questionType: type,
        content: data.content,
        explanation: data.explanation || '',
        order: data.order,
        points: data.points,
    } as const;

    switch (type) {
        case QuestionType.MULTIPLE_CHOICE:
            return {
                ...base,
                questionType: QuestionType.MULTIPLE_CHOICE,
                answers: mapAnswers(data.answers),
            } satisfies TMultipleChoiceForm;
        case QuestionType.SHORT_ANSWER:
            return {
                ...base,
                questionType: QuestionType.SHORT_ANSWER,
                answers: mapAnswers(data.answers),
            } satisfies TShortAnswerForm;
        case QuestionType.TRUE_FALSE:
            return {
                ...base,
                questionType: QuestionType.TRUE_FALSE,
                trueFalseAnswer: data.trueFalseAnswer ?? false,
            } satisfies TTrueFalseForm;
        case QuestionType.FILL_IN_BLANK:
            return {
                ...base,
                questionType: QuestionType.FILL_IN_BLANK,
                blankTemplate: '',
                answers: [],
            } satisfies TFillInBlankForm;
        case QuestionType.ESSAY:
            return {
                ...base,
                questionType: QuestionType.ESSAY,
                gradingCriteria: data.gradingCriteria ?? '',
            } satisfies TEssayForm;
        case QuestionType.MATCHING:
            return {
                ...base,
                questionType: QuestionType.MATCHING,
                matchingPairs: parseMatchingPairs(),
            } satisfies TMatchingForm;
        case QuestionType.RANKING:
            return {
                ...base,
                questionType: QuestionType.RANKING,
                rankingItems: parseRankingItems(),
            } satisfies TRankingForm;

    }
}

export function buildCreateDefaultsFor(
    type: QuestionType,
    quizId: number
): TInstructorQuestionForm {
    return createDefaults(type, quizId);
}

export function buildEditDefaultsFor(
    type: QuestionType,
    quizId: number,
    data: QuestionDataDto
): TInstructorQuestionForm {
    return editDefaults(type, quizId, data);
}
