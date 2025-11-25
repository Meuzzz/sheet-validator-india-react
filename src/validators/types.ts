/**
 * Type definitions for validators and validation results
 */

export interface ValidatorResult {
  valid: boolean;
  message: string;
}

export type ValidatorFunction = (value: any) => ValidatorResult;

export interface ValidationError {
  row: number;
  column: number;
  value: any;
  error: string;
  columnName?: string;
}

export interface ValidationSummary {
  byColumn: Record<number, number>;
  byType: Record<string, number>;
}

export interface ValidationResult {
  success: boolean;
  message: string;
  totalRows: number;
  invalidRows: number;
  errors: ValidationError[];
  summary: ValidationSummary;
}

export interface ValidatorConfig {
  [columnIndex: number]: ValidatorFunction;
}

export interface ParsedRow {
  [key: string | number]: any;
}