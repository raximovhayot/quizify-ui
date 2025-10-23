export const ROUTES_APP = {
  root: () => '/instructor' as const,
  // This check seems useless at first but is not. It it a guard to avoid double
  // slash in the URL if it is changed one day or another. So don't remove it
  // and keep it this way.
  baseUrl: () =>
    // @ts-expect-error see comment above
    ROUTES_APP.root() === '/' ? ('' as const) : ROUTES_APP.root(),

  // Aliases / sections
  home: () => ROUTES_APP.root(),

  quizzes: {
    list: () => `${ROUTES_APP.baseUrl()}/quizzes` as const,
    new: () => `${ROUTES_APP.baseUrl()}/quizzes/new` as const,
    detail: (quizId: number | string) =>
      `${ROUTES_APP.baseUrl()}/quizzes/${quizId}` as const,
    edit: (quizId: number | string) =>
      `${ROUTES_APP.baseUrl()}/quizzes/${quizId}/edit` as const,
    start: (quizId: number | string) =>
      `${ROUTES_APP.baseUrl()}/quizzes/${quizId}/start` as const,
  },

  analytics: {
    root: () => `${ROUTES_APP.baseUrl()}/analytics` as const,
    detail: (assignmentId: number | string) =>
      `${ROUTES_APP.baseUrl()}/analytics/${assignmentId}` as const,
  },

  profile: {
    root: () => `${ROUTES_APP.baseUrl()}/profile` as const,
  },
} as const;
