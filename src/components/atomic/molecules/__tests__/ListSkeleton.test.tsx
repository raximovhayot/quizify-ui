import React from 'react';
import { render } from '@testing-library/react';
import { ListSkeleton } from '../ListSkeleton';

describe('ListSkeleton', () => {
  it('renders the specified number of rows', () => {
    const { container } = render(<ListSkeleton rows={4} />);
    const items = container.querySelectorAll('div.rounded-md.border.p-4');
    expect(items.length).toBe(4);
  });

  it('respects dense spacing', () => {
    const { container } = render(<ListSkeleton rows={1} dense />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('space-y-1');
  });

  it('hides action placeholder when showAction is false', () => {
    const { container } = render(<ListSkeleton rows={1} showAction={false} />);
    const action = container.querySelector('div.h-6.w-16');
    expect(action).toBeNull();
  });

  it('supports deprecated count alias', () => {
    const { container } = render(<ListSkeleton count={2} />);
    const items = container.querySelectorAll('div.rounded-md.border.p-4');
    expect(items.length).toBe(2);
  });
});
