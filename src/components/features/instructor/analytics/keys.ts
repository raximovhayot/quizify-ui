export const assignmentKeys = {
  all: ['assignments'] as const,
  lists: () => [...assignmentKeys.all, 'list'] as const,
  list: (filter: Record<string, unknown>) =>
    [...assignmentKeys.lists(), filter] as const,
  details: () => [...assignmentKeys.all, 'detail'] as const,
  detail: (id: number) => [...assignmentKeys.details(), id] as const,
} as const;

export const analyticsKeys = {
  all: ['analytics'] as const,
  assignment: (assignmentId: number) =>
    [...analyticsKeys.all, 'assignment', assignmentId] as const,
  questions: (assignmentId: number) =>
    [...analyticsKeys.all, 'questions', assignmentId] as const,
  registrations: (assignmentId: number) =>
    [...analyticsKeys.all, 'registrations', assignmentId] as const,
} as const;
