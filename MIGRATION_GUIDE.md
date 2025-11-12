# Migration Guide: Using New API Infrastructure

This guide shows how to use the new API infrastructure in your components.

## Quick Start

### Import What You Need

```typescript
// React Query hooks (recommended for components)
import { 
  useQuizzes,
  useCreateQuiz,
  useQuestions,
  useStartAttempt,
  useProfile 
} from '@/lib/api';

// Direct API calls (for special cases)
import { quizzesApi, attemptsApi } from '@/lib/api';

// Zustand stores
import { useUIStore } from '@/lib/stores/ui-store';
import { useAttemptStore } from '@/lib/stores/attempt-store';

// WebSocket
import { useWebSocket } from '@/lib/websocket/hooks';
```

## Examples

### 1. Quiz Listing Page

```typescript
'use client';

import { useQuizzes, useDeleteQuiz } from '@/lib/api';

export default function QuizzesPage() {
  // Fetch quizzes with automatic caching
  const { data, isLoading, error } = useQuizzes({ 
    page: 0, 
    size: 10,
    status: 'PUBLISHED' 
  });

  // Delete mutation
  const deleteQuiz = useDeleteQuiz();

  const handleDelete = async (id: number) => {
    await deleteQuiz.mutateAsync(id);
    // Automatically refetches quiz list!
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading quizzes</div>;

  return (
    <div>
      {data?.content.map(quiz => (
        <div key={quiz.id}>
          <h3>{quiz.title}</h3>
          <button onClick={() => handleDelete(quiz.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 2. Quiz Creation

```typescript
'use client';

import { useCreateQuiz } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function CreateQuizPage() {
  const router = useRouter();
  const createQuiz = useCreateQuiz();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const quiz = await createQuiz.mutateAsync({
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        status: 'DRAFT',
      });

      // Success! Navigate to quiz edit page
      router.push(`/instructor/quizzes/${quiz.id}/edit`);
    } catch (error) {
      // Error toast already shown by hook
      console.error('Failed to create quiz:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Quiz Title" required />
      <textarea name="description" placeholder="Description" />
      <button type="submit" disabled={createQuiz.isPending}>
        {createQuiz.isPending ? 'Creating...' : 'Create Quiz'}
      </button>
    </form>
  );
}
```

### 3. Quiz Taking with WebSocket

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useAttemptContent,
  useSubmitAttempt,
  useSaveAttemptProgress 
} from '@/lib/api';
import { useAttemptStore } from '@/lib/stores/attempt-store';
import { useWebSocket } from '@/lib/websocket/hooks';

export default function AttemptPage({ 
  params 
}: { 
  params: { attemptId: string } 
}) {
  const router = useRouter();
  const attemptId = Number(params.attemptId);

  // Fetch attempt content
  const { data: content } = useAttemptContent(attemptId);

  // Mutations
  const submitAttempt = useSubmitAttempt();
  const saveProgress = useSaveAttemptProgress();

  // Zustand store for local state
  const { answers, saveAnswer, clearAttempt } = useAttemptStore();

  // WebSocket for real-time notifications
  const { subscribe, connect } = useWebSocket();

  useEffect(() => {
    // Connect WebSocket (if you have user ID and token)
    // connect(userId, accessToken);

    // Subscribe to attempt notifications
    const unsubscribe = subscribe((message) => {
      if (message.attemptId === attemptId) {
        if (message.action === 'STOP') {
          // Time's up! Auto-submit
          handleSubmit();
        } else if (message.action === 'WARNING') {
          // Show warning toast (already handled by message.message)
        }
      }
    });

    return unsubscribe;
  }, [attemptId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (answers.size > 0) {
        const answersArray = Array.from(answers.values());
        saveProgress.mutate({
          id: attemptId,
          data: { answers: answersArray }
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [answers]);

  const handleAnswerChange = (questionId: number, answerId: number) => {
    saveAnswer(questionId, answerId);
  };

  const handleSubmit = async () => {
    const answersArray = Array.from(answers.values());
    
    await submitAttempt.mutateAsync({
      id: attemptId,
      data: { answers: answersArray }
    });

    clearAttempt();
    router.push(`/student/attempts/${attemptId}/results`);
  };

  return (
    <div>
      <h1>Quiz Attempt</h1>
      {content?.questions.map(question => (
        <div key={question.id}>
          <h3>{question.questionText}</h3>
          {question.options?.map(option => (
            <label key={option.id}>
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.id}
                onChange={() => handleAnswerChange(question.id, option.id)}
              />
              {option.text}
            </label>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit} disabled={submitAttempt.isPending}>
        Submit
      </button>
    </div>
  );
}
```

### 4. User Profile

```typescript
'use client';

import { useProfile, useUpdateProfile } from '@/lib/api';

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await updateProfile.mutateAsync({
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
    });
  };

  if (isLoading) return <div>Loading profile...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="firstName" 
        defaultValue={profile?.firstName} 
        placeholder="First Name" 
      />
      <input 
        name="lastName" 
        defaultValue={profile?.lastName} 
        placeholder="Last Name" 
      />
      <input 
        name="email" 
        type="email"
        defaultValue={profile?.email} 
        placeholder="Email" 
      />
      <button type="submit" disabled={updateProfile.isPending}>
        Save
      </button>
    </form>
  );
}
```

### 5. Authentication

```typescript
'use client';

import { useSignIn } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const signIn = useSignIn();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await signIn.mutateAsync({
        phone: formData.get('phone') as string,
        password: formData.get('password') as string,
      });

      // Tokens stored automatically!
      router.push('/dashboard');
    } catch (error) {
      // Error toast already shown
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="phone" placeholder="Phone" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit" disabled={signIn.isPending}>
        {signIn.isPending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

### 6. Using Zustand Stores

```typescript
'use client';

import { useUIStore } from '@/lib/stores/ui-store';

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside className={isSidebarOpen ? 'open' : 'closed'}>
      <button onClick={toggleSidebar}>
        Toggle
      </button>
      {/* Sidebar content */}
    </aside>
  );
}
```

## Benefits of New Pattern

### 1. Automatic Features

- **Caching**: Data cached automatically, no manual state management
- **Refetching**: Automatic background refetching
- **Loading States**: Built-in `isLoading`, `isPending`
- **Error Handling**: Consistent error handling with toasts
- **Optimistic Updates**: Easy to implement

### 2. Less Code

**Before (Service Layer):**
```typescript
const [quizzes, setQuizzes] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const data = await QuizService.getQuizzes();
      setQuizzes(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  fetchQuizzes();
}, []);
```

**After (React Query Hook):**
```typescript
const { data: quizzes, isLoading, error } = useQuizzes();
```

### 3. Type Safety

All hooks are fully typed:
```typescript
const { data } = useQuiz(quizId);
// data is typed as Quiz | undefined

const createQuiz = useCreateQuiz();
// Knows parameter type is QuizCreateRequest
```

## Migration Checklist

For each component using old services:

- [ ] Replace `QuizService.getQuizzes()` → `useQuizzes()`
- [ ] Replace `QuizService.createQuiz()` → `useCreateQuiz()`
- [ ] Remove manual state management (`useState`, `useEffect`)
- [ ] Remove try/catch (error handling built-in)
- [ ] Remove loading state management
- [ ] Use Zustand for UI state
- [ ] Add WebSocket for real-time features

## Common Patterns

### Pagination

```typescript
const [page, setPage] = useState(0);
const { data } = useQuizzes({ page, size: 10 });

<button onClick={() => setPage(p => p + 1)}>Next</button>
```

### Dependent Queries

```typescript
const { data: quiz } = useQuiz(quizId);
const { data: questions } = useQuestions(quizId, !!quiz);
```

### Mutations with Optimistic Updates

```typescript
const updateQuiz = useUpdateQuiz();

updateQuiz.mutate(
  { id: quizId, data: { title: 'New Title' } },
  {
    onMutate: async (variables) => {
      // Optimistically update cache
      queryClient.setQueryData(
        queryKeys.quizzes.detail(quizId),
        (old) => ({ ...old, title: variables.data.title })
      );
    },
  }
);
```

## Need Help?

- See `/src/lib/README.md` for infrastructure details
- Check `/docs/FRONTEND-AI-AGENT-GUIDE.md` for API reference
- Review `/docs/FRONTEND-REBUILD-PLAN.md` for architecture patterns
