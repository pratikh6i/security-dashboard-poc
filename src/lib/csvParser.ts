import Papa from 'papaparse';
import { Finding, CSVParseResult, ParseError } from '@/types';

// Required columns for SCC-format CSV
const REQUIRED_COLUMNS = [
    'finding_category',
    'finding_severity',
    'resource_name',
    'resource_type',
    'resource_project'
];

export function parseCSV(file: File): Promise<CSVParseResult> {
    return new Promise((resolve, reject) => {
        Papa.parse<Finding>(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim().toLowerCase().replace(/ /g, '_'),
            complete: (results) => {
                const errors: ParseError[] = [];

                // Transform headers to match our expected format
                const data = results.data.map(row => {
                    const transformed: Record<string, string> = {};
                    Object.entries(row).forEach(([key, value]) => {
                        transformed[key] = value?.toString() || '';
                    });
                    return transformed as unknown as Finding;
                });

                // Validate required columns exist
                if (data.length > 0) {
                    const columns = Object.keys(data[0]).map(c => c.toLowerCase());
                    const missingColumns = REQUIRED_COLUMNS.filter(
                        col => !columns.includes(col.toLowerCase())
                    );

                    if (missingColumns.length > 0) {
                        errors.push({
                            type: 'warning',
                            message: `Missing recommended columns: ${missingColumns.join(', ')}. Using legacy format.`
                        });
                    }
                }

                // Filter out empty rows
                const filteredData = data.filter(row => {
                    const values = Object.values(row);
                    return values.some(v => v && v.toString().trim() !== '');
                });

                if (filteredData.length === 0) {
                    errors.push({
                        type: 'error',
                        message: 'No valid data rows found in CSV file'
                    });
                }

                // Add any parse errors
                results.errors.forEach(err => {
                    errors.push({
                        type: 'warning',
                        message: err.message,
                        row: err.row
                    });
                });

                resolve({ data: filteredData, errors });
            },
            error: (error) => {
                reject(new Error(`Failed to parse CSV: ${error.message}`));
            }
        });
    });
}

export function validateCSVData(data: Finding[]): ParseError[] {
    const errors: ParseError[] = [];

    data.forEach((row, index) => {
        // Check for required fields (be flexible for legacy format)
        if (!row.finding_category && !row.category) {
            errors.push({
                type: 'warning',
                message: `Row ${index + 2}: Missing finding category`,
                row: index + 2
            });
        }

        if (!row.finding_severity && !row.severity) {
            errors.push({
                type: 'warning',
                message: `Row ${index + 2}: Missing severity level`,
                row: index + 2
            });
        }
    });

    return errors;
}
