/**
 * Validates Pakistani mobile phone numbers
 * Format: 03XX-XXXXXXX (11 digits, starting with 03)
 * Valid prefixes: 0300-0399, 0400-0499, 0500-0599, 0600-0699, 0700-0799, 0800-0899, 0900-0999
 */
const validatePakistaniPhone = (phone) => {
  if (!phone) {
    return { valid: false, message: 'Phone number is required' };
  }

  // Remove any spaces, dashes, or other characters
  const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Check if it's exactly 11 digits
  if (!/^\d{11}$/.test(cleanedPhone)) {
    return { valid: false, message: 'Phone number must be exactly 11 digits' };
  }

  // Check if it starts with 03 (Pakistani mobile prefix)
  if (!cleanedPhone.startsWith('03')) {
    return { valid: false, message: 'Pakistani mobile numbers must start with 03' };
  }

  // Extract the prefix (first 4 digits: 03XX)
  const prefix = cleanedPhone.substring(0, 4);
  const prefixNumber = parseInt(prefix);

  // Validate prefix range (0300-0399, 0400-0499, etc.)
  // Pakistani mobile prefixes are in ranges: 0300-0399, 0400-0499, 0500-0599, 0600-0699, 0700-0799, 0800-0899, 0900-0999
  const validPrefixes = [
    (prefixNumber >= 300 && prefixNumber <= 399),  // 0300-0399
    (prefixNumber >= 400 && prefixNumber <= 499),  // 0400-0499
    (prefixNumber >= 500 && prefixNumber <= 599),  // 0500-0599
    (prefixNumber >= 600 && prefixNumber <= 699),  // 0600-0699
    (prefixNumber >= 700 && prefixNumber <= 799),  // 0700-0799
    (prefixNumber >= 800 && prefixNumber <= 899),  // 0800-0899
    (prefixNumber >= 900 && prefixNumber <= 999),  // 0900-0999
  ];

  if (!validPrefixes.some(valid => valid)) {
    return { valid: false, message: 'Invalid Pakistani mobile number prefix' };
  }

  return { valid: true, message: 'Phone number is valid', cleaned: cleanedPhone };
};

module.exports = validatePakistaniPhone;
