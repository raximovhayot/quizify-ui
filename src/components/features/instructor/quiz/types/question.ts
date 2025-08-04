/**
 * Question-related types for instructors
 * Based on analysis of InstructorQuestionController
 */

// Question type enum based on backend
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  FILL_IN_BLANK = 'fill_in_blank',
  ESSAY = 'essay',
  MATCHING = 'matching',
  RANKING = 'ranking',
}

// Answer Data DTO for questions
export interface AnswerDataDto {
  id?: number;
  content: string;
  correct: boolean;
  order: number;
  attachmentId?: number;
}

// Question Data DTO - response from question endpoints
export interface QuestionDataDto {
  id: number;
  questionType: QuestionType;
  content: string;
  explanation?: string;
  order: number;
  points: number;
  trueFalseAnswer?: boolean;
  answers: AnswerDataDto[];
}

// Answer Save Request for question creation/update
export interface InstructionAnswerSaveRequest {
  id?: number;
  content: string;
  correct: boolean;
  order: number;
  attachmentId?: number;
}

// Question Save Request - POST /instructor/questions and PUT /instructor/questions/{id}
export interface InstructorQuestionSaveRequest {
  id?: number;
  questionType: QuestionType; // @NotNull
  content: string; // @NotBlank
  explanation?: string;
  blankTemplate?: string; // Required for FILL_IN_BLANK
  gradingCriteria?: string; // Required for ESSAY
  matchingConfig?: string; // Required for MATCHING
  correctOrder?: string; // Required for RANKING
  trueFalseAnswer?: boolean; // Required for TRUE_FALSE
  attachmentId?: number;
  quizId: number; // @NotNull
  order: number;
  points: number; // @PositiveOrZero
  answers: InstructionAnswerSaveRequest[]; // @Valid, @NotNull, size varies by question type
}

// Question Filter for GET /instructor/questions/{quizId}/list
export interface QuestionFilter {
  parentId: number; // quizId
  page?: number;
  size?: number;
}

// Helper types for form handling
export type QuestionFormData = Omit<
  InstructorQuestionSaveRequest,
  'answers'
> & {
  answers: Partial<InstructionAnswerSaveRequest>[];
};

// Question-related helper functions
export function getRequiredAnswersCount(questionType: QuestionType): {
  min: number;
  max?: number;
} {
  switch (questionType) {
    case QuestionType.MULTIPLE_CHOICE:
      return { min: 2 };
    case QuestionType.TRUE_FALSE:
      return { min: 2, max: 2 };
    case QuestionType.SHORT_ANSWER:
    case QuestionType.FILL_IN_BLANK:
      return { min: 1 };
    case QuestionType.MATCHING:
      return { min: 4 };
    case QuestionType.RANKING:
      return { min: 2 };
    case QuestionType.ESSAY:
      return { min: 0 };
    default:
      return { min: 0 };
  }
}

export function getQuestionTypeLabel(type: QuestionType): string {
  const labels: Record<QuestionType, string> = {
    [QuestionType.MULTIPLE_CHOICE]: 'Multiple Choice',
    [QuestionType.TRUE_FALSE]: 'True/False',
    [QuestionType.SHORT_ANSWER]: 'Short Answer',
    [QuestionType.FILL_IN_BLANK]: 'Fill in the Blank',
    [QuestionType.ESSAY]: 'Essay',
    [QuestionType.MATCHING]: 'Matching',
    [QuestionType.RANKING]: 'Ranking',
  };
  return labels[type];
}

export function requiresSpecialField(questionType: QuestionType): {
  blankTemplate?: boolean;
  gradingCriteria?: boolean;
  matchingConfig?: boolean;
  correctOrder?: boolean;
  trueFalseAnswer?: boolean;
} {
  switch (questionType) {
    case QuestionType.FILL_IN_BLANK:
      return { blankTemplate: true };
    case QuestionType.ESSAY:
      return { gradingCriteria: true };
    case QuestionType.MATCHING:
      return { matchingConfig: true };
    case QuestionType.RANKING:
      return { correctOrder: true };
    case QuestionType.TRUE_FALSE:
      return { trueFalseAnswer: true };
    default:
      return {};
  }
}
