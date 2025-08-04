'use client';

import { AlertCircle, File, Upload, X } from 'lucide-react';
import { FileRejection, useDropzone } from 'react-dropzone';

import { useCallback, useState } from 'react';

import { useTranslations } from 'next-intl';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  selectedFile?: File | null;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string;
  maxSizeInMB?: number;
  allowedTypes?: string[];
  accept?: string;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  isUploading = false,
  uploadProgress = 0,
  error,
  maxSizeInMB = 10,
  allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
  accept,
  disabled = false,
  className,
}: FileUploadProps) {
  const t = useTranslations();
  const [dragError, setDragError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        return t('fileUpload.errors.fileSize', {
          fallback: `File size must be less than ${maxSizeInMB}MB`,
          maxSize: maxSizeInMB,
        });
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        return t('fileUpload.errors.fileType', {
          fallback: 'File type not supported',
        });
      }

      return null;
    },
    [maxSizeInMB, allowedTypes, t]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setDragError(null);

      if (rejectedFiles.length > 0) {
        setDragError(
          t('fileUpload.errors.rejected', {
            fallback: 'Some files were rejected',
          })
        );
        return;
      }

      if (acceptedFiles.length === 0) {
        return;
      }

      const file = acceptedFiles[0];
      const validationError = validateFile(file);

      if (validationError) {
        setDragError(validationError);
        return;
      }

      onFileSelect(file);
    },
    [onFileSelect, validateFile, t]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: accept ? { [accept]: [] } : undefined,
      multiple: false,
      disabled: disabled || isUploading,
      maxSize: maxSizeInMB * 1024 * 1024,
    });

  const handleRemoveFile = () => {
    setDragError(null);
    onFileRemove?.();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const displayError = error || dragError;

  return (
    <div className={cn('w-full', className)}>
      {!selectedFile ? (
        <Card
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed transition-colors cursor-pointer',
            {
              'border-primary bg-primary/5': isDragActive && !isDragReject,
              'border-destructive bg-destructive/5':
                isDragReject || displayError,
              'border-muted-foreground/25 hover:border-muted-foreground/50':
                !isDragActive && !displayError,
              'opacity-50 cursor-not-allowed': disabled || isUploading,
            }
          )}
        >
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <input {...getInputProps()} />
            <Upload
              className={cn('h-10 w-10 mb-4', {
                'text-primary': isDragActive && !isDragReject,
                'text-destructive': isDragReject || displayError,
                'text-muted-foreground': !isDragActive && !displayError,
              })}
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isDragActive
                  ? t('fileUpload.dropHere', { fallback: 'Drop file here' })
                  : t('fileUpload.dragOrClick', {
                      fallback: 'Drag and drop a file here, or click to select',
                    })}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('fileUpload.maxSize', {
                  fallback: `Maximum file size: ${maxSizeInMB}MB`,
                  maxSize: maxSizeInMB,
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <File className="h-8 w-8 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              {!isUploading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {isUploading && (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span>
                    {t('fileUpload.uploading', { fallback: 'Uploading...' })}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {displayError && (
        <Alert variant="destructive" className="mt-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
