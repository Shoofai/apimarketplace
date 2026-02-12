'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@/components/ui/modal';
import { cn } from '@/lib/cn';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  const themes = [
    {
      id: 'light',
      name: 'Light',
      icon: Sun,
      description: 'Light mode for bright environments',
    },
    {
      id: 'dark',
      name: 'Dark',
      icon: Moon,
      description: 'Dark mode for low-light environments',
    },
    {
      id: 'system',
      name: 'System',
      icon: Monitor,
      description: 'Automatically match your device settings',
    },
  ];

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <Modal>
      <ModalTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 transition-transform hover:scale-110"
        >
          <CurrentIcon className="h-5 w-5 transition-transform duration-300" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </ModalTrigger>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle>Choose Theme</ModalTitle>
        </ModalHeader>
        <div className="grid gap-3 py-4">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isActive = theme === themeOption.id;

            return (
              <button
                key={themeOption.id}
                onClick={() => setTheme(themeOption.id)}
                className={cn(
                  'flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-all hover:bg-accent',
                  isActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div
                  className={cn(
                    'rounded-lg p-2 transition-colors',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{themeOption.name}</span>
                    {isActive && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{themeOption.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </ModalContent>
    </Modal>
  );
}
