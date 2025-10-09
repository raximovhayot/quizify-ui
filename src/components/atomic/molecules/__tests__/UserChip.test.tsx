import React from 'react';
import { render, screen } from '@testing-library/react';
import { UserChip } from '../UserChip';

describe('UserChip', () => {
  it('renders name and subtitle with avatar fallback initials', () => {
    render(<UserChip name="Ada Lovelace" subtitle="Student" />);

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Student')).toBeInTheDocument();
    // Initials should be AL (fallback content). We don't assert exact casing logic beyond presence.
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('renders gracefully when imageUrl is provided', () => {
    render(<UserChip name="Grace Hopper" imageUrl="https://example.com/grace.jpg" />);
    // We only assert that the name is rendered; JSDOM doesn't emulate image loading for Radix Avatar.
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
  });
});
