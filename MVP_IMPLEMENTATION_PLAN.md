# MVP Implementation Plan - Quizify

## Overview
This document outlines the complete implementation plan for the Quizify MVP based on the AI Agent Guide analysis.

## Infrastructure Status ✅
- **28 React Query hooks** - Production ready
- **API Client** - 90% code reduction (865 → 67 lines)
- **Zustand Stores** - auth, UI, attempt state management
- **WebSocket Service** - Real-time communication ready
- **Service Layer** - Completely eliminated (2,500+ lines removed)
- **TypeScript Coverage** - 100%

## Phase 1: Quiz-Taking Experience (PRIORITY 1) 🎯

### Features to Implement

#### 1.1 Real-Time Timer Component
**File**: `src/components/quiz/QuizTimer.tsx`
```typescript
- Countdown display (HH:MM:SS)
- Visual warnings (< 5 minutes: yellow, < 1 minute: red)
- WebSocket integration for auto-submit
- Pause/resume functionality (if backend supports)
```

#### 1.2 Answer Auto-Save
**File**: `src/features/student/attempt/hooks/useAutoSave.ts`
```typescript
- Debounced save (2 seconds after last change)
- Uses existing useSaveAttemptProgress hook
- Shows save status indicator
- Handles offline scenarios
```

#### 1.3 Question Navigation
**File**: `src/components/quiz/QuestionNavigation.tsx`
```typescript
- Next/Previous buttons
- Question number grid for jumping
- Visual indicators (answered/unanswered/flagged)
- Progress bar
```

#### 1.4 WebSocket Integration
**File**: `src/features/student/attempt/components/AttemptPage.tsx`
```typescript
- Connect to WebSocket on page load
- Listen for STOP/WARNING messages
- Auto-submit on time expiry
- Show real-time notifications
```

#### 1.5 Submit Confirmation
**File**: `src/components/quiz/SubmitConfirmationDialog.tsx`
```typescript
- Show unanswered questions count
- Confirmation checkbox
- Final submit button
- Loading state during submission
```

### Implementation Steps
1. Create `QuizTimer` component with WebSocket integration
2. Implement `useAutoSave` hook with debouncing
3. Build `QuestionNavigation` component
4. Update attempt page with WebSocket connection
5. Add submit confirmation dialog

### Hooks to Use
- `useAttemptContent` - Get quiz questions
- `useSaveAttemptProgress` - Auto-save answers
- `useSubmitAttempt` - Final submission
- `useWebSocket` - Real-time communication
- `useAttemptStore` - Local state management

---

## Phase 2: Assignment Management (PRIORITY 2)

### Features to Implement

#### 2.1 Assignment Creation Wizard
**File**: `src/features/instructor/analytics/components/CreateAssignmentWizard.tsx`
```typescript
- Step 1: Select quiz
- Step 2: Schedule (start/end times)
- Step 3: Add students (bulk registration)
- Step 4: Settings (duration, attempts)
- Step 5: Review and publish
```

#### 2.2 Student Registration
**File**: `src/features/instructor/analytics/components/StudentRegistrationForm.tsx`
```typescript
- Bulk add by phone numbers
- CSV upload
- Manual entry
- Validation
```

#### 2.3 Join by Code
**File**: `src/features/student/home/components/JoinAssignmentDialog.tsx`
```typescript
- Code input field
- Validation
- Assignment preview
- Join confirmation
```

#### 2.4 Assignment Cards
**File**: `src/features/student/home/components/AssignmentCard.tsx`
```typescript
- Show time remaining
- Status indicators (upcoming/active/completed)
- Start button (enabled only when active)
- Quiz details
```

### Hooks to Use
- `useCreateAssignment` - Create new assignment
- `useStudentRegistrations` - Manage registrations
- `useJoinQuiz` - Join assignment by code
- `useStudentAssignments` - List student assignments

---

## Phase 3: Results & Grading (PRIORITY 3)

### Features to Implement

#### 3.1 Attempt Details View (Instructor)
**File**: `src/features/instructor/grading/components/AttemptDetailsView.tsx`
```typescript
- Student information
- Attempt timeline
- Question-by-question breakdown
- Score calculation
- Manual grading (if needed)
```

#### 3.2 Student Results View
**File**: `src/features/student/history/components/AttemptResultsView.tsx`
```typescript
- Overall score
- Time taken
- Correct/incorrect breakdown
- Question review with explanations
- Download certificate (if passed)
```

#### 3.3 Analytics Dashboard
**File**: `src/features/instructor/analytics/components/AssignmentAnalytics.tsx`
```typescript
- Average score
- Completion rate
- Score distribution chart
- Time statistics
- Export to CSV
```

### Hooks to Use
- `useAttempt` - Get attempt details
- `useAttemptContent` - Get questions/answers
- `useGradeAttempt` - Submit grades
- `useAssignmentAnalytics` - Get analytics data

---

## Phase 4: Real-Time Features (PRIORITY 4)

### Features to Implement

#### 4.1 WebSocket Connection Manager
**File**: `src/lib/websocket/ConnectionManager.tsx`
```typescript
- Auto-connect on login
- Connection status indicator
- Auto-reconnect logic
- Heartbeat monitoring
```

#### 4.2 Live Notifications
**File**: `src/components/notifications/LiveNotifications.tsx`
```typescript
- Toast notifications for WebSocket events
- Sound alerts (optional)
- Notification history
- Mark as read functionality
```

#### 4.3 Instructor Controls
**File**: `src/features/instructor/grading/components/LiveAttemptControls.tsx`
```typescript
- View active attempts
- Send STOP command
- Send WARNING message
- Real-time attempt status
```

### Hooks to Use
- `useWebSocket` - WebSocket connection
- Zustand stores for notification state

---

## Phase 5: Profile & Settings (PRIORITY 5)

### Features to Implement

#### 5.1 Profile Settings Page
**File**: `src/features/profile/components/ProfileSettings.tsx`
```typescript
- Change password
- Language preference
- Dashboard type preference
- Profile picture upload
```

#### 5.2 File Upload Component
**File**: `src/components/upload/FileUpload.tsx`
```typescript
- Drag & drop support
- Progress indicator
- File type validation
- Preview for images
```

### Hooks to Use
- `useProfile` - Get profile data
- `useUpdateProfile` - Update profile
- `useChangePassword` - Change password

---

## Technical Implementation Notes

### WebSocket Message Format
```typescript
interface WebSocketMessage {
  action: 'STOP' | 'WARNING' | 'TIME_UPDATE';
  attemptId: number;
  message?: string;
  timestamp: number;
}
```

### Auto-Save Strategy
```typescript
const useAutoSave = (attemptId: number) => {
  const { saveAnswer } = useAttemptStore();
  const saveMutation = useSaveAttemptProgress();
  
  const debouncedSave = useMemo(
    () => debounce((answers: Answer[]) => {
      saveMutation.mutate({ attemptId, answers });
    }, 2000),
    [attemptId]
  );
  
  return { save: debouncedSave, isSaving: saveMutation.isLoading };
};
```

### Timer Logic
```typescript
const useQuizTimer = (endTime: Date, onTimeExpired: () => void) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = differenceInSeconds(endTime, new Date());
      setTimeRemaining(Math.max(0, remaining));
      
      if (remaining <= 0) {
        clearInterval(interval);
        onTimeExpired();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [endTime, onTimeExpired]);
  
  return timeRemaining;
};
```

---

## Testing Strategy

### Unit Tests
- Test each hook independently
- Test components with mocked hooks
- Test WebSocket message handling

### Integration Tests
- Test complete user flows
- Test WebSocket + auto-save interaction
- Test error scenarios

### E2E Tests
- Sign up → Complete profile → Take quiz → View results
- Create quiz → Create assignment → Grade attempts
- WebSocket reconnection scenarios

---

## Deployment Checklist

- [ ] All TypeScript errors resolved
- [ ] ESLint warnings fixed
- [ ] Build passes (`npm run build`)
- [ ] WebSocket configuration for production
- [ ] Environment variables configured
- [ ] API base URL configured
- [ ] Error tracking setup (Sentry/similar)
- [ ] Analytics setup (GA/similar)

---

## API Endpoints Reference

All endpoints are documented in `docs/FRONTEND-AI-AGENT-GUIDE.md`:

**Auth**: `/api/v1/auth/*`
**Quizzes**: `/api/v1/instructor/quizzes/*`
**Questions**: `/api/v1/instructor/questions/*`
**Assignments**: `/api/v1/instructor/assignments/*`
**Attempts**: `/api/v1/student/attempts/*`
**Profile**: `/api/v1/account/*`
**WebSocket**: `/ws` (SockJS/STOMP)

---

## Timeline Estimate

**Phase 1** (Quiz-Taking): 3-4 days
**Phase 2** (Assignments): 3-4 days
**Phase 3** (Results): 2-3 days
**Phase 4** (Real-time): 2-3 days
**Phase 5** (Profile): 1-2 days
**Testing & Polish**: 2-3 days

**Total**: ~2-3 weeks for complete MVP

---

## Next Steps

1. Start with Phase 1.1 (Quiz Timer)
2. Implement Phase 1.2 (Auto-Save)
3. Complete Phase 1.3-1.5
4. Move to Phase 2
5. Continue sequentially through phases

All infrastructure is ready. Focus on UI components and connecting them to existing hooks.
