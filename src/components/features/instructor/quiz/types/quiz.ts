export enum QuizStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

// Quiz Settings interface (JSON field in backend)
export interface QuizSettings {
  time: number; // @PositiveOrZero - time limit in minutes (Integer in backend)
  attempt: number; // @PositiveOrZero - maximum number of attempts (Integer in backend)
  shuffleQuestions: boolean; // whether to shuffle questions (boolean in backend)
  shuffleAnswers: boolean; // whether to shuffle answers (boolean in backend)
}

// Quiz Data DTO (matches backend QuizDataDTO)
export interface QuizDataDTO {
  id: number; // Long in backend
  title: string;
  description?: string | null;
  status: QuizStatus;
  createdDate: string; // LocalDateTime in backend
  lastModifiedDate?: string; // LocalDateTime in backend
  numberOfQuestions: number; // Integer in backend
  settings: QuizSettings;
  attachmentId?: number; // Long in backend
}

// Quiz Filter for GET /instructor/quizzes (matches backend QuizFilter)
export interface QuizFilter {
  page?: number; // default: 0
  size?: number; // default: 10
  search?: string;
  status?: QuizStatus;
  [key: string]: unknown;
}

// Quiz Create Request - POST /instructor/quizzes
export interface InstructorQuizCreateRequest {
  title: string; // @NotBlank, @Size(min = 3, max = 512)
  description?: string; // @Size(max = 1024)
  settings: QuizSettings; // @Valid
  attachmentId?: number; // Long in backend
}

// Quiz Update Request - PUT /instructor/quizzes/{quizId}
export interface InstructorQuizUpdateRequest {
  id?: number; // Long in backend
  title: string; // @NotBlank, @Size(min = 3, max = 512)
  description?: string; // @Size(max = 1024)
  settings: QuizSettings; // @Valid, @NotNull
  attachmentId?: number; // Long in backend
}

// Quiz Status Update Request - PATCH /instructor/quizzes/{quizId}/status
export interface InstructorQuizUpdateStatusRequest {
  id: number;
  status: QuizStatus;
}

// Helper types for form handling
export type QuizFormData = Omit<InstructorQuizCreateRequest, 'settings'> & {
  settings: Partial<QuizSettings>; // Keep as Partial for form handling flexibility
};
