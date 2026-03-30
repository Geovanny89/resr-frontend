import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Obtener preferencia guardada o usar preferencia del sistema
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    // Aplicar tema al documento
    if (isDark) {
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.style.colorScheme = 'light';
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const theme = {
    isDark,
    colors: isDark ? {
      bg: '#0f172a',
      bgSecondary: '#1e293b',
      bgTertiary: '#334155',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textTertiary: '#94a3b8',
      border: '#475569',
      borderLight: '#334155',
      primary: '#667eea',
      primaryDark: '#764ba2',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      cardBg: '#1e293b',
      cardBgHover: '#334155',
      inputBg: '#0f172a',
      inputBorder: '#475569',
      shadow: 'rgba(0, 0, 0, 0.3)',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    } : {
      bg: '#f8f9fa',
      bgSecondary: '#ffffff',
      bgTertiary: '#f1f5f9',
      text: '#2d3748',
      textSecondary: '#718096',
      textTertiary: '#a0aec0',
      border: '#e2e8f0',
      borderLight: '#f1f5f9',
      primary: '#667eea',
      primaryDark: '#764ba2',
      success: '#38a169',
      error: '#e53e3e',
      warning: '#d97706',
      cardBg: '#ffffff',
      cardBgHover: '#f7fafc',
      inputBg: '#ffffff',
      inputBorder: '#e2e8f0',
      shadow: 'rgba(0, 0, 0, 0.08)',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }
  };

  return (
    <ThemeContext.Provider value={{ ...theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
}
