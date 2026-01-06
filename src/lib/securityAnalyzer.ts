import { ResourceData, SecurityMetrics, SecurityIssue, ChartData } from '@/types';

const SEVERITY_COLORS = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#ca8a04',
    low: '#2563eb'
};

const STATUS_COLORS: Record<string, string> = {
    RUNNING: '#22c55e',
    STOPPED: '#ef4444',
    TERMINATED: '#6b7280',
    SUSPENDED: '#f59e0b',
    STAGING: '#3b82f6',
    PROVISIONING: '#8b5cf6'
};

const CHART_COLORS = [
    '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
];

export function analyzeSecurityData(data: ResourceData[]): SecurityMetrics {
    const issues: SecurityIssue[] = [];
    const byProject: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byZone: Record<string, number> = {};

    // Count by project, status, zone
    data.forEach(row => {
        const project = row['Project ID'] || 'Unknown';
        const status = row['Status'] || 'Unknown';
        const zone = row['Zone'] || 'Unknown';

        byProject[project] = (byProject[project] || 0) + 1;
        byStatus[status] = (byStatus[status] || 0) + 1;
        byZone[zone] = (byZone[zone] || 0) + 1;
    });

    // Analyze security issues

    // 1. VMs without Shielded VM
    const noShieldedVM = data.filter(row => {
        const shielded = row['Shielded VM'] || '';
        return shielded.includes('SecureBoot: Off') || shielded === 'Not Configured';
    });
    if (noShieldedVM.length > 0) {
        issues.push({
            severity: 'high',
            title: 'Shielded VM Disabled',
            count: noShieldedVM.length,
            description: 'VMs without Secure Boot enabled are vulnerable to boot-level malware.',
            affectedResources: noShieldedVM.map(r => `${r['Project ID']}/${r['Instance Name']}`)
        });
    }

    // 2. VMs with full API access
    const fullApiAccess = data.filter(row => {
        const scopes = row['API Access Scopes'] || '';
        return scopes.includes('All APIs (Full Access)') || scopes.includes('cloud-platform');
    });
    if (fullApiAccess.length > 0) {
        issues.push({
            severity: 'critical',
            title: 'Full API Access Granted',
            count: fullApiAccess.length,
            description: 'VMs with full cloud-platform scope can access all GCP APIs.',
            affectedResources: fullApiAccess.map(r => `${r['Project ID']}/${r['Instance Name']}`)
        });
    }

    // 3. VMs with External IPs
    const withExternalIP = data.filter(row => {
        const extIP = row['External IP'] || '';
        return extIP && !extIP.startsWith('None');
    });
    if (withExternalIP.length > 0) {
        issues.push({
            severity: 'medium',
            title: 'External IP Assigned',
            count: withExternalIP.length,
            description: 'VMs with external IPs are directly accessible from the internet.',
            affectedResources: withExternalIP.map(r => `${r['Project ID']}/${r['Instance Name']}`)
        });
    }

    // 4. VMs without OS Agent
    const noOSAgent = data.filter(row => {
        const agent = row['OS Agent Installed'] || '';
        return agent === 'No';
    });
    if (noOSAgent.length > 0) {
        issues.push({
            severity: 'low',
            title: 'OS Agent Not Installed',
            count: noOSAgent.length,
            description: 'VMs without OS Config agent cannot be managed for patches.',
            affectedResources: noOSAgent.map(r => `${r['Project ID']}/${r['Instance Name']}`)
        });
    }

    // 5. VMs without Deletion Protection
    const noDeletionProtection = data.filter(row => {
        const protection = row['Deletion Protection'] || '';
        return protection === 'No';
    });
    if (noDeletionProtection.length > 0) {
        issues.push({
            severity: 'low',
            title: 'Deletion Protection Disabled',
            count: noDeletionProtection.length,
            description: 'VMs can be accidentally deleted without protection.',
            affectedResources: noDeletionProtection.map(r => `${r['Project ID']}/${r['Instance Name']}`)
        });
    }

    // 6. VMs with IP Forwarding enabled
    const ipForwardingEnabled = data.filter(row => {
        const forwarding = row['IP Forwarding'] || '';
        return forwarding === 'Enabled';
    });
    if (ipForwardingEnabled.length > 0) {
        issues.push({
            severity: 'medium',
            title: 'IP Forwarding Enabled',
            count: ipForwardingEnabled.length,
            description: 'VMs can route traffic, potentially bypassing network controls.',
            affectedResources: ipForwardingEnabled.map(r => `${r['Project ID']}/${r['Instance Name']}`)
        });
    }

    // 7. Confidential VM not enabled
    const noConfidentialVM = data.filter(row => {
        const confidential = row['Confidential VM'] || '';
        return confidential === 'Disabled';
    });
    // Only flag if > 50% don't have it (it's optional)
    if (noConfidentialVM.length > data.length * 0.8) {
        issues.push({
            severity: 'low',
            title: 'Confidential VM Not Used',
            count: noConfidentialVM.length,
            description: 'Consider Confidential VMs for processing sensitive data.',
            affectedResources: noConfidentialVM.slice(0, 10).map(r => `${r['Project ID']}/${r['Instance Name']}`)
        });
    }

    // Sort issues by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    // Calculate security score (100 - weighted issues)
    let score = 100;
    issues.forEach(issue => {
        const weight = issue.severity === 'critical' ? 15 :
            issue.severity === 'high' ? 10 :
                issue.severity === 'medium' ? 5 : 2;
        score -= Math.min(weight * (issue.count / data.length) * 10, weight * 3);
    });
    score = Math.max(0, Math.round(score));

    const runningInstances = data.filter(r => r['Status'] === 'RUNNING').length;
    const stoppedInstances = data.filter(r => r['Status'] === 'STOPPED').length;

    return {
        totalResources: data.length,
        runningInstances,
        stoppedInstances,
        securityScore: score,
        issues,
        byProject,
        byStatus,
        byZone
    };
}

export function getStatusChartData(byStatus: Record<string, number>): ChartData[] {
    return Object.entries(byStatus).map(([name, value], index) => ({
        name,
        value,
        color: STATUS_COLORS[name] || CHART_COLORS[index % CHART_COLORS.length]
    }));
}

export function getProjectChartData(byProject: Record<string, number>): ChartData[] {
    return Object.entries(byProject)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value], index) => ({
            name: name.length > 20 ? name.slice(0, 17) + '...' : name,
            value,
            color: CHART_COLORS[index % CHART_COLORS.length]
        }));
}

export function getZoneChartData(byZone: Record<string, number>): ChartData[] {
    return Object.entries(byZone)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value], index) => ({
            name,
            value,
            color: CHART_COLORS[index % CHART_COLORS.length]
        }));
}

export function getSeverityColor(severity: string): string {
    return SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || '#6b7280';
}

export { CHART_COLORS, STATUS_COLORS };
