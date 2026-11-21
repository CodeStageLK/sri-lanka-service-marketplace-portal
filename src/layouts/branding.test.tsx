// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { AuthLayout } from './auth-layout';
import { DashboardLayout } from './dashboard-layout';
import { PublicLayout } from './public-layout';
import { useThemeStore } from '@/stores/theme-store';
import { useAuthStore } from '@/stores/auth-store';

const initialAuth = useAuthStore.getState();
afterEach(() => { cleanup(); useThemeStore.getState().setTheme('light'); localStorage.removeItem('servhub-theme'); useAuthStore.setState(initialAuth, true); });

describe('portal branding', () => {
  it('shows a home-linked logo on public, authentication and dashboard layouts', () => {
    for (const Layout of [PublicLayout, AuthLayout, DashboardLayout]) {
      render(<MemoryRouter initialEntries={['/test']}><Routes><Route element={<Layout />}><Route path="/test" element={<p>Page content</p>} /></Route></Routes></MemoryRouter>);
      expect(screen.getByRole('link', { name: 'SERVE HUB portal home' }).getAttribute('href')).toBe('/');
      expect(screen.getByRole('img', { name: 'SERVE HUB' })).toBeTruthy();
      expect(screen.getByText('Page content')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeTruthy();
      cleanup();
    }
  });

  it('switches and saves the theme', () => {
    useThemeStore.getState().setTheme('light');
    render(<MemoryRouter><AuthLayout /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('servhub-theme')).toBe('dark');
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }));
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('links visitors to sign in and providers to their account', () => {
    render(<MemoryRouter><PublicLayout /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Sign in' }).getAttribute('href')).toBe('/login');
    act(() => useAuthStore.setState({ user: { id: 'provider', email: 'provider@example.test', isEmailVerified: true, roles: ['INDIVIDUAL_PROVIDER'], permissions: [], customerProfile: null, providerProfile: { id: 'profile', providerType: 'INDIVIDUAL', isActive: true, verificationStatus: 'APPROVED' } } }));
    expect(screen.getByRole('link', { name: 'Account' }).getAttribute('href')).toBe('/provider/dashboard');
  });
});
