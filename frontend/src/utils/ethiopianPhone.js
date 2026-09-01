/**
 * Ethiopian Phone Number Validation and Formatting Standard
 *
 * Valid Ethiopian formats:
 * - Starting with +251 9... or +251 7... (e.g. +251 911 234 567)
 * - Starting with 09... or 07... (e.g. 0911234567)
 * - Starting with 9... or 7... (9 digits)
 */

export function validateEthiopianPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      message: 'Phone number is required.',
      formatted: '',
    };
  }

  // Remove spaces, dashes, parentheses
  const cleaned = phone.trim().replace(/[\s\-()]/g, '');

  // Case 1: +251 format (+2519xxxxxxxx or +2517xxxxxxxx)
  const intlRegex = /^\+251([79]\d{8})$/;
  // Case 2: 00251 format
  const doubleZeroRegex = /^00251([79]\d{8})$/;
  // Case 3: 251 without plus
  const noPlusRegex = /^251([79]\d{8})$/;
  // Case 4: Local format with leading 0 (09xxxxxxxx or 07xxxxxxxx)
  const localRegex = /^0([79]\d{8})$/;
  // Case 5: 9 digits starting with 9 or 7
  const shortRegex = /^([79]\d{8})$/;

  let match = cleaned.match(intlRegex) ||
    cleaned.match(doubleZeroRegex) ||
    cleaned.match(noPlusRegex) ||
    cleaned.match(localRegex) ||
    cleaned.match(shortRegex);

  if (!match) {
    return {
      isValid: false,
      message: 'Invalid Ethiopian phone number. Must start with 09, 07, or +251 (e.g. 0911 234 567).',
      formatted: phone,
    };
  }

  const core9Digits = match[1]; // e.g. "911234567"
  const formattedIntl = `+251 ${core9Digits.slice(0, 2)} ${core9Digits.slice(2, 5)} ${core9Digits.slice(5)}`;
  const formattedLocal = `0${core9Digits.slice(0, 2)} ${core9Digits.slice(2, 5)} ${core9Digits.slice(5)}`;

  return {
    isValid: true,
    message: '',
    core: core9Digits,
    formatted: formattedIntl,
    formattedLocal: formattedLocal,
    rawE164: `+251${core9Digits}`,
  };
}

export function formatEthiopianPhoneInput(input) {
  if (!input) return '';
  const cleaned = input.replace(/[^\d+]/g, '');
  return cleaned;
}
