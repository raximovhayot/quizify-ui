import React from 'react';
import { render } from '@testing-library/react';
import { Text } from '../Text';

describe('Text', () => {
  it('renders with semantic element and classes', () => {
    const { container } = render(
      <Text as="p" size="xs" muted weight="semibold" align="center">
        Hello
      </Text>
    );
    const p = container.querySelector('p');
    expect(p).toBeInTheDocument();
    expect(p).toHaveClass('text-xs');
    expect(p).toHaveClass('font-semibold');
    expect(p).toHaveClass('text-center');
    expect(p).toHaveClass('text-muted-foreground');
  });

  it('covers alternate branches: lg size, bold, right, not muted', () => {
    const { container } = render(
      <Text as="div" size="lg" weight="bold" align="right">World</Text>
    );
    const el = container.querySelector('div');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('text-lg');
    expect(el).toHaveClass('font-bold');
    expect(el).toHaveClass('text-right');
    expect(el).not.toHaveClass('text-muted-foreground');
  });
});

it('renders defaults: sm size, normal weight, left align', () => {
  const { container } = render(<Text>Default</Text>);
  const el = container.firstChild as HTMLElement;
  expect(el).toHaveClass('text-sm');
  expect(el).toHaveClass('font-normal');
  expect(el).toHaveClass('text-left');
});
