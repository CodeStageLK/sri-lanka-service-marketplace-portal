import { afterEach, describe, expect, it, vi } from 'vitest';
import * as authApi from '@/services/auth-api';
import { useAuthStore } from './auth-store';

vi.mock('@/services/auth-api', () => ({
  getCsrfToken: vi.fn(),
  refreshWebSession: vi.fn(),
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));

const initialState = useAuthStore.getState();

afterEach(() => {
  useAuthStore.setState(initialState, true);
  vi.clearAllMocks();
});

describe('session initialization', () => {
  it('shares one refresh when initialization runs concurrently', async () => {
    vi.mocked(authApi.getCsrfToken).mockResolvedValue({ csrfToken: 'csrf' });
    vi.mocked(authApi.refreshWebSession).mockResolvedValue({ accessToken: 'access', tokenType: 'Bearer', expiresIn: 900 });
    vi.mocked(authApi.getCurrentUser).mockResolvedValue({
      id: 'user', email: 'user@example.test', isEmailVerified: true, roles: ['CUSTOMER'], permissions: [],
      customerProfile: { firstName: 'Test', lastName: 'User' }, providerProfile: null,
    });
    await Promise.all([useAuthStore.getState().initialize(), useAuthStore.getState().initialize()]);
    expect(authApi.getCsrfToken).toHaveBeenCalledTimes(1);
    expect(authApi.refreshWebSession).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().user?.id).toBe('user');
  });
});
