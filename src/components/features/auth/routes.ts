export const ROUTES_AUTH = {
  login: () => `/sign-in`,
  register: () => `/sign-up`,
  registerVerify: (params: { phone: string; resendTime?: number }) =>
    `${ROUTES_AUTH.register()}/verify?phone=${encodeURIComponent(params.phone)}${params.resendTime ? `&resendTime=${params.resendTime}` : ''}`,
  forgotPassword: () => `/forgot-password`,
  forgotPasswordVerify: (params: { phone: string; waitingTime?: number }) =>
    `${ROUTES_AUTH.forgotPassword()}/verify?phone=${encodeURIComponent(params.phone)}${params.waitingTime ? `&resendTime=${params.waitingTime}` : ''}`,
  resetPassword: (params: { phone: string; token: string }) =>
    `${ROUTES_AUTH.forgotPassword()}/reset?phone=${encodeURIComponent(params.phone)}&token=${params.token}`,
  logout: (params: { redirect?: string } = {}) =>
    params.redirect ? `/logout?redirect=${params.redirect}` : '/logout',
} as const;
