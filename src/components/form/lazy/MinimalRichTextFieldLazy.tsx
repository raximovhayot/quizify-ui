'use client';

import dynamic from 'next/dynamic';
import { type FC } from 'react';
import type { MinimalRichTextFieldProps } from '../MinimalRichTextField';
import type { FieldValues, FieldPath } from 'react-hook-form';

export const MinimalRichTextFieldLazy = dynamic(
  () => import('../MinimalRichTextField'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2">
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        <div className="border rounded-lg overflow-hidden bg-background opacity-60">
          <div className="border-b bg-muted/20 p-2 flex items-center gap-1">
            <div className="h-7 w-7 bg-muted rounded animate-pulse" />
            <div className="h-7 w-7 bg-muted rounded animate-pulse" />
            <div className="h-7 w-7 bg-muted rounded animate-pulse" />
          </div>
          <div className="p-3" style={{ minHeight: '120px' }}>
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    ),
  }
) as <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
  props: MinimalRichTextFieldProps<TFieldValues, TName>
) => ReturnType<FC>;
