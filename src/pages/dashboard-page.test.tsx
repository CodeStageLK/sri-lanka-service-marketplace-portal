// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashboardPage } from './dashboard-page';

describe('provider application shell', () => {
  it('makes the missing authentication explicit', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/This screen is not protected yet/)).toBeTruthy();
  });
});
