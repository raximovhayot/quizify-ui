// Export all API endpoints from a single entry point
export { authApi } from './auth';
export { quizzesApi } from './quizzes';
export { questionsApi } from './questions';
export { assignmentsApi } from './assignments';
export { attemptsApi } from './attempts';
export { profileApi } from './profile';

// Re-export types
export type * from './auth';
export type * from './quizzes';
export type * from './questions';
export type * from './assignments';
export type * from './attempts';
export type * from './profile';
