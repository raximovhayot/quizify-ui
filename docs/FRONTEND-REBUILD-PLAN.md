# Frontend Rebuild Plan - Quizify UI

## Overview

This document provides a comprehensive plan to rebuild the Quizify frontend with optimized architecture, simpler patterns, and better performance. Based on the analysis of your existing Next.js 15 codebase.

---

## Executive Summary

**Current State:** A- (Very Good)
**Target State:** A+ (Excellent)
**Estimated Effort:** 2-3 weeks for a clean rebuild
**Key Focus Areas:** Simplification, Performance, WebSocket integration, Better state management

---

## Technology Stack

### Keep ✅
- **Next.js 15** (App Router)
- **TypeScript**
- **shadcn/ui + Tailwind CSS**
- **TanStack Query** (React Query v5)
- **Zod** (validation)
- **Sonner** (toasts)
- **React Hook Form**
- **NextAuth v5**

### Add 🆕
- **Zustand** - Global client state management
- **Axios** - Simpler HTTP client (replace custom ApiClient)
- **SockJS-client + @stomp/stompjs** - WebSocket for real-time features
- **date-fns** - Date utilities (you already have this)

### Remove/Replace 🔄
- Custom `ApiClient` (700 lines) → Axios + TanStack Query interceptors
- Excessive complexity in API layer

---

## Phase 1: Project Setup & Core Infrastructure

### 1.1 Initialize Clean Project

```bash
npx create-next-app@latest quizify-ui-v2 --typescript --tailwind --app
cd quizify-ui-v2
```

**Configuration:**
- Enable: TypeScript, ESLint, Tailwind CSS, App Router
- Disable: src/ directory (use app/ at root level for Next.js 15 best practices)
- Enable: `turbopack` for faster dev builds

### 1.2 Install Dependencies

```bash
# Core dependencies
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install zustand
npm install axios
npm install zod
npm install next-auth@beta
npm install @hookform/resolvers react-hook-form
npm install sonner
npm install date-fns
npm install clsx tailwind-merge class-variance-authority

# WebSocket
npm install sockjs-client @stomp/stompjs
npm install -D @types/sockjs-client

# shadcn/ui (CLI will install Radix UI components as needed)
npx shadcn@latest init

# Dev dependencies
npm install -D @types/node
npm install -D eslint-config-next
npm install -D prettier prettier-plugin-tailwindcss
npm install -D husky lint-staged
```

### 1.3 Project Structure

```
quizify-ui-v2/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group for auth pages
│   │   ├── sign-in/
│   │   │   └── page.tsx
│   │   ├── sign-up/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/              # Route group for authenticated pages
│   │   ├── instructor/
│   │   │   ├── quizzes/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [quizId]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── assignments/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [assignmentId]/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── student/
│   │   │   ├── assignments/
│   │   │   │   └── page.tsx
│   │   │   ├── attempts/
│   │   │   │   └── [attemptId]/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   └── layout.tsx            # Shared dashboard layout
│   │
│   ├── api/                      # API routes (minimal - only for NextAuth)
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   │
│   ├── globals.css
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing/redirect page
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   │
│   ├── quiz/                     # Quiz-specific components
│   │   ├── quiz-card.tsx
│   │   ├── question-editor.tsx
│   │   └── answer-list.tsx
│   │
│   ├── layout/                   # Layout components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   │
│   └── shared/                   # Shared components
│       ├── timer.tsx
│       ├── file-upload.tsx
│       └── error-boundary.tsx
│
├── lib/
│   ├── api/                      # API client & endpoints
│   │   ├── client.ts             # Axios instance
│   │   ├── endpoints/
│   │   │   ├── auth.ts
│   │   │   ├── quizzes.ts
│   │   │   ├── assignments.ts
│   │   │   └── attempts.ts
│   │   └── types.ts              # API types
│   │
│   ├── auth/                     # Auth utilities
│   │   ├── next-auth.config.ts
│   │   └── session.ts
│   │
│   ├── websocket/                # WebSocket service
│   │   ├── client.ts
│   │   └── hooks.ts
│   │
│   ├── stores/                   # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── ui-store.ts
│   │   └── attempt-store.ts
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-timer.ts
│   │   └── use-debounce.ts
│   │
│   ├── utils/                    # Utilities
│   │   ├── cn.ts                 # className utility
│   │   ├── validators.ts
│   │   └── formatters.ts
│   │
│   └── query/                    # React Query setup
│       ├── client.ts
│       └── keys.ts
│
├── types/
│   ├── api.ts                    # API response types
│   ├── quiz.ts
│   ├── assignment.ts
│   └── attempt.ts
│
├── middleware.ts                 # Next.js middleware for auth
├── .env.local                    # Environment variables
└── package.json
```

---

## Phase 2: Core Setup

### 2.1 Environment Configuration

**`.env.local`**
```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8080

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production

# WebSocket
NEXT_PUBLIC_WS_URL=http://localhost:8080/ws
```

### 2.2 Simplified API Client

**`lib/api/client.ts`**
```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { auth } from '@/lib/auth/next-auth.config';

// Create axios instance
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get session server-side or client-side
    const session = await auth();
    
    if (session?.accessToken) {
      config.headers.Authorization = `******;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response.data, // Return data directly
  async (error: AxiosError) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Token expired - redirect to sign in
      window.location.href = '/sign-in';
    }
    
    // Transform error to standard format
    const apiError = {
      code: error.response?.status || 'NETWORK_ERROR',
      message: (error.response?.data as any)?.message || error.message,
    };
    
    return Promise.reject(apiError);
  }
);

export type ApiError = {
  code: string | number;
  message: string;
};
```

**Why this is better:**
- **90% less code** (50 lines vs 700 lines)
- Uses battle-tested axios library
- Works seamlessly with TanStack Query
- Simpler to understand and maintain

### 2.3 TanStack Query Setup

**`lib/query/client.ts`**
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

**`lib/query/keys.ts`** - Query key factory
```typescript
export const queryKeys = {
  // Auth
  auth: {
    session: ['auth', 'session'] as const,
  },
  
  // Quizzes
  quizzes: {
    all: ['quizzes'] as const,
    lists: () => [...queryKeys.quizzes.all, 'list'] as const,
    list: (filters: unknown) => [...queryKeys.quizzes.lists(), filters] as const,
    details: () => [...queryKeys.quizzes.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.quizzes.details(), id] as const,
  },
  
  // Assignments
  assignments: {
    all: ['assignments'] as const,
    lists: () => [...queryKeys.assignments.all, 'list'] as const,
    list: (filters: unknown) => [...queryKeys.assignments.lists(), filters] as const,
    details: () => [...queryKeys.assignments.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.assignments.details(), id] as const,
  },
  
  // Attempts
  attempts: {
    all: ['attempts'] as const,
    details: () => [...queryKeys.attempts.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.attempts.details(), id] as const,
  },
};
```

### 2.4 Zustand Stores

**`lib/stores/auth-store.ts`**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  // State
  isInitialized: boolean;
  
  // Actions
  setInitialized: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isInitialized: false,
      setInitialized: (value) => set({ isInitialized: value }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

**`lib/stores/ui-store.ts`**
```typescript
import { create } from 'zustand';

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // Mobile menu
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Theme (if needed beyond next-themes)
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  
  theme: 'system',
  setTheme: (theme) => set({ theme }),
}));
```

**`lib/stores/attempt-store.ts`** - For quiz attempt state
```typescript
import { create } from 'zustand';

interface Answer {
  questionId: number;
  answerId: number | number[];
  timestamp: Date;
}

interface AttemptState {
  // Current attempt
  attemptId: number | null;
  answers: Map<number, Answer>;
  
  // Actions
  startAttempt: (attemptId: number) => void;
  saveAnswer: (questionId: number, answerId: number | number[]) => void;
  clearAttempt: () => void;
}

export const useAttemptStore = create<AttemptState>((set) => ({
  attemptId: null,
  answers: new Map(),
  
  startAttempt: (attemptId) => set({ attemptId, answers: new Map() }),
  
  saveAnswer: (questionId, answerId) =>
    set((state) => {
      const newAnswers = new Map(state.answers);
      newAnswers.set(questionId, {
        questionId,
        answerId,
        timestamp: new Date(),
      });
      return { answers: newAnswers };
    }),
  
  clearAttempt: () => set({ attemptId: null, answers: new Map() }),
}));
```

---

## Phase 3: API Layer Implementation

### 3.1 API Endpoints Structure

**`lib/api/endpoints/auth.ts`**
```typescript
import { apiClient } from '../client';
import type { 
  SignInRequest, 
  SignUpPrepareRequest,
  SignUpVerifyRequest,
  JWTTokenResponse 
} from '@/types/api';

export const authApi = {
  signIn: (data: SignInRequest) =>
    apiClient.post<JWTTokenResponse>('/auth/sign-in', data),
  
  signUpPrepare: (data: SignUpPrepareRequest) =>
    apiClient.post('/auth/sign-up/prepare', data),
  
  signUpVerify: (data: SignUpVerifyRequest) =>
    apiClient.post<JWTTokenResponse>('/auth/sign-up/verify', data),
  
  refreshToken: (refreshToken: string) =>
    apiClient.post<JWTTokenResponse>('/auth/refresh-token', { refreshToken }),
};
```

**`lib/api/endpoints/quizzes.ts`**
```typescript
import { apiClient } from '../client';
import type { Quiz, QuizCreateRequest, QuizUpdateRequest } from '@/types/quiz';

export const quizzesApi = {
  getAll: (params?: { page?: number; size?: number; search?: string }) =>
    apiClient.get<{ content: Quiz[]; totalElements: number }>('/instructor/quizzes', { params }),
  
  getById: (id: number) =>
    apiClient.get<Quiz>(`/instructor/quizzes/${id}`),
  
  create: (data: QuizCreateRequest) =>
    apiClient.post<Quiz>('/instructor/quizzes', data),
  
  update: (id: number, data: QuizUpdateRequest) =>
    apiClient.put<Quiz>(`/instructor/quizzes/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/instructor/quizzes/${id}`),
};
```

### 3.2 React Query Hooks

**`lib/api/endpoints/quizzes.hooks.ts`**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizzesApi } from './quizzes';
import { queryKeys } from '@/lib/query/keys';
import { toast } from 'sonner';

// Queries
export const useQuizzes = (params?: { page?: number; size?: number; search?: string }) => {
  return useQuery({
    queryKey: queryKeys.quizzes.list(params),
    queryFn: () => quizzesApi.getAll(params),
  });
};

export const useQuiz = (id: number) => {
  return useQuery({
    queryKey: queryKeys.quizzes.detail(id),
    queryFn: () => quizzesApi.getById(id),
    enabled: !!id,
  });
};

// Mutations
export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: quizzesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.all });
      toast.success('Quiz created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create quiz');
    },
  });
};

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      quizzesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.lists() });
      toast.success('Quiz updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update quiz');
    },
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: quizzesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.all });
      toast.success('Quiz deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete quiz');
    },
  });
};
```

---

## Phase 4: WebSocket Integration

### 4.1 WebSocket Service

**`lib/websocket/client.ts`**
```typescript
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

interface WebSocketMessage {
  attemptId: number;
  action: 'STOP' | 'WARNING';
  message: string;
  data?: any;
}

type MessageCallback = (message: WebSocketMessage) => void;

class WebSocketClient {
  private client: Client | null = null;
  private callbacks: Map<string, MessageCallback> = new Map();
  private userId: number | null = null;
  private connected = false;

  connect(userId: number, accessToken: string) {
    if (this.connected && this.userId === userId) {
      return; // Already connected
    }

    this.disconnect(); // Disconnect previous connection
    this.userId = userId;

    const socket = new SockJS(process.env.NEXT_PUBLIC_WS_URL!);
    
    this.client = new Client({
      webSocketFactory: () => socket as any,
      connectHeaders: {
        Authorization: `******,
      },
      debug: (str) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[WebSocket]', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      console.log('[WebSocket] Connected');
      this.connected = true;
      this.subscribe();
    };

    this.client.onStompError = (frame) => {
      console.error('[WebSocket] Error:', frame);
      this.connected = false;
    };

    this.client.onDisconnect = () => {
      console.log('[WebSocket] Disconnected');
      this.connected = false;
    };

    this.client.activate();
  }

  private subscribe() {
    if (!this.client || !this.userId) return;

    this.client.subscribe(`/queue/attempt/${this.userId}`, (message: IMessage) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.body);
        this.callbacks.forEach((callback) => callback(data));
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    });
  }

  onMessage(id: string, callback: MessageCallback) {
    this.callbacks.set(id, callback);
  }

  offMessage(id: string) {
    this.callbacks.delete(id);
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.callbacks.clear();
    this.connected = false;
    this.userId = null;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const wsClient = new WebSocketClient();
```

### 4.2 WebSocket React Hook

**`lib/websocket/hooks.ts`**
```typescript
import { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { wsClient } from './client';
import type { WebSocketMessage } from './client';

export const useWebSocket = () => {
  const { data: session } = useSession();
  
  useEffect(() => {
    if (session?.user?.id && session?.accessToken) {
      wsClient.connect(session.user.id, session.accessToken);
    }
    
    return () => {
      wsClient.disconnect();
    };
  }, [session?.user?.id, session?.accessToken]);
  
  const subscribe = useCallback((callback: (msg: WebSocketMessage) => void) => {
    const id = Math.random().toString(36).substring(7);
    wsClient.onMessage(id, callback);
    
    return () => wsClient.offMessage(id);
  }, []);
  
  return { subscribe, isConnected: wsClient.isConnected() };
};
```

### 4.3 Usage in Components

**`app/(dashboard)/student/attempts/[attemptId]/page.tsx`**
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/lib/websocket/hooks';
import { useAttemptStore } from '@/lib/stores/attempt-store';
import { toast } from 'sonner';

export default function AttemptPage({ params }: { params: { attemptId: string } }) {
  const router = useRouter();
  const { subscribe } = useWebSocket();
  const { submitAttempt } = useAttemptStore();
  
  useEffect(() => {
    const unsubscribe = subscribe((message) => {
      if (message.attemptId === Number(params.attemptId)) {
        if (message.action === 'STOP') {
          toast.error(message.message);
          submitAttempt(); // Auto-submit when time's up
          router.push(`/student/attempts/${params.attemptId}/results`);
        } else if (message.action === 'WARNING') {
          toast.warning(message.message);
        }
      }
    });
    
    return unsubscribe;
  }, [params.attemptId, subscribe]);
  
  return (
    <div>
      {/* Attempt UI */}
    </div>
  );
}
```

---

## Phase 5: Authentication with NextAuth

### 5.1 NextAuth Configuration

**`lib/auth/next-auth.config.ts`**
```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authApi } from '@/lib/api/endpoints/auth';

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const response = await authApi.signIn({
            phone: credentials.phone as string,
            password: credentials.password as string,
          });
          
          if (response.data) {
            return {
              id: response.data.account.id.toString(),
              name: `${response.data.account.firstName} ${response.data.account.lastName}`,
              email: response.data.account.phone,
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              roles: response.data.account.roles,
            };
          }
          
          return null;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user.roles = token.roles;
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
});
```

### 5.2 Middleware for Route Protection

**`middleware.ts`**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/next-auth.config';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes
  const publicRoutes = ['/sign-in', '/sign-up'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Redirect authenticated users away from auth pages
  if (isPublicRoute && session) {
    const dashboardType = session.user.dashboardType || 'student';
    return NextResponse.redirect(new URL(`/${dashboardType}`, req.url));
  }

  // Protect all other routes
  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // Role-based access control
  if (pathname.startsWith('/instructor')) {
    const hasInstructorRole = session?.user?.roles?.some(
      (role: any) => role.name === 'ROLE_INSTRUCTOR'
    );
    
    if (!hasInstructorRole) {
      return NextResponse.redirect(new URL('/student', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## Phase 6: Key Components Examples

### 6.1 Quiz List Page

**`app/(dashboard)/instructor/quizzes/page.tsx`**
```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuizzes } from '@/lib/api/endpoints/quizzes.hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QuizCard } from '@/components/quiz/quiz-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function QuizzesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  
  const { data, isLoading, error } = useQuizzes({ search, page, size: 20 });
  
  if (error) {
    return <div>Error loading quizzes</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Quizzes</h1>
        <Link href="/instructor/quizzes/new">
          <Button>Create New Quiz</Button>
        </Link>
      </div>
      
      <Input
        placeholder="Search quizzes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6"
      />
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data?.content?.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### 6.2 Quiz Card Component

**`components/quiz/quiz-card.tsx`**
```typescript
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDeleteQuiz } from '@/lib/api/endpoints/quizzes.hooks';
import type { Quiz } from '@/types/quiz';

interface QuizCardProps {
  quiz: Quiz;
}

export function QuizCard({ quiz }: QuizCardProps) {
  const deleteMutation = useDeleteQuiz();
  
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      await deleteMutation.mutateAsync(quiz.id);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Link href={`/instructor/quizzes/${quiz.id}`}>
            <Button variant="outline" size="sm">View</Button>
          </Link>
          <Link href={`/instructor/quizzes/${quiz.id}/edit`}>
            <Button variant="outline" size="sm">Edit</Button>
          </Link>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Phase 7: Migration Checklist

### Week 1: Infrastructure
- [ ] Set up new Next.js 15 project
- [ ] Install all dependencies
- [ ] Configure ESLint, Prettier, TypeScript
- [ ] Set up folder structure
- [ ] Create API client with Axios
- [ ] Set up TanStack Query
- [ ] Create Zustand stores
- [ ] Configure NextAuth
- [ ] Set up middleware

### Week 2: Core Features
- [ ] Implement auth flow (sign-in, sign-up)
- [ ] Create layout components (Header, Sidebar)
- [ ] Implement quiz listing
- [ ] Implement quiz creation/editing
- [ ] Implement assignment features
- [ ] Add WebSocket integration
- [ ] Create attempt/quiz-taking flow
- [ ] Implement results view

### Week 3: Polish & Testing
- [ ] Add loading states and skeletons
- [ ] Implement error boundaries
- [ ] Add toast notifications
- [ ] Write unit tests for key hooks
- [ ] Write E2E tests for critical flows
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Final review and deployment

---

## Key Improvements Summary

### 1. **90% Less API Code**
- From 700 lines custom client → 50 lines Axios setup
- Leverages battle-tested library
- Easier to debug and maintain

### 2. **Better State Management**
- Zustand for client state (UI, transient data)
- TanStack Query for server state (API data)
- Clear separation of concerns

### 3. **WebSocket Integration**
- Real-time attempt notifications
- Auto-submit on time expiration
- Clean hook-based API

### 4. **Improved DX (Developer Experience)**
- Type-safe API calls
- Automatic cache invalidation
- Built-in loading and error states
- Optimistic updates support

### 5. **Better Performance**
- Route-based code splitting
- Lazy loading for heavy components
- Optimized bundle size
- Server Components where possible

---

## Next Steps

1. **Review this plan** - Make sure it aligns with your requirements
2. **Set up new project** - Follow Phase 1
3. **Incremental migration** - Move features one by one
4. **Test thoroughly** - Each feature as you migrate
5. **Deploy gradually** - Use feature flags if needed

---

## Questions to Consider

1. Do you want to keep the current repo or start completely fresh?
2. Are there any custom features not covered in this plan?
3. What's your timeline for the migration?
4. Do you need help with specific parts of the implementation?

Let me know if you'd like me to create code examples for any specific part!