export * from './useAssignments';
export * from './useCreateAssignment';

// Re-export analytics hooks from useAssignments
export {
  useAssignmentAnalytics,
  useQuestionAnalytics,
  useStudentRegistrations,
} from './useAssignments';
