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
  trueFalseAnswer?: boolean;
  answers: AnswerDataDto[];
}

export interface InstructionAnswerSaveRequest {
  id?: number;
  content: string;
  correct: boolean;
  order: number;
  attachmentId?: number;
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
}
