export enum AssignmentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export interface AssignmentDTO {
  id: number;
  title: string;
  description?: string | null;
  status?: AssignmentStatus | string; // keep flexible if backend returns string
  createdDate?: string;
  dueDate?: string | null;
  quizId?: number;
}

export interface AssignmentFilter {
  page?: number; // default 0
  size?: number; // default 10
  search?: string;
  status?: AssignmentStatus | string;
}
