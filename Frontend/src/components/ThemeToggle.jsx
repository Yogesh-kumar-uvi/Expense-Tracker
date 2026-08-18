// src/components/ThemeToggle.jsx
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const OPTIONS = [
  { value: 'light', icon: Sun, label: 'Light theme' },
  { value: 'dark', icon: Moon, label: 'Dark theme' },
  { value: 'system', icon: Monitor, label: 'Match system theme' },
];

export default function ThemeToggle() {
  const { preference, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="flex items-center gap-0.5 rounded-control border border-border bg-surface p-0.5"
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={[
              'flex h-7 w-7 items-center justify-center rounded-[8px] transition-colors',
              active
                ? 'bg-primary-600 text-white'
                : 'text-muted hover:text-text-primary',
            ].join(' ')}
          >
            <Icon size={14} strokeWidth={2.25} />
          </button>
        );
      })}
    </div>
  );
}
