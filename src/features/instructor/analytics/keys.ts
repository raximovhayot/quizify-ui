export const assignmentKeys = {
  all: ['assignments'] as const,
  lists: () => [...assignmentKeys.all, 'list'] as const,
  list: (filter: Record<string, unknown>) =>
    [...assignmentKeys.lists(), filter] as const,
  details: () => [...assignmentKeys.all, 'detail'] as const,
  detail: (id: number) => [...assignmentKeys.details(), id] as const,
  analytics: (assignmentId: number) =>
    [...assignmentKeys.all, 'analytics', assignmentId] as const,
  questionAnalytics: (assignmentId: number) =>
    [...assignmentKeys.all, 'questions', 'analytics', assignmentId] as const,
  registrations: (assignmentId: number) =>
    [...assignmentKeys.all, 'registrations', assignmentId] as const,
} as const;
