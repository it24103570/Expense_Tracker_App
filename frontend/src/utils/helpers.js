/**
 * Format a number as LKR currency
 */
export const formatCurrency = (amount) => {
  return `LKR ${Number(amount).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format a date string to "14 Apr" style
 */
export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });
};

/**
 * Format a date string to "April 2026" style
 */
export const formatMonthYear = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Get current month name + year
 */
export const currentMonthLabel = () => {
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Get user's join date in readable format
 */
export const formatJoinDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
