import {z} from 'zod';

export const pageableSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
    z.object({
        content: z
            .array(itemSchema)
            .nullish()
            .transform((v) => v ?? []),
        totalElements: z.number().int().nonnegative(),
        totalPages: z.number().int().nonnegative(),
        size: z.number().int().nonnegative(),
        page: z.number().int().nonnegative(),
    });
