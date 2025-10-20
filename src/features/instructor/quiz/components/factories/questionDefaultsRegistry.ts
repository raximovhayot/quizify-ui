'use client';

import {TInstructorQuestionForm} from '../../schemas/questionSchema';
import {
    AnswerDataDto,
    QuestionDataDto,
    QuestionType,
} from '../../types/question';

// Discriminated union variant helpers for cleaner typing
type TMultipleChoiceForm = TInstructorQuestionForm;


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

    return {
        ...base,
        questionType: QuestionType.MULTIPLE_CHOICE,
        answers: [
            {content: '', correct: true},
            {content: '', correct: false},
        ],
    } satisfies TMultipleChoiceForm;
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

    return {
        ...base,
        questionType: QuestionType.MULTIPLE_CHOICE,
        answers: mapAnswers(data.answers),
    } satisfies TMultipleChoiceForm;
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
