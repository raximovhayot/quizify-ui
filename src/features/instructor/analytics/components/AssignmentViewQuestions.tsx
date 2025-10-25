'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { useQuestionAnalytics } from '../hooks';

interface AssignmentViewQuestionsProps {
  assignmentId: number;
}

export function AssignmentViewQuestions({
  assignmentId,
}: Readonly<AssignmentViewQuestionsProps>) {
  const t = useTranslations();
  const { data: questions, isLoading } = useQuestionAnalytics(assignmentId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {t('instructor.assignment.questions.title', {
              fallback: 'Questions',
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('instructor.assignment.questions.loading', {
              fallback: 'Loading questions...',
            })}
          </p>
        </CardContent>
      </Card>
    );
  }

  const questionsList = questions || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('instructor.assignment.questions.title', {
            fallback: 'Questions',
          })}{' '}
          {questionsList.length > 0 && (
            <span className="text-muted-foreground font-normal">
              ({questionsList.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {questionsList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('instructor.assignment.questions.empty', {
              fallback: 'No questions available',
            })}
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>
                    {t('instructor.assignment.questions.question', {
                      fallback: 'Question',
                    })}
                  </TableHead>
                  <TableHead>
                    {t('instructor.assignment.questions.type', {
                      fallback: 'Type',
                    })}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('instructor.assignment.questions.points', {
                      fallback: 'Points',
                    })}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('instructor.assignment.questions.correctRate', {
                      fallback: 'Correct %',
                    })}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questionsList.map((question, index) => (
                  <TableRow key={question.questionId}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div
                        className="line-clamp-2"
                        dangerouslySetInnerHTML={{
                          __html: question.questionText,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{question.questionType}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {question.points}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          question.correctPercentage >= 70
                            ? 'text-green-600 font-medium'
                            : question.correctPercentage >= 40
                              ? 'text-yellow-600 font-medium'
                              : 'text-red-600 font-medium'
                        }
                      >
                        {question.correctPercentage.toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
