'use client';

import { CheckCircle2, ClipboardCheck, FileEdit, XCircle } from 'lucide-react';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { sanitizeHtml } from '@/lib/sanitize';

import { EssayAnswer } from '../types/grading';
import { GradeEssayDialog } from './GradeEssayDialog';

interface EssayGradingTableProps {
  essays: EssayAnswer[];
  loading?: boolean;
}

export function EssayGradingTable({ essays, loading }: EssayGradingTableProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEssay, setSelectedEssay] = useState<EssayAnswer | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    'ALL' | 'PENDING' | 'GRADED'
  >('ALL');

  if (loading) {
    return <EssayGradingTableSkeleton />;
  }

  const filteredEssays = essays.filter((essay) => {
    const matchesSearch =
      essay.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      essay.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'ALL' || essay.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: EssayAnswer['status']) => {
    if (status === 'GRADED') {
      return (
        <Badge variant="outline" className="text-green-600">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          {t('instructor.grading.graded', { fallback: 'Graded' })}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-orange-600">
        <ClipboardCheck className="mr-1 h-3 w-3" />
        {t('instructor.grading.pending', { fallback: 'Pending' })}
      </Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileEdit className="h-5 w-5" />
              {t('instructor.grading.essayAnswers', {
                fallback: 'Essay Answers',
              })}
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'ALL' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('ALL')}
                >
                  {t('common.all', { fallback: 'All' })}
                </Button>
                <Button
                  variant={filterStatus === 'PENDING' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('PENDING')}
                >
                  {t('instructor.grading.pending', { fallback: 'Pending' })}
                </Button>
                <Button
                  variant={filterStatus === 'GRADED' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('GRADED')}
                >
                  {t('instructor.grading.graded', { fallback: 'Graded' })}
                </Button>
              </div>
              <Input
                placeholder={t('instructor.grading.searchStudents', {
                  fallback: 'Search students...',
                })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEssays.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {searchQuery || filterStatus !== 'ALL'
                ? t('instructor.grading.noResults', {
                    fallback: 'No essays found',
                  })
                : t('instructor.grading.noEssays', {
                    fallback: 'No essay answers to grade',
                  })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t('instructor.grading.student', { fallback: 'Student' })}
                    </TableHead>
                    <TableHead className="w-[40%]">
                      {t('instructor.grading.question', {
                        fallback: 'Question',
                      })}
                    </TableHead>
                    <TableHead>
                      {t('instructor.grading.status', { fallback: 'Status' })}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('instructor.grading.score', { fallback: 'Score' })}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('common.actions', { fallback: 'Actions' })}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEssays.map((essay) => (
                    <TableRow key={essay.answerId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{essay.studentName}</div>
                          <div className="text-sm text-muted-foreground">
                            {essay.studentEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="line-clamp-2 text-sm"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(essay.questionText || ''),
                          }}
                        />
                      </TableCell>
                      <TableCell>{getStatusBadge(essay.status)}</TableCell>
                      <TableCell className="text-right">
                        {essay.currentScore !== null ? (
                          <div>
                            <div className="font-medium">
                              {essay.currentScore}/{essay.questionPoints}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {(
                                (essay.currentScore / essay.questionPoints) *
                                100
                              ).toFixed(0)}
                              %
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEssay(essay)}
                        >
                          {essay.status === 'GRADED' ? (
                            <>
                              <FileEdit className="h-4 w-4 mr-2" />
                              {t('instructor.grading.regrade', {
                                fallback: 'Regrade',
                              })}
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              {t('instructor.grading.grade', {
                                fallback: 'Grade',
                              })}
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEssay && (
        <GradeEssayDialog
          answer={selectedEssay}
          open={!!selectedEssay}
          onOpenChange={(open) => !open && setSelectedEssay(null)}
        />
      )}
    </>
  );
}

function EssayGradingTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
