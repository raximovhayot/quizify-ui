import React from 'react';
import { render, screen } from '@testing-library/react';
import { List, ListItem } from '../';

describe('List & ListItem', () => {
  it('renders a UL with default spacing and LI children', () => {
    const { container } = render(
      <List>
        <ListItem>One</ListItem>
        <ListItem>Two</ListItem>
      </List>
    );

    const ul = container.querySelector('ul');
    expect(ul).toBeInTheDocument();
    expect(ul).toHaveClass('space-y-2');
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  it('applies dense spacing when dense is true', () => {
    const { container } = render(
      <List dense>
        <ListItem>Item</ListItem>
      </List>
    );
    const ul = container.querySelector('ul');
    expect(ul).toHaveClass('space-y-1');
  });
});
