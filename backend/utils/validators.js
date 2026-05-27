import validator from "validator";

// Regular expressions
const nameRegex = /^[a-zA-Z\s]+$/;
const upperCaseRegex = /[A-Z]/;
const lowerCaseRegex = /[a-z]/;
const numberRegex = /[0-9]/;
const specialCharRegex = /[^A-Za-z0-9]/;

/**
 * Validates a user's full name
 * @param {string} name 
 * @returns {string|null} Error message or null if valid
 */
export const validateName = (name) => {
  if (!name || name.trim() === "") return "Full name is required";
  const trimmedName = name.trim();
  if (trimmedName.length < 3) return "Name must contain at least 3 characters";
  if (trimmedName.length > 40) return "Name must be less than 40 characters";
  if (!nameRegex.test(trimmedName)) return "Name must not contain numbers or special characters";
  return null;
};

/**
 * Validates an email address
 * @param {string} email 
 * @returns {string|null} Error message or null if valid
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === "") return "Email is required";
  if (!validator.isEmail(email.trim())) return "Please enter a valid email address";
  return null;
};

/**
 * Validates a strong password
 * @param {string} password 
 * @returns {string|null} Error message or null if valid
 */
export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!upperCaseRegex.test(password)) return "Password must contain at least one uppercase letter";
  if (!lowerCaseRegex.test(password)) return "Password must contain at least one lowercase letter";
  if (!numberRegex.test(password)) return "Password must contain at least one number";
  if (!specialCharRegex.test(password)) return "Password must contain at least one special character";
  return null;
};

/**
 * Validates OTP
 * @param {string} otp 
 * @returns {string|null} Error message or null if valid
 */
export const validateOTP = (otp) => {
  if (!otp || otp.trim() === "") return "OTP is required";
  if (!validator.isNumeric(otp.trim())) return "OTP must be numeric";
  if (otp.trim().length !== 6) return "OTP must be exactly 6 digits";
  return null;
};
