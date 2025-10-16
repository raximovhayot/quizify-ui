'use client';

import {
  Archive,
  Download,
  File,
  FileText,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { AttachmentDTO } from '@/features/attachment/attachmentService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollableAlertDialogContent } from '@/components/shared/ui/ScrollableAlertDialogContent';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface AttachmentDisplayProps {
  attachment: AttachmentDTO;
  onDownload?: (attachment: AttachmentDTO) => void;
  onDelete?: (attachmentId: number) => void;
  showActions?: boolean;
  isDeleting?: boolean;
  className?: string;
}

export function AttachmentDisplay({
  attachment,
  onDownload,
  onDelete,
  showActions = true,
  isDeleting = false,
  className,
}: AttachmentDisplayProps) {
  const t = useTranslations();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    }
    if (contentType === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    if (
      contentType.includes('word') ||
      contentType.includes('document') ||
      contentType === 'text/plain'
    ) {
      return <FileText className="h-8 w-8 text-blue-600" />;
    }
    if (contentType.includes('excel') || contentType.includes('sheet')) {
      return <FileText className="h-8 w-8 text-green-600" />;
    }
    if (
      contentType.includes('zip') ||
      contentType.includes('rar') ||
      contentType.includes('archive')
    ) {
      return <Archive className="h-8 w-8 text-orange-500" />;
    }
    return <File className="h-8 w-8 text-muted-foreground" />;
  };

  const getFileTypeLabel = (contentType: string): string => {
    const typeMap: Record<string, string> = {
      'image/jpeg': 'JPEG',
      'image/png': 'PNG',
      'image/gif': 'GIF',
      'image/webp': 'WebP',
      'application/pdf': 'PDF',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'DOCX',
      'application/vnd.ms-excel': 'XLS',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        'XLSX',
      'text/plain': 'TXT',
      'text/csv': 'CSV',
    };

    return (
      typeMap[contentType] || contentType.split('/')[1]?.toUpperCase() || 'FILE'
    );
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(attachment);
    } else {
      // Fallback: open download URL in new tab
      window.open(attachment.downloadUrl, '_blank');
    }
  };

  const handleDelete = () => {
    onDelete?.(attachment.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {getFileIcon(attachment.contentType)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-sm font-medium truncate">
                  {attachment.originalFileName}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {getFileTypeLabel(attachment.contentType)}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.fileSize)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('attachment.uploadedOn', {
                    fallback: 'Uploaded on {date}',
                    date: formatDate(attachment.uploadDate),
                  })}
                </p>
              </div>
            </div>
          </div>

          {showActions && (
            <div className="flex items-center space-x-1 ml-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-8 w-8 p-0"
                title={t('attachment.download', { fallback: 'Download' })}
              >
                <Download className="h-4 w-4" />
              </Button>

              {onDelete && (
                <AlertDialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      disabled={isDeleting}
                      title={t('attachment.delete', { fallback: 'Delete' })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <ScrollableAlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t('attachment.deleteConfirm.title', {
                          fallback: 'Delete attachment',
                        })}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('attachment.deleteConfirm.description', {
                          fallback:
                            'Are you sure you want to delete this attachment? This action cannot be undone.',
                        })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {t('common.cancel', { fallback: 'Cancel' })}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t('common.delete', { fallback: 'Delete' })}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </ScrollableAlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
