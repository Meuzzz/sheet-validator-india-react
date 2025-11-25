/**
 * File parsing utilities for CSV and Excel files
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ParsedRow } from '../validators/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];

export interface ParseFileOptions {
  maxFileSize?: number;
  skipHeader?: boolean;
}

/**
 * Parses CSV file content
 */
export const parseCSV = (content: string): ParsedRow[] => {
  const result = Papa.parse(content, {
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (result.errors && result.errors.length > 0) {
    throw new Error(`CSV Parse Error: ${result.errors[0].message}`);
  }

  return result.data as ParsedRow[];
};

/**
 * Parses Excel file (XLSX/XLS)
 */
export const parseExcel = (arrayBuffer: ArrayBuffer): ParsedRow[] => {
  try {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheet = workbook.SheetNames[0];

    if (!firstSheet) {
      throw new Error('No sheets found in Excel file');
    }

    const worksheet = workbook.Sheets[firstSheet];
    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
    });

    return data as ParsedRow[];
  } catch (error) {
    throw new Error(`Excel Parse Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Main file parser that handles both CSV and Excel
 */
export const parseFile = async (
  file: File,
  options: ParseFileOptions = {}
): Promise<ParsedRow[]> => {
  const { maxFileSize = MAX_FILE_SIZE } = options;

  // Validate file size
  if (file.size > maxFileSize) {
    throw new Error(
      `File size exceeds maximum allowed size of ${Math.round(maxFileSize / 1024 / 1024)}MB`
    );
  }

  // Validate file extension
  const ext = getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`Unsupported file type: ${ext}. Allowed: .csv, .xlsx, .xls`);
  }

  // Parse based on file type
  if (ext === '.csv') {
    const content = await file.text();
    return parseCSV(content);
  } else {
    const arrayBuffer = await file.arrayBuffer();
    return parseExcel(arrayBuffer);
  }
};

/**
 * Extracts file extension
 */
export const getFileExtension = (filename: string): string => {
  const match = filename.match(/\.[^/.]+$/);
  return match ? match[0].toLowerCase() : '';
};

/**
 * Validates file before parsing
 */
export const validateFile = (file: File, maxFileSize = MAX_FILE_SIZE): string | null => {
  if (!file) {
    return 'No file provided';
  }

  if (file.size === 0) {
    return 'File is empty';
  }

  if (file.size > maxFileSize) {
    return `File exceeds maximum size of ${Math.round(maxFileSize / 1024 / 1024)}MB`;
  }

  const ext = getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `Unsupported file type: ${ext}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`;
  }

  return null; // No errors
};