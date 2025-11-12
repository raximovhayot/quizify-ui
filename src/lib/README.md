# New API & State Infrastructure

This directory contains the modernized API client and state management infrastructure as outlined in the rebuild plan (Phase 1-2).

## Structure

```
lib/
├── api/                    # Simplified API layer
│   ├── client.ts          # Axios instance with interceptors (50 lines vs 865)
│   ├── types.ts           # Common API types
│   └── endpoints/         # API endpoint modules
│       ├── auth.ts        # Authentication endpoints
│       ├── quizzes.ts     # Quiz endpoints
│       └── assignments.ts # Assignment endpoints
│
├── stores/                 # Zustand stores for client state
│   ├── auth-store.ts      # Auth initialization state
│   ├── ui-store.ts        # UI state (sidebar, mobile menu)
│   └── attempt-store.ts   # Quiz attempt state
│
├── websocket/              # WebSocket real-time features
│   ├── client.ts          # WebSocket client singleton
│   └── hooks.ts           # React hooks for WebSocket
│
└── query/                  # React Query configuration
    ├── client.ts          # QueryClient setup
    └── keys.ts            # Query key factory
```

## Usage Examples

### API Client

```typescript
import { apiClient } from '@/lib/api/client';

// The client automatically:
// - Adds auth tokens to requests
// - Handles token refresh on 401
// - Provides type-safe responses

const response = await apiClient.get('/instructor/quizzes');
```

### API Endpoints

```typescript
import { quizzesApi } from '@/lib/api/endpoints/quizzes';

// Type-safe API calls
const { data } = await quizzesApi.getAll({ page: 0, size: 10 });
const quiz = await quizzesApi.getById(1);
const newQuiz = await quizzesApi.create({ title: 'My Quiz' });
```

### Zustand Stores

```typescript
import { useUIStore } from '@/lib/stores/ui-store';
import { useAttemptStore } from '@/lib/stores/attempt-store';

// In components
const { isSidebarOpen, toggleSidebar } = useUIStore();
const { startAttempt, saveAnswer } = useAttemptStore();
```

### WebSocket

```typescript
import { useWebSocket } from '@/lib/websocket/hooks';

function AttemptPage() {
  const { subscribe, connect } = useWebSocket();
  
  useEffect(() => {
    // Connect when user is authenticated
    connect(userId, accessToken);
    
    // Subscribe to messages
    const unsubscribe = subscribe((message) => {
      if (message.action === 'STOP') {
        // Handle time's up
      }
    });
    
    return unsubscribe;
  }, []);
}
```

### React Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { quizzesApi } from '@/lib/api/endpoints/quizzes';
import { queryKeys } from '@/lib/query/keys';

// Queries
const { data: quizzes } = useQuery({
  queryKey: queryKeys.quizzes.list({ page: 0 }),
  queryFn: () => quizzesApi.getAll({ page: 0 }),
});

// Mutations
const createQuiz = useMutation({
  mutationFn: quizzesApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.all });
  },
});
```

## Migration Strategy

This new infrastructure works **alongside** the existing code. You can:

1. **Keep using existing code** - Nothing breaks
2. **Gradually migrate** - Use new API client for new features
3. **Mix and match** - Use Zustand stores with old API, or vice versa

## Benefits

### API Client (90% Less Code)
- **Before**: 865 lines in `api.ts`
- **After**: ~50 lines in `client.ts` + modular endpoints
- Auto token refresh
- Better error handling
- Type-safe by default

### State Management
- **Zustand**: Simple, minimal boilerplate for client state
- **React Query**: Server state with caching, invalidation
- Clear separation of concerns

### WebSocket
- Singleton client (single connection)
- React hooks for easy integration
- Auto-reconnect and heartbeat

## Next Steps

1. **Try it out** - Use new API client in a new component
2. **Migrate incrementally** - Move one feature at a time
3. **Remove old code** - Once feature is migrated, delete old implementation

See [FRONTEND-REBUILD-PLAN.md](../../docs/FRONTEND-REBUILD-PLAN.md) for full migration guide.
