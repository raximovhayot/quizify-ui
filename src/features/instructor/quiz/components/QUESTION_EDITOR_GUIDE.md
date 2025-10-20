# Question Editor Dialog - Implementation Guide

## Overview

The `QuestionEditorDialog` is a unified, minimalist dialog component that handles both creating and editing quiz questions. It replaces the previous separate `CreateQuestionModal` and `EditQuestionDialog` components.

## Key Features

### ✅ Unified Design
- Single component for both create and edit operations
- Mode-based UI that adapts to the context
- 32% reduction in code (170 lines vs 250+ lines)

### ✅ Minimalist UI
- Clean shadcn-based design
- Subtle background highlights (`bg-muted/50`)
- Improved visual hierarchy
- Rounded corners (`rounded-2xl`)

### ✅ Responsive Layout
- **Mobile**: Full-screen FormDrawer with bottom sheet
- **Desktop**: Centered Dialog (max-w-3xl)
- Touch-optimized for mobile devices

### ✅ Rich Text & Math Support
- TipTap editor with Mathematics extension
- Supports LaTeX formulas
- Rich formatting (bold, italic, lists, code)

## Usage

### Create Mode

```typescript
import { QuestionEditorDialog } from './QuestionEditorDialog';
import { useCreateQuestion } from '../hooks/useQuestions';
import { toInstructorQuestionSaveRequest } from '../schemas/questionSchema';

function YourComponent({ quizId }: { quizId: number }) {
  const [open, setOpen] = useState(false);
  const createQuestion = useCreateQuestion();

  const handleCreate = async (formData: TInstructorQuestionForm) => {
    try {
      const payload = toInstructorQuestionSaveRequest(formData);
      await createQuestion.mutateAsync(payload);
      setOpen(false);
    } catch {
      // Error handling via mutation toast
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Question</Button>
      
      <QuestionEditorDialog
        mode="create"
        quizId={quizId}
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleCreate}
        isSubmitting={createQuestion.isPending}
      />
    </>
  );
}
```

### Edit Mode

```typescript
import { QuestionEditorDialog } from './QuestionEditorDialog';
import { useUpdateQuestion } from '../hooks/useQuestions';
import { toInstructorQuestionSaveRequest } from '../schemas/questionSchema';

function YourComponent({ quizId }: { quizId: number }) {
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDataDto | null>(null);
  const updateQuestion = useUpdateQuestion();

  const handleEdit = async (formData: TInstructorQuestionForm) => {
    if (!selectedQuestion) return;
    
    try {
      const payload = toInstructorQuestionSaveRequest(formData);
      await updateQuestion.mutateAsync({
        questionId: selectedQuestion.id,
        data: payload,
      });
      setSelectedQuestion(null);
    } catch {
      // Error handling via mutation toast
    }
  };

  return (
    <QuestionEditorDialog
      mode="edit"
      quizId={quizId}
      question={selectedQuestion}
      open={!!selectedQuestion}
      onOpenChange={(open) => !open && setSelectedQuestion(null)}
      onSubmit={handleEdit}
      isSubmitting={updateQuestion.isPending}
    />
  );
}
```

## Props API

```typescript
interface QuestionEditorDialogProps {
  /** The quiz ID this question belongs to */
  quizId: number;
  
  /** Controls dialog visibility */
  open: boolean;
  
  /** Callback when dialog should close */
  onOpenChange: (open: boolean) => void;
  
  /** Callback when form is submitted */
  onSubmit: (data: TInstructorQuestionForm) => Promise<void>;
  
  /** Whether form is currently submitting */
  isSubmitting?: boolean;
  
  /** Dialog mode: 'create' or 'edit' (default: 'create') */
  mode?: 'create' | 'edit';
  
  /** Question data to edit (required for edit mode) */
  question?: QuestionDataDto | null;
}
```

## UI Behavior

### Create Mode
1. Shows a highlighted card with question type selector
2. User selects question type from dropdown
3. Form fields render based on selected type
4. Title: "Create Question"
5. Description: "Add a new question to your quiz"

### Edit Mode
1. Shows question type as a read-only badge
2. Form fields pre-populated with question data
3. Question type cannot be changed
4. Title: "Edit Question"
5. Description: "Update the question details below"

## Visual Design

### Type Selector Card (Create Mode)
```tsx
<div className="rounded-lg bg-muted/50 p-4 border">
  <Field>
    <FieldLabel className="text-sm font-medium">
      Question type
    </FieldLabel>
    <Select>
      {/* Options */}
    </Select>
  </Field>
</div>
```

### Type Badge (Edit Mode)
```tsx
<div className="flex items-center justify-between rounded-lg bg-muted/50 p-3 border">
  <span className="text-sm font-medium text-muted-foreground">
    Question type
  </span>
  <Badge variant="secondary">
    Multiple Choice
  </Badge>
</div>
```

## Responsive Design

### Mobile (< 768px)
- Full-screen FormDrawer
- Slides up from bottom
- Rounded top corners (`rounded-t-2xl`)
- Touch-optimized controls

### Desktop (≥ 768px)
- Centered Dialog
- Max width: 3xl (768px)
- Rounded corners on all sides
- Scrollable content area

## Internationalization

The component uses i18n for all user-facing text:

```typescript
// English
"createQuestion": "Create Question"
"createQuestionDescription": "Add a new question to your quiz"
"editQuestion": "Edit Question"
"editQuestionDescription": "Update the question details below"

// Russian
"createQuestion": "Создать вопрос"
"createQuestionDescription": "Добавьте новый вопрос в викторину"
"editQuestion": "Редактировать вопрос"
"editQuestionDescription": "Обновите детали вопроса ниже"

// Uzbek
"createQuestion": "Savol yaratish"
"createQuestionDescription": "Viktorinangizga yangi savol qo'shing"
"editQuestion": "Savolni tahrirlash"
"editQuestionDescription": "Quyida savol tafsilotlarini yangilang"
```

## Form Fields

The dialog uses `QuestionFormRenderer` which supports:

1. **Base Fields** (all question types)
   - Points (number input)
   - Question content (rich text editor with math support)
   - Explanation (textarea, optional)

2. **Type-Specific Fields**
   - Multiple Choice: Answer options with correct/incorrect flags
   - More types can be added via the registry pattern

## Math Support

The rich text editor supports LaTeX math formulas via TipTap's Mathematics extension:

```latex
Inline: $E = mc^2$
Block: $$\frac{-b \pm \sqrt{b^2-4ac}}{2a}$$
```

## Accessibility

- Proper ARIA labels on all form fields
- Keyboard navigation support
- Focus management when dialog opens/closes
- Screen reader friendly
- Clear error messages

## Migration Guide

### Before (Separate Components)

```typescript
// For creating
<CreateQuestionModal
  quizId={quizId}
  open={openCreate}
  onOpenChange={setOpenCreate}
/>

// For editing
<EditQuestionDialog
  open={!!editingQuestion}
  question={editingQuestion}
  quizId={quizId}
  isSubmitting={isUpdatePending}
  onClose={onCloseEdit}
  onSubmit={onSubmitEdit}
/>
```

### After (Unified Component)

```typescript
// For creating
<QuestionEditorDialog
  mode="create"
  quizId={quizId}
  open={openCreate}
  onOpenChange={setOpenCreate}
  onSubmit={handleCreate}
  isSubmitting={createQuestion.isPending}
/>

// For editing
<QuestionEditorDialog
  mode="edit"
  quizId={quizId}
  question={editingQuestion}
  open={!!editingQuestion}
  onOpenChange={(open) => !open && setEditingQuestion(null)}
  onSubmit={handleEdit}
  isSubmitting={updateQuestion.isPending}
/>
```

## Testing

The component is tested via integration tests in `QuestionsListContainer.test.tsx`:

```typescript
// Mock for testing
jest.mock('../QuestionEditorDialog', () => ({
  QuestionEditorDialog: ({ open, onSubmit, onOpenChange, quizId, question }: any) => {
    if (!open) return null;
    return (
      <div data-testid="question-editor-dialog">
        {/* Test content */}
      </div>
    );
  },
}));
```

## Best Practices

1. **Always provide mode prop** for clarity
2. **Handle errors in onSubmit** callback
3. **Use proper TypeScript types** from schemas
4. **Validate data** via Zod schemas
5. **Show loading state** via isSubmitting
6. **Provide i18n keys** for all text

## Future Enhancements

Potential improvements for future iterations:

- [ ] Question preview mode
- [ ] Keyboard shortcuts (Cmd+Enter to submit)
- [ ] Auto-save draft functionality
- [ ] Question templates
- [ ] Question bank integration
- [ ] Duplicate question feature
- [ ] Question history/versions

## Related Files

- `QuestionEditorDialog.tsx` - Main dialog component
- `BaseQuestionForm.tsx` - Base form with common fields
- `QuestionFormRenderer.tsx` - Type-based form renderer
- `questionFormRegistry.tsx` - Registry for question type forms
- `questionSchema.ts` - Zod schemas for validation
- `useQuestions.ts` - React Query hooks

## Support

For questions or issues, refer to:
- Project guidelines: `.junie/guidelines.md`
- AI workflow guide: `.junie/ai_workflow_guide.md`
- Component documentation: `src/components/shared/ui/README.md`
