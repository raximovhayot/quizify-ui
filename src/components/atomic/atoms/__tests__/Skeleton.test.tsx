import React from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton } from '@/components/ui/skeleton';

describe('ui/Skeleton', () => {
  it('renders a skeleton', () => {
    render(<Skeleton data-testid="sk" className="h-2 w-2" />);
    expect(screen.getByTestId('sk')).toBeInTheDocument();
  });
});
