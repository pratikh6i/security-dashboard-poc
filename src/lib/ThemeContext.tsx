'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme } from '@/types';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'gcp-security-dashboard-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Load theme from localStorage
        const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
        if (stored) {
            setTheme(stored);
        } else {
            // Default to system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem(THEME_STORAGE_KEY, theme);

            // Apply theme class and styles
            const root = document.documentElement;
            if (theme === 'dark') {
                root.classList.add('dark');
                root.style.setProperty('--bg-color', '#030712');
                root.style.setProperty('--text-color', '#f9fafb');
                document.body.style.backgroundColor = '#030712';
                document.body.style.color = '#f9fafb';
            } else {
                root.classList.remove('dark');
                root.style.setProperty('--bg-color', '#f9fafb');
                root.style.setProperty('--text-color', '#111827');
                document.body.style.backgroundColor = '#f9fafb';
                document.body.style.color = '#111827';
            }
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Prevent flash of wrong theme
    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
