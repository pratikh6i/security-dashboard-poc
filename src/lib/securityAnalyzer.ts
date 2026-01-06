import { Finding, SecurityMetrics, SEVERITY_COLORS } from '@/types';

export function analyzeFindings(findings: Finding[]): SecurityMetrics {
    const bySeverity = {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
        INFO: 0
    };

    const byResourceType: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byProject: Record<string, number> = {};
    const byLocation: Record<string, number> = {};
    const categorySeverity: Record<string, string> = {};

    findings.forEach(finding => {
        // Count by severity
        const severity = (finding.finding_severity || 'INFO').toUpperCase() as keyof typeof bySeverity;
        if (severity in bySeverity) {
            bySeverity[severity]++;
        }

        // Count by resource type
        const resourceType = extractResourceType(finding.resource_type || finding.resource_name || '');
        byResourceType[resourceType] = (byResourceType[resourceType] || 0) + 1;

        // Count by category
        const category = finding.finding_category || 'Unknown';
        byCategory[category] = (byCategory[category] || 0) + 1;
        categorySeverity[category] = finding.finding_severity || 'INFO';

        // Count by project
        const project = finding.resource_project || 'Unknown';
        byProject[project] = (byProject[project] || 0) + 1;

        // Count by location
        const location = finding.resource_location || 'global';
        byLocation[location] = (byLocation[location] || 0) + 1;
    });

    // Calculate security score
    const securityScore = calculateSecurityScore(bySeverity, findings.length);

    // Get top categories sorted by count
    const topCategories = Object.entries(byCategory)
        .map(([name, count]) => ({
            name,
            count,
            severity: categorySeverity[name] || 'INFO'
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    return {
        totalFindings: findings.length,
        bySeverity,
        byResourceType,
        byCategory,
        byProject,
        byLocation,
        securityScore,
        topCategories
    };
}

function extractResourceType(resourceTypeOrName: string): string {
    // Extract from SCC format: "compute.googleapis.com/Instance" -> "Instance"
    if (resourceTypeOrName.includes('/')) {
        const parts = resourceTypeOrName.split('/');
        return parts[parts.length - 1] || 'Unknown';
    }
    return resourceTypeOrName || 'Unknown';
}

function calculateSecurityScore(
    bySeverity: SecurityMetrics['bySeverity'],
    total: number
): number {
    if (total === 0) return 100;

    // Weighted deductions
    const weights = {
        CRITICAL: 25,
        HIGH: 15,
        MEDIUM: 5,
        LOW: 1,
        INFO: 0
    };

    let deduction = 0;
    deduction += bySeverity.CRITICAL * weights.CRITICAL;
    deduction += bySeverity.HIGH * weights.HIGH;
    deduction += bySeverity.MEDIUM * weights.MEDIUM;
    deduction += bySeverity.LOW * weights.LOW;

    // Normalize and cap
    const score = Math.max(0, 100 - Math.min(deduction, 100));
    return Math.round(score);
}

export function getSeverityColor(severity: string): string {
    const sev = severity.toUpperCase() as keyof typeof SEVERITY_COLORS;
    return SEVERITY_COLORS[sev] || SEVERITY_COLORS.INFO;
}

export function getSeverityChartData(bySeverity: SecurityMetrics['bySeverity']) {
    return Object.entries(bySeverity)
        .filter(([, count]) => count > 0)
        .map(([severity, count]) => ({
            name: severity,
            value: count,
            color: getSeverityColor(severity)
        }));
}

export function getResourceTypeChartData(byResourceType: Record<string, number>) {
    return Object.entries(byResourceType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value], index) => ({
            name,
            value,
            color: getChartColor(index)
        }));
}

export function getProjectChartData(byProject: Record<string, number>) {
    return Object.entries(byProject)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, value], index) => ({
            name: name.length > 20 ? name.substring(0, 20) + '...' : name,
            value,
            color: getChartColor(index)
        }));
}

export const CHART_COLORS = [
    '#4285f4', '#34a853', '#fbbc04', '#ea4335',
    '#673ab7', '#00bcd4', '#ff5722', '#795548'
];

function getChartColor(index: number): string {
    return CHART_COLORS[index % CHART_COLORS.length];
}
