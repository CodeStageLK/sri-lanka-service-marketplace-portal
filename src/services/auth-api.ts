import { apiRequest } from '@/services/api-client';
import type { AuthResponse, CurrentUser, RegistrationResponse, SafeSession } from '@/types/auth';

export interface RegisterCustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterIndividualProviderInput {
  displayName: string;
  email: string;
  password: string;
  contactPhone?: string;
}

export interface RegisterBusinessProviderInput {
  businessName: string;
  email: string;
  password: string;
  contactPersonName?: string;
  registrationNumber?: string;
  businessAddress?: string;
  contactPhone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  clientType?: 'WEB';
  deviceName?: string;
}

export async function registerCustomer(input: RegisterCustomerInput): Promise<RegistrationResponse> {
  return apiRequest<RegistrationResponse>('/auth/register/customer', { method: 'POST', body: input });
}

export async function registerIndividualProvider(input: RegisterIndividualProviderInput): Promise<RegistrationResponse> {
  return apiRequest<RegistrationResponse>('/auth/register/provider/individual', { method: 'POST', body: input });
}

export async function registerBusinessProvider(input: RegisterBusinessProviderInput): Promise<RegistrationResponse> {
  return apiRequest<RegistrationResponse>('/auth/register/provider/business', { method: 'POST', body: input });
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { ...input, clientType: 'WEB' },
  });
}

export async function getCsrfToken(): Promise<{ csrfToken: string }> {
  return apiRequest<{ csrfToken: string }>('/auth/csrf');
}

export async function refreshWebSession(csrfToken: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/refresh', {
    method: 'POST',
    body: {},
    csrfToken,
  });
}

export async function getCurrentUser(accessToken: string, signal?: AbortSignal): Promise<CurrentUser> {
  return apiRequest<CurrentUser>('/auth/me', { accessToken, signal });
}

export async function logout(accessToken: string): Promise<void> {
  return apiRequest<void>('/auth/logout', { method: 'POST', accessToken });
}

export async function getSessions(accessToken: string): Promise<SafeSession[]> {
  return apiRequest<SafeSession[]>('/auth/sessions', { accessToken });
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/auth/email/verify', { method: 'POST', body: { token } });
}

export async function resendVerification(email: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/auth/email/resend', { method: 'POST', body: { email } });
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/auth/password/forgot', { method: 'POST', body: { email } });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  return apiRequest<void>('/auth/password/reset', {
    method: 'POST',
    body: { token, newPassword },
  });
}

export async function changePassword(currentPassword: string, newPassword: string, accessToken: string): Promise<void> {
  return apiRequest<void>('/auth/password/change', {
    method: 'POST',
    accessToken,
    body: { currentPassword, newPassword },
  });
}

export async function logoutAll(accessToken: string): Promise<void> {
  return apiRequest<void>('/auth/logout-all', { method: 'POST', accessToken });
}

export async function revokeSession(accessToken: string, sessionId: string): Promise<void> {
  return apiRequest<void>(`/auth/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
    accessToken,
  });
}
