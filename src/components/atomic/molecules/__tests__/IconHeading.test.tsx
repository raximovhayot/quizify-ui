import React from 'react';
import { render, screen } from '@testing-library/react';
import IconHeadingDefault, { IconHeading } from '../IconHeading';

describe('IconHeading', () => {
  it('renders title and optional description', () => {
    render(<IconHeading title="Section Title" description="Small note" />);
    expect(screen.getByText('Section Title')).toBeInTheDocument();
    expect(screen.getByText('Small note')).toBeInTheDocument();
  });

  it('renders a custom icon when provided', () => {
    const icon = <span data-testid="icon">*</span>;
    render(<IconHeading icon={icon} title="With Icon" />);
    expect(screen.getByText('With Icon')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders with title only (no icon, no description)', () => {
    const { container } = render(<IconHeading title="Only Title" />);
    expect(screen.getByText('Only Title')).toBeInTheDocument();
    // Ensure description is not present
    expect(container.querySelector('div.text-xs')).toBeNull();
  });

  it('has a default export for convenience', () => {
    expect(typeof IconHeadingDefault).toBe('function');
  });
});
