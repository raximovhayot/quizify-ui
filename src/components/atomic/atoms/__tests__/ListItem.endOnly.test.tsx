import React from 'react';
import { render, screen } from '@testing-library/react';
import { ListItem } from '../ListItem';

describe('ListItem (end only)', () => {
  it('renders end slot without start', () => {
    render(
      <ListItem end={<button>Action</button>}>
        Row
      </ListItem>
    );
    expect(screen.getByText('Row')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
});
