import { AssignmentAnalytics, StudentAttempt } from '../types/analytics';
import { AssignmentDTO } from '../types/assignment';
import { InstructorAttemptSummary } from '../types/attempt';

/**
 * Compute analytics from a list of attempts
 * This is used when the backend doesn't provide analytics endpoints
 */
export function computeAnalyticsFromAttempts(
  assignment: AssignmentDTO,
  attempts: InstructorAttemptSummary[]
): AssignmentAnalytics {
  // Convert backend attempts to frontend StudentAttempt format
  const studentAttempts: StudentAttempt[] = attempts.map((attempt) => ({
    id: attempt.attemptId,
    studentId: attempt.studentId,
    studentName: attempt.studentName,
    studentEmail: '', // Not provided by backend summary
    attemptNumber: attempt.attemptNumber,
    status: normalizeStatus(attempt.status),
    score: attempt.score,
    maxScore: 100, // TODO: Get from quiz/assignment data
    percentage: attempt.score !== null ? attempt.score : null,
    startedAt: attempt.startedAt,
    submittedAt: attempt.completedAt,
    timeSpent: attempt.durationSeconds,
    correctCount: 0, // Not available in summary
    incorrectCount: 0, // Not available in summary
    unansweredCount: 0, // Not available in summary
  }));

  // Compute aggregate statistics
  const completedAttempts = attempts.filter((a) => a.completed);
  const scoresArray = completedAttempts
    .map((a) => a.score)
    .filter((s): s is number => s !== null);

  const totalAttempts = attempts.length;
  const completedCount = completedAttempts.length;
  const inProgressCount = totalAttempts - completedCount;

  const averageScore =
    scoresArray.length > 0
      ? scoresArray.reduce((sum, score) => sum + score, 0) / scoresArray.length
      : null;

  const highestScore = scoresArray.length > 0 ? Math.max(...scoresArray) : null;
  const lowestScore = scoresArray.length > 0 ? Math.min(...scoresArray) : null;

  const durationsArray = completedAttempts
    .map((a) => a.durationSeconds)
    .filter((d): d is number => d !== null);

  const averageTimeSpent =
    durationsArray.length > 0
      ? durationsArray.reduce((sum, dur) => sum + dur, 0) /
        durationsArray.length
      : null;

  // Get unique student count (registrations)
  const uniqueStudents: { [key: number]: boolean } = {};
  attempts.forEach((a) => {
    uniqueStudents[a.studentId] = true;
  });
  const totalRegistrations = Object.keys(uniqueStudents).length;

  return {
    assignmentId: assignment.id,
    assignmentTitle: assignment.title,
    quizTitle: '', // Not available in assignment DTO, would need quiz fetch
    totalRegistrations,
    totalAttempts,
    completedAttempts: completedCount,
    inProgressAttempts: inProgressCount,
    averageScore,
    highestScore,
    lowestScore,
    averageTimeSpent,
    attempts: studentAttempts,
  };
}

/**
 * Normalize backend status to frontend status format
 */
function normalizeStatus(
  status: string
): 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED' {
  const upperStatus = status.toUpperCase();
  if (upperStatus === 'GRADED') return 'GRADED';
  if (upperStatus === 'SUBMITTED') return 'SUBMITTED';
  return 'IN_PROGRESS';
}
