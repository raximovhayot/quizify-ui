import React from 'react';
import { render } from '@testing-library/react';
import { ListItem } from '../ListItem';

describe('ListItem (props spread)', () => {
  it('forwards extra HTML attributes to li element', () => {
    const { container } = render(
      <ListItem aria-label="row" data-testid="row">Row</ListItem>
    );
    const li = container.querySelector('li');
    expect(li).toHaveAttribute('aria-label', 'row');
    expect(li).toHaveAttribute('data-testid', 'row');
  });
});
