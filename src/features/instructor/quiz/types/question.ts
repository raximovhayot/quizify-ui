// Question type enum
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
}

// Answer type from backend
export interface AnswerDataDto {
  id: number;
  content: string;
  correct?: boolean | null;
  order: number;
  matchingKey?: string | null; // For matching questions
  correctPosition?: number | null;
}

// Question type from backend
export interface QuestionDataDto {
  id: number;
  questionType: QuestionType;
  content: string;
  explanation?: string | null;
  order: number;
  points: number;
  answers: AnswerDataDto[];
  // Optional fields for specific question types
  trueFalseAnswer?: boolean | null;
  gradingCriteria?: string | null;
}

// Request types for creating/updating questions
export interface InstructorQuestionSaveRequest {
  quizId: number;
  questionType: QuestionType;
  content: string;
  explanation?: string;
  points: number;
  order: number;
  answers?: InstructionAnswerSaveRequest[];
  trueFalseAnswer?: boolean;
  gradingCriteria?: string;
}

export interface InstructionAnswerSaveRequest {
  id?: number;
  content: string;
  correct?: boolean;
  order: number;
  matchingKey?: string;
  correctPosition?: number;
}

// Filter for question listing
export interface QuestionFilter {
  quizId: number;
  page?: number;
  size?: number;
}

// Reorder questions
export interface QuestionReorderItem {
  id: number;
  order: number;
}
