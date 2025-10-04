'use client';

import { Calendar, Clock, Play, Trophy, XCircle } from 'lucide-react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useRegistrations } from '../hooks/useRegistration';
import { AssignmentRegistration, RegistrationStatus } from '../types/registration';

export function RegistrationList() {
  const t = useTranslations();
  const router = useRouter();
  const { data, isLoading, error } = useRegistrations({
    page: 0,
    size: 20,
  });

  if (isLoading) {
    return <RegistrationListSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">
            {t('student.assignment.errorLoading', {
              fallback: 'Error Loading Assignments',
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('student.assignment.errorMessage', {
              fallback: 'Unable to load your assignments. Please try again later.',
            })}
          </p>
        </CardContent>
      </Card>
    );
  }

  const registrations = data?.content || [];

  if (registrations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">
            {t('student.assignment.noRegistrations', {
              fallback: 'No Assignments Yet',
            })}
          </h3>
          <p className="text-muted-foreground">
            {t('student.assignment.noRegistrationsMessage', {
              fallback: 'Join an assignment using a code to get started.',
            })}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        {t('student.assignment.myAssignments', {
          fallback: 'My Assignments',
        })}
      </h2>

      <div className="grid gap-4">
        {registrations.map((registration) => (
          <RegistrationCard
            key={registration.id}
            registration={registration}
            onClick={() =>
              router.push(`/student/assignments/${registration.assignmentId}`)
            }
          />
        ))}
      </div>
    </div>
  );
}

interface RegistrationCardProps {
  registration: AssignmentRegistration;
  onClick: () => void;
}

function RegistrationCard({ registration, onClick }: RegistrationCardProps) {
  const t = useTranslations();
  const { assignment, attemptsUsed, status } = registration;

  const now = new Date();
  const startTime = new Date(assignment.startTime);
  const endTime = new Date(assignment.endTime);
  const isActive = now >= startTime && now <= endTime;
  const isUpcoming = now < startTime;
  const isExpired = now > endTime;

  const getStatusBadge = () => {
    if (status === RegistrationStatus.COMPLETED) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          {t('student.assignment.statusCompleted', { fallback: 'Completed' })}
        </span>
      );
    }
    if (status === RegistrationStatus.CANCELLED) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          <XCircle className="h-3 w-3" />
          {t('student.assignment.statusCancelled', { fallback: 'Cancelled' })}
        </span>
      );
    }
    if (isUpcoming) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <Clock className="h-3 w-3" />
          {t('student.assignment.statusUpcoming', { fallback: 'Upcoming' })}
        </span>
      );
    }
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <Play className="h-3 w-3" />
          {t('student.assignment.statusActive', { fallback: 'Active' })}
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          {t('student.assignment.statusExpired', { fallback: 'Expired' })}
        </span>
      );
    }
    return null;
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6" onClick={onClick}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{assignment.title}</h3>
            {assignment.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {assignment.description}
              </p>
            )}
          </div>
          {getStatusBadge()}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">
                {t('student.assignment.starts', { fallback: 'Starts' })}
              </p>
              <p className="font-medium">{startTime.toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">
                {t('student.assignment.ends', { fallback: 'Ends' })}
              </p>
              <p className="font-medium">{endTime.toLocaleDateString()}</p>
            </div>
          </div>

          {assignment.timeLimit && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {t('student.assignment.timeLimit', { fallback: 'Time Limit' })}
                </p>
                <p className="font-medium">
                  {assignment.timeLimit}{' '}
                  {t('student.assignment.minutes', { fallback: 'min' })}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">
                {t('student.assignment.attempts', { fallback: 'Attempts' })}
              </p>
              <p className="font-medium">
                {attemptsUsed} /{' '}
                {assignment.maxAttempts === 0
                  ? t('student.assignment.unlimited', { fallback: '∞' })
                  : assignment.maxAttempts}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm">
            {t('student.assignment.viewDetails', {
              fallback: 'View Details',
            })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RegistrationListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
