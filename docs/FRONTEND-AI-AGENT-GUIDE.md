# Frontend Development Guide for AI Agents (Copilot)

## 📋 Table of Contents
1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [API Architecture](#api-architecture)
4. [Authentication & Authorization](#authentication--authorization)
5. [Data Models & DTOs](#data-models--dtos)
6. [Frontend Architecture Recommendations](#frontend-architecture-recommendations)
7. [UI/UX Guidelines](#uiux-guidelines)
8. [Component Structure](#component-structure)
9. [State Management](#state-management)
10. [Real-Time Features (WebSocket)](#real-time-features-websocket)
11. [Error Handling](#error-handling)
12. [Security Best Practices](#security-best-practices)
13. [Code Examples](#code-examples)
14. [Testing Strategy](#testing-strategy)

---

## Introduction

### Purpose
This documentation is specifically designed for AI agents (like GitHub Copilot) to understand the Quizify backend API and create an optimal frontend application. It provides comprehensive information about the backend architecture, API endpoints, data structures, and best practices for building a modern, responsive, and user-friendly frontend.

### System Context
Quizify is a comprehensive quiz management platform for educational settings built with:
- **Backend**: Spring Boot 3.4.5, Java 17, PostgreSQL, Redis
- **Frontend**: To be built (React/Vue/Angular recommended)
- **Authentication**: JWT with Phone OTP
- **Real-time**: WebSocket (STOMP protocol)
- **File Storage**: S3-compatible (Digital Ocean Spaces)

### Target Users
1. **Instructors**: Create/manage quizzes, assignments, view analytics
2. **Students**: Take quizzes, view results, track performance
3. **Admin**: System management (future)

---

## System Overview

### Business Flows

#### Instructor Workflow
1. Sign up/Sign in
2. Create quiz with questions and answers
3. Create assignment from quiz (scheduled with deadlines)
4. Register students to assignment
5. Monitor student attempts and results
6. View analytics

#### Student Workflow
1. Sign up/Sign in
2. Join assignment (via code or invitation)
3. Start quiz attempt
4. Answer questions within time limit
5. Submit attempt
6. View results and analytics

### Key Concepts

#### Quiz (Template)
- A collection of questions that serves as a template
- Can be reused for multiple assignments
- Statuses: `DRAFT`, `PUBLISHED`
- Contains: title, description, questions, settings, attachments

#### Assignment (Scheduled Quiz)
- A quiz instance with specific time window and student registrations
- Statuses: `PUBLISHED` → `STARTED` → `FINISHED`
- Contains: all quiz data + start/end times + registered students

#### Attempt (Student's Quiz Session)
- Individual student's quiz session
- Tracks: answers, time spent, score, completion status
- Questions/answers are copied to prevent retroactive changes

---

## API Architecture

### Base URL
```
http://localhost:8080/api/v1
```

### API Path Structure
The API follows a consistent RESTful structure:

```
/api/v1/{role}/{resource}/{action}
```

**Roles:**
- `/instructor` - Instructor-only endpoints
- `/student` - Student-only endpoints
- `/auth` - Public authentication endpoints
- `/account` - User account management

**Resources:**
- `/quizzes` - Quiz templates
- `/assignments` - Scheduled quizzes
- `/questions` - Quiz questions
- `/attempts` - Quiz attempts
- `/files` - File attachments

### API Endpoints Overview

#### Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/sign-up/prepare` | Send OTP to phone | No |
| POST | `/sign-up/verify` | Verify OTP and create account | No |
| POST | `/sign-in` | Login with phone and password | No |
| POST | `/refresh-token` | Get new access token | No |
| POST | `/forgot-password/prepare` | Send OTP for password reset | No |
| POST | `/forgot-password/verify` | Verify OTP for password reset | No |
| POST | `/forgot-password/update` | Update password | No |

#### Account Endpoints (`/api/v1/account`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get current user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| PATCH | `/language` | Update preferred language | Yes |
| PATCH | `/dashboard-type` | Update default dashboard | Yes |

#### Instructor Quiz Endpoints (`/api/v1/instructor/quizzes`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create new quiz | Yes (INSTRUCTOR) |
| GET | `/` | List all quizzes (paginated) | Yes (INSTRUCTOR) |
| GET | `/{quizId}` | Get quiz details | Yes (INSTRUCTOR) |
| PUT | `/{quizId}` | Update quiz | Yes (INSTRUCTOR) |
| PATCH | `/{quizId}` | Update quiz status | Yes (INSTRUCTOR) |
| DELETE | `/{quizId}` | Delete quiz | Yes (INSTRUCTOR) |

#### Instructor Question Endpoints (`/api/v1/instructor/quizzes/{quizId}/questions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create question | Yes (INSTRUCTOR) |
| GET | `/` | List all questions | Yes (INSTRUCTOR) |
| GET | `/{questionId}` | Get question details | Yes (INSTRUCTOR) |
| PUT | `/{questionId}` | Update question | Yes (INSTRUCTOR) |
| DELETE | `/{questionId}` | Delete question | Yes (INSTRUCTOR) |
| POST | `/reorder` | Reorder questions | Yes (INSTRUCTOR) |

#### Instructor Assignment Endpoints (`/api/v1/instructor/assignments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create assignment | Yes (INSTRUCTOR) |
| GET | `/` | List assignments | Yes (INSTRUCTOR) |
| GET | `/{assignmentId}` | Get assignment details | Yes (INSTRUCTOR) |
| PUT | `/{assignmentId}` | Update assignment | Yes (INSTRUCTOR) |
| DELETE | `/{assignmentId}` | Delete assignment | Yes (INSTRUCTOR) |
| GET | `/{assignmentId}/attempts` | Get all attempts | Yes (INSTRUCTOR) |
| GET | `/{assignmentId}/analytics` | Get analytics | Yes (INSTRUCTOR) |
| POST | `/{assignmentId}/registrations` | Bulk register students | Yes (INSTRUCTOR) |

#### Student Assignment Endpoints (`/api/v1/student/assignments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List my assignments | Yes (STUDENT) |
| GET | `/{assignmentId}` | Get assignment details | Yes (STUDENT) |
| POST | `/join` | Join assignment by code | Yes (STUDENT) |

#### Student Attempt Endpoints (`/api/v1/student/assignments/{assignmentId}/attempts`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Start new attempt | Yes (STUDENT) |
| GET | `/` | List my attempts | Yes (STUDENT) |
| GET | `/{attemptId}` | Get attempt details | Yes (STUDENT) |
| POST | `/{attemptId}/answers` | Submit answers | Yes (STUDENT) |
| POST | `/{attemptId}/submit` | Submit attempt | Yes (STUDENT) |

#### File Attachment Endpoints (`/api/v1/files`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/upload` | Upload file | Yes |
| GET | `/{fileId}` | Download file | Yes |
| DELETE | `/{fileId}` | Delete file | Yes |

---

## Authentication & Authorization

### Authentication Flow

#### Sign Up (Phone OTP)
```
1. POST /api/v1/auth/sign-up/prepare
   Request: { "phone": "+998901234567" }
   Response: { "phone": "+998901234567", "otpExpiresIn": 300 }

2. POST /api/v1/auth/sign-up/verify
   Request: { "phone": "+998901234567", "otp": "123456", "firstName": "John", "lastName": "Doe", "password": "password123" }
   Response: { 
     "accessToken": "eyJhbGc...",
     "refreshToken": "eyJhbGc...",
     "account": { "id": 1, "firstName": "John", ... }
   }
```

#### Sign In (Phone + Password)
```
POST /api/v1/auth/sign-in
Request: { "phone": "+998901234567", "password": "password123" }
Response: { 
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "account": { "id": 1, "firstName": "John", ... }
}
```

#### Token Refresh
```
POST /api/v1/auth/refresh-token
Request: { "refreshToken": "eyJhbGc..." }
Response: { 
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Authorization Headers

All authenticated requests must include:
```
Authorization: Bearer {accessToken}
```

### Role-Based Access Control (RBAC)

Users can have multiple roles:
- `ROLE_INSTRUCTOR` - Access instructor endpoints
- `ROLE_STUDENT` - Access student endpoints
- `ROLE_ADMIN` - Access admin endpoints (future)

**Note**: Upon registration, users are assigned both `INSTRUCTOR` and `STUDENT` roles by default.

---

## Data Models & DTOs

### Core Enums

#### QuizStatus
```typescript
enum QuizStatus {
  DRAFT = 'draft',           // Quiz is being edited
  PUBLISHED = 'published',   // Quiz is ready to use
  STARTED = 'started',       // Assignment has started
  FINISHED = 'finished'      // Assignment has ended
}
```

#### QuestionType
```typescript
enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice'
  // Future: TRUE_FALSE, MATCHING, FILL_IN_BLANK, etc.
}
```

#### UserState
```typescript
enum UserState {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked'
}
```

#### Language
```typescript
enum Language {
  EN = 'en',
  UZ = 'uz',
  RU = 'ru'
}
```

#### DashboardType
```typescript
enum DashboardType {
  INSTRUCTOR = 'instructor',
  STUDENT = 'student'
}
```

### Request DTOs

#### Sign Up Prepare Request
```typescript
interface SignUpPrepareRequest {
  phone: string;  // E.164 format: +998901234567
}
```

#### Sign Up Verify Request
```typescript
interface SignUpVerifyRequest {
  phone: string;
  otp: string;
  firstName: string;
  lastName: string;
  password: string;
}
```

#### Sign In Request
```typescript
interface SignInRequest {
  phone: string;
  password: string;
}
```

#### Quiz Create Request
```typescript
interface QuizCreateRequest {
  title: string;              // Required, max 255 chars
  description?: string;       // Optional
  attachmentId?: number;      // Optional file attachment
}
```

#### Quiz Update Request
```typescript
interface QuizUpdateRequest {
  title: string;
  description?: string;
  settings?: QuizSettings;
  attachmentId?: number;
}
```

#### Quiz Settings
```typescript
interface QuizSettings {
  timeLimitSeconds?: number;     // Time limit in seconds
  maxAttempts?: number;          // Max attempts allowed (default: 1)
  shuffleQuestions?: boolean;    // Shuffle question order
  shuffleAnswers?: boolean;      // Shuffle answer order
  showCorrectAnswers?: boolean;  // Show correct answers after submit
  showScore?: boolean;           // Show score immediately
}
```

#### Question Save Request
```typescript
interface QuestionSaveRequest {
  questionType: QuestionType;
  content: string;           // Question text (required)
  explanation?: string;      // Explanation for the answer
  points: number;            // Points for correct answer
  order?: number;            // Display order
  answers: AnswerSaveRequest[];
}
```

#### Answer Save Request (Multiple Choice)
```typescript
interface AnswerSaveRequest {
  content: string;       // Answer text
  isCorrect: boolean;    // Is this the correct answer
  order?: number;        // Display order
}
```

#### Assignment Create Request
```typescript
interface AssignmentCreateRequest {
  quizId: number;           // Source quiz template
  title?: string;           // Override quiz title
  description?: string;     // Override quiz description
  startTime: string;        // ISO 8601 datetime
  endTime: string;          // ISO 8601 datetime
  settings?: QuizSettings;  // Override quiz settings
}
```

#### Assignment Join Request
```typescript
interface AssignmentJoinRequest {
  code: string;  // Assignment join code
}
```

#### Bulk Registration Request
```typescript
interface BulkRegistrationRequest {
  studentIds: number[];  // Array of student user IDs
}
```

### Response DTOs

#### Account Response
```typescript
interface AccountResponse {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  state: UserState;
  language: Language;
  dashboardType: DashboardType;
  roles: RoleResponse[];
}

interface RoleResponse {
  id: number;
  name: string;  // e.g., "ROLE_INSTRUCTOR"
}
```

#### JWT Token Response
```typescript
interface JWTToken<T> {
  accessToken: string;
  refreshToken: string;
  account: T;  // AccountResponse
}
```

#### Quiz Response
```typescript
interface QuizResponse {
  id: number;
  title: string;
  description?: string;
  status: QuizStatus;
  createdDate: string;         // ISO 8601
  lastModifiedDate: string;    // ISO 8601
  numberOfQuestions: number;
  settings?: QuizSettings;
  attachmentId?: number;
}
```

#### Question Response
```typescript
interface QuestionResponse {
  id: number;
  questionType: QuestionType;
  content: string;
  explanation?: string;
  order: number;
  points: number;
  answers: AnswerResponse[];
}
```

#### Answer Response
```typescript
interface AnswerResponse {
  id: number;
  content: string;
  order: number;
  isCorrect?: boolean;  // Only shown to instructors or after attempt completion
}
```

#### Assignment Analytics Response
```typescript
interface AssignmentAnalyticsResponse {
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}
```

#### API Response Wrapper
All responses are wrapped in a standard format:
```typescript
interface Response<T> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
  timestamp: string;
}

interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
}
```

#### Paginated List Response
```typescript
interface PageableList<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
```

### Pagination & Filtering

Query parameters for list endpoints:
```typescript
interface PaginationParams {
  page?: number;      // Default: 0
  size?: number;      // Default: 20, Max: 100
  sort?: string;      // e.g., "createdDate,desc"
}

interface QuizFilter extends PaginationParams {
  search?: string;    // Search in title and description
  status?: QuizStatus;
}
```

---

## Frontend Architecture Recommendations

### Technology Stack Recommendations

#### Option 1: Next.js (Highly Recommended)
```
- Next.js 14+ (App Router)
- TypeScript
- React 18+
- TanStack Query (React Query) for API
- Zustand or React Context for state
- Tailwind CSS or shadcn/ui
- SockJS + STOMP for WebSocket
- Axios for HTTP
- React Hook Form + Zod for forms
- next-auth for authentication (optional)
```

**Benefits of Next.js:**
- Server-side rendering (SSR) for better SEO and initial load performance
- Built-in API routes for backend-for-frontend (BFF) pattern
- Image optimization and automatic code splitting
- File-based routing (no need for React Router)
- Built-in TypeScript support
- Excellent developer experience

#### Option 2: React (Recommended)
```
- React 18+
- TypeScript
- Vite or Create React App
- React Router v6
- TanStack Query (React Query) for API
- Zustand or Redux Toolkit for state
- Tailwind CSS or Material-UI
- SockJS + STOMP for WebSocket
- Axios for HTTP
- React Hook Form + Zod for forms
```

#### Option 3: Vue 3
```
- Vue 3 with Composition API
- TypeScript
- Vite
- Vue Router
- Pinia for state management
- TanStack Query for Vue
- Tailwind CSS or Vuetify
- SockJS + STOMP for WebSocket
```

#### Option 4: Angular
```
- Angular 16+
- TypeScript
- RxJS
- Angular Material
- NgRx for state management
- SockJS + STOMP for WebSocket
```

### Folder Structure (React Example)

```
src/
├── api/                      # API client and endpoints
│   ├── axios-instance.ts
│   ├── auth.api.ts
│   ├── quiz.api.ts
│   ├── assignment.api.ts
│   └── attempt.api.ts
│
├── assets/                   # Images, icons, fonts
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── components/               # Reusable components
│   ├── common/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Card/
│   ├── quiz/
│   │   ├── QuizCard/
│   │   ├── QuestionList/
│   │   └── AnswerOption/
│   └── layout/
│       ├── Header/
│       ├── Sidebar/
│       └── Footer/
│
├── features/                 # Feature-based modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   ├── instructor/
│   │   ├── quiz/
│   │   ├── assignment/
│   │   └── analytics/
│   └── student/
│       ├── assignment/
│       └── attempt/
│
├── hooks/                    # Custom React hooks
│   ├── useAuth.ts
│   ├── useWebSocket.ts
│   └── useTimer.ts
│
├── layouts/                  # Page layouts
│   ├── AuthLayout.tsx
│   ├── InstructorLayout.tsx
│   └── StudentLayout.tsx
│
├── pages/                    # Page components
│   ├── auth/
│   │   ├── SignIn.tsx
│   │   └── SignUp.tsx
│   ├── instructor/
│   │   ├── QuizList.tsx
│   │   ├── QuizCreate.tsx
│   │   └── AssignmentList.tsx
│   └── student/
│       ├── AssignmentList.tsx
│       └── AttemptView.tsx
│
├── services/                 # Business logic services
│   ├── auth.service.ts
│   ├── storage.service.ts
│   └── websocket.service.ts
│
├── store/                    # State management
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── quizSlice.ts
│   │   └── attemptSlice.ts
│   └── index.ts
│
├── types/                    # TypeScript types/interfaces
│   ├── api.types.ts
│   ├── auth.types.ts
│   ├── quiz.types.ts
│   └── attempt.types.ts
│
├── utils/                    # Utility functions
│   ├── validators.ts
│   ├── formatters.ts
│   └── constants.ts
│
├── App.tsx
├── main.tsx
└── routes.tsx
```

### Folder Structure (Next.js App Router Example)

```
app/
├── (auth)/                       # Auth route group
│   ├── sign-in/
│   │   └── page.tsx
│   ├── sign-up/
│   │   └── page.tsx
│   └── layout.tsx
│
├── instructor/                   # Instructor dashboard
│   ├── quizzes/
│   │   ├── page.tsx
│   │   ├── [quizId]/
│   │   │   ├── page.tsx
│   │   │   └── edit/
│   │   │       └── page.tsx
│   │   └── new/
│   │       └── page.tsx
│   ├── assignments/
│   │   ├── page.tsx
│   │   └── [assignmentId]/
│   │       └── page.tsx
│   ├── analytics/
│   │   └── page.tsx
│   └── layout.tsx
│
├── student/                      # Student dashboard
│   ├── assignments/
│   │   ├── page.tsx
│   │   └── [assignmentId]/
│   │       └── page.tsx
│   ├── attempts/
│   │   └── [attemptId]/
│   │       ├── page.tsx
│   │       └── results/
│   │           └── page.tsx
│   └── layout.tsx
│
├── api/                          # API routes (optional BFF)
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts
│
├── layout.tsx                    # Root layout
└── page.tsx                      # Landing page

components/
├── common/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── Card.tsx
├── quiz/
│   ├── QuizCard.tsx
│   ├── QuestionList.tsx
│   └── AnswerOption.tsx
└── layout/
    ├── Header.tsx
    ├── Sidebar.tsx
    └── Footer.tsx

lib/
├── api/                          # API client
│   ├── axios-instance.ts
│   ├── auth.api.ts
│   ├── quiz.api.ts
│   ├── assignment.api.ts
│   └── attempt.api.ts
│
├── store/                        # State management
│   ├── authStore.ts
│   ├── quizStore.ts
│   └── attemptStore.ts
│
├── services/
│   ├── auth.service.ts
│   ├── storage.service.ts
│   └── websocket.service.ts
│
└── utils/
    ├── validators.ts
    ├── formatters.ts
    └── constants.ts

hooks/
├── useAuth.ts
├── useWebSocket.ts
└── useTimer.ts

types/
├── api.types.ts
├── auth.types.ts
├── quiz.types.ts
└── attempt.types.ts

public/
├── images/
├── icons/
└── fonts/
```

**Next.js Specific Features:**
- **App Router**: File-based routing with nested layouts
- **Server Components**: Default server-side rendering for better performance
- **Route Groups**: Organize routes with `(groupName)` without affecting URL
- **API Routes**: Optional backend-for-frontend layer
- **Middleware**: Authentication and authorization at the edge
- **Image Optimization**: Built-in `next/image` component

---

## UI/UX Guidelines

### Design Principles

1. **User-Centric**: Design for both instructors and students
2. **Accessibility**: WCAG 2.1 Level AA compliance
3. **Responsive**: Mobile-first approach
4. **Performance**: Fast load times, optimistic UI updates
5. **Consistency**: Uniform patterns across all pages

### Color Scheme Suggestions

```css
/* Primary Colors */
--primary: #4F46E5;        /* Indigo - Main actions */
--primary-dark: #4338CA;
--primary-light: #818CF8;

/* Secondary Colors */
--secondary: #10B981;      /* Green - Success states */
--secondary-dark: #059669;
--secondary-light: #6EE7B7;

/* Neutral Colors */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-500: #6B7280;
--gray-900: #111827;

/* Semantic Colors */
--success: #10B981;        /* Correct answers, success */
--warning: #F59E0B;        /* Warnings, time running out */
--error: #EF4444;          /* Errors, incorrect answers */
--info: #3B82F6;           /* Information */
```

### Typography

```css
/* Headings */
h1 { font-size: 2.25rem; font-weight: 700; }  /* Page titles */
h2 { font-size: 1.875rem; font-weight: 600; } /* Section titles */
h3 { font-size: 1.5rem; font-weight: 600; }   /* Subsection titles */

/* Body */
body { font-size: 1rem; line-height: 1.5; }   /* Normal text */
small { font-size: 0.875rem; }                 /* Meta information */
```

### Layout Guidelines

#### Instructor Dashboard
- **Sidebar Navigation**: Quizzes, Assignments, Analytics
- **Main Content**: List/Grid view with filters and search
- **Action Buttons**: Prominent "Create New" buttons

#### Student Dashboard
- **Card-Based Layout**: Assignment cards with status indicators
- **Simple Navigation**: Active assignments, Completed, Results
- **Progress Indicators**: Visual progress bars

#### Quiz Taking Interface
- **Full-Screen Mode**: Minimize distractions
- **Timer**: Always visible countdown
- **Question Navigation**: Sidebar or bottom navigation
- **Auto-Save Indicator**: Show save status
- **Submit Button**: Prominent but requires confirmation

### Responsive Breakpoints

```css
/* Mobile First */
--mobile: 320px;
--tablet: 768px;
--desktop: 1024px;
--wide: 1280px;
```

---

## Component Structure

### Common Components

#### Button Component
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  onClick,
  children
}) => {
  // Implementation
};
```

#### Input Component
```tsx
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  label?: string;
  placeholder?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({ ... }) => {
  // Implementation
};
```

#### Modal Component
```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ ... }) => {
  // Implementation
};
```

### Quiz-Specific Components

#### QuizCard Component
```tsx
interface QuizCardProps {
  quiz: QuizResponse;
  onEdit?: () => void;
  onDelete?: () => void;
  onCreateAssignment?: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ ... }) => {
  // Display quiz info with action buttons
};
```

#### QuestionEditor Component
```tsx
interface QuestionEditorProps {
  question?: QuestionResponse;
  onSave: (question: QuestionSaveRequest) => void;
  onCancel: () => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({ ... }) => {
  // Form for creating/editing questions
};
```

#### Timer Component
```tsx
interface TimerProps {
  endTime: Date;
  onTimeUp: () => void;
  warningThreshold?: number; // seconds
  onWarning?: () => void;
}

export const Timer: React.FC<TimerProps> = ({ ... }) => {
  // Countdown timer with warnings
};
```

---

## State Management

### Global State (Zustand Example)

#### Auth Store
```typescript
interface AuthState {
  user: AccountResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInstructor: boolean;
  isStudent: boolean;
  
  signIn: (credentials: SignInRequest) => Promise<void>;
  signOut: () => void;
  refreshAccessToken: () => Promise<void>;
  updateProfile: (profile: Partial<AccountResponse>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  
  get isInstructor() {
    return get().user?.roles.some(r => r.name === 'ROLE_INSTRUCTOR') ?? false;
  },
  
  get isStudent() {
    return get().user?.roles.some(r => r.name === 'ROLE_STUDENT') ?? false;
  },
  
  signIn: async (credentials) => {
    const response = await authApi.signIn(credentials);
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    set({
      user: response.data.account,
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      isAuthenticated: true
    });
  },
  
  signOut: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false
    });
  },
  
  // ... other methods
}));
```

#### Attempt Store (Quiz Taking)
```typescript
interface AttemptState {
  currentAttempt: AttemptResponse | null;
  answers: Map<number, any>; // questionId -> answer
  timeRemaining: number;
  
  startAttempt: (assignmentId: number) => Promise<void>;
  saveAnswer: (questionId: number, answer: any) => Promise<void>;
  submitAttempt: () => Promise<void>;
  updateTimeRemaining: (seconds: number) => void;
}
```

### Server State (React Query)

#### Quiz Queries
```typescript
// Fetch quizzes
export const useQuizzes = (filters: QuizFilter) => {
  return useQuery({
    queryKey: ['quizzes', filters],
    queryFn: () => quizApi.getQuizzes(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch single quiz
export const useQuiz = (quizId: number) => {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizApi.getQuiz(quizId),
    enabled: !!quizId,
  });
};

// Create quiz mutation
export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: QuizCreateRequest) => quizApi.createQuiz(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
};

// Update quiz mutation
export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quizId, data }: { quizId: number; data: QuizUpdateRequest }) => 
      quizApi.updateQuiz(quizId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
};
```

---

## Real-Time Features (WebSocket)

### WebSocket Connection Setup

#### Service Implementation (JavaScript/TypeScript)
```typescript
import SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs';

interface WebSocketMessage {
  attemptId: number;
  action: 'STOP' | 'WARNING';
  message: string;
  data?: any;
}

class WebSocketService {
  private client: Client | null = null;
  private userId: number | null = null;
  private callbacks: Map<string, (message: WebSocketMessage) => void> = new Map();

  connect(userId: number, accessToken: string) {
    this.userId = userId;
    
    const socket = new SockJS('http://localhost:8080/ws');
    this.client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`
      },
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      console.log('WebSocket connected');
      this.subscribeToAttempts();
    };

    this.client.onStompError = (frame) => {
      console.error('WebSocket error:', frame);
    };

    this.client.activate();
  }

  private subscribeToAttempts() {
    if (!this.client || !this.userId) return;

    this.client.subscribe(`/queue/attempt/${this.userId}`, (message: Message) => {
      const data: WebSocketMessage = JSON.parse(message.body);
      
      // Trigger registered callbacks
      this.callbacks.forEach(callback => callback(data));
    });
  }

  onMessage(id: string, callback: (message: WebSocketMessage) => void) {
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
  }
}

export const webSocketService = new WebSocketService();
```

#### React Hook for WebSocket
```typescript
export const useWebSocket = () => {
  const { user, accessToken } = useAuthStore();
  
  useEffect(() => {
    if (user && accessToken) {
      webSocketService.connect(user.id, accessToken);
    }
    
    return () => {
      webSocketService.disconnect();
    };
  }, [user, accessToken]);
  
  const subscribe = useCallback((callback: (msg: WebSocketMessage) => void) => {
    const id = Math.random().toString(36);
    webSocketService.onMessage(id, callback);
    
    return () => webSocketService.offMessage(id);
  }, []);
  
  return { subscribe };
};
```

#### Usage in Attempt Component
```tsx
const AttemptPage: React.FC = () => {
  const { subscribe } = useWebSocket();
  const { submitAttempt } = useAttemptStore();
  
  useEffect(() => {
    const unsubscribe = subscribe((message) => {
      if (message.action === 'STOP') {
        // Time's up! Auto-submit the attempt
        submitAttempt();
        toast.error(message.message);
      } else if (message.action === 'WARNING') {
        // Show warning
        toast.warning(`Only ${message.data?.minutesLeft} minutes remaining!`);
      }
    });
    
    return unsubscribe;
  }, [subscribe, submitAttempt]);
  
  return (
    // Attempt UI
  );
};
```

### WebSocket Events

#### Server → Client Messages

**Attempt Time Warning**
```json
{
  "attemptId": 123,
  "action": "WARNING",
  "message": "5 minutes remaining",
  "data": {
    "minutesLeft": 5
  }
}
```

**Attempt Time Expired**
```json
{
  "attemptId": 123,
  "action": "STOP",
  "message": "Your attempt time has expired",
  "data": null
}
```

---

## Error Handling

### Error Response Format

All API errors follow this structure:
```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTH_001` | Invalid credentials | 401 |
| `AUTH_002` | Token expired | 401 |
| `AUTH_003` | Invalid OTP | 400 |
| `AUTH_004` | OTP expired | 400 |
| `QUIZ_001` | Quiz not found | 404 |
| `QUIZ_002` | Quiz already published | 400 |
| `ASSIGNMENT_001` | Assignment not found | 404 |
| `ASSIGNMENT_002` | Assignment already started | 400 |
| `ATTEMPT_001` | Attempt not found | 404 |
| `ATTEMPT_002` | Time limit exceeded | 400 |
| `ATTEMPT_003` | Max attempts reached | 400 |
| `VALIDATION_ERROR` | Input validation failed | 400 |
| `UNAUTHORIZED` | Insufficient permissions | 403 |
| `RATE_LIMIT` | Too many requests | 429 |

### Error Handling Service

```typescript
class ErrorHandler {
  handle(error: any): string {
    if (error.response) {
      // API error
      const apiError: ApiError = error.response.data;
      return this.getErrorMessage(apiError.error.code, apiError.error.message);
    } else if (error.request) {
      // Network error
      return 'Network error. Please check your connection.';
    } else {
      // Unknown error
      return 'An unexpected error occurred.';
    }
  }
  
  private getErrorMessage(code: string, defaultMessage: string): string {
    const messages: Record<string, string> = {
      'AUTH_001': 'Invalid phone number or password.',
      'AUTH_002': 'Your session has expired. Please sign in again.',
      'AUTH_003': 'Invalid verification code.',
      'AUTH_004': 'Verification code has expired. Please request a new one.',
      'QUIZ_001': 'Quiz not found.',
      'ATTEMPT_002': 'Time limit exceeded for this attempt.',
      'ATTEMPT_003': 'You have reached the maximum number of attempts.',
      'RATE_LIMIT': 'Too many requests. Please try again later.',
    };
    
    return messages[code] || defaultMessage;
  }
}

export const errorHandler = new ErrorHandler();
```

### Axios Interceptor for Error Handling

```typescript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
});

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors and refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Token expired - try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/api/v1/auth/refresh-token', {
          refreshToken
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - sign out
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/sign-in';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

## Security Best Practices

### Client-Side Security

1. **Token Storage**
    - Store tokens in `localStorage` or `sessionStorage`
    - Never store in cookies without `httpOnly` flag
    - Clear tokens on logout

2. **XSS Prevention**
    - Sanitize user input before displaying
    - Use framework's built-in escaping (React automatically escapes)
    - Never use `dangerouslySetInnerHTML` with user content

3. **CSRF Protection**
    - Backend handles CSRF for state-changing operations
    - Always send auth token in `Authorization` header

4. **Input Validation**
    - Validate on client-side for UX
    - Never trust client-side validation alone (backend validates)
    - Use schema validation libraries (Zod, Yup)

5. **Sensitive Data**
    - Never log sensitive data to console in production
    - Mask passwords in forms
    - Don't expose internal IDs in URLs when possible

### Form Validation Example (Zod)

```typescript
import { z } from 'zod';

const signUpSchema = z.object({
  phone: z.string()
    .regex(/^\+998\d{9}$/, 'Invalid phone number format'),
  otp: z.string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only digits'),
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be at most 50 characters'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be at most 50 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

type SignUpForm = z.infer<typeof signUpSchema>;
```

---

## Code Examples

### Complete Sign-Up Flow

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth.api';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const signIn = useAuthStore(state => state.signIn);
  
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await authApi.signUpPrepare({ phone });
      setStep('verify');
    } catch (err: any) {
      setError(errorHandler.handle(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await authApi.signUpVerify({
        phone,
        otp,
        firstName,
        lastName,
        password,
      });
      
      // Store tokens
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      // Update auth state
      await signIn({ phone, password });
      
      // Redirect based on dashboard preference
      const dashboardType = response.data.account.dashboardType;
      navigate(dashboardType === 'instructor' ? '/instructor' : '/student');
    } catch (err: any) {
      setError(errorHandler.handle(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {step === 'phone' ? (
          <form onSubmit={handleSendOTP}>
            <Input
              label="Phone Number"
              type="text"
              placeholder="+998901234567"
              value={phone}
              onChange={setPhone}
              required
            />
            <Button 
              type="submit" 
              loading={loading}
              className="w-full mt-4"
            >
              Send Verification Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <Input
              label="Verification Code"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={setOtp}
              required
            />
            <Input
              label="First Name"
              type="text"
              value={firstName}
              onChange={setFirstName}
              required
            />
            <Input
              label="Last Name"
              type="text"
              value={lastName}
              onChange={setLastName}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              required
            />
            <Button 
              type="submit" 
              loading={loading}
              className="w-full mt-4"
            >
              Create Account
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
```

### Quiz Taking Component

```tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAttempt } from '@/hooks/useAttempt';
import { useWebSocket } from '@/hooks/useWebSocket';

const QuizAttemptPage: React.FC = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { subscribe } = useWebSocket();
  
  const {
    attempt,
    questions,
    answers,
    timeRemaining,
    saveAnswer,
    submitAttempt,
    isLoading
  } = useAttempt(Number(assignmentId));
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = questions[currentQuestionIndex];

  // Handle WebSocket messages
  useEffect(() => {
    const unsubscribe = subscribe((message) => {
      if (message.action === 'STOP' && message.attemptId === attempt?.id) {
        handleSubmit();
      }
    });
    return unsubscribe;
  }, [subscribe, attempt]);

  const handleAnswerChange = async (answerId: number) => {
    if (!currentQuestion) return;
    
    await saveAnswer(currentQuestion.id, answerId);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (window.confirm('Are you sure you want to submit?')) {
      await submitAttempt();
      navigate(`/student/attempts/${attempt?.id}/results`);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!currentQuestion) return <div>No questions available</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Timer */}
      <div className="bg-white shadow px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">{attempt?.title}</h1>
          <Timer 
            seconds={timeRemaining}
            onTimeUp={handleSubmit}
          />
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <span className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          
          <h2 className="text-lg font-medium mb-6">
            {currentQuestion.content}
          </h2>
          
          <div className="space-y-3">
            {currentQuestion.answers.map((answer) => (
              <label
                key={answer.id}
                className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={answer.id}
                  checked={answers.get(currentQuestion.id) === answer.id}
                  onChange={() => handleAnswerChange(answer.id)}
                  className="mr-3"
                />
                <span>{answer.content}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="secondary"
          >
            Previous
          </Button>
          
          <div className="space-x-4">
            {currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={handleSubmit} variant="primary">
                Submit Attempt
              </Button>
            ) : (
              <Button onClick={handleNext} variant="primary">
                Next
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigation */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium mb-3">Questions</h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`
                  p-2 rounded text-sm font-medium
                  ${currentQuestionIndex === index 
                    ? 'bg-primary text-white' 
                    : answers.has(q.id)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
```

### File Upload Component

```tsx
import { useState } from 'react';
import { attachmentApi } from '@/api/attachment.api';

interface FileUploadProps {
  onUploadComplete: (fileId: number) => void;
  accept?: string;
  maxSizeMB?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  accept = 'image/*,application/pdf',
  maxSizeMB = 5
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setError('');
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await attachmentApi.upload(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setProgress(percentCompleted);
        }
      });

      onUploadComplete(response.data.id);
    } catch (err: any) {
      setError(errorHandler.handle(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={uploading}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-lg file:border-0
          file:text-sm file:font-semibold
          file:bg-primary file:text-white
          hover:file:bg-primary-dark
          file:cursor-pointer cursor-pointer"
      />
      
      {uploading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">{progress}% uploaded</p>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
};
```

### Next.js App Router Examples

#### Sign-Up Page (Next.js Server & Client Components)

```tsx
// app/(auth)/sign-up/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth.api';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

export default function SignUpPage() {
  const router = useRouter();
  const signIn = useAuthStore(state => state.signIn);
  
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await authApi.signUpPrepare({ phone });
      setStep('verify');
    } catch (err: any) {
      setError(errorHandler.handle(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await authApi.signUpVerify({
        phone,
        otp,
        firstName,
        lastName,
        password,
      });
      
      // Update auth state
      await signIn({ phone, password });
      
      // Redirect based on dashboard preference
      const dashboardType = response.data.account.dashboardType;
      router.push(dashboardType === 'instructor' ? '/instructor' : '/student');
    } catch (err: any) {
      setError(errorHandler.handle(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {step === 'phone' ? (
          <form onSubmit={handleSendOTP}>
            <Input
              label="Phone Number"
              placeholder="+998901234567"
              value={phone}
              onChange={setPhone}
              required
            />
            <Button type="submit" loading={loading} className="w-full mt-4">
              Send Verification Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <Input label="Verification Code" value={otp} onChange={setOtp} required />
            <Input label="First Name" value={firstName} onChange={setFirstName} required />
            <Input label="Last Name" value={lastName} onChange={setLastName} required />
            <Input label="Password" type="password" value={password} onChange={setPassword} required />
            <Button type="submit" loading={loading} className="w-full mt-4">
              Create Account
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
```

#### Next.js Middleware for Authentication

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ['/sign-in', '/sign-up', '/'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Redirect to sign-in if not authenticated
  if (!accessToken && !isPublicRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Redirect to dashboard if already authenticated
  if (accessToken && (pathname === '/sign-in' || pathname === '/sign-up')) {
    return NextResponse.redirect(new URL('/instructor', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

#### Next.js API Route for Token Refresh (Optional BFF Pattern)

```typescript
// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();
    
    // Call backend API to refresh token
    const response = await fetch('http://localhost:8080/api/v1/auth/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    
    // Set HTTP-only cookies for better security
    const cookieStore = cookies();
    cookieStore.set('accessToken', data.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    });
    
    cookieStore.set('refreshToken', data.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 401 }
    );
  }
}
```

#### Server Component Example (Quiz List)

```tsx
// app/instructor/quizzes/page.tsx
import { QuizCard } from '@/components/quiz/QuizCard';
import { Button } from '@/components/common/Button';
import Link from 'next/link';

// This is a Server Component - fetches data on the server
async function getQuizzes() {
  const res = await fetch('http://localhost:8080/api/v1/instructor/quizzes', {
    headers: {
      'Authorization': `Bearer ${process.env.SERVER_ACCESS_TOKEN}`,
    },
    cache: 'no-store', // or use revalidate for ISR
  });
  
  if (!res.ok) throw new Error('Failed to fetch quizzes');
  return res.json();
}

export default async function QuizzesPage() {
  const quizzes = await getQuizzes();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Quizzes</h1>
        <Link href="/instructor/quizzes/new">
          <Button>Create New Quiz</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.data.content.map((quiz: any) => (
          <QuizCard key={quiz.id} quiz={quiz} />
        ))}
      </div>
    </div>
  );
}
```

#### Next.js Layout with Authentication

```tsx
// app/instructor/layout.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken');

  if (!accessToken) {
    redirect('/sign-in');
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## Testing Strategy

### Unit Testing

Test individual components and utilities:

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Integration Testing

Test API interactions:

```typescript
// quizApi.test.ts
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { quizApi } from './quiz.api';

const server = setupServer(
  rest.get('http://localhost:8080/api/v1/instructor/quizzes', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          content: [
            { id: 1, title: 'Test Quiz', status: 'PUBLISHED' }
          ],
          totalElements: 1
        }
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Quiz API', () => {
  it('fetches quizzes successfully', async () => {
    const response = await quizApi.getQuizzes({ page: 0, size: 20 });
    expect(response.data.content).toHaveLength(1);
    expect(response.data.content[0].title).toBe('Test Quiz');
  });
});
```

### E2E Testing (Cypress)

```typescript
// sign-in.cy.ts
describe('Sign In Flow', () => {
  it('allows user to sign in successfully', () => {
    cy.visit('/sign-in');
    
    cy.get('input[name="phone"]').type('+998901234567');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to dashboard
    cy.url().should('include', '/instructor');
    cy.contains('Welcome').should('be.visible');
  });

  it('shows error for invalid credentials', () => {
    cy.visit('/sign-in');
    
    cy.get('input[name="phone"]').type('+998901234567');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    cy.contains('Invalid phone number or password').should('be.visible');
  });
});
```

---

## Additional Resources

### API Documentation
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI Spec: `http://localhost:8080/v3/api-docs`

### Backend Documentation
- [Backend Documentation](./backend-documentation.md)
- [Functional Documentation](./functional-documentation.md)
- [High-Level Design](./high-level-design.md)
- [WebSocket Guide](./WEBSOCKET-GUIDE.md)

### Design Resources
- [Material Design](https://material.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

### Development Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [Postman](https://www.postman.com/) for API testing

---

## Quick Start Checklist for Frontend Development

- [ ] Review this documentation thoroughly
- [ ] Set up development environment (Node.js, npm/yarn)
- [ ] Initialize frontend project with chosen framework
- [ ] Configure TypeScript
- [ ] Set up API client with Axios
- [ ] Implement authentication flow
- [ ] Create layout components (Header, Sidebar, Footer)
- [ ] Implement routing structure
- [ ] Create common UI components (Button, Input, Modal, etc.)
- [ ] Implement instructor features (Quiz, Assignment management)
- [ ] Implement student features (Quiz taking, Results viewing)
- [ ] Integrate WebSocket for real-time updates
- [ ] Add error handling and validation
- [ ] Implement loading states and optimistic updates
- [ ] Add comprehensive testing
- [ ] Optimize performance (code splitting, lazy loading)
- [ ] Ensure accessibility (ARIA labels, keyboard navigation)
- [ ] Test on multiple devices and browsers
- [ ] Deploy to production

---

## Support & Contact

For questions or issues:
1. Check existing backend documentation
2. Review Swagger API documentation
3. Contact backend team for API-related questions
4. Refer to this guide for frontend best practices

---

**Last Updated**: 2025-11-11
**Version**: 1.0
**Maintained By**: Quizify Development Team