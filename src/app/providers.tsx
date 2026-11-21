import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export function Providers({ children }: { children: ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const state = useAuthStore.getState();
      if (state.accessToken && state.expiresAt && state.expiresAt - Date.now() < 60_000) {
        void state.refresh();
      }
    }, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
