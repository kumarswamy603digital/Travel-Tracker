/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate country code format (2 uppercase letters)
 */
export function isValidCountryCode(code) {
  if (typeof code !== 'string') return false;
  return /^[A-Z]{2}$/.test(code.toUpperCase());
}

/**
 * Sanitize string input
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .slice(0, 255) // Limit length
    .replace(/[<>]/g, ''); // Remove potential HTML
}

/**
 * Escape HTML entities
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

export default {
  isValidEmail,
  isValidCountryCode,
  sanitizeString,
  escapeHtml,
};
