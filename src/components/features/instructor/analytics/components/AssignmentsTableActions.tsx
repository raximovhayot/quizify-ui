'use client';

import {
  CheckCircle2,
  CircleOff,
  Eye,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AssignmentsTableActionsProps {
  id: number;
  viewHref: string;
  onDelete?: () => void;
  onPublish?: () => void;
  onUnpublish?: () => void;
  disabled?: boolean;
}

export function AssignmentsTableActions({
  id,
  viewHref,
  onDelete,
  onPublish,
  onUnpublish,
  disabled = false,
}: Readonly<AssignmentsTableActionsProps>) {
  const t = useTranslations();

  const hasAnyActions = onDelete || onPublish || onUnpublish;

  if (!hasAnyActions) {
    // Simple "View" button when no mutations are wired yet
    return (
      <Button
        variant="ghost"
        size="sm"
        asChild
        aria-label={t('common.view', { fallback: 'View' })}
      >
        <Link href={viewHref}>
          <Eye className="mr-2 h-4 w-4" />
          {t('common.view', { fallback: 'View' })}
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('common.actions', { fallback: 'Actions' })}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem asChild>
            <Link
              href={viewHref}
              aria-label={t('common.view', { fallback: 'View' })}
            >
              <Eye className="mr-2 h-4 w-4" />
              {t('common.view', { fallback: 'View' })}
            </Link>
          </DropdownMenuItem>
          {onPublish && (
            <DropdownMenuItem
              onClick={onPublish}
              disabled={disabled}
              aria-label={t('common.publish', { fallback: 'Publish' })}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {t('common.publish', { fallback: 'Publish' })}
            </DropdownMenuItem>
          )}
          {onUnpublish && (
            <DropdownMenuItem
              onClick={onUnpublish}
              disabled={disabled}
              aria-label={t('common.unpublish', { fallback: 'Unpublish' })}
            >
              <CircleOff className="mr-2 h-4 w-4" />
              {t('common.unpublish', { fallback: 'Unpublish' })}
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem
              onClick={onDelete}
              disabled={disabled}
              className="text-destructive focus:text-destructive"
              aria-label={t('common.delete', { fallback: 'Delete' })}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('common.delete', { fallback: 'Delete' })}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
