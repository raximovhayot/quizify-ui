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
  
  // Timing
  startTime: Date | null;
  timeRemaining: number | null; // in seconds
  
  // Actions
  startAttempt: (attemptId: number, duration?: number) => void;
  saveAnswer: (questionId: number, answerId: number | number[]) => void;
  updateTimeRemaining: (seconds: number) => void;
  submitAttempt: () => void;
  clearAttempt: () => void;
}

export const useAttemptStore = create<AttemptState>((set) => ({
  attemptId: null,
  answers: new Map(),
  startTime: null,
  timeRemaining: null,
  
  startAttempt: (attemptId, duration) =>
    set({
      attemptId,
      answers: new Map(),
      startTime: new Date(),
      timeRemaining: duration || null,
    }),
  
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
  
  updateTimeRemaining: (seconds) =>
    set({ timeRemaining: seconds }),
  
  submitAttempt: () => {
    // This would trigger actual submission via API
    // For now, just clear local state
    set({ attemptId: null, answers: new Map(), startTime: null, timeRemaining: null });
  },
  
  clearAttempt: () =>
    set({ attemptId: null, answers: new Map(), startTime: null, timeRemaining: null }),
}));
