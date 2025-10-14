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

export interface QuestionDataDto {
  id: number;
  questionType: QuestionType;
  content: string;
  explanation?: string;
  order: number;
  points: number;
  // Type-specific optional fields for prefill in edit forms
  trueFalseAnswer?: boolean;
  blankTemplate?: string; // FILL_IN_BLANK
  gradingCriteria?: string; // ESSAY
  matchingConfig?: string; // MATCHING (JSON string of pairs)
  correctOrder?: string; // RANKING (JSON string array)
  answers: AnswerDataDto[];
}

export interface InstructionAnswerSaveRequest {
  id?: number;
  content: string;
  /**
   * For Multiple Choice / Fill-in-Blank / Short Answer, indicates correctness.
   * For Matching/Ranking, this is ignored by backend; you may omit.
   */
  correct?: boolean;
  order: number;
  attachmentId?: number;
  /**
   * Required for Matching questions: items that belong to the same pair must share the same key.
   * Example: "pair-1", "pair-2" or UUIDs/numbered strings. Must be non-empty when questionType = matching.
   */
  matchingKey?: string;
}

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

export interface QuestionFilter {
  quizId: number; // quizId
  page?: number;
  size?: number;
  [key: string]: unknown;
}

// Reorder payload item for questions within a quiz
export interface QuestionReorderItem {
  id: number;
  order: number;
}
