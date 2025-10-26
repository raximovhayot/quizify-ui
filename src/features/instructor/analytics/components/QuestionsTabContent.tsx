'use client';

import { AssignmentViewQuestions } from './AssignmentViewQuestions';

interface QuestionsTabContentProps {
  assignmentId: number;
}

export function QuestionsTabContent({
  assignmentId,
}: Readonly<QuestionsTabContentProps>) {
  return <AssignmentViewQuestions assignmentId={assignmentId} />;
}
