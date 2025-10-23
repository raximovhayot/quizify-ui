import { render, screen } from '@testing-library/react';

import { MathLiveDialog } from '../MathLiveDialog';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, options?: { fallback?: string }) =>
    options?.fallback || key,
}));

describe('MathLiveDialog', () => {
  const mockOnInsert = jest.fn();
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(
      <MathLiveDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onInsert={mockOnInsert}
      />
    );

    expect(screen.getByText('Math Editor')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <MathLiveDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onInsert={mockOnInsert}
      />
    );

    expect(screen.queryByText('Math Editor')).not.toBeInTheDocument();
  });

  it('shows display mode label for block mode', () => {
    render(
      <MathLiveDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onInsert={mockOnInsert}
        mode="block"
      />
    );

    expect(screen.getByText(/Display mode/i)).toBeInTheDocument();
  });

  it('renders clear, cancel and insert buttons', () => {
    render(
      <MathLiveDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onInsert={mockOnInsert}
      />
    );

    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Insert')).toBeInTheDocument();
  });

  it('shows virtual keyboard button', () => {
    render(
      <MathLiveDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onInsert={mockOnInsert}
      />
    );

    expect(screen.getByText(/Show Virtual Keyboard/i)).toBeInTheDocument();
  });

  it('displays helpful tips', () => {
    render(
      <MathLiveDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onInsert={mockOnInsert}
      />
    );

    expect(screen.getByText(/Tips:/i)).toBeInTheDocument();
    expect(screen.getByText(/Type naturally/i)).toBeInTheDocument();
  });
});
