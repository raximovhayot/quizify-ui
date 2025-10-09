import React from 'react';
import { render } from '@testing-library/react';
import { ListItem } from '../ListItem';

describe('ListItem (no slots)', () => {
  it('renders children and merges custom className when no start/end provided', () => {
    const { container, getByText } = render(
      <ListItem className="extra">Plain</ListItem>
    );
    expect(getByText('Plain')).toBeInTheDocument();
    const li = container.querySelector('li');
    expect(li).toHaveClass('extra');
  });
});
