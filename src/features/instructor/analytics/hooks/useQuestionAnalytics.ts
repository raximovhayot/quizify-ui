/**
 * DEPRECATED: useQuestionAnalytics has been removed.
 * Please use useAssignmentQuestions instead:
 *   import { useAssignmentQuestions } from '../hooks';
 */
// Keeping a stub to avoid TS include errors if the file is picked up by the compiler.
// If accidentally imported, it will throw immediately and guide the developer.
export function useQuestionAnalytics(_assignmentId: number): never {
  throw new Error('useQuestionAnalytics was removed. Use useAssignmentQuestions instead.');
}
