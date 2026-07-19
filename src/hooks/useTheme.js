// Theme management hook

import { useState, useEffect, useCallback } from 'react';

export function useTheme(themeSetting = 'system') {
  const [resolvedTheme, setResolvedTheme] = useState('light');

  const applyTheme = useCallback((setting) => {
    let theme;
    if (setting === 'system') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      theme = setting;
    }
    document.documentElement.setAttribute('data-theme', theme);
    setResolvedTheme(theme);
  }, []);

  useEffect(() => {
    applyTheme(themeSetting);

    // Listen for system theme changes
    if (themeSetting === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [themeSetting, applyTheme]);

  return resolvedTheme;
}
