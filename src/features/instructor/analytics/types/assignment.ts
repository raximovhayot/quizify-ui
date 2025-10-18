export enum AssignmentStatus {
  // Note: Backend uses CREATED/STARTED/FINISHED. Keep this enum unused for now or replace when needed.
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export enum AssignmentResultShowType {
  IMMEDIATELY = 'IMMEDIATELY',
  AFTER_ASSIGNMENT = 'AFTER_ASSIGNMENT',
  NEVER = 'NEVER',
}

export enum AssignmentResultType {
  ONLY_RESULT = 'ONLY_RESULT',
  ONLY_CORRECT = 'ONLY_CORRECT',
  FULL = 'FULL',
}

export interface AssignmentSettings {
  startTime: string; // ISO 8601 string
  endTime: string; // ISO 8601 string
  attempt: number; // max attempts (0 = unlimited)
  time: number; // time limit in minutes (0 = unlimited)
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  resultShowType: AssignmentResultShowType;
  resultType: AssignmentResultType;
}

export interface AssignmentDTO {
  id: number;
  title: string;
  description?: string | null;
  status?: AssignmentStatus | string; // keep flexible if backend returns string
  createdDate?: string;
  dueDate?: string | null;
  quizId?: number;
  settings?: AssignmentSettings;
}

export interface AssignmentFilter {
  page?: number; // default 0
  size?: number; // default 10
  search?: string;
  status?: AssignmentStatus | string;
  [key: string]: unknown; // Index signature for BaseFilter compatibility
}

export interface AssignmentCreateRequest {
  quizId: number;
  title: string;
  description?: string;
  settings: AssignmentSettings;
  startImmediately?: boolean;
}
