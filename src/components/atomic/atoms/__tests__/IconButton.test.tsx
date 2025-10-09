import React from 'react';
import { render, screen } from '@testing-library/react';
import { IconButton } from '../IconButton';
import { Plus } from 'lucide-react';

describe('IconButton', () => {
  it('renders as a button with aria-label and icon', () => {
    render(
      <IconButton label="Add item">
        <Plus aria-hidden className="h-4 w-4" />
      </IconButton>
    );
    const btn = screen.getByRole('button', { name: /add item/i });
    expect(btn).toBeInTheDocument();
  });

  it('supports size branches sm and lg', () => {
    const { rerender } = render(
      <IconButton label="Small" size="sm">
        <Plus aria-hidden />
      </IconButton>
    );
    let btn = screen.getByRole('button', { name: 'Small' });
    expect(btn).toHaveClass('h-8 w-8');

    rerender(
      <IconButton label="Large" size="lg">
        <Plus aria-hidden />
      </IconButton>
    );
    btn = screen.getByRole('button', { name: 'Large' });
    expect(btn).toHaveClass('h-11 w-11');
  });
});
