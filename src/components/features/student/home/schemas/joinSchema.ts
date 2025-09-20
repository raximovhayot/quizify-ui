import { z } from 'zod';

export type TTranslate = (
  key: string,
  params?: Record<string, string | number | Date>
) => string;

export function createJoinSchema(t: TTranslate) {
  return z.object({
    code: z
      .string()
      .trim()
      .min(
        1,
        t('student.home.joinRequired', {
          fallback: 'Please enter a join code.',
        })
      )
      .min(
        4,
        t('student.home.joinMinLength', {
          fallback: 'Code should be at least 4 characters.',
        })
      )
      .max(64)
      .regex(
        /^[A-Za-z0-9-]+$/,
        t('student.home.joinInvalid', {
          fallback: 'Enter a valid code (letters, numbers, dashes).',
        })
      ),
  });
}

export type TJoinForm = z.infer<ReturnType<typeof createJoinSchema>>;
