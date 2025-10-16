export enum AssignmentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export enum AssignmentResultShowType {
  AFTER_ASSIGNMENT = 'AFTER_ASSIGNMENT',
  AFTER_EACH_ATTEMPT = 'AFTER_EACH_ATTEMPT',
  NEVER = 'NEVER',
}

export enum AssignmentResultType {
  ONLY_CORRECT = 'ONLY_CORRECT',
  ALL_ANSWERS = 'ALL_ANSWERS',
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
}
