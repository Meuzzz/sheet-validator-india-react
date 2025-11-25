/**
 * Built-in validators for Indian data formats
 */

import { ValidatorFunction, ValidatorResult } from './types';

/**
 * Validates Indian Aadhaar number format
 * Format: 12 digits starting with 2-9
 */
export const aadhaarValidator: ValidatorFunction = (value): ValidatorResult => {
  const cleaned = String(value || '').replace(/\s+/g, '').trim();
  const isValid = /^[2-9]\d{11}$/.test(cleaned);

  return {
    valid: isValid,
    message: isValid ? 'Valid Aadhaar' : 'Invalid Aadhaar number (12 digits, starts with 2-9)',
  };
};

/**
 * Validates Indian phone number format
 * Format: 10 digits starting with 6-9
 */
export const phoneValidator: ValidatorFunction = (value): ValidatorResult => {
  const cleaned = String(value || '').replace(/\s+/g, '').trim();
  const isValid = /^[6-9]\d{9}$/.test(cleaned);

  return {
    valid: isValid,
    message: isValid
      ? 'Valid phone number'
      : 'Invalid Indian phone number (10 digits, starts with 6-9)',
  };
};

/**
 * Validates Indian PIN code format
 * Format: 6 digits
 */
export const pinCodeValidator: ValidatorFunction = (value): ValidatorResult => {
  const cleaned = String(value || '').replace(/\s+/g, '').trim();
  const isValid = /^\d{6}$/.test(cleaned);

  return {
    valid: isValid,
    message: isValid ? 'Valid PIN code' : 'Invalid PIN code (6 digits)',
  };
};

/**
 * Validates email address format
 */
export const emailValidator: ValidatorFunction = (value): ValidatorResult => {
  const cleaned = String(value || '').trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned);

  return {
    valid: isValid,
    message: isValid ? 'Valid email' : 'Invalid email format',
  };
};

/**
 * Validates non-empty string
 */
export const requiredValidator: ValidatorFunction = (value): ValidatorResult => {
  const isValid = value != null && String(value).trim().length > 0;

  return {
    valid: isValid,
    message: isValid ? 'Field is required' : 'Field cannot be empty',
  };
};

/**
 * Validates numeric value
 */
export const numericValidator: ValidatorFunction = (value): ValidatorResult => {
  const isValid = !isNaN(Number(value)) && value !== '';

  return {
    valid: isValid,
    message: isValid ? 'Valid number' : 'Value must be numeric',
  };
};

/**
 * All available built-in validators
 */
export const VALIDATORS = {
  aadhaar: aadhaarValidator,
  phone: phoneValidator,
  pinCode: pinCodeValidator,
  email: emailValidator,
  required: requiredValidator,
  numeric: numericValidator,
} as const;

export type ValidatorName = keyof typeof VALIDATORS;