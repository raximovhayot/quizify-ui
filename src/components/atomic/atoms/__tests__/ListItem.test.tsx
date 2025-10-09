import React from 'react';
import { render, screen } from '@testing-library/react';
import { ListItem } from '../ListItem';

describe('ListItem', () => {
  it('renders with start and end slots', () => {
    render(
      <ListItem
        start={<span data-testid="start">S</span>}
        end={<button>Go</button>}
      >
        Content
      </ListItem>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });
});
