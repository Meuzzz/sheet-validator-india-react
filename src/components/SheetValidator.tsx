import React, { useState, useRef, useEffect } from 'react';
import { ValidatorConfig, ValidationResult, ValidationError } from '../validators/types';
import { useSheetValidator } from '../hooks/useSheetValidator';
import { validateFile } from '../utils/fileParser';
import { SHEET_VALIDATOR_STYLES } from './styles/SheetValidator.css';

export type StylingMode = 'default' | 'tailwind' | 'unstyled';

export interface SheetValidatorProps {
  validatorConfig: ValidatorConfig;
  onValidationComplete: (result: ValidationResult) => void;
  onError?: (error: Error) => void;
  showPreview?: boolean;
  maxFileSize?: number;
  theme?: 'light' | 'dark';
  columnNames?: Record<number, string>;
  title?: string;
  subtitle?: string;
  styling?: StylingMode;
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

const TAILWIND_CLASSES = {
  container: 'max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg font-sans',
  title: 'text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2',
  subtitle: 'text-sm text-gray-500 dark:text-gray-400 mb-6',
  uploadArea: 'border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-10 text-center cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20',
  uploadAreaActive: 'border-blue-500 bg-blue-100 dark:bg-blue-900/30',
  uploadIcon: 'text-5xl mb-3',
  uploadText: 'text-base font-medium text-gray-700 dark:text-gray-300 my-2',
  uploadHint: 'text-sm text-gray-500 dark:text-gray-400 mt-2',
  fileInput: 'hidden',
  progressContainer: 'my-6',
  progressLabel: 'text-sm font-medium mb-2 flex justify-between text-gray-700 dark:text-gray-300',
  progressBar: 'w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
  progressFill: 'h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300',
  alertSuccess: 'p-3 rounded-lg my-4 text-sm flex items-center gap-3 bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  alertError: 'p-3 rounded-lg my-4 text-sm flex items-center gap-3 bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  results: 'mt-8',
  resultsHeader: 'flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700',
  resultsTitle: 'text-lg font-semibold text-gray-800 dark:text-gray-100',
  resultsSummary: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6',
  summaryCard: 'p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg',
  summaryLabel: 'text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1',
  summaryValue: 'text-2xl font-bold text-gray-800 dark:text-gray-100',
  summaryValueSuccess: 'text-2xl font-bold text-green-600 dark:text-green-400',
  summaryValueError: 'text-2xl font-bold text-red-600 dark:text-red-400',
  table: 'w-full border-collapse mt-4 text-sm',
  tableHead: 'bg-gray-50 dark:bg-gray-900',
  tableTh: 'p-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b-2 border-gray-200 dark:border-gray-700',
  tableTd: 'p-3 border-b border-gray-200 dark:border-gray-700',
  tableRowHover: 'hover:bg-gray-50 dark:hover:bg-gray-900/50',
  errorRow: 'font-medium',
  errorValue: 'font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm',
  errorMessage: 'text-red-600 dark:text-red-400 font-medium',
  pagination: 'flex justify-center items-center gap-2 mt-5',
  paginationButton: 'px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg cursor-pointer transition-all hover:bg-blue-500 hover:text-white hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
  paginationInfo: 'text-sm text-gray-500 dark:text-gray-400',
  sectionTitle: 'mt-6 mb-3 text-base font-semibold text-gray-800 dark:text-gray-100'
};

const DEFAULT_CLASSES = {
  container: 'sv-container',
  title: 'sv-title',
  subtitle: 'sv-subtitle',
  uploadArea: 'sv-upload-area',
  uploadAreaActive: 'active',
  uploadIcon: 'sv-upload-icon',
  uploadText: 'sv-upload-text',
  uploadHint: 'sv-upload-hint',
  fileInput: 'sv-file-input',
  progressContainer: 'sv-progress-container',
  progressLabel: 'sv-progress-label',
  progressBar: 'sv-progress-bar',
  progressFill: 'sv-progress-fill',
  alertSuccess: 'sv-alert sv-alert-success',
  alertError: 'sv-alert sv-alert-error',
  results: 'sv-results',
  resultsHeader: 'sv-results-header',
  resultsTitle: 'sv-results-title',
  resultsSummary: 'sv-results-summary',
  summaryCard: 'sv-summary-card',
  summaryLabel: 'sv-summary-label',
  summaryValue: 'sv-summary-value',
  summaryValueSuccess: 'sv-summary-value',
  summaryValueError: 'sv-summary-value',
  table: 'sv-errors-table',
  tableHead: '',
  tableTh: '',
  tableTd: '',
  tableRowHover: '',
  errorRow: 'sv-error-row',
  errorValue: 'sv-error-value',
  errorMessage: 'sv-error-message',
  pagination: 'sv-pagination',
  paginationButton: 'sv-pagination-button',
  paginationInfo: 'sv-pagination-info',
  sectionTitle: ''
};

let stylesInjected = false;

const injectStyles = () => {
  if (stylesInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = SHEET_VALIDATOR_STYLES;
  style.setAttribute('data-sv-styles', '');
  document.head.appendChild(style);
  stylesInjected = true;
};

export const SheetValidator: React.FC<SheetValidatorProps> = ({
  validatorConfig,
  onValidationComplete,
  onError,
  showPreview = true,
  maxFileSize = 5 * 1024 * 1024,
  theme = 'light',
  columnNames = {},
  title = '📄 Sheet Validator',
  subtitle = 'Upload and validate your CSV or Excel files',
  styling = 'default',
}) => {
  const { validateFile: validateFileHandler, loading, progress, result } = useSheetValidator(maxFileSize);
  const [isDragging, setIsDragging] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({ currentPage: 1, itemsPerPage: 10 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (styling === 'default') injectStyles();
  }, [styling]);

  const cls = styling === 'tailwind' ? TAILWIND_CLASSES : styling === 'default' ? DEFAULT_CLASSES : {} as typeof DEFAULT_CLASSES;

  const getClass = (key: keyof typeof DEFAULT_CLASSES, extra?: string) => {
    if (styling === 'unstyled') return extra || '';
    return `${cls[key] || ''} ${extra || ''}`.trim();
  };

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;
    const fileError = validateFile(file, maxFileSize);
    if (fileError) {
      onError?.(new Error(fileError));
      return;
    }
    try {
      const validationResult = await validateFileHandler(file, validatorConfig);
      onValidationComplete(validationResult);
      setPagination({ currentPage: 1, itemsPerPage: 10 });
    } catch (error) {
      if (error instanceof Error) onError?.(error);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files?.length) handleFileSelect(e.currentTarget.files[0]);
  };

  const getPaginatedErrors = (): ValidationError[] => {
    if (!result?.errors) return [];
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    return result.errors.slice(start, start + pagination.itemsPerPage);
  };

  const totalPages = result?.errors ? Math.ceil(result.errors.length / pagination.itemsPerPage) : 1;

  return (
    <div className={getClass('container')} data-theme={theme}>
      <h1 className={getClass('title')}>{title}</h1>
      <p className={getClass('subtitle')}>{subtitle}</p>

      <div
        className={getClass('uploadArea', isDragging ? cls.uploadAreaActive : '')}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <div className={getClass('uploadIcon')}>📁</div>
        <div className={getClass('uploadText')}>{loading ? 'Processing...' : 'Drag and drop your file here'}</div>
        <div className={getClass('uploadHint')}>or click to select a file</div>
        <input
          ref={fileInputRef}
          type="file"
          className={getClass('fileInput')}
          accept=".csv,.xlsx,.xls"
          onChange={handleInputChange}
          disabled={loading}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {loading && progress > 0 && (
        <div className={getClass('progressContainer')}>
          <div className={getClass('progressLabel')}>
            <span>Processing file...</span>
            <span>{progress}%</span>
          </div>
          <div className={getClass('progressBar')}>
            <div className={getClass('progressFill')} style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {result && (
        <div className={result.success ? getClass('alertSuccess') : getClass('alertError')} role={result.success ? 'status' : 'alert'}>
          <span>{result.success ? '✓' : '✕'}</span>
          <span>
            {result.success
              ? `${result.message} - All ${result.totalRows} rows are valid.`
              : `${result.message} - Found ${result.invalidRows} invalid row(s) out of ${result.totalRows}.`}
          </span>
        </div>
      )}

      {showPreview && result && (
        <div className={getClass('results')}>
          <div className={getClass('resultsHeader')}>
            <h3 className={getClass('resultsTitle')}>Validation Results</h3>
          </div>

          <div className={getClass('resultsSummary')}>
            <div className={getClass('summaryCard')}>
              <div className={getClass('summaryLabel')}>Total Rows</div>
              <div className={getClass('summaryValue')}>{result.totalRows}</div>
            </div>
            <div className={getClass('summaryCard')}>
              <div className={getClass('summaryLabel')}>Invalid Rows</div>
              <div className={result.invalidRows > 0 ? getClass('summaryValueError') : getClass('summaryValueSuccess')}>{result.invalidRows}</div>
            </div>
            <div className={getClass('summaryCard')}>
              <div className={getClass('summaryLabel')}>Valid Rows</div>
              <div className={getClass('summaryValueSuccess')}>{result.totalRows - result.invalidRows}</div>
            </div>
            <div className={getClass('summaryCard')}>
              <div className={getClass('summaryLabel')}>Error Count</div>
              <div className={getClass('summaryValue')}>{result.errors.length}</div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <>
              <h4 className={getClass('sectionTitle')}>Error Details</h4>
              <table className={getClass('table')}>
                <thead className={getClass('tableHead')}>
                  <tr>
                    <th className={getClass('tableTh')}>Row</th>
                    <th className={getClass('tableTh')}>Column</th>
                    <th className={getClass('tableTh')}>Value</th>
                    <th className={getClass('tableTh')}>Error Message</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedErrors().map((error, i) => (
                    <tr key={i} className={getClass('tableRowHover')}>
                      <td className={getClass('tableTd', cls.errorRow)}>{error.row}</td>
                      <td className={getClass('tableTd')}>{error.column}</td>
                      <td className={getClass('tableTd')}><code className={getClass('errorValue')}>{String(error.value)}</code></td>
                      <td className={getClass('tableTd', cls.errorMessage)}>{error.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className={getClass('pagination')}>
                  <button
                    className={getClass('paginationButton')}
                    onClick={() => setPagination(p => ({ ...p, currentPage: Math.max(1, p.currentPage - 1) }))}
                    disabled={pagination.currentPage === 1}
                  >
                    ← Previous
                  </button>
                  <span className={getClass('paginationInfo')}>Page {pagination.currentPage} of {totalPages}</span>
                  <button
                    className={getClass('paginationButton')}
                    onClick={() => setPagination(p => ({ ...p, currentPage: Math.min(totalPages, p.currentPage + 1) }))}
                    disabled={pagination.currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SheetValidator;