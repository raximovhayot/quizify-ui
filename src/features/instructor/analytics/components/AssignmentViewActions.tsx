'use client';

import { Download, FileEdit, Settings } from 'lucide-react';
import { toast } from 'sonner';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { AssignmentService } from '../services/assignmentService';
import { AssignmentDTO } from '../types/assignment';

interface AssignmentViewActionsProps {
  assignment: AssignmentDTO;
}

export function AssignmentViewActions({
  assignment,
}: Readonly<AssignmentViewActionsProps>) {
  const t = useTranslations();
  const router = useRouter();

  const handleExport = async () => {
    try {
      const blob = await AssignmentService.exportAnalytics(assignment.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assignment-${assignment.id}-analytics.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(
        t('instructor.assignment.exportSuccess', {
          fallback: 'Analytics exported successfully',
        })
      );
    } catch {
      toast.error(
        t('instructor.assignment.exportError', {
          fallback: 'Failed to export analytics',
        })
      );
    }
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('instructor.assignment.actions.title', { fallback: 'Actions' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full justify-start" onClick={handleGrade}>
          <FileEdit className="mr-2 h-4 w-4" />
          {t('instructor.assignment.actions.grade', {
            fallback: 'Grade Essays',
          })}
        </Button>

        <Button variant="outline" className="w-full justify-start" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          {t('instructor.assignment.actions.export', {
            fallback: 'Export Analytics',
          })}
        </Button>

        <Button variant="outline" className="w-full justify-start" onClick={handleEdit}>
          <Settings className="mr-2 h-4 w-4" />
          {t('instructor.assignment.actions.editSettings', {
            fallback: 'Edit Settings',
          })}
        </Button>
      </CardContent>
    </Card>
  );
}
