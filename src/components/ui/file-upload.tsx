'use client';

import { useState, useRef, useCallback, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText, 
  Video,
  Music,
  Archive,
  AlertCircle,
  Check
} from 'lucide-react';

interface FileUploadProps {
  onFilesChange?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  multiple?: boolean;
}

interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return Image;
  if (fileType.startsWith('video/')) return Video;
  if (fileType.startsWith('audio/')) return Music;
  if (fileType.includes('pdf') || fileType.includes('document')) return FileText;
  if (fileType.includes('zip') || fileType.includes('rar')) return Archive;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileUpload({
  onFilesChange,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedFileTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
  className,
  disabled = false,
  showPreview = true,
  multiple = true,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)}`;
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = acceptedFileTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      return type === fileExtension || type === file.type;
    });

    if (!isValidType) {
      return `File type not supported. Accepted types: ${acceptedFileTypes.join(', ')}`;
    }

    return null;
  };

  const simulateUpload = (fileId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileId 
                ? { ...f, status: 'success' as const, progress: 100 }
                : f
            )
          );
          resolve();
        } else {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileId 
                ? { ...f, progress }
                : f
            )
          );
        }
      }, 200);

      // Simulate occasional errors
      if (Math.random() < 0.1) {
        setTimeout(() => {
          clearInterval(interval);
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileId 
                ? { ...f, status: 'error' as const, error: 'Upload failed. Please try again.' }
                : f
            )
          );
          reject(new Error('Upload failed'));
        }, 1000);
      }
    });
  };

  const processFiles = useCallback(async (files: File[]) => {
    if (disabled) return;

    const validFiles: File[] = [];
    const newUploadedFiles: UploadedFile[] = [];

    for (const file of files) {
      if (uploadedFiles.length + validFiles.length >= maxFiles) {
        break;
      }

      const error = validateFile(file);
      const fileId = `${file.name}-${Date.now()}-${Math.random()}`;

      if (error) {
        newUploadedFiles.push({
          file,
          id: fileId,
          status: 'error',
          error,
        });
      } else {
        validFiles.push(file);
        const preview = file.type.startsWith('image/') 
          ? URL.createObjectURL(file) 
          : undefined;

        newUploadedFiles.push({
          file,
          id: fileId,
          preview,
          status: 'uploading',
          progress: 0,
        });
      }
    }

    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);

    // Simulate upload for valid files
    for (const uploadedFile of newUploadedFiles) {
      if (uploadedFile.status === 'uploading') {
        try {
          await simulateUpload(uploadedFile.id);
        } catch (error) {
          console.error('Upload failed:', error);
        }
      }
    }

    if (onFilesChange) {
      onFilesChange([...uploadedFiles.map(f => f.file), ...validFiles]);
    }
  }, [uploadedFiles, maxFiles, maxSize, acceptedFileTypes, disabled, onFilesChange]);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragActive(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, [disabled, processFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = Array.from(e.target.files || []);
    processFiles(files);
    
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [disabled, processFiles]);

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      const newFiles = prev.filter(f => f.id !== fileId);
      
      if (onFilesChange) {
        onFilesChange(newFiles.map(f => f.file));
      }
      
      return newFiles;
    });
  };

  const retryUpload = async (fileId: string) => {
    setUploadedFiles(prev => 
      prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'uploading' as const, progress: 0, error: undefined }
          : f
      )
    );

    try {
      await simulateUpload(fileId);
    } catch (error) {
      console.error('Retry upload failed:', error);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <Card 
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragActive && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <CardContent className="p-6">
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center text-center space-y-4"
          >
            <input 
              ref={fileInputRef}
              type="file"
              multiple={multiple}
              onChange={handleFileInputChange}
              className="hidden"
              disabled={disabled}
              accept={acceptedFileTypes.join(',')}
            />
            
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              isDragActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}>
              <Upload className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isDragActive 
                  ? 'Drop files here...' 
                  : 'Drag & drop files here, or click to select'
                }
              </p>
              <p className="text-xs text-muted-foreground">
                Max {maxFiles} files, up to {formatFileSize(maxSize)} each
              </p>
              <p className="text-xs text-muted-foreground">
                Supported: {acceptedFileTypes.join(', ')}
              </p>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {uploadedFiles.length > 0 && showPreview && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files ({uploadedFiles.length})</h4>
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile) => {
              const FileIcon = getFileIcon(uploadedFile.file.type);
              
              return (
                <Card key={uploadedFile.id} className="p-3">
                  <div className="flex items-center space-x-3">
                    {/* File Icon/Preview */}
                    <div className="flex-shrink-0">
                      {uploadedFile.preview ? (
                        <img
                          src={uploadedFile.preview}
                          alt={uploadedFile.file.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          <FileIcon className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                      
                      {/* Progress Bar */}
                      {uploadedFile.status === 'uploading' && (
                        <div className="mt-1">
                          <div className="w-full bg-muted rounded-full h-1">
                            <div 
                              className="bg-primary h-1 rounded-full transition-all duration-300"
                              style={{ width: `${uploadedFile.progress || 0}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Uploading... {Math.round(uploadedFile.progress || 0)}%
                          </p>
                        </div>
                      )}

                      {/* Error Message */}
                      {uploadedFile.status === 'error' && (
                        <p className="text-xs text-destructive mt-1">
                          {uploadedFile.error}
                        </p>
                      )}
                    </div>

                    {/* Status Icon */}
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      {uploadedFile.status === 'success' && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                      {uploadedFile.status === 'error' && (
                        <>
                          <AlertCircle className="w-4 h-4 text-destructive" />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => retryUpload(uploadedFile.id)}
                            className="h-6 px-2 text-xs"
                          >
                            Retry
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(uploadedFile.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}