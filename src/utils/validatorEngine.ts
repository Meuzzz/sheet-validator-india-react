import {
  ValidatorConfig,
  ValidationError,
  ValidationResult,
  ValidationSummary,
  ParsedRow,
} from '../validators/types';

export const validateRow = (
  row: ParsedRow,
  validatorConfig: ValidatorConfig,
  rowIndex: number
): ValidationError[] => {
  const errors: ValidationError[] = [];

  for (const [colIndexStr, validatorFn] of Object.entries(validatorConfig)) {
    const colIndex = Number(colIndexStr);
    const value = row[colIndex];

    try {
      const result = validatorFn(value);

      if (!result.valid) {
        errors.push({
          row: rowIndex,
          column: colIndex,
          value,
          error: result.message,
        });
      }
    } catch (error) {
      errors.push({
        row: rowIndex,
        column: colIndex,
        value,
        error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  return errors;
};

export const validateAllRows = (
  rows: ParsedRow[],
  validatorConfig: ValidatorConfig,
  skipHeaderRow = true
): ValidationError[] => {
  const allErrors: ValidationError[] = [];
  const startIndex = skipHeaderRow ? 1 : 0;

  for (let i = startIndex; i < rows.length; i++) {
    const rowErrors = validateRow(rows[i], validatorConfig, i + 1);
    allErrors.push(...rowErrors);
  }

  return allErrors;
};

export const generateSummary = (errors: ValidationError[]): ValidationSummary => {
  const byColumn: Record<number, number> = {};
  const byType: Record<string, number> = {};

  errors.forEach((error) => {
    byColumn[error.column] = (byColumn[error.column] || 0) + 1;

    const errorType = error.error.split('(')[0].trim() || 'Unknown';
    byType[errorType] = (byType[errorType] || 0) + 1;
  });

  return { byColumn, byType };
};

export const formatValidationResult = (
  errors: ValidationError[],
  totalRows: number
): ValidationResult => {
  const invalidRows = new Set(errors.map((e) => e.row)).size;
  const summary = generateSummary(errors);

  return {
    success: errors.length === 0,
    message: errors.length === 0 ? 'Sheet validated successfully' : 'Validation failed',
    totalRows,
    invalidRows,
    errors,
    summary,
  };
};

export const validateSheet = (
  rows: ParsedRow[],
  validatorConfig: ValidatorConfig,
  skipHeaderRow = true
): ValidationResult => {
  if (!rows || rows.length === 0) {
    return formatValidationResult([], 0);
  }

  const errors = validateAllRows(rows, validatorConfig, skipHeaderRow);
  return formatValidationResult(errors, rows.length);
};