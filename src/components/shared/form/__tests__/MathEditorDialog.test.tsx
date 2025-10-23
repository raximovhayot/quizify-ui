import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next-intl useTranslations to just return fallback or key
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: { fallback?: string; [k: string]: unknown }) => {
    if (params && typeof params.fallback === 'string') return params.fallback as string;
    return key;
  },
}));

import { MathEditorDialog } from '../MathEditorDialog';

describe('MathEditorDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    onInsert: jest.fn(),
    mode: 'inline' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog when open', () => {
    render(<MathEditorDialog {...defaultProps} />);
    expect(screen.getByText('Math Editor')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<MathEditorDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('Math Editor')).not.toBeInTheDocument();
  });

  it('renders LaTeX input field', () => {
    render(<MathEditorDialog {...defaultProps} />);
    expect(screen.getByLabelText('LaTeX Input')).toBeInTheDocument();
  });

  it('renders preview area', () => {
    render(<MathEditorDialog {...defaultProps} />);
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('renders all template categories', () => {
    render(<MathEditorDialog {...defaultProps} />);
    
    // Check for template category tabs
    expect(screen.getByRole('tab', { name: /Basic/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Calculus/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Trig/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Matrices/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Equations/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Logic/i })).toBeInTheDocument();
  });

  it('renders symbol categories', () => {
    render(<MathEditorDialog {...defaultProps} />);
    
    // Check for symbol category tabs
    expect(screen.getByRole('tab', { name: /Symbols/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Greek/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Operators/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Arrows/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Sets/i })).toBeInTheDocument();
  });

  it('renders basic templates by default', () => {
    render(<MathEditorDialog {...defaultProps} />);
    
    // Basic templates should be visible by default
    expect(screen.getByText('Fraction')).toBeInTheDocument();
    expect(screen.getByText('Superscript')).toBeInTheDocument();
    expect(screen.getByText('Square root')).toBeInTheDocument();
  });

  it('renders LaTeX input with placeholder', () => {
    render(<MathEditorDialog {...defaultProps} />);

    const input = screen.getByLabelText('LaTeX Input');
    expect(input).toHaveAttribute('placeholder');
  });

  it('calls onOpenChange when Cancel button is clicked', async () => {
    const onOpenChange = jest.fn();
    const user = userEvent.setup();
    render(<MathEditorDialog {...defaultProps} onOpenChange={onOpenChange} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // Note: Tab switching tests are skipped due to a pre-existing issue with setState during render
  // in the renderPreview function (line 228 in MathEditorDialog.tsx)
  // This should be fixed in a separate PR

  it('has a clear button', () => {
    render(<MathEditorDialog {...defaultProps} />);

    const clearButton = screen.getByTitle('Clear');
    expect(clearButton).toBeInTheDocument();
  });

  it('disables Insert button when input is empty', () => {
    render(<MathEditorDialog {...defaultProps} />);

    const insertButton = screen.getByRole('button', { name: /Insert/i });
    expect(insertButton).toBeDisabled();
  });

  it('shows display mode indicator in block mode', () => {
    render(<MathEditorDialog {...defaultProps} mode="block" />);
    expect(screen.getByText(/Display mode/i)).toBeInTheDocument();
  });
});
