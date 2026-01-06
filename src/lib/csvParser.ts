import Papa from 'papaparse';
import { ResourceData, ParseError } from '@/types';

export interface CSVParseResult {
    data: ResourceData[];
    errors: ParseError[];
    meta: {
        fields: string[];
        rowCount: number;
    };
}

export function parseCSV(file: File): Promise<CSVParseResult> {
    return new Promise((resolve, reject) => {
        Papa.parse<ResourceData>(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            complete: (results) => {
                const errors: ParseError[] = results.errors.map(err => ({
                    type: err.type,
                    message: err.message,
                    row: err.row
                }));

                // Filter out completely empty rows
                const validData = results.data.filter(row => {
                    return Object.values(row).some(val => val && val.toString().trim() !== '');
                });

                resolve({
                    data: validData,
                    errors,
                    meta: {
                        fields: results.meta.fields || [],
                        rowCount: validData.length
                    }
                });
            },
            error: (error) => {
                reject(new Error(`Failed to parse CSV: ${error.message}`));
            }
        });
    });
}

export function validateCSVData(data: ResourceData[]): ParseError[] {
    const errors: ParseError[] = [];

    if (data.length === 0) {
        errors.push({
            type: 'EmptyData',
            message: 'The CSV file contains no data rows.'
        });
        return errors;
    }

    // Check for required columns
    const requiredColumns = ['Project ID', 'Instance Name', 'Status'];
    const firstRow = data[0];

    for (const col of requiredColumns) {
        if (!(col in firstRow)) {
            errors.push({
                type: 'MissingColumn',
                message: `Required column "${col}" is missing from the CSV.`
            });
        }
    }

    return errors;
}
