# Instructor Quizzes Page — Analysis & Task List

This document summarizes the current implementation of the Instructor Quizzes feature, how our MCP servers assist development, key findings from the code review, and a prioritized task list with acceptance criteria.

Date: 2025-08-08

---

Current MCP Servers (.junie/mcp/mcp.json)
- backend-filesystem: mcp-server-filesystem /home/xmpl/Idea/Quizify/quizify-backend
- swagger: mcp-swagger-server https://quizifybackend-b86e8709a4d9.herokuapp.com/v3/api-docs

How to leverage them for Quizzes
- Swagger MCP: Explore endpoints and contracts for /instructor/quizzes; optionally generate types with:
  npx -y openapi-typescript https://quizifybackend-b86e8709a4d9.herokuapp.com/v3/api-docs -o src/types/generated/api.d.ts
- Backend filesystem MCP: Cross-check controller/service for query params (e.g., status/search/sorts) and response shapes.

---

Current Implementation Overview
- Route: src/app/instructor/quizzes/page.tsx -> renders QuizListContainer (client component).
- Container: QuizListContainer manages QuizFilter state (page/size/search/status), uses hooks (useQuizzes, useDeleteQuiz, useUpdateQuizStatus) and renders loading/error/empty states.
- Presentational:
  - QuizList: UI for header, search, status filter, page-size selector, list of QuizCard, pagination, delete confirmation dialog.
  - QuizCard: Displays title, status, description, counts, settings, dates; menu actions: View, Edit, Publish/Unpublish (status toggle), Delete.
  - QuizPagination: Accessible pagination controls with numbered pages and first/prev/next/last.
- Hooks: useQuizzes/useQuiz/useCreateQuiz/useUpdateQuiz/useUpdateQuizStatus/useDeleteQuiz using React Query, Zod validation, and toast notifications.
- Schemas: schemas/quizSchema.ts defines QuizSettings/QuizDataDTO/Filters/Form schema and paginated list response.
- Service: services/quizService.ts implements list/detail/create/update/status (PATCH) and delete; returns IPageableList or DTOs via apiClient and extractApiData.
- Types: types/quiz.ts + types/question.ts + index re-exports; IPageableList in src/types/common.ts.
- Auth/access: middleware.ts restricts /instructor to INSTRUCTOR role (plus profile completion flow).

---

Key Findings (Gaps & Risks)
1) Response type mismatch for status update (likely runtime error)
   - Hook useUpdateQuizStatus expects and validates a QuizDataDTO response (quizDataDTOSchema.parse(response)).
   - Service QuizService.updateQuizStatus returns Promise<void> and discards response.
   - This mismatch will cause schema parsing to fail at runtime (undefined parsed as object) if used.
   - Action: Confirm via Swagger MCP whether PATCH /instructor/quizzes/{id}/status returns the updated quiz. Align hook+service accordingly.

2) Create/Edit/View navigation not wired
   - Create button in QuizList and View/Edit items in QuizCard have no routing. No create/edit pages detected.

3) Filters are not URL-synced and search is not debounced
   - Comments imply debounced search, but it isn’t implemented. Filter state is local only, not reflected in query params.

4) Sorting support exists in schema but not in UI/service params
   - quizFilterSchema supports sorts[] and userId. Service getQuizzes doesn’t send sorts; UI lacks sort control.

5) Optimistic updates (status toggle/delete) not implemented
   - Currently invalidates queries post-mutation; UX can be improved with optimistic updates and rollback on error.

6) Empty state CTAs and skeletons
   - Empty state CTA present for Create First Quiz, but navigation not wired.
   - Loading uses a spinner; list skeletons could improve perceived performance.

7) Error mapping and i18n
   - Toasts and ErrorDisplay use fallback i18n keys; ensure keys exist and map BackendError codes to user-friendly messages to avoid generic errors.

9) MCP-driven type safety and drift detection
   - Hand-written types currently align but could drift. Adopt generated types selectively for the quizzes feature or validate shapes during CI.

---

Prioritized Task List (with Acceptance Criteria)

Critical (Fix ASAP)
1. Align update status endpoint types
   - Steps:
     - Check Swagger MCP for PATCH /instructor/quizzes/{id}/status response shape.
     - Option A (preferred if API returns body): Update QuizService.updateQuizStatus to return QuizDataDTO, and update useUpdateQuizStatus schema validation accordingly.
     - Option B (if API returns no body): Change useUpdateQuizStatus to accept void, remove schema parse, and rely on invalidateQueries or optimistic update.
   - Acceptance:
     - Toggling status shows success toast and either updates item immediately or after refetch without errors.
     - No Zod parse error in status mutation.

High
2. Wire navigation for Create/View/Edit
   - Create routes: src/app/instructor/quizzes/new/page.tsx and src/app/instructor/quizzes/[quizId]/edit/page.tsx (stubs acceptable initially).
   - Add Link/Router pushes in QuizList (Create) and QuizCard (View/Edit) to navigate to these pages.
   - Acceptance: Clicking Create navigates to /instructor/quizzes/new. Clicking Edit/View navigates appropriately.

3. URL-sync filters and pagination
   - Read searchParams on mount to seed filter state; update URL on changes (search/status/page/size) without full reload.
   - Allow deep-linking and back/forward navigation to restore state.
   - Acceptance: Copying URL preserves filters; browser back/forward restores list state.

4. Debounced search
   - Add 300–500ms debounce for search input before updating filter and query.
   - Acceptance: API calls only after typing stops; no excessive calls per keystroke.

5. Sorting support (if backend supports)
   - Confirm param naming via Swagger MCP (e.g., sorts[0].field=title, sorts[0].direction=ASC) or standard sort param.
   - Add sort control (by Created, Title, Status) and pass to service.
   - Acceptance: Changing sort updates ordering server-side.

Medium
6. Optimistic updates for status and delete
   - In useUpdateQuizStatus/useDeleteQuiz, implement onMutate with cache update and rollback on error; keep invalidate as final sync.
   - Acceptance: UI reflects action instantly and rolls back correctly on failure.

7. Loading skeletons
   - Replace large spinner with skeleton cards matching QuizCard layout for list loading.
   - Acceptance: Skeletons display during initial and refetch loads.

8. Error mapping and i18n audit
   - Map common BackendError codes to translatable messages; ensure all keys used in Quizzes UI exist in messages.
   - Acceptance: User sees meaningful localized errors; no missing key warnings.

9. Accessibility checks
   - Ensure buttons/menus have appropriate aria-labels (many already do), focus states, and keyboard navigation in pagination/menu.
   - Acceptance: Basic a11y checks pass (e.g., via testing-library and manual keyboard testing).

Low / Later
10. Pass AbortSignal from React Query to apiClient for cancellation
    - Thread signal through apiClient; reconcile with existing timeout AbortController.
    - Acceptance: In-flight requests cancel on component unmount or refetch.

11. MCP-driven type generation (targeted)
    - Generate types for quizzes endpoints; replace or augment hand-written DTOs and Zod schemas where valuable.
    - Acceptance: Types compile; no drift with Swagger; minimal noise in PR.

12. Tests
    - Service and hooks: msw-based unit tests for success/error flows (list/create/update/status/delete).
    - Components: Render tests for QuizList/QuizCard/QuizPagination; verify actions and empty/loading/error states.
    - Acceptance: CI runs tests; coverage includes critical paths.

13. Nice-to-have UX
    - Persist recent page size to local storage.
    - Remember last filters per user (optional).

---

Environment & Config Checklist
- Ensure NEXT_PUBLIC_API_BASE_URL is set (defaults to http://localhost:8080/api) and reachable.
- NEXTAUTH_SECRET configured for auth; instructor role required for /instructor.
- Consider SKIP_ENV_VALIDATION for Docker/CI as needed.

---

Delivery Plan (Incremental)
- PR 1 (Critical): Fix status update mismatch; add smoke test for the mutation; wire navigation for Create/Edit/View to stub pages so buttons work.
- PR 2 (High): URL-sync filters + debounced search; small component tests.
- PR 3 (High): Sorting (after Swagger confirmation) + optimistic updates.
- PR 4 (Medium): Skeletons + error/i18n audit.
- PR 5 (Later): AbortSignal + MCP type generation + broader tests.

Notes
- Keep all user-facing strings translatable (next-intl keys), avoid hard-coded text.
- Use the service layer for all backend calls; validate via Zod.
- Follow feature structure and naming conventions from project guidelines.



---

Status Update (2025-08-09)

Completed in this session
- Critical 1. Align update status endpoint types — Done (Option B: no response body parsed; hook/service return void; no Zod parse on status mutation). ✓
- High 2. Wire navigation for Create/View/Edit — Done (stub pages added; actions navigate correctly). ✓
- High 3. URL-sync filters and pagination — Done (state derived from URL; updates push/replace URL; back/forward restores state). ✓
- High 4. Debounced search — Done (400ms debounce in QuizList; avoids excessive requests). ✓
- High 5. Sorting support — Done (UI control wired; sorts[] query param sent to backend as field/direction). ✓
- Medium 6. Optimistic updates for status and delete — Done (onMutate with cache update + rollback; final invalidate/refetch). ✓
- Medium 7. Loading skeletons — Done (QuizListSkeleton replaces spinner; used during load and refetch). ✓
- Low 10. Pass AbortSignal from React Query to apiClient — Done. ✓

Not yet done (remaining)
- Medium 9. Accessibility checks — Pending (aria/keyboard/focus auditing and tests).
- Low 11. MCP-driven type generation (targeted) — Pending.
- Low 12. Tests — Pending (msw-based service/hook tests; component render + interaction tests).
- Low 13. Nice-to-have UX — Pending (persist page size; remember filters).

Acceptance notes
- Status toggle and delete now use optimistic UI with rollback; final invalidation ensures server truth.
- Sorting UI and service params are wired (sortField/sortDir in URL -> sorts[] sent to backend).
- In-flight list/detail requests are cancellable via AbortSignal on unmount/refetch.
- i18n keys were partially added earlier; a full audit/mapping remains.
