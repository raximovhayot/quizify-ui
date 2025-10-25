/**
 * Export analytics data to CSV format
 */

import { format } from 'date-fns';

import { AssignmentAnalytics, QuestionAnalytics } from '../types/analytics';

/**
 * Convert assignment analytics to CSV format
 */
export function exportAssignmentAnalyticsToCSV(
  analytics: AssignmentAnalytics
): string {
  const headers = [
    'Student Name',
    'Email',
    'Attempt Number',
    'Status',
    'Score',
    'Max Score',
    'Percentage',
    'Started At',
    'Submitted At',
    'Time Spent (seconds)',
    'Correct',
    'Incorrect',
    'Unanswered',
  ];

  const rows = analytics.attempts.map((attempt) => [
    attempt.studentName,
    attempt.studentEmail,
    attempt.attemptNumber.toString(),
    attempt.status,
    attempt.score?.toString() || '',
    attempt.maxScore.toString(),
    attempt.percentage?.toString() || '',
    formatDate(attempt.startedAt),
    formatDate(attempt.submittedAt),
    attempt.timeSpent?.toString() || '',
    attempt.correctCount.toString(),
    attempt.incorrectCount.toString(),
    attempt.unansweredCount.toString(),
  ]);

  return convertToCSV([headers, ...rows]);
}

/**
 * Convert question analytics to CSV format
 */
export function exportQuestionAnalyticsToCSV(
  questions: QuestionAnalytics[]
): string {
  const headers = [
    'Question ID',
    'Question Text',
    'Type',
    'Points',
    'Total Attempts',
    'Correct',
    'Incorrect',
    'Partial',
    'Unanswered',
    'Average Score',
    'Correct Percentage',
  ];

  const rows = questions.map((q) => [
    q.questionId.toString(),
    stripHtml(q.questionText),
    q.questionType,
    q.points.toString(),
    q.totalAttempts.toString(),
    q.correctCount.toString(),
    q.incorrectCount.toString(),
    q.partialCount.toString(),
    q.unansweredCount.toString(),
    q.averageScore.toString(),
    q.correctPercentage.toString(),
  ]);

  return convertToCSV([headers, ...rows]);
}

/**
 * Convert array of string arrays to CSV format
 */
function convertToCSV(rows: string[][]): string {
  return rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

/**
 * Format date for CSV export
 */
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
  } catch {
    return dateString;
  }
}

/**
 * Strip HTML tags from text
 * Uses multiple passes to prevent incomplete sanitization
 */
function stripHtml(html: string): string {
  let text = html;
  let previousText = '';
  
  // Keep removing tags until no more tags are found
  while (text !== previousText) {
    previousText = text;
    text = text.replace(/<[^>]*>/g, '');
  }
  
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Trigger browser download of CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
