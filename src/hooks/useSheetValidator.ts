import { useState, useCallback } from 'react';
import { ValidatorConfig, ValidationResult, ValidationError } from '../validators/types';
import { parseFile, validateFile } from '../utils/fileParser';
import { validateSheet } from '../utils/validatorEngine';

export interface UseSheetValidatorReturn {
  validateFile: (file: File, config: ValidatorConfig) => Promise<ValidationResult>;
  loading: boolean;
  errors: ValidationError[];
  progress: number;
  result: ValidationResult | null;
  reset: () => void;
  setErrors: (errors: ValidationError[]) => void;
}

export const useSheetValidator = (maxFileSize = 5 * 1024 * 1024): UseSheetValidatorReturn => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const validateFileHandler = useCallback(
    async (file: File, config: ValidatorConfig): Promise<ValidationResult> => {
      setLoading(true);
      setProgress(0);
      setErrors([]);
      setResult(null);

      try {
        const fileError = validateFile(file, maxFileSize);
        if (fileError) {
          throw new Error(fileError);
        }

        setProgress(25);

        const rows = await parseFile(file, { maxFileSize });
        setProgress(60);

        const validationResult = validateSheet(rows, config);
        setProgress(100);

        setErrors(validationResult.errors);
        setResult(validationResult);

        return validationResult;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorResult: ValidationResult = {
          success: false,
          message: errorMessage,
          totalRows: 0,
          invalidRows: 0,
          errors: [],
          summary: { byColumn: {}, byType: {} },
        };

        setErrors([]);
        setResult(errorResult);
        setProgress(0);

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [maxFileSize]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setErrors([]);
    setProgress(0);
    setResult(null);
  }, []);

  return {
    validateFile: validateFileHandler,
    loading,
    errors,
    progress,
    result,
    reset,
    setErrors,
  };
};