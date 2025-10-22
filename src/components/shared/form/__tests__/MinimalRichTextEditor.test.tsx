import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next-intl useTranslations to just return fallback or key
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: { fallback?: string; [k: string]: unknown }) => {
    if (params && typeof params.fallback === 'string') return params.fallback as string;
    return key;
  },
}));

// Mock the useIsHydrated hook to return true
jest.mock('../../hooks/useIsHydrated', () => ({
  useIsHydrated: () => true,
}));

import { MinimalRichTextEditor } from '../MinimalRichTextEditor';

describe('MinimalRichTextEditor', () => {
  const defaultProps = {
    content: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders editor with toolbar buttons', async () => {
    render(<MinimalRichTextEditor {...defaultProps} />);

    // Wait for editor to be ready
    await waitFor(() => {
      expect(screen.getByTitle('Bold')).toBeInTheDocument();
    });

    // Check for essential formatting buttons
    expect(screen.getByTitle('Bold')).toBeInTheDocument();
    expect(screen.getByTitle('Italic')).toBeInTheDocument();
    expect(screen.getByTitle('Code')).toBeInTheDocument();
    expect(screen.getByTitle('Bullet List')).toBeInTheDocument();
    expect(screen.getByTitle('Ordered List')).toBeInTheDocument();
  });

  it('renders math formula buttons', async () => {
    render(<MinimalRichTextEditor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTitle('Bold')).toBeInTheDocument();
    });

    // Check for math formula buttons
    expect(screen.getByTitle('Insert inline formula $...$ (LaTeX)')).toBeInTheDocument();
    expect(screen.getByTitle('Insert block formula $$...$$ (LaTeX)')).toBeInTheDocument();
  });

  it('opens math editor dialog when clicking inline formula button', async () => {
    const user = userEvent.setup();
    render(<MinimalRichTextEditor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTitle('Bold')).toBeInTheDocument();
    });

    const inlineFormulaButton = screen.getByTitle('Insert inline formula $...$ (LaTeX)');
    await user.click(inlineFormulaButton);

    // Check that the math editor dialog opens
    await waitFor(() => {
      expect(screen.getByText('Math Editor')).toBeInTheDocument();
    });
  });

  it('opens math editor dialog when clicking block formula button', async () => {
    const user = userEvent.setup();
    render(<MinimalRichTextEditor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTitle('Bold')).toBeInTheDocument();
    });

    const blockFormulaButton = screen.getByTitle('Insert block formula $$...$$ (LaTeX)');
    await user.click(blockFormulaButton);

    // Check that the math editor dialog opens
    await waitFor(() => {
      expect(screen.getByText('Math Editor')).toBeInTheDocument();
    });
  });

  it('accepts initial content', async () => {
    const content = '<p>Initial content</p>';
    render(<MinimalRichTextEditor {...defaultProps} content={content} />);

    await waitFor(() => {
      expect(screen.getByTitle('Bold')).toBeInTheDocument();
    });

    // Find the editor content area (TipTap renders a contenteditable div)
    const editorContent = document.querySelector('.ProseMirror');
    expect(editorContent).toBeInTheDocument();
    expect(editorContent?.textContent).toContain('Initial content');
  });

  it('disables buttons when editor is disabled', () => {
    render(<MinimalRichTextEditor {...defaultProps} disabled={true} />);

    // All buttons should be disabled
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});
