// Type definitions for GCP Security Dashboard

export interface ResourceData {
  'Resource Type': string;
  'Project ID': string;
  'Instance Name': string;
  'Zone': string;
  'Status': string;
  'Machine Type': string;
  'Creation Time': string;
  'Last Start Time': string;
  'Deletion Protection': string;
  'Internal IP': string;
  'External IP': string;
  'Network': string;
  'Subnet': string;
  'Network Interfaces': string;
  'Boot Disk Size (GB)': string;
  'External Disks': string;
  'OS Details (Boot Disk)': string;
  'OS Running (Agent)': string;
  'OS Agent Installed': string;
  'Service Account': string;
  'API Access Scopes': string;
  'Tags': string;
  'Labels': string;
  'Startup Script': string;
  'Shutdown Script': string;
  'Shielded VM': string;
  'Confidential VM': string;
  'SSH Keys': string;
  'IP Forwarding': string;
  [key: string]: string; // Allow additional fields for future resource types
}

export interface SecurityMetrics {
  totalResources: number;
  runningInstances: number;
  stoppedInstances: number;
  securityScore: number;
  issues: SecurityIssue[];
  byProject: Record<string, number>;
  byStatus: Record<string, number>;
  byZone: Record<string, number>;
}

export interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  count: number;
  description: string;
  affectedResources: string[];
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
  [key: string]: string | number | undefined;
}

export interface ParseError {
  type: string;
  message: string;
  row?: number;
}
