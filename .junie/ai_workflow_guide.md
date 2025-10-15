# AI Implementation Workflow Guide

> **Purpose**: Step-by-step workflows for AI agents to implement features correctly and consistently. Each workflow includes time estimates, file locations, and complete examples.

---

## Table of Contents

1. [Adding a New Entity (CRUD)](#adding-a-new-entity-crud)
2. [Adding a New Form](#adding-a-new-form)
3. [Adding a New Page](#adding-a-new-page)
4. [Adding a New Question Type](#adding-a-new-question-type)
5. [Adding API Integration](#adding-api-integration)
6. [Adding i18n Support](#adding-i18n-support)
7. [Error Handling Workflows](#error-handling-workflows)
8. [Testing Workflows](#testing-workflows)

---

## Adding a New Entity (CRUD)

**Example: Creating a "Course" entity with full CRUD operations**

**Time Estimate:** 90-120 minutes  
**Complexity:** Medium

### Step 1: Define Types (15 min)

**File:** `src/components/features/courses/types/course.ts`

```typescript
// Status enum
export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// Main entity type (matches backend DTO)
export interface CourseDTO {
  id: number;
  title: string;
  description?: string;
  status: CourseStatus;
  instructorId: number;
  createdDate: string;
  lastModifiedDate?: string;
  numberOfStudents: number;
}

// Filter for listing
export interface CourseFilter {
  page?: number;
  size?: number;
  search?: string;
  status?: CourseStatus;
  instructorId?: number;
  [key: string]: unknown;
}

// Create request (no id, no timestamps)
export interface CourseCreateRequest {
  title: string;
  description?: string;
  status?: CourseStatus;
}

// Update request (includes id)
export interface CourseUpdateRequest extends CourseCreateRequest {
  id: number;
}

// Status update request
export interface CourseStatusUpdateRequest {
  id: number;
  status: CourseStatus;
}
```

**Checklist:**
- [ ] Enum for status (if applicable)
- [ ] DTO matches backend response
- [ ] Filter extends base pageable
- [ ] Create request has no id/timestamps
- [ ] Update request includes id
- [ ] Separate status update type (if needed)

---

### Step 2: Create Zod Schemas (20 min)

**File:** `src/components/features/courses/schemas/courseSchema.ts`

```typescript
import { z } from 'zod';
import { pageableSchema } from '@/components/shared/schemas/pageable.schema';
import { CourseStatus } from '../types/course';

// Normalize status (accept uppercase from backend)
const statusSchema = z.preprocess(
  (val) => (typeof val === 'string' ? val.toLowerCase() : val),
  z.nativeEnum(CourseStatus)
);

// Reusable field schemas
const titleSchema = z
  .string()
  .min(3, 'courses.validation.titleMin')
  .max(200, 'courses.validation.titleMax');

const descriptionSchema = z
  .string()
  .max(1000, 'courses.validation.descriptionMax')
  .optional();

// DTO Schema (for response validation)
export const courseDTOSchema = z.object({
  id: z.coerce.number(),
  title: titleSchema,
  description: descriptionSchema,
  status: statusSchema,
  instructorId: z.coerce.number(),
  createdDate: z.string(),
  lastModifiedDate: z.string().optional(),
  numberOfStudents: z.coerce.number(),
});

// Form Schema (for client-side form validation)
export const courseFormSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  status: statusSchema.default(CourseStatus.DRAFT),
});

// Pageable response schema
export const courseListResponseSchema = pageableSchema(courseDTOSchema);

// Type exports
export type TCourseFormData = z.infer<typeof courseFormSchema>;
export type TCourseListResponse = z.infer<typeof courseListResponseSchema>;
```

**Checklist:**
- [ ] Status normalization (lowercase)
- [ ] Reusable field schemas
- [ ] DTO schema with coercion
- [ ] Form schema without id/timestamps
- [ ] Pageable response schema
- [ ] Type exports from schemas
- [ ] Validation messages use i18n keys

---

### Step 3: Create Query Keys (5 min)

**File:** `src/components/features/courses/keys.ts`

```typescript
import { CourseFilter } from './types/course';

export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filter: CourseFilter) => [...courseKeys.lists(), filter] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: number) => [...courseKeys.details(), id] as const,
} as const;
```

**Pattern Explanation:**
- `all`: Base key for all course queries
- `lists`: Key for all list queries
- `list(filter)`: Specific list with filter
- `details`: Key for all detail queries
- `detail(id)`: Specific detail by id

**Checklist:**
- [ ] Hierarchical key structure
- [ ] Uses `as const` for type safety
- [ ] Includes filter in list key

---

### Step 4: Create Service Layer (30 min)

**File:** `src/components/features/courses/services/courseService.ts`

```typescript
import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';
import { IPageableList } from '@/types/common';
import {
  CourseDTO,
  CourseFilter,
  CourseCreateRequest,
  CourseUpdateRequest,
  CourseStatusUpdateRequest,
} from '../types/course';
import {
  courseDTOSchema,
  courseListResponseSchema,
} from '../schemas/courseSchema';

export class CourseService {
  /**
   * Get paginated list of courses
   */
  static async getCourses(
    filter: CourseFilter = {},
    signal?: AbortSignal
  ): Promise<IPageableList<CourseDTO>> {
    const response: IApiResponse<IPageableList<CourseDTO>> =
      await apiClient.get('/instructor/courses', {
        signal,
        query: {
          page: filter.page,
          size: filter.size,
          search: filter.search,
          status: filter.status,
          instructorId: filter.instructorId,
        },
      });

    const data = extractApiData(response);
    return courseListResponseSchema.parse(data);
  }

  /**
   * Get single course by ID
   */
  static async getCourse(
    courseId: number,
    signal?: AbortSignal
  ): Promise<CourseDTO> {
    const response: IApiResponse<CourseDTO> = await apiClient.get(
      '/instructor/courses/:id',
      { signal, params: { id: courseId } }
    );

    const data = extractApiData(response);
    return courseDTOSchema.parse(data);
  }

  /**
   * Create a new course
   */
  static async createCourse(data: CourseCreateRequest): Promise<CourseDTO> {
    const response: IApiResponse<CourseDTO> = await apiClient.post(
      '/instructor/courses',
      data
    );

    const result = extractApiData(response);
    return courseDTOSchema.parse(result);
  }

  /**
   * Update existing course
   */
  static async updateCourse(
    courseId: number,
    data: CourseUpdateRequest
  ): Promise<CourseDTO> {
    const response: IApiResponse<CourseDTO> = await apiClient.put(
      '/instructor/courses/:id',
      data,
      { params: { id: courseId } }
    );

    const result = extractApiData(response);
    return courseDTOSchema.parse(result);
  }

  /**
   * Update course status
   */
  static async updateCourseStatus(
    courseId: number,
    data: CourseStatusUpdateRequest
  ): Promise<void> {
    const response: IApiResponse<void> = await apiClient.patch(
      '/instructor/courses/:id/status',
      data,
      { params: { id: courseId } }
    );

    extractApiData(response);
  }

  /**
   * Delete course
   */
  static async deleteCourse(courseId: number): Promise<void> {
    const response: IApiResponse<void> = await apiClient.delete(
      '/instructor/courses/:id',
      { params: { id: courseId } }
    );

    extractApiData(response);
  }
}
```

**Checklist:**
- [ ] All methods are static
- [ ] AbortSignal for GET requests
- [ ] Use apiClient methods (get, post, put, patch, delete)
- [ ] Path params use `:paramName` syntax
- [ ] Query params in `query` object
- [ ] Always validate responses with Zod
- [ ] Extract data with `extractApiData`
- [ ] JSDoc comments for all methods

---

### Step 5: Create React Query Hooks (30 min)

**File:** `src/components/features/courses/hooks/useCourses.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { courseKeys } from '../keys';
import { CourseService } from '../services/courseService';
import { CourseFilter } from '../types/course';

export function useCourses(filter: CourseFilter = {}) {
  return useQuery({
    queryKey: courseKeys.list(filter),
    queryFn: async ({ signal }) => {
      return CourseService.getCourses(filter, signal);
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}
```

**File:** `src/components/features/courses/hooks/useCourse.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { courseKeys } from '../keys';
import { courseDTOSchema } from '../schemas/courseSchema';
import { CourseService } from '../services/courseService';
import { CourseDTO } from '../types/course';

export function useCourse(courseId: number) {
  return useQuery({
    queryKey: courseKeys.detail(courseId),
    queryFn: async ({ signal }): Promise<CourseDTO> => {
      const response = await CourseService.getCourse(courseId, signal);
      return courseDTOSchema.parse(response);
    },
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}
```

**File:** `src/components/features/courses/hooks/useCreateCourse.ts`

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { createMutation } from '@/lib/mutation-utils';
import { courseKeys } from '../keys';
import { courseDTOSchema } from '../schemas/courseSchema';
import { CourseService } from '../services/courseService';
import { CourseCreateRequest, CourseDTO } from '../types/course';

export function useCreateCourse() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return createMutation<CourseDTO, CourseCreateRequest>({
    mutationFn: async (data) => {
      const created = await CourseService.createCourse(data);
      return { data: created, errors: [] };
    },
    successMessage: t('courses.create.success', {
      fallback: 'Course created successfully',
    }),
    invalidateQueries: [courseKeys.lists()],
    onSuccess: (data) => {
      // Validate and prime detail cache
      const validated = courseDTOSchema.parse(data);
      queryClient.setQueryData(courseKeys.detail(validated.id), validated);
    },
  })();
}
```

**File:** `src/components/features/courses/hooks/useUpdateCourse.ts`

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { createMutation } from '@/lib/mutation-utils';
import { courseKeys } from '../keys';
import { courseDTOSchema } from '../schemas/courseSchema';
import { CourseService } from '../services/courseService';
import { CourseUpdateRequest, CourseDTO } from '../types/course';

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return createMutation<CourseDTO, CourseUpdateRequest>({
    mutationFn: async (data) => {
      if (!data.id) {
        throw new Error('Course ID is required for update');
      }
      const updated = await CourseService.updateCourse(data.id, data);
      return { data: updated, errors: [] };
    },
    successMessage: t('courses.update.success', {
      fallback: 'Course updated successfully',
    }),
    invalidateQueries: [courseKeys.lists()],
    onSuccess: (data) => {
      // Validate and update detail cache
      const validated = courseDTOSchema.parse(data);
      queryClient.setQueryData(courseKeys.detail(validated.id), validated);
    },
  })();
}
```

**File:** `src/components/features/courses/hooks/useDeleteCourse.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { courseKeys } from '../keys';
import { TCourseListResponse } from '../schemas/courseSchema';
import { CourseService } from '../services/courseService';
import { CourseDTO } from '../types/course';

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: async (courseId: number): Promise<void> => {
      await CourseService.deleteCourse(courseId);
    },
    onMutate: async (courseId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: courseKeys.lists() });

      // Snapshot previous lists
      const previousLists = queryClient.getQueriesData<TCourseListResponse>({
        queryKey: courseKeys.lists(),
      });

      // Optimistically update lists
      previousLists.forEach(([key, data]) => {
        if (!data) return;
        const content = data.content.filter((c) => c.id !== courseId);
        queryClient.setQueryData<TCourseListResponse>(key, {
          ...data,
          content,
          totalElements: Math.max(0, data.totalElements - 1),
        });
      });

      // Snapshot and remove detail
      const previousDetail = queryClient.getQueryData<CourseDTO>(
        courseKeys.detail(courseId)
      );
      queryClient.removeQueries({ queryKey: courseKeys.detail(courseId) });

      return { previousLists, previousDetail, courseId };
    },
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.removeQueries({ queryKey: courseKeys.detail(courseId) });

      toast.success(
        t('courses.delete.success', {
          fallback: 'Course deleted successfully',
        })
      );
    },
    onError: (error, courseId, context) => {
      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          courseKeys.detail(context.courseId),
          context.previousDetail
        );
      }

      toast.error(
        t('courses.delete.error', {
          fallback: 'Failed to delete course',
        })
      );
    },
  });
}
```

**File:** `src/components/features/courses/hooks/index.ts` (Barrel export)

```typescript
export { useCourses } from './useCourses';
export { useCourse } from './useCourse';
export { useCreateCourse } from './useCreateCourse';
export { useUpdateCourse } from './useUpdateCourse';
export { useDeleteCourse } from './useDeleteCourse';
```

**Checklist:**
- [ ] Query hooks use `useQuery`
- [ ] Mutation hooks use `createMutation` utility
- [ ] Delete uses `useMutation` directly (for optimistic updates)
- [ ] Pass `signal` to service methods
- [ ] Invalidate appropriate query keys
- [ ] Prime detail cache after create/update
- [ ] Optimistic updates for delete
- [ ] Rollback on error
- [ ] i18n for success/error messages
- [ ] Barrel export in index.ts

---

### Step 6: Add i18n Keys (15 min)

**Files:** `messages/en.json`, `messages/ru.json`, `messages/uz.json`

```json
{
  "courses": {
    "title": "Courses",
    "create": {
      "title": "Create Course",
      "button": "Create Course",
      "success": "Course created successfully"
    },
    "update": {
      "success": "Course updated successfully",
      "error": "Failed to update course"
    },
    "delete": {
      "success": "Course deleted successfully",
      "error": "Failed to delete course",
      "dialog": {
        "title": "Delete Course",
        "description": "Are you sure you want to delete this course? This action cannot be undone."
      }
    },
    "form": {
      "title": "Title",
      "titlePlaceholder": "Enter course title...",
      "description": "Description",
      "descriptionPlaceholder": "Enter course description...",
      "status": "Status",
      "submit": "Save Course",
      "submitting": "Saving..."
    },
    "validation": {
      "titleMin": "Title must be at least 3 characters",
      "titleMax": "Title must not exceed 200 characters",
      "descriptionMax": "Description must not exceed 1000 characters"
    },
    "status": {
      "draft": "Draft",
      "published": "Published",
      "archived": "Archived"
    },
    "list": {
      "empty": {
        "title": "No courses found",
        "description": "Create your first course to get started"
      },
      "filtered": {
        "empty": {
          "title": "No courses match your search",
          "description": "Try adjusting your search criteria"
        }
      }
    },
    "loading": "Loading courses...",
    "error": {
      "title": "Something went wrong",
      "description": "There was a problem loading the courses. Please try again.",
      "loadFailed": "Failed to load courses"
    }
  }
}
```

**Checklist:**
- [ ] Add to ALL THREE locale files
- [ ] Follow naming convention: `{feature}.{context}.{key}`
- [ ] Include form labels and placeholders
- [ ] Include validation messages
- [ ] Include success/error messages
- [ ] Include empty state messages
- [ ] If non-English, use Google Translate + mark for review

---

### Step 7: Create Form Component (20 min)

**File:** `src/components/features/courses/components/CourseForm.tsx`

```typescript
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { courseFormSchema, type TCourseFormData } from '../schemas/courseSchema';
import {
  CourseDTO,
  CourseStatus,
  CourseCreateRequest,
  CourseUpdateRequest,
} from '../types/course';

export interface CourseFormProps {
  course?: CourseDTO;
  onSubmit: (
    data: CourseCreateRequest | CourseUpdateRequest
  ) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
  hideTitle?: boolean;
}

export function CourseForm({
  course,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className,
  hideTitle = false,
}: Readonly<CourseFormProps>) {
  const t = useTranslations('courses');

  const form = useForm<TCourseFormData>({
    resolver: zodResolver(courseFormSchema) as Resolver<TCourseFormData>,
    defaultValues: {
      title: course?.title || '',
      description: course?.description || '',
      status: course?.status || CourseStatus.DRAFT,
    },
  });

  const handleFormSubmit = async (data: TCourseFormData) => {
    const submitData: CourseCreateRequest | CourseUpdateRequest = {
      ...data,
    };

    if (course) {
      (submitData as CourseUpdateRequest).id = course.id;
    }

    await onSubmit(submitData);
  };

  return (
    <Card className={className}>
      {!hideTitle && (
        <CardHeader>
          <CardTitle>
            {course
              ? t('update.title', { default: 'Edit Course' })
              : t('create.title', { default: 'Create New Course' })}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          {/* Title */}
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="title">{t('form.title')}</FieldLabel>
                <FieldContent>
                  <Input
                    id="title"
                    placeholder={t('form.titlePlaceholder')}
                    disabled={isSubmitting}
                    aria-invalid={!!fieldState.error}
                    aria-describedby={
                      fieldState.error ? 'title-error' : undefined
                    }
                    {...field}
                  />
                  <FieldError id="title-error">
                    {fieldState.error?.message}
                  </FieldError>
                </FieldContent>
              </Field>
            )}
          />

          {/* Description */}
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="description">
                  {t('form.description')}
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    id="description"
                    placeholder={t('form.descriptionPlaceholder')}
                    disabled={isSubmitting}
                    rows={3}
                    aria-invalid={!!fieldState.error}
                    aria-describedby={
                      fieldState.error ? 'description-error' : undefined
                    }
                    {...field}
                  />
                  <FieldError id="description-error">
                    {fieldState.error?.message}
                  </FieldError>
                </FieldContent>
              </Field>
            )}
          />

          {/* Status */}
          <Controller
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="status">{t('form.status')}</FieldLabel>
                <FieldContent>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CourseStatus.DRAFT}>
                        {t('status.draft')}
                      </SelectItem>
                      <SelectItem value={CourseStatus.PUBLISHED}>
                        {t('status.published')}
                      </SelectItem>
                      <SelectItem value={CourseStatus.ARCHIVED}>
                        {t('status.archived')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError id="status-error">
                    {fieldState.error?.message}
                  </FieldError>
                </FieldContent>
              </Field>
            )}
          />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {t('common.cancel', { default: 'Cancel' })}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting
                ? t('form.submitting')
                : course
                  ? t('common.update', { default: 'Update' })
                  : t('common.create', { default: 'Create' })}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

**Checklist:**
- [ ] Use Controller for all fields
- [ ] Field primitives (Field, FieldLabel, FieldContent, FieldError)
- [ ] aria-invalid and aria-describedby
- [ ] Disabled state during submission
- [ ] i18n for all text
- [ ] Responsive button layout
- [ ] hideTitle prop for modal usage

---

### Step 8: Summary & Verification

**Files Created (13 total):**
```
src/components/features/courses/
├── types/
│   └── course.ts
├── schemas/
│   └── courseSchema.ts
├── services/
│   └── courseService.ts
├── hooks/
│   ├── useCourses.ts
│   ├── useCourse.ts
│   ├── useCreateCourse.ts
│   ├── useUpdateCourse.ts
│   ├── useDeleteCourse.ts
│   └── index.ts
├── components/
│   └── CourseForm.tsx
└── keys.ts

messages/
├── en.json (updated)
├── ru.json (updated)
└── uz.json (updated)
```

**Final Checklist:**
- [ ] All 13 files created
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] i18n keys added to all locales
- [ ] Service methods use correct HTTP verbs
- [ ] Query keys follow hierarchical pattern
- [ ] Mutations invalidate correct queries
- [ ] Form uses Field primitives
- [ ] All text is translatable

**Next Steps:**
- Create list/detail pages (see "Adding a New Page")
- Add table/card components for listing
- Add delete confirmation dialog
- Write tests

---

## Adding a New Form

**Example: Creating a multi-step wizard form**

### When to Use This Pattern

- Multi-step registration
- Complex configuration wizards
- Progressive data collection

### Step 1: Define Form Steps

```typescript
// src/components/features/courses/components/CreateCourseWizard.tsx
enum WizardStep {
  BASIC_INFO = 0,
  SETTINGS = 1,
  CONFIRMATION = 2,
}

interface WizardState {
  currentStep: WizardStep;
  formData: Partial<CourseCreateRequest>;
}
```

### Step 2: Create Step Components

```typescript
// BasicInfoStep.tsx
interface BasicInfoStepProps {
  data: Partial<CourseCreateRequest>;
  onNext: (data: Partial<CourseCreateRequest>) => void;
  onCancel: () => void;
}

export function BasicInfoStep({ data, onNext, onCancel }: BasicInfoStepProps) {
  const t = useTranslations('courses.wizard');
  const form = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: data,
  });

  return (
    <form onSubmit={form.handleSubmit(onNext)}>
      {/* Fields */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit">{t('next')}</Button>
      </div>
    </form>
  );
}
```

### Step 3: Create Wizard Container

```typescript
export function CreateCourseWizard() {
  const [state, setState] = useState<WizardState>({
    currentStep: WizardStep.BASIC_INFO,
    formData: {},
  });

  const createCourse = useCreateCourse();

  const handleStepComplete = (data: Partial<CourseCreateRequest>) => {
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, ...data },
      currentStep: prev.currentStep + 1,
    }));
  };

  const handleSubmit = async () => {
    await createCourse.mutateAsync(state.formData as CourseCreateRequest);
  };

  return (
    <div>
      {state.currentStep === WizardStep.BASIC_INFO && (
        <BasicInfoStep
          data={state.formData}
          onNext={handleStepComplete}
          onCancel={() => {}}
        />
      )}
      {/* Other steps */}
    </div>
  );
}
```

**Key Points:**
- State machine for steps
- Accumulate data across steps
- Final submit with complete data
- Allow navigation back/forward

---

## Adding a New Page

**Example: Creating a course list page with filters**

### Step 1: Create Page Component (App Router)

**File:** `src/app/instructor/courses/page.tsx`

```typescript
import CoursesListPage from '@/components/features/courses/CoursesListPage';

export default function InstructorCoursesPage() {
  return <CoursesListPage />;
}
```

### Step 2: Create Feature Page Component

**File:** `src/components/features/courses/CoursesListPage.tsx`

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useUrlFilter } from '@/components/shared/hooks/useUrlFilter';
import { ContentPlaceholder } from '@/components/shared/ui/ContentPlaceholder';
import { FileText } from 'lucide-react';
import { ROUTES_APP } from '../routes';
import { CoursesHeader } from './components/CoursesHeader';
import { CoursesListSection } from './components/CoursesListSection';
import { useDeleteCourse } from './hooks/useDeleteCourse';
import { useCourses } from './hooks/useCourses';
import { CourseFilter, CourseStatus } from './types/course';

export function CoursesListPage() {
  const router = useRouter();
  const t = useTranslations();

  // URL-based state management
  const { filter, setPage, setSearch } = useUrlFilter<CourseFilter>({
    defaultSize: 10,
    parseFilter: (params) => ({
      status: params.get('status') as CourseStatus | undefined,
    }),
  });

  // Local state for search (before debounce)
  const [searchQuery, setSearchQuery] = useState(filter.search || '');

  // Sync searchQuery with URL filter
  useEffect(() => {
    setSearchQuery(filter.search || '');
  }, [filter.search]);

  // Debounce search input
  useEffect(() => {
    const trimmed = (searchQuery || '').trim();
    if (trimmed === (filter.search || '')) return;
    const id = setTimeout(() => {
      setSearch(trimmed);
    }, 400);
    return () => clearTimeout(id);
  }, [searchQuery, filter.search, setSearch]);

  const coursesQuery = useCourses(filter);
  const deleteCourse = useDeleteCourse();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = (searchQuery || '').trim();
    setSearch(trimmed);
  };

  return (
    <div className="space-y-6">
      <CoursesHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onCreate={() => router.push(ROUTES_APP.courses.new())}
      />

      {coursesQuery.isError ? (
        <ContentPlaceholder
          icon={FileText}
          title={t('common.error.title', { fallback: 'Something went wrong' })}
          description={t('common.error.description', {
            fallback: 'There was a problem loading the data. Please try again.',
          })}
          actions={[
            {
              label: t('common.retry', { fallback: 'Try Again' }),
              onClick: () => coursesQuery.refetch(),
            },
          ]}
        />
      ) : (
        <CoursesListSection
          loading={coursesQuery.isLoading}
          courses={coursesQuery.data?.content}
          onDelete={(id: number) => deleteCourse.mutate(id)}
          searchQuery={filter.search || ''}
          isDeleting={deleteCourse.isPending}
          currentPage={coursesQuery.data?.page || 0}
          totalPages={coursesQuery.data?.totalPages || 0}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

export default CoursesListPage;
```

**Checklist:**
- [ ] Use `'use client'` directive
- [ ] URL-based filter state with `useUrlFilter`
- [ ] Local state for search with debounce
- [ ] Error boundary with ContentPlaceholder
- [ ] Loading/error/success states handled
- [ ] Pass callbacks to child components

---

### Step 3: Create Routes Configuration

**File:** `src/components/features/courses/routes.ts`

```typescript
export const ROUTES_APP = {
  courses: {
    root: () => '/instructor/courses',
    list: () => '/instructor/courses',
    new: () => '/instructor/courses/new',
    detail: (id: number) => `/instructor/courses/${id}`,
    edit: (id: number) => `/instructor/courses/${id}/edit`,
  },
};
```

---

## Adding a New Question Type

**Example: Adding a "Dropdown" question type**

**Time Estimate:** 120-150 minutes  
**Complexity:** High

### Step 1: Add to QuestionType Enum

**File:** `src/components/features/instructor/quiz/types/question.ts`

```typescript
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  FILL_IN_BLANK = 'fill_in_blank',
  ESSAY = 'essay',
  MATCHING = 'matching',
  RANKING = 'ranking',
  DROPDOWN = 'dropdown', // ✅ NEW
}
```

---

### Step 2: Update Form Schema

**File:** `src/components/features/instructor/quiz/schemas/questionSchema.ts`

```typescript
export const instructorQuestionFormSchema = z.discriminatedUnion('questionType', [
  // ... existing types
  
  // ✅ NEW: Dropdown
  baseQuestionFields.extend({
    questionType: z.literal(QuestionType.DROPDOWN),
    dropdownOptions: z
      .array(z.object({ 
        label: z.string().min(1, 'Option label required'),
        value: z.string().min(1, 'Option value required'),
        correct: z.boolean(),
      }))
      .min(2, 'At least 2 options required'),
  }),
]);
```

---

### Step 3: Add Default Values

**File:** `src/components/features/instructor/quiz/components/factories/questionDefaultsRegistry.ts`

```typescript
// Add to createDefaults function
case QuestionType.DROPDOWN:
  return {
    ...base,
    questionType: QuestionType.DROPDOWN,
    dropdownOptions: [
      { label: 'Option 1', value: 'opt1', correct: true },
      { label: 'Option 2', value: 'opt2', correct: false },
    ],
  } satisfies TDropdownForm;

// Add to editDefaults function
case QuestionType.DROPDOWN:
  return {
    ...base,
    questionType: QuestionType.DROPDOWN,
    dropdownOptions: parseDropdownOptions(data.dropdownConfig),
  } satisfies TDropdownForm;

// Helper function
function parseDropdownOptions(config?: string) {
  if (!config) return [{ label: '', value: '', correct: false }];
  try {
    const parsed = JSON.parse(config);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [{ label: '', value: '', correct: false }];
}
```

---

### Step 4: Create Form Component

**File:** `src/components/features/instructor/quiz/components/forms/DropdownQuestionForm.tsx`

```typescript
'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import type { TInstructorQuestionForm } from '../../schemas/questionSchema';
import { QuestionType } from '../../types/question';
import type { BaseQuestionFormProps } from './BaseQuestionForm';
import { BaseQuestionForm } from './BaseQuestionForm';

export type DropdownQuestionFormProps = Omit<
  BaseQuestionFormProps,
  'fixedType' | 'children'
>;

export function DropdownQuestionForm(props: DropdownQuestionFormProps) {
  const t = useTranslations();

  function DropdownFields() {
    type TDropdownForm = {
      dropdownOptions: { label: string; value: string; correct: boolean }[];
    };
    
    const { register, watch, setValue, formState } =
      useFormContext<TDropdownForm>();
    
    const options = (watch('dropdownOptions') ?? []) as {
      label: string;
      value: string;
      correct: boolean;
    }[];

    const handleAdd = () =>
      setValue('dropdownOptions', [
        ...options,
        { label: '', value: '', correct: false },
      ]);

    const handleRemove = (index: number) =>
      setValue(
        'dropdownOptions',
        options.filter((_, i) => i !== index)
      );

    const getMessage = (err: unknown): string | undefined => {
      if (!err) return undefined;
      if (typeof err === 'string') return err;
      if (typeof err === 'object') {
        const obj = err as { message?: unknown; root?: { message?: unknown } };
        if (typeof obj.message === 'string') return obj.message;
        if (obj.root && typeof obj.root.message === 'string')
          return obj.root.message;
      }
      return undefined;
    };

    const optionsErrorMsg = getMessage(
      (formState.errors as unknown as { dropdownOptions?: unknown })
        .dropdownOptions
    );

    return (
      <Field>
        <FieldLabel>
          {t('common.question.dropdown.options', {
            fallback: 'Dropdown options',
          })}
        </FieldLabel>
        <FieldContent>
          <div className="space-y-3">
            {options.map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end border rounded-lg p-3"
              >
                <div className="sm:col-span-5 space-y-1">
                  <span className="text-xs text-muted-foreground">
                    {t('common.label', { fallback: 'Label' })}
                  </span>
                  <Input
                    placeholder={t('common.label', { fallback: 'Label' })}
                    {...register(`dropdownOptions.${index}.label` as const)}
                  />
                </div>
                
                <div className="sm:col-span-4 space-y-1">
                  <span className="text-xs text-muted-foreground">
                    {t('common.value', { fallback: 'Value' })}
                  </span>
                  <Input
                    placeholder={t('common.value', { fallback: 'Value' })}
                    {...register(`dropdownOptions.${index}.value` as const)}
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2">
                  <Switch
                    id={`dropdown-correct-${index}`}
                    {...register(`dropdownOptions.${index}.correct` as const)}
                  />
                  <label
                    htmlFor={`dropdown-correct-${index}`}
                    className="text-xs"
                  >
                    {t('common.correct', { fallback: 'Correct' })}
                  </label>
                </div>

                <div className="sm:col-span-1">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemove(index)}
                    className="w-full"
                  >
                    {t('common.remove', { fallback: 'Remove' })}
                  </Button>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={handleAdd}
              className="w-full sm:w-auto"
            >
              {t('common.add', { fallback: 'Add Option' })}
            </Button>
            
            <FieldError id="dropdownOptions-error">
              {optionsErrorMsg}
            </FieldError>
          </div>
        </FieldContent>
      </Field>
    );
  }

  return (
    <BaseQuestionForm {...props} fixedType={QuestionType.DROPDOWN}>
      <DropdownFields />
    </BaseQuestionForm>
  );
}
```

---

### Step 5: Register in Form Registry

**File:** `src/components/features/instructor/quiz/components/factories/questionFormRegistry.tsx`

```typescript
import { DropdownQuestionForm } from '../forms/DropdownQuestionForm';

const questionFormRegistry: Record<QuestionType, QuestionFormComponent> = {
  // ... existing
  [QuestionType.DROPDOWN]: DropdownQuestionForm, // ✅ NEW
};

// Update metadata
const questionTypeLabelKeys: Record<
  QuestionType,
  { key: string; fallback: string }
> = {
  // ... existing
  [QuestionType.DROPDOWN]: {
    key: 'common.questionTypes.dropdown',
    fallback: 'Dropdown',
  }, // ✅ NEW
};

// Update canonical order
export function getAllQuestionTypes(): QuestionType[] {
  return [
    QuestionType.MULTIPLE_CHOICE,
    QuestionType.TRUE_FALSE,
    QuestionType.SHORT_ANSWER,
    QuestionType.FILL_IN_BLANK,
    QuestionType.ESSAY,
    QuestionType.MATCHING,
    QuestionType.RANKING,
    QuestionType.DROPDOWN, // ✅ NEW
  ];
}
```

---

### Step 6: Add Request Builder

**File:** `src/components/features/instructor/quiz/components/factories/questionRequestRegistry.ts`

```typescript
type TDropdown = Extract<
  TInstructorQuestionForm,
  { questionType: QuestionType.DROPDOWN }
>;

const dropdownBuilder: QuestionRequestBuilder<TDropdown> = {
  build(form) {
    // Convert dropdown options to answers
    const answers: InstructionAnswerSaveRequest[] = form.dropdownOptions.map(
      (opt, idx) => ({
        content: opt.label,
        correct: opt.correct,
        order: idx,
        // Store value in a custom field or use matchingKey
        matchingKey: opt.value,
      })
    );

    const dropdownConfig = JSON.stringify(form.dropdownOptions);

    return {
      ...baseFields(form),
      dropdownConfig,
      answers,
    };
  },
};

// Register builder
const builders: Record<
  QuestionType,
  QuestionRequestBuilder<TInstructorQuestionForm>
> = {
  // ... existing
  [QuestionType.DROPDOWN]: dropdownBuilder as unknown as QuestionRequestBuilder<TInstructorQuestionForm>,
};
```

---

### Step 7: Add Preview Renderer

**File:** `src/components/features/instructor/quiz/components/factories/questionPreviewRegistry.tsx`

```typescript
const dropdownPreview: OptionsPreviewFn = ({ q, showCorrect, t }) => {
  let options: { label: string; value: string; correct?: boolean }[] = [];
  
  try {
    if (typeof q.dropdownConfig === 'string' && q.dropdownConfig.trim()) {
      const parsed = JSON.parse(q.dropdownConfig);
      if (Array.isArray(parsed)) options = parsed;
    }
  } catch {}

  if (options.length === 0 && Array.isArray(q.answers)) {
    options = q.answers.map((a) => ({
      label: a.content,
      value: a.matchingKey || a.content,
      correct: a.correct,
    }));
  }

  if (options.length === 0) return null;

  return (
    <div className="mt-2">
      <div className="text-sm text-muted-foreground">
        {t('common.selectFromDropdown', { fallback: 'Select from dropdown:' })}
      </div>
      <ul className="mt-2 space-y-1">
        {options.map((opt, idx) => {
          const isCorrect = showCorrect && opt.correct;
          return (
            <li
              key={idx}
              className={`text-sm flex items-center gap-2 px-2 py-1 ${
                isCorrect
                  ? 'bg-green-100 dark:bg-green-900/20 rounded-md'
                  : ''
              }`}
            >
              <span className="font-medium">{opt.label}</span>
              {showCorrect && isCorrect && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  ✓
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// Register preview
const registry: Record<QuestionType, OptionsPreviewFn> = {
  // ... existing
  [QuestionType.DROPDOWN]: dropdownPreview,
};
```

---

### Step 8: Add i18n Keys

**Files:** `messages/en.json`, `messages/ru.json`, `messages/uz.json`

```json
{
  "common": {
    "questionTypes": {
      "dropdown": "Dropdown"
    },
    "question": {
      "dropdown": {
        "options": "Dropdown options"
      }
    },
    "selectFromDropdown": "Select from dropdown:",
    "label": "Label",
    "value": "Value"
  }
}
```

---

### Step 9: Update Backend Types (if needed)

**File:** `src/components/features/instructor/quiz/types/question.ts`

```typescript
export interface QuestionDataDto {
  // ... existing fields
  dropdownConfig?: string; // ✅ NEW: JSON string for dropdown options
}

export interface InstructorQuestionSaveRequest {
  // ... existing fields
  dropdownConfig?: string; // ✅ NEW
}
```

---

### Step 10: Summary & Testing

**Files Modified (6 total):**
```
✅ types/question.ts (enum + DTO)
✅ schemas/questionSchema.ts (form schema)
✅ factories/questionDefaultsRegistry.ts (defaults)
✅ factories/questionFormRegistry.tsx (registration + metadata)
✅ factories/questionRequestRegistry.ts (request builder)
✅ factories/questionPreviewRegistry.tsx (preview renderer)
✅ forms/DropdownQuestionForm.tsx (NEW form component)
✅ messages/*.json (i18n keys)
```

**Testing Checklist:**
- [ ] Can create dropdown question
- [ ] Can edit dropdown question
- [ ] Options display correctly in preview
- [ ] Correct answer is marked when "Show Answers" enabled
- [ ] Form validation works
- [ ] Data persists correctly
- [ ] Backend accepts dropdownConfig

---

## Adding API Integration

**Example: Integrating a third-party grading API**

### Step 1: Define Types

```typescript
// src/services/grading/types.ts
export interface GradingRequest {
  studentAnswer: string;
  correctAnswer: string;
  questionType: string;
}

export interface GradingResponse {
  score: number; // 0-1
  feedback: string;
  confidence: number;
}
```

---

### Step 2: Create Service

```typescript
// src/services/grading/gradingService.ts
import { apiClient } from '@/lib/api';

export class GradingService {
  static async gradeAnswer(
    request: GradingRequest
  ): Promise<GradingResponse> {
    const response = await apiClient.post<GradingResponse>(
      '/api/grading/evaluate',
      request
    );

    if (response.errors.length > 0) {
      throw new Error(response.errors[0]?.message || 'Grading failed');
    }

    return response.data;
  }
}
```

---

### Step 3: Create Hook

```typescript
// src/services/grading/useGrading.ts
import { useMutation } from '@tanstack/react-query';
import { GradingService } from './gradingService';
import type { GradingRequest, GradingResponse } from './types';

export function useGrading() {
  return useMutation<GradingResponse, Error, GradingRequest>({
    mutationFn: (request) => GradingService.gradeAnswer(request),
  });
}
```

---

### Step 4: Use in Component

```typescript
export function AnswerGrader({ answer, correctAnswer }: Props) {
  const grading = useGrading();

  const handleGrade = async () => {
    try {
      const result = await grading.mutateAsync({
        studentAnswer: answer,
        correctAnswer,
        questionType: 'essay',
      });
      
      console.log('Score:', result.score);
      console.log('Feedback:', result.feedback);
    } catch (error) {
      console.error('Grading failed:', error);
    }
  };

  return (
    <Button onClick={handleGrade} disabled={grading.isPending}>
      {grading.isPending ? 'Grading...' : 'Grade Answer'}
    </Button>
  );
}
```

---

## Adding i18n Support

### Step 1: Identify All User-Facing Text

**Checklist:**
- [ ] Page titles
- [ ] Button labels
- [ ] Form labels and placeholders
- [ ] Error messages
- [ ] Success messages
- [ ] Empty state messages
- [ ] Tooltips and help text
- [ ] Validation messages

---

### Step 2: Create i18n Key Structure

```json
{
  "feature": {
    "page": {
      "title": "Page Title",
      "description": "Page description"
    },
    "form": {
      "fieldName": "Field Label",
      "fieldNamePlaceholder": "Placeholder text",
      "submit": "Submit",
      "submitting": "Submitting..."
    },
    "validation": {
      "fieldNameRequired": "Field is required",
      "fieldNameMin": "Minimum {count} characters",
      "fieldNameMax": "Maximum {count} characters"
    },
    "messages": {
      "success": "Operation successful",
      "error": "Operation failed"
    },
    "empty": {
      "title": "No items found",
      "description": "Try creating one"
    }
  }
}
```

---

### Step 3: Add to All Locale Files

**CRITICAL:** Add keys to ALL THREE files:
- `messages/en.json`
- `messages/ru.json` (use Google Translate + mark for review)
- `messages/uz.json` (use Google Translate + mark for review)

---

### Step 4: Use in Components

```typescript
const t = useTranslations('feature');

// Simple usage
<h1>{t('page.title')}</h1>

// With fallback
<h1>{t('page.title', { fallback: 'Default Title' })}</h1>

// With variables
<p>{t('validation.fieldNameMin', { count: 3 })}</p>

// Nested keys
<Button>{t('form.submit')}</Button>
```

---

## Error Handling Workflows

### Pattern 1: Form Validation Errors

```typescript
const form = useForm({
  resolver: zodResolver(schema),
});

// Errors are automatically displayed via FieldError
<FieldError id="field-error">
  {form.formState.errors.fieldName?.message}
</FieldError>
```

---

### Pattern 2: API Errors in Mutations

```typescript
const mutation = useMutation({
  mutationFn: apiCall,
  onError: (error: BackendError) => {
    // Error toast is already shown by handleApiResponse
    // Optional: Set form errors
    error.errors.forEach((err) => {
      if (err.field) {
        form.setError(err.field as Path<T>, {
          type: 'backend',
          message: err.message,
        });
      }
    });
  },
});
```

---

### Pattern 3: Query Errors

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
});

if (error) {
  return (
    <ContentPlaceholder
      icon={AlertTriangle}
      title={t('error.title')}
      description={t('error.description')}
      actions={[
        {
          label: t('common.retry'),
          onClick: () => refetch(),
        },
      ]}
    />
  );
}
```

---

### Pattern 4: Try-Catch in Async Handlers

```typescript
const handleSubmit = async (data: FormData) => {
  try {
    await mutation.mutateAsync(data);
    onSuccess?.();
  } catch (error) {
    // Error is already handled by mutation's onError
    // Only add logic if you need component-specific handling
    console.error('Form submission failed:', error);
  }
};
```

**Rule:** Always use try-catch for async handlers, even if empty.

---

## Testing Workflows

### Pattern 1: Service Layer Tests

```typescript
// src/services/__tests__/courseService.test.ts
import { CourseService } from '../courseService';
import { apiClient } from '@/lib/api';

jest.mock('@/lib/api');

describe('CourseService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches courses successfully', async () => {
    const mockResponse = {
      data: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        page: 0,
      },
      errors: [],
    };

    (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

    const result = await CourseService.getCourses({});

    expect(apiClient.get).toHaveBeenCalledWith(
      '/instructor/courses',
      expect.objectContaining({
        query: expect.any(Object),
      })
    );
    expect(result).toEqual(mockResponse.data);
  });

  it('handles API errors', async () => {
    const mockError = {
      data: null,
      errors: [{ code: 'ERROR', message: 'Failed' }],
    };

    (apiClient.get as jest.Mock).mockResolvedValue(mockError);

    await expect(CourseService.getCourses({})).rejects.toThrow();
  });
});
```

---

### Pattern 2: Hook Tests (with React Testing Library)

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCourses } from '../useCourses';
import { CourseService } from '../../services/courseService';

jest.mock('../../services/courseService');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useCourses', () => {
  it('fetches courses successfully', async () => {
    const mockData = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      page: 0,
    };

    (CourseService.getCourses as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useCourses({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
  });
});
```

---

### Pattern 3: Component Tests

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CourseForm } from '../CourseForm';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('CourseForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  it('renders form fields', () => {
    render(
      <CourseForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    render(
      <CourseForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Course' },
    });

    fireEvent.submit(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Course',
        })
      );
    });
  });

  it('displays validation errors', async () => {
    render(
      <CourseForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.submit(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });
});
```

---

## Quick Reference: Decision Trees

### When to Create a New Service File?

```
Is it a new backend endpoint?
├─ YES → Create new service
└─ NO → Does it fit existing service?
   ├─ YES → Add method to existing service
   └─ NO → Create new service
```

---

### When to Use Optimistic Updates?

```
Is the operation destructive (delete)?
├─ YES → Use optimistic updates
└─ NO → Is immediate feedback critical?
   ├─ YES → Use optimistic updates
   └─ NO → Use standard mutations
```

---

### When to Use Container/Presentational Pattern?

```
Does component fetch data?
├─ YES → Create Container + Presentational
└─ NO → Is it reusable across contexts?
   ├─ YES → Create Presentational only
   └─ NO → Create single component
```

---

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Not Using Field Primitives

```typescript
// ❌ WRONG
<div>
  <label>Name</label>
  <input {...register('name')} />
</div>

// ✅ CORRECT
<Field>
  <FieldLabel htmlFor="name">{t('form.name')}</FieldLabel>
  <FieldContent>
    <Input id="name" {...register('name')} />
  </FieldContent>
</Field>
```

---

### ❌ Pitfall 2: Hardcoded Strings

```typescript
// ❌ WRONG
<Button>Save</Button>

// ✅ CORRECT
<Button>{t('common.save')}</Button>
```

---

### ❌ Pitfall 3: Missing AbortSignal

```typescript
// ❌ WRONG
static async getCourses(filter: CourseFilter): Promise<IPageableList<CourseDTO>> {
  const response = await apiClient.get('/instructor/courses');
  return extractApiData(response);
}

// ✅ CORRECT
static async getCourses(
  filter: CourseFilter,
  signal?: AbortSignal
): Promise<IPageableList<CourseDTO>> {
  const response = await apiClient.get('/instructor/courses', {
    signal,
    query: filter,
  });
  return extractApiData(response);
}
```

---

### ❌ Pitfall 4: Not Validating API Responses

```typescript
// ❌ WRONG
static async getCourse(id: number): Promise<CourseDTO> {
  const response = await apiClient.get(`/courses/${id}`);
  return extractApiData(response); // Unknown shape!
}

// ✅ CORRECT
static async getCourse(id: number): Promise<CourseDTO> {
  const response = await apiClient.get(`/courses/${id}`);
  const data = extractApiData(response);
  return courseDTOSchema.parse(data); // Validated!
}
```

---

### ❌ Pitfall 5: Incorrect Query Key Usage

```typescript
// ❌ WRONG - Static key doesn't update with filter changes
queryKey: ['courses']

// ✅ CORRECT - Dynamic key includes filter
queryKey: courseKeys.list(filter)
```

---

### ❌ Pitfall 6: Not Invalidating Queries After Mutations

```typescript
// ❌ WRONG
const createCourse = useMutation({
  mutationFn: CourseService.createCourse,
  // No invalidation!
});

// ✅ CORRECT
const createCourse = createMutation({
  mutationFn: CourseService.createCourse,
  invalidateQueries: [courseKeys.lists()],
});
```

---

### ❌ Pitfall 7: Missing Accessibility Attributes

```typescript
// ❌ WRONG
<Input {...register('email')} />
{errors.email && <span>{errors.email.message}</span>}

// ✅ CORRECT
<Input
  id="email"
  {...register('email')}
  aria-invalid={!!errors.email}
  aria-describedby="email-error"
/>
<FieldError id="email-error">
  {errors.email?.message}
</FieldError>
```

---

### ❌ Pitfall 8: Not Handling Loading States

```typescript
// ❌ WRONG
const { data } = useQuery({ queryKey: ['courses'], queryFn: getCourses });
return <CourseList courses={data} />; // What if loading?

// ✅ CORRECT
const { data, isLoading, error } = useQuery({
  queryKey: ['courses'],
  queryFn: getCourses,
});

if (isLoading) return <FullPageLoading text={t('loading')} />;
if (error) return <ErrorDisplay error={error} />;
return <CourseList courses={data || []} />;
```

---

### ❌ Pitfall 9: Creating Custom Phone Inputs

```typescript
// ❌ WRONG - Don't create custom phone validation
<Input
  type="tel"
  {...register('phone')}
  placeholder="+998 XX XXX XX XX"
/>

// ✅ CORRECT - Use PhoneField component
<PhoneField
  control={form.control}
  name="phone"
  label={t('auth.phone.label')}
  placeholder={t('auth.phone.placeholderUz')}
/>
```

---

### ❌ Pitfall 10: Mixing Data Fetching with Presentation

```typescript
// ❌ WRONG - Everything in one component
export function CourseList() {
  const [courses, setCourses] = useState([]);
  
  useEffect(() => {
    fetch('/api/courses').then(/* ... */);
  }, []);
  
  return <div>{courses.map(/* ... */)}</div>;
}

// ✅ CORRECT - Separated concerns
// Presentational
export function CourseList({ courses }: { courses: CourseDTO[] }) {
  return <div>{courses.map(/* ... */)}</div>;
}

// Container
export function CourseListContainer() {
  const { data: courses, isLoading } = useCourses();
  if (isLoading) return <Spinner />;
  return <CourseList courses={courses || []} />;
}
```

---

## AI Agent Checklist Template

Use this template for every feature implementation:

```markdown
## Feature: [Feature Name]

### Planning Phase
- [ ] Understand requirements completely
- [ ] Check for similar existing implementations
- [ ] Identify files that need to be created/modified
- [ ] Verify API endpoints and contracts
- [ ] Plan i18n key structure

### Implementation Phase - Types & Schemas
- [ ] Create/update types file
- [ ] Create Zod schemas
- [ ] Export type inferences from schemas
- [ ] Add to barrel exports if needed

### Implementation Phase - Service Layer
- [ ] Create service class with static methods
- [ ] Add AbortSignal to GET requests
- [ ] Use apiClient methods correctly
- [ ] Validate all responses with Zod
- [ ] Add JSDoc comments

### Implementation Phase - React Query
- [ ] Create query keys file
- [ ] Create query hooks (useEntity, useEntities)
- [ ] Create mutation hooks (useCreate, useUpdate, useDelete)
- [ ] Configure staleTime and gcTime appropriately
- [ ] Implement optimistic updates for deletes
- [ ] Add proper error handling

### Implementation Phase - i18n
- [ ] Add keys to messages/en.json
- [ ] Add keys to messages/ru.json
- [ ] Add keys to messages/uz.json
- [ ] Follow naming convention: {feature}.{context}.{key}
- [ ] Include fallback values in code

### Implementation Phase - Components
- [ ] Create presentational components
- [ ] Create container components
- [ ] Use Field primitives for forms
- [ ] Add proper accessibility attributes
- [ ] Handle loading/error/empty states
- [ ] Add responsive design classes

### Implementation Phase - Forms
- [ ] Use React Hook Form + Zod resolver
- [ ] Use Controller for all fields
- [ ] Add aria-invalid and aria-describedby
- [ ] Disable fields during submission
- [ ] Show validation errors with FieldError
- [ ] Add cancel/submit buttons with proper labels

### Testing Phase
- [ ] Manual testing: create operation
- [ ] Manual testing: read/list operation
- [ ] Manual testing: update operation
- [ ] Manual testing: delete operation
- [ ] Manual testing: form validation
- [ ] Manual testing: error states
- [ ] Manual testing: empty states
- [ ] Manual testing: responsive design
- [ ] Manual testing: accessibility (keyboard navigation)

### Code Quality Phase
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All text is translatable (no hardcoded strings)
- [ ] Consistent naming conventions
- [ ] Proper error handling everywhere
- [ ] All mutations invalidate correct queries
- [ ] Loading states handled
- [ ] Empty states handled

### Documentation Phase
- [ ] Add comments to complex logic
- [ ] Update routes configuration if needed
- [ ] Document any non-obvious patterns used
```

---

## Time Estimates for Common Tasks

| Task | Time Estimate | Complexity |
|------|---------------|------------|
| Add simple CRUD entity | 90-120 min | Medium |
| Add complex form (multi-step) | 120-180 min | High |
| Add new page with filters | 60-90 min | Medium |
| Add new question type | 120-150 min | High |
| Add API integration | 30-60 min | Low-Medium |
| Add i18n support to page | 30-45 min | Low |
| Create reusable component | 45-60 min | Medium |
| Add optimistic updates | 30-45 min | Medium |
| Write comprehensive tests | 60-90 min | Medium |
| Fix accessibility issues | 15-30 min | Low |

---

## Emergency Debugging Workflow

### Problem: Mutation Not Working

```
1. Check Network Tab
   ├─ Request sent? → Check service method
   ├─ Response 200? → Check response validation
   └─ Response error? → Check backend logs

2. Check React Query DevTools
   ├─ Mutation pending? → Check onSuccess/onError
   ├─ Query invalidated? → Check invalidateQueries
   └─ Cache updated? → Check setQueryData

3. Check Console
   ├─ Zod validation error? → Check schema
   ├─ Type error? → Check types
   └─ Runtime error? → Check logic
```

---

### Problem: Form Validation Not Working

```
1. Check Zod Schema
   ├─ Schema matches form fields?
   ├─ Validation rules correct?
   └─ Error messages have i18n keys?

2. Check Form Setup
   ├─ Using zodResolver?
   ├─ Using Controller?
   └─ Passing form.control?

3. Check Field Component
   ├─ Using FieldError?
   ├─ Passing error message?
   └─ Has aria-describedby?
```

---

### Problem: i18n Keys Not Working

```
1. Check Key Structure
   ├─ Key exists in en.json?
   ├─ Key exists in ru.json?
   └─ Key exists in uz.json?

2. Check Usage
   ├─ Using useTranslations?
   ├─ Correct namespace?
   └─ Fallback provided?

3. Check File Location
   ├─ In messages/ folder?
   └─ Valid JSON?
```

---

## Final Notes for AI Agents

### Before Starting Any Task

1. **Read requirements twice**
2. **Check existing code** for similar patterns
3. **Ask clarifying questions** if uncertain
4. **Plan the implementation** before coding
5. **Follow the checklist** strictly

### During Implementation

1. **One file at a time** - complete each file fully
2. **Copy patterns exactly** from existing code
3. **Test as you go** - don't wait until the end
4. **Use TypeScript strictly** - no `any` types
5. **Add i18n immediately** - don't leave for later

### After Implementation

1. **Review checklist** - ensure nothing missed
2. **Test all paths** - happy path, errors, edge cases
3. **Verify accessibility** - keyboard navigation, screen readers
4. **Check responsive design** - mobile, tablet, desktop
5. **Document any deviations** from patterns

### Communication Guidelines

1. **Be explicit** about what you're doing
2. **Ask before deviating** from established patterns
3. **Explain trade-offs** when suggesting alternatives
4. **Provide examples** when explaining
5. **Admit uncertainty** when you don't know

---

## Success Metrics

A feature is considered **complete** when:

- ✅ All TypeScript compiles without errors
- ✅ All ESLint checks pass
- ✅ All text uses i18n (no hardcoded strings)
- ✅ All forms use Field primitives
- ✅ All API responses are validated with Zod
- ✅ All mutations invalidate appropriate queries
- ✅ Loading, error, and empty states handled
- ✅ Responsive design works on mobile/desktop
- ✅ Keyboard navigation works
- ✅ Manual testing passes all scenarios

---

**END OF AI WORKFLOW GUIDE**