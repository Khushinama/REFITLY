export const validateName = (name) => {
  if (!name || name.trim() === "") return "Full name is required";
  const trimmed = name.trim();
  if (trimmed.length < 3) return "Name must contain at least 3 characters";
  if (trimmed.length > 40) return "Name must be less than 40 characters";
  if (!/^[a-zA-Z\s]+$/.test(trimmed)) return "Name must not contain numbers or special characters";
  return "";
};

export const validateEmail = (email) => {
  if (!email || email.trim() === "") return "Email is required";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim().toLowerCase())) return "Please enter a valid email address";
  return "";
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  
  const rules = [
    { check: password.length >= 8, message: "minimum 8 characters" },
    { check: /[A-Z]/.test(password), message: "uppercase letter" },
    { check: /[a-z]/.test(password), message: "lowercase letter" },
    { check: /[0-9]/.test(password), message: "number" },
    { check: /[^A-Za-z0-9]/.test(password), message: "special character" }
  ];

  const failedRules = rules.filter(r => !r.check).map(r => r.message);
  
  if (failedRules.length > 0) {
    return `Password must contain ${failedRules.join(", ")}`;
  }
  return "";
};

export const checkPasswordStrength = (password) => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
};

export const validateOTP = (otp) => {
  if (!otp || otp.trim() === "") return "OTP is required";
  if (!/^\d{6}$/.test(otp.trim())) return "OTP must be exactly 6 digits";
  return "";
};
