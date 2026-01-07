'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/DataContext';
import { LLMSettings } from '@/types';
import { Settings, Key, Check, AlertCircle, Sparkles } from 'lucide-react';

export default function SettingsPage() {
    const { llmSettings, setLLMSettings } = useData();
    const [provider, setProvider] = useState<LLMSettings['provider']>(llmSettings?.provider || 'gemini');
    const [apiKey, setApiKey] = useState(llmSettings?.apiKey || '');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setLLMSettings({ provider, apiKey });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="max-w-2xl space-y-6 animate-fadeIn">
            <div>
                <h1 className="text-2xl font-bold mb-2">Settings</h1>
                <p className="text-[var(--text-muted)]">Configure your CloudGuard SIEM preferences</p>
            </div>

            {/* LLM Configuration */}
            <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <h2 className="font-semibold">Sentinel AI Configuration</h2>
                        <p className="text-sm text-[var(--text-muted)]">Configure your LLM provider for AI insights</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Provider Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">LLM Provider</label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setProvider('gemini')}
                                className={`flex-1 p-3 rounded-lg border transition-colors ${provider === 'gemini'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]'
                                    }`}
                            >
                                <div className="font-medium">Google Gemini</div>
                                <div className="text-xs text-[var(--text-muted)]">Recommended for GCP</div>
                            </button>
                            <button
                                onClick={() => setProvider('openai')}
                                className={`flex-1 p-3 rounded-lg border transition-colors ${provider === 'openai'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]'
                                    }`}
                            >
                                <div className="font-medium">OpenAI GPT-4</div>
                                <div className="text-xs text-[var(--text-muted)]">Advanced analysis</div>
                            </button>
                        </div>
                    </div>

                    {/* API Key */}
                    <div>
                        <label className="block text-sm font-medium mb-2">API Key</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input
                                type="password"
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                placeholder={provider === 'gemini' ? 'Enter your Gemini API key' : 'Enter your OpenAI API key'}
                                className="input w-full pl-10"
                            />
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                            {provider === 'gemini' ? (
                                <>Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a></>
                            ) : (
                                <>Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenAI Platform</a></>
                            )}
                        </p>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={handleSave}
                            disabled={!apiKey}
                            className="btn-primary disabled:opacity-50 flex items-center gap-2"
                        >
                            <Settings className="w-4 h-4" />
                            Save Settings
                        </button>
                        {saved && (
                            <span className="flex items-center gap-1 text-green-500 text-sm">
                                <Check className="w-4 h-4" />
                                Settings saved!
                            </span>
                        )}
                    </div>
                </div>

                {!apiKey && (
                    <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Add an API key to enable Sentinel AI features</span>
                    </div>
                )}
            </div>

            {/* Data Management */}
            <div className="card p-6">
                <h2 className="font-semibold mb-4">Data Management</h2>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                        <div>
                            <div className="font-medium">Clear All Scans</div>
                            <div className="text-sm text-[var(--text-muted)]">Delete all stored scan data</div>
                        </div>
                        <button
                            onClick={() => {
                                if (confirm('Are you sure? This will delete all scan data.')) {
                                    localStorage.removeItem('cloudguard-scans');
                                    window.location.reload();
                                }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                            Clear Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
