'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useData } from '@/lib/DataContext';
import { AIInsight, Severity, SEVERITY_CONFIG } from '@/types';
import {
    Sparkles,
    Send,
    Loader2,
    AlertTriangle,
    Lightbulb,
    RefreshCw,
    Settings,
    ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function SentinelPage() {
    const { currentScan, llmSettings } = useData();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const generateInsights = async () => {
        if (!currentScan || !llmSettings?.apiKey) return;

        setIsGenerating(true);

        // Group findings by category
        const byCategory: Record<string, number> = {};
        currentScan.findings.forEach(f => {
            const cat = f.finding_category;
            byCategory[cat] = (byCategory[cat] || 0) + 1;
        });

        // Generate mock insights (in production, call actual LLM API)
        const topCategories = Object.entries(byCategory)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const mockInsights: AIInsight[] = topCategories.map(([category, count], i) => {
            const finding = currentScan.findings.find(f => f.finding_category === category);
            return {
                id: `insight-${i}`,
                category,
                severity: finding?.finding_severity || 'MEDIUM',
                title: `${count} ${category} issues detected`,
                description: finding?.finding_description || 'Security misconfiguration detected.',
                findings: currentScan.findings
                    .filter(f => f.finding_category === category)
                    .slice(0, 3)
                    .map(f => f.resource_name),
                recommendations: [
                    finding?.remediation || 'Review and remediate the affected resources.',
                    'Consider implementing automated compliance checks.',
                    'Document exceptions and maintain an audit trail.',
                ],
            };
        });

        setInsights(mockInsights);
        setIsGenerating(false);
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        // Simulate AI response (in production, call actual LLM API)
        setTimeout(() => {
            let response = '';

            if (userMessage.toLowerCase().includes('critical')) {
                const criticalCount = currentScan?.findings.filter(f => f.finding_severity === 'CRITICAL').length || 0;
                response = `I found ${criticalCount} critical findings in your scan. The most common are:\n\n`;
                const criticals = currentScan?.findings.filter(f => f.finding_severity === 'CRITICAL').slice(0, 3) || [];
                criticals.forEach(f => {
                    response += `• **${f.finding_category}**: ${f.finding_description}\n`;
                });
                response += '\nWould you like remediation steps for any of these?';
            } else if (userMessage.toLowerCase().includes('remediat')) {
                response = 'Here are general remediation priorities:\n\n';
                response += '1. **Address Critical & High severity findings first** - These pose the greatest risk.\n';
                response += '2. **Disable public access** - Remove external IPs and public bucket ACLs.\n';
                response += '3. **Enable encryption** - Ensure SSL/TLS is required for all connections.\n';
                response += '4. **Restrict API scopes** - Avoid cloud-platform scope when possible.\n';
                response += '\nNeed specific guidance for any finding?';
            } else if (userMessage.toLowerCase().includes('summar')) {
                const summary = currentScan?.summary;
                response = `**Scan Summary**\n\n`;
                response += `• Total Findings: ${summary?.total || 0}\n`;
                response += `• Failed Checks: ${summary?.failed || 0}\n`;
                response += `• Passed Checks: ${summary?.passed || 0}\n`;
                response += `• Threat Score: ${summary?.threatScore || 0}%\n\n`;
                response += `**By Severity:**\n`;
                response += `• Critical: ${summary?.bySeverity.CRITICAL || 0}\n`;
                response += `• High: ${summary?.bySeverity.HIGH || 0}\n`;
                response += `• Medium: ${summary?.bySeverity.MEDIUM || 0}\n`;
                response += `• Low: ${summary?.bySeverity.LOW || 0}\n`;
            } else {
                response = `I can help you analyze your security findings. Try asking:\n\n`;
                response += `• "What are my critical findings?"\n`;
                response += `• "Give me a summary of my scan"\n`;
                response += `• "How do I remediate these issues?"\n`;
                response += `• "Which projects have the most vulnerabilities?"`;
            }

            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
            setIsLoading(false);
        }, 1000);
    };

    if (!llmSettings?.apiKey) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="w-20 h-20 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                    <Settings className="w-10 h-10 text-purple-500" />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Configure AI Settings</h2>
                    <p className="text-[var(--text-muted)] max-w-md">
                        Add your LLM API key in Settings to enable Sentinel AI insights.
                    </p>
                </div>
                <Link href="/settings" className="btn-primary flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Go to Settings
                </Link>
            </div>
        );
    }

    return (
        <div className="h-full flex gap-6 animate-fadeIn">
            {/* Chat Panel */}
            <div className="flex-1 flex flex-col card">
                <div className="p-4 border-b border-[var(--border-color)] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-semibold">Sentinel AI</h2>
                        <p className="text-xs text-[var(--text-muted)]">Ask questions about your security findings</p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center py-8 text-[var(--text-muted)]">
                            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Ask me about your security findings</p>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-[var(--bg-tertiary)]'
                                    }`}
                            >
                                <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-[var(--bg-tertiary)] p-3 rounded-lg">
                                <Loader2 className="w-5 h-5 animate-spin" />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-[var(--border-color)]">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder="Ask about your findings..."
                            className="input flex-1"
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={isLoading || !input.trim()}
                            className="btn-primary disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Insights Panel */}
            <div className="w-80 flex flex-col card">
                <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
                    <h3 className="font-semibold">AI Insights</h3>
                    <button
                        onClick={generateInsights}
                        disabled={isGenerating || !currentScan}
                        className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {insights.length === 0 ? (
                        <div className="text-center py-8 text-[var(--text-muted)]">
                            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Click refresh to generate insights</p>
                        </div>
                    ) : (
                        insights.map(insight => {
                            const config = SEVERITY_CONFIG[insight.severity];
                            return (
                                <div
                                    key={insight.id}
                                    className="p-3 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors"
                                >
                                    <div className="flex items-start gap-2 mb-2">
                                        <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: config.color }} />
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{insight.title}</div>
                                            <span
                                                className="badge text-xs mt-1"
                                                style={{ color: config.color, backgroundColor: config.bgColor }}
                                            >
                                                {insight.severity}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                                        {insight.description}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
