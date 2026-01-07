// Finding types aligned with Google SCC
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type FindingState = 'ACTIVE' | 'INACTIVE' | 'MUTED';
export type FindingStatus = 'FAIL' | 'PASS';
export type Theme = 'light' | 'dark';

export interface Finding {
  id: string;
  finding_name: string;
  finding_category: string;
  finding_severity: Severity;
  finding_state: FindingState;
  finding_class: string;
  status: FindingStatus;
  resource_name: string;
  resource_type: string;
  resource_project: string;
  resource_location: string;
  finding_description: string;
  remediation: string;
  compliance: string;
  scan_time: string;
  service?: string;
}

export interface ScanResult {
  id: string;
  name: string;
  timestamp: string;
  findings: Finding[];
  summary: ScanSummary;
}

export interface ScanSummary {
  total: number;
  passed: number;
  failed: number;
  bySeverity: Record<Severity, number>;
  byService: Record<string, number>;
  byProject: Record<string, number>;
  threatScore: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: 'admin' | 'viewer';
  organization?: string;
}

export interface AIInsight {
  id: string;
  category: string;
  severity: Severity;
  title: string;
  description: string;
  findings: string[];
  recommendations: string[];
}

export interface LLMSettings {
  provider: 'gemini' | 'openai';
  apiKey: string;
}

export const SEVERITY_CONFIG: Record<Severity, { color: string; bgColor: string; weight: number }> = {
  CRITICAL: { color: '#dc2626', bgColor: 'rgba(220, 38, 38, 0.1)', weight: 10 },
  HIGH: { color: '#ea580c', bgColor: 'rgba(234, 88, 12, 0.1)', weight: 5 },
  MEDIUM: { color: '#ca8a04', bgColor: 'rgba(202, 138, 4, 0.1)', weight: 2 },
  LOW: { color: '#16a34a', bgColor: 'rgba(22, 163, 74, 0.1)', weight: 1 },
  INFO: { color: '#2563eb', bgColor: 'rgba(37, 99, 235, 0.1)', weight: 0 },
};

export const SERVICE_ICONS: Record<string, string> = {
  'compute': '💻',
  'container': '📦',
  'storage': '🗄️',
  'network': '🌐',
  'sql': '🛢️',
  'iam': '🔐',
};
