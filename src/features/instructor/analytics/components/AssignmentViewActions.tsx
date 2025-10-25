'use client';

import { Download, FileEdit, Settings } from 'lucide-react';
import { toast } from 'sonner';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  useAssignmentAnalytics,
  useQuestionAnalytics,
} from '../hooks';
import {
  downloadCSV,
  exportAssignmentAnalyticsToCSV,
  exportQuestionAnalyticsToCSV,
} from '../lib/exportUtils';
import { AssignmentDTO } from '../types/assignment';

interface AssignmentViewActionsProps {
  assignment: AssignmentDTO;
}

export function AssignmentViewActions({
  assignment,
}: Readonly<AssignmentViewActionsProps>) {
  const t = useTranslations();
  const router = useRouter();
  const { data: analytics } = useAssignmentAnalytics(assignment.id);
  const { data: questions } = useQuestionAnalytics(assignment.id);

  const handleGrade = () => {
    router.push(`/instructor/grading/${assignment.id}`);
  };

  const handleEdit = () => {
    // TODO: Implement edit assignment functionality
    toast.info(
      t('instructor.assignment.editNotImplemented', {
        fallback: 'Edit assignment functionality coming soon',
      })
    );
  };

  const handleExportAttempts = () => {
    if (!analytics) {
      toast.error(
        t('instructor.analytics.export.noData', {
          fallback: 'No data available to export',
        })
      );
      return;
    }

    try {
      const csv = exportAssignmentAnalyticsToCSV(analytics);
      const filename = `assignment-${assignment.id}-attempts-${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csv, filename);
      toast.success(
        t('instructor.analytics.export.success', {
          fallback: 'Analytics exported successfully',
        })
      );
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(
        t('instructor.analytics.export.error', {
          fallback: 'Failed to export analytics',
        })
      );
    }
  };

  const handleExportQuestions = () => {
    if (!questions || questions.length === 0) {
      toast.error(
        t('instructor.analytics.export.noData', {
          fallback: 'No data available to export',
        })
      );
      return;
    }

    try {
      const csv = exportQuestionAnalyticsToCSV(questions);
      const filename = `assignment-${assignment.id}-questions-${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csv, filename);
      toast.success(
        t('instructor.analytics.export.success', {
          fallback: 'Question analytics exported successfully',
        })
      );
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(
        t('instructor.analytics.export.error', {
          fallback: 'Failed to export analytics',
        })
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('instructor.assignment.actions.title', { fallback: 'Actions' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleGrade}
        >
          <FileEdit className="mr-2 h-4 w-4" />
          {t('instructor.assignment.actions.grade', {
            fallback: 'Grade Essays',
          })}
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleExportAttempts}
          disabled={!analytics}
        >
          <Download className="mr-2 h-4 w-4" />
          {t('instructor.assignment.actions.exportAttempts', {
            fallback: 'Export Attempts (CSV)',
          })}
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleExportQuestions}
          disabled={!questions || questions.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          {t('instructor.assignment.actions.exportQuestions', {
            fallback: 'Export Questions (CSV)',
          })}
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleEdit}
        >
          <Settings className="mr-2 h-4 w-4" />
          {t('instructor.assignment.actions.editSettings', {
            fallback: 'Edit Settings',
          })}
        </Button>
      </CardContent>
    </Card>
  );
}
