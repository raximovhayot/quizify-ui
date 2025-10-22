'use client';

import dynamic from 'next/dynamic';

export const MinimalRichTextEditorLazy = dynamic(
  () =>
    import('../MinimalRichTextEditor').then((mod) => ({
      default: mod.MinimalRichTextEditor,
    })),
  {
    ssr: false,
    loading: () => (
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
    ),
  }
);
