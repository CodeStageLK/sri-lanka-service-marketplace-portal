// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CustomerGuard, ProviderGuard } from './RoleGuard';
import { DashboardLayout } from '@/layouts/dashboard-layout';
import { PortalLoginPage } from '@/pages/PortalLoginPage';
import { useAuthStore } from '@/stores/auth-store';
import type { CurrentUser } from '@/types/auth';

const dualUser: CurrentUser = {
  id: 'user-1',
  email: 'person@example.test',
  isEmailVerified: true,
  roles: ['CUSTOMER', 'INDIVIDUAL_PROVIDER'],
  permissions: [],
  customerProfile: { firstName: 'Sample', lastName: 'Customer' },
  providerProfile: { id: 'provider-1', providerType: 'INDIVIDUAL', verificationStatus: 'NOT_SUBMITTED', isActive: true },
};

const initialState = useAuthStore.getState();

afterEach(() => {
  cleanup();
  useAuthStore.setState(initialState, true);
  vi.unstubAllEnvs();
});

function renderDashboards(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<p>Login required</p>} />
        <Route element={<CustomerGuard />}>
          <Route element={<DashboardLayout />}>
            <Route path="/account/dashboard" element={<h1>Customer dashboard</h1>} />
          </Route>
        </Route>
        <Route element={<ProviderGuard />}>
          <Route element={<DashboardLayout />}>
            <Route path="/provider/dashboard" element={<h1>Provider dashboard</h1>} />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('portal role switching', () => {
  it('switches both ways without logging out for a dual-role user', () => {
    const logout = vi.fn();
    useAuthStore.setState({ user: dualUser, isInitialized: true, isLoading: false, logout });
    renderDashboards('/account/dashboard');
    fireEvent.click(screen.getByRole('link', { name: /switch to provider/i }));
    expect(screen.getByRole('heading', { name: 'Provider dashboard' })).toBeTruthy();
    fireEvent.click(screen.getByRole('link', { name: /switch to customer/i }));
    expect(screen.getByRole('heading', { name: 'Customer dashboard' })).toBeTruthy();
    expect(logout).not.toHaveBeenCalled();
  });

  it('does not offer or grant access to a profile without its matching role', () => {
    useAuthStore.setState({ user: { ...dualUser, roles: ['CUSTOMER'] }, isInitialized: true, isLoading: false });
    renderDashboards('/account/dashboard');
    expect(screen.queryByRole('link', { name: /switch to provider/i })).toBeNull();
    cleanup();
    renderDashboards('/provider/dashboard');
    expect(screen.getByText(/not authorized/i)).toBeTruthy();
  });

  it('redirects signed-out users to login', () => {
    useAuthStore.setState({ user: null, isInitialized: true, isLoading: false });
    renderDashboards('/provider/dashboard');
    expect(screen.getByText('Login required')).toBeTruthy();
  });

  it('returns a dual-role user to the requested dashboard after login', async () => {
    const login = vi.fn(async () => { useAuthStore.setState({ user: dualUser }); });
    useAuthStore.setState({ user: null, login, isLoading: false });
    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: '/provider/dashboard' } }]}>
        <Routes>
          <Route path="/login" element={<PortalLoginPage />} />
          <Route path="/provider/dashboard" element={<h1>Provider dashboard</h1>} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'person@example.test' } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'test-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Provider dashboard' })).toBeTruthy());
  });

  it('signs into the selected demo view using the normal login flow', async () => {
    vi.stubEnv('VITE_DEMO_PORTAL_EMAIL', 'demo@example.test');
    vi.stubEnv('VITE_DEMO_PORTAL_PASSWORD', 'demo-password');
    const login = vi.fn(async () => { useAuthStore.setState({ user: dualUser }); });
    useAuthStore.setState({ user: null, login, isLoading: false });
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<PortalLoginPage />} />
          <Route path="/provider/dashboard" element={<h1>Provider dashboard</h1>} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Service provider' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Provider dashboard' })).toBeTruthy());
    expect(login).toHaveBeenCalledWith('demo@example.test', 'demo-password');
  });
});
