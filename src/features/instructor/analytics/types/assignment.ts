export enum AssignmentStatus {
  // Backend status values (uppercase)
  CREATED = 'CREATED',
  STARTED = 'STARTED',
  FINISHED = 'FINISHED',
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
  status?: AssignmentStatus; // optional because backend may omit status in list DTOs
  code?: string; // Assignment access code
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
