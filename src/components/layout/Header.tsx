'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Bell, LogOut, ChevronDown } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import ClientSelector from '@/components/ClientSelector';

const PAGE_TITLES: Record<string, string> = {
    '/': 'Dashboard',
    '/findings': 'Findings',
    '/resources': 'Resources',
    '/lighthouse': 'Sentinel AI',
    '/scans': 'Scans & Uploads',
    '/settings': 'Settings',
    '/profile': 'Profile',
};

export default function Header() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const [showUser, setShowUser] = React.useState(false);

    const pageTitle = PAGE_TITLES[pathname] || 'Dashboard';

    return (
        <header className="h-14 flex items-center justify-between px-6 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
            {/* Left: Page Title & Client Selector */}
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold">{pageTitle}</h1>
                <ClientSelector />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <button className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors relative">
                    <Bell className="w-5 h-5" />
                </button>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowUser(!showUser)}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <ChevronDown className="w-4 h-4" />
                    </button>

                    {showUser && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowUser(false)} />
                            <div className="absolute top-full right-0 mt-1 w-56 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-lg z-50">
                                <div className="p-4 border-b border-[var(--border-color)]">
                                    <div className="font-medium">{user?.username}</div>
                                    <div className="text-sm text-[var(--text-muted)]">Security Engineer</div>
                                </div>
                                <div className="p-2">
                                    <button
                                        onClick={() => {
                                            logout();
                                            setShowUser(false);
                                        }}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-[var(--bg-tertiary)] w-full text-left text-red-500"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
