// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PortalLoginPage } from './PortalLoginPage';
import { RegisterPage } from './RegisterPage';
import * as authApi from '@/services/auth-api';
import { useAuthStore } from '@/stores/auth-store';

vi.mock('@/services/auth-api', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/services/auth-api')>(),
  registerCustomer: vi.fn(),
}));

const initialState = useAuthStore.getState();
afterEach(() => { cleanup(); useAuthStore.setState(initialState, true); vi.resetAllMocks(); });

describe('portal authentication screens', () => {
  it('signs in using the existing flow and shows account links', async () => {
    const login = vi.fn(async () => {
      useAuthStore.setState({ user: { id: 'customer', email: 'user@example.test', isEmailVerified: true, roles: ['CUSTOMER'], permissions: [], customerProfile: { firstName: 'Test', lastName: 'User' }, providerProfile: null } });
    });
    useAuthStore.setState({ login });
    render(<MemoryRouter initialEntries={['/login']}><Routes><Route path="/login" element={<PortalLoginPage />} /><Route path="/account/dashboard" element={<p>Customer dashboard</p>} /></Routes></MemoryRouter>);
    fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), { target: { value: 'user@example.test' } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByLabelText(/Password/).getAttribute('type')).toBe('text');
    expect(screen.getByRole('link', { name: 'Join as a provider' }).getAttribute('href')).toBe('/register-provider');
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Customer dashboard')).toBeTruthy();
    expect(login).toHaveBeenCalledWith('user@example.test', 'password');
  });

  it('submits the customer registration DTO and displays its success', async () => {
    vi.mocked(authApi.registerCustomer).mockResolvedValue({ id: 'customer', email: 'user@example.test', status: 'PENDING', emailDelivery: 'accepted' });
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);
    fireEvent.change(screen.getByRole('textbox', { name: 'First name' }), { target: { value: 'Test' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Last name' }), { target: { value: 'User' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), { target: { value: 'user@example.test' } });
    fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: 'strong-password-123' } });
    fireEvent.change(screen.getByLabelText(/^Confirm password/), { target: { value: 'strong-password-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() => expect(authApi.registerCustomer).toHaveBeenCalledWith({ firstName: 'Test', lastName: 'User', email: 'user@example.test', password: 'strong-password-123' }));
    expect(await screen.findByText('Account created. Check your email to verify the account.')).toBeTruthy();
  });
});
