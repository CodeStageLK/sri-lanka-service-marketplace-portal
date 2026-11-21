import { create } from 'zustand';
import {
  getCurrentUser,
  getCsrfToken,
  login as loginRequest,
  logout as logoutRequest,
  refreshWebSession,
} from '@/services/auth-api';
import type { CurrentUser } from '@/types/auth';
import { canAccessCustomer, canAccessProvider } from '@/lib/portal-access';

interface AuthState {
  accessToken: string | null;
  csrfToken: string | null;
  user: CurrentUser | null;
  isInitialized: boolean;
  isLoading: boolean;
  expiresAt: number | null;
  refreshPromise: Promise<boolean> | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  csrfToken: null,
  user: null,
  isInitialized: false,
  isLoading: false,
  expiresAt: null,
  refreshPromise: null,

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    await get().refresh();
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const auth = await loginRequest({ email, password, clientType: 'WEB' });
      if (!auth.csrfToken) throw new Error('The login response did not include a CSRF token.');
      const user = await getCurrentUser(auth.accessToken);
      if (!canAccessCustomer(user) && !canAccessProvider(user)) {
        await logoutRequest(auth.accessToken);
        throw new Error('This account is not authorized for the SERVE HUB portal.');
      }
      set({
        accessToken: auth.accessToken,
        csrfToken: auth.csrfToken,
        user,
        isLoading: false,
        expiresAt: Date.now() + auth.expiresIn * 1000,
        refreshPromise: null,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    const accessToken = get().accessToken;
    set({ isLoading: true });
    try {
      if (accessToken) await logoutRequest(accessToken);
    } finally {
      set({ accessToken: null, csrfToken: null, user: null, isLoading: false, expiresAt: null, refreshPromise: null });
    }
  },

  refresh: async () => {
    const existing = get().refreshPromise;
    if (existing) return existing;
    const refreshPromise = (async () => {
      try {
        let csrfToken = get().csrfToken;
        if (!csrfToken) csrfToken = (await getCsrfToken()).csrfToken;
        const refreshed = await refreshWebSession(csrfToken);
        const user = await getCurrentUser(refreshed.accessToken);
        set({
          accessToken: refreshed.accessToken,
          csrfToken,
          user,
          isInitialized: true,
          isLoading: false,
          expiresAt: Date.now() + refreshed.expiresIn * 1000,
          refreshPromise: null,
        });
        return true;
      } catch {
        set({
          accessToken: null,
          csrfToken: null,
          user: null,
          isInitialized: true,
          isLoading: false,
          expiresAt: null,
          refreshPromise: null,
        });
        return false;
      }
    })();
    set({ refreshPromise });
    return refreshPromise;
  },
}));
