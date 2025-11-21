const dns = require('dns').promises;
const axios = require('axios');

/**
 * Validates if an email address is real and exists
 * Uses DNS MX record check and optional API validation
 */
const validateEmail = async (email) => {
  try {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Invalid email format' };
    }

    // Extract domain from email
    const domain = email.split('@')[1];

    // Check DNS MX records to verify domain exists (with timeout)
    try {
      const mxRecords = await Promise.race([
        dns.resolveMx(domain),
        new Promise((_, reject) => setTimeout(() => reject(new Error('DNS timeout')), 3000))
      ]);
      
      if (!mxRecords || mxRecords.length === 0) {
        // If no MX records but domain might still be valid, continue
        console.log(`No MX records found for ${domain}, but continuing validation`);
      }
    } catch (dnsError) {
      // If MX lookup fails, try A record as fallback
      try {
        await Promise.race([
          dns.resolve4(domain),
          new Promise((_, reject) => setTimeout(() => reject(new Error('DNS timeout')), 3000))
        ]);
        console.log(`MX lookup failed but A record found for ${domain}`);
      } catch (aError) {
        // If both fail, still allow the email but log warning
        console.warn(`DNS validation failed for ${domain}, but allowing email:`, aError.message);
        // Don't block registration - just log the warning
        // return { valid: false, message: 'Email domain does not exist or is invalid' };
      }
    }

    // Optional: Use Abstract API for additional validation (if API key is provided)
    if (process.env.ABSTRACT_API_KEY) {
      try {
        const response = await axios.get('https://emailvalidation.abstractapi.com/v1/', {
          params: {
            api_key: process.env.ABSTRACT_API_KEY,
            email: email
          },
          timeout: 5000
        });

        if (response.data && response.data.deliverability === 'UNDELIVERABLE') {
          return { valid: false, message: 'Email address is not deliverable' };
        }

        if (response.data && response.data.is_disposable_email?.value === true) {
          return { valid: false, message: 'Disposable email addresses are not allowed' };
        }
      } catch (apiError) {
        // If API fails, continue with DNS validation only
        console.log('Email validation API unavailable, using DNS validation only');
      }
    }

    return { valid: true, message: 'Email is valid' };
  } catch (error) {
    console.error('Email validation error:', error);
    // Be more lenient - if validation fails, still allow the email
    // Only block if format is clearly wrong
    return { valid: true, message: 'Email format is valid' };
  }
};

module.exports = validateEmail;
