import React from 'react';
import { render, screen } from '@testing-library/react';
import { KeyValue } from '../KeyValue';

describe('KeyValue', () => {
  it('renders vertical by default with label and value', () => {
    const { container } = render(<KeyValue label="Label" value="Value" />);

    const dl = container.querySelector('dl');
    const dt = container.querySelector('dt');
    const dd = container.querySelector('dd');

    expect(dl).toBeInTheDocument();
    expect(dt).toHaveTextContent('Label');
    expect(dd).toHaveTextContent('Value');
  });

  it('renders horizontal layout when specified', () => {
    const { container } = render(
      <KeyValue label={<span>Label</span>} value={<strong>Value</strong>} orientation="horizontal" />
    );
    const dl = container.querySelector('dl');
    expect(dl).toHaveClass('grid');
    // Ensure content visible
    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });
});
