### Domain naming — Student “quiz” vs Backend “assignment”

Updated: 2025-10-07

Purpose

- Clarify the terminology we use in the student-facing UI vs. the backend model, so engineers, PMs, and translators stay aligned.

Core rule

- For students, “quiz” is the product term displayed in the UI.
- In the backend, the relevant entities and endpoints live under the Assignment domain.
- Therefore: student UI copy and routes say “quiz”, while the service layer calls Assignment endpoints and uses Assignment DTOs.

Practical guidelines

1. Services and endpoints (technical truth)
   - Join/check/registrations use Assignment endpoints:
     - GET `/student/assignments/join?code=…`
     - POST `/student/assignments/join` → returns `{ attemptId, assignmentId }`
     - GET `/student/assignments/registrations` → pageable list
   - Attempts lifecycle:
     - GET `/student/assignments/attempts` (filter by status)
     - GET `/student/assignments/attempts/{attemptId}/content`
     - POST `/student/assignments/attempts/save-state`
     - POST `/student/assignments/attempts/{attemptId}/complete`
   - Keep types as Assignment/Attempt in the service layer (e.g., `AssignmentRegistrationItem`, `AttemptListingData`). Do not rename types to “Quiz”.

2. UI and copy (student-facing language)
   - All student-facing strings should use the word “quiz”. Examples:
     - “Join quiz”, “Upcoming quizzes”, “In‑progress quizzes”.
   - Use `next-intl` keys like `student.home.upcoming`, `student.join.*`, with text that says “quiz”.
   - Component props can remain typed with Assignment/Attempt DTOs; only the visible labels use “quiz”.

3. Routing (student area)
   - Keep attempt player route as `/student/attempts/:attemptId`.
   - When linking from a list item, derive the target from `attemptId` (not `assignmentId`).

4. Mapping policy
   - Do not remap or rename DTO fields to force “quiz” at the type level.
   - Prefer zero-mapping services with Zod validation. The “quiz” terminology is a presentational concern handled in components and translations.

5. Instructor area (no change)
   - Instructors see both Quizzes and Assignments distinctly (true domain names). Do not rename anything in instructor flows.

6. i18n examples (English shown; provide `uz`, `ru` equivalents)
   - `student.home.upcoming`: “Upcoming quizzes”
   - `student.home.inProgress`: “In‑progress quizzes”
   - `student.join.title`: “Join a quiz”
   - `student.join.success`: “Joined successfully”

7. QA checklist
   - Student Home shows “Upcoming quizzes” from Assignment registrations and “In‑progress quizzes” from Attempts.
   - No student-facing string mentions “assignment”.
   - Network calls for student features hit only Assignment/Attempt endpoints.
   - Typecheck passes with Assignment/Attempt DTOs; no `any`.

Notes

- This policy avoids confusion for users while keeping code aligned with backend contracts.
- When regenerating OpenAPI types, keep the Assignment/Attempt names intact in TypeScript; do not alias to “Quiz” in types.
