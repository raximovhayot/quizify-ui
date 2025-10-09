import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/shared/ui/EmptyState';

describe('EmptyState', () => {
  it('renders default variant with message', () => {
    render(<EmptyState message="No items" />);
    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  it('renders large variant with description and action', () => {
    render(
      <EmptyState
        variant="large"
        message="Nothing here yet"
        description="Create your first item"
        action={<button>Do it</button>}
      />
    );
    // Title is a heading in large variant
    expect(screen.getByRole('heading', { name: 'Nothing here yet' })).toBeInTheDocument();
    expect(screen.getByText('Create your first item')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Do it' })).toBeInTheDocument();
  });

  it('renders inline variant with custom icon', () => {
    render(<EmptyState variant="inline" message="Empty" icon={<span data-testid="icon" />} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
