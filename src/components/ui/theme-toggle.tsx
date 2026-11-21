import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/stores/theme-store';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const next = theme === 'light' ? 'dark' : 'light';
  const Icon = theme === 'light' ? Moon : Sun;
  return <button type="button" onClick={toggleTheme} aria-label={`Switch to ${next} mode`} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm hover:bg-muted">
    <Icon aria-hidden="true" size={16} /><span className="hidden sm:inline">{next === 'dark' ? 'Dark' : 'Light'} mode</span>
  </button>;
}
