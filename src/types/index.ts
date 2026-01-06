// SCC-Compatible Types for GCP Security Dashboard

export interface Finding {
  finding_name: string;
  finding_category: string;
  finding_severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  finding_state: 'ACTIVE' | 'INACTIVE';
  finding_class: 'VULNERABILITY' | 'MISCONFIGURATION' | 'OBSERVATION';
  resource_name: string;
  resource_type: string;
  resource_project: string;
  resource_location: string;
  finding_description: string;
  remediation: string;
  compliance: string;
  scan_time: string;
  [key: string]: string; // Index signature for dynamic access
}

export interface SecurityMetrics {
  totalFindings: number;
  bySeverity: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
    INFO: number;
  };
  byResourceType: Record<string, number>;
  byCategory: Record<string, number>;
  byProject: Record<string, number>;
  byLocation: Record<string, number>;
  securityScore: number;
  topCategories: Array<{ name: string; count: number; severity: string }>;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
  [key: string]: string | number | undefined;
}

export interface ParseError {
  type: 'warning' | 'error';
  message: string;
  row?: number;
}

export interface CSVParseResult {
  data: Finding[];
  errors: ParseError[];
}

// Theme types
export type Theme = 'light' | 'dark';

// Severity colors
export const SEVERITY_COLORS = {
  CRITICAL: '#dc2626',
  HIGH: '#ea580c',
  MEDIUM: '#ca8a04',
  LOW: '#2563eb',
  INFO: '#6b7280'
} as const;

// Resource type icons/colors
export const RESOURCE_TYPE_COLORS: Record<string, string> = {
  'Instance': '#4285f4',
  'Cluster': '#34a853',
  'Bucket': '#fbbc04',
  'Firewall': '#ea4335',
  'SqlInstance': '#673ab7',
  'Project': '#9c27b0'
};
