import { z } from 'zod';

import { AttemptStatus } from '@/components/features/student/quiz/types/attempt';
import { pageableSchema } from '@/components/shared/schemas/pageable.schema';

export const attemptListDTOSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  attempt: z.number().int().nonnegative(),
  status: z.nativeEnum(AttemptStatus),
  correct: z.number().int().nonnegative().optional(),
  incorrect: z.number().int().nonnegative().optional(),
  notChosen: z.number().int().nonnegative().optional(),
  total: z.number().int().nonnegative().optional(),
});

export const pageableAttemptListSchema = pageableSchema(attemptListDTOSchema);
