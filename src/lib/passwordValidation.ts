export const PASSWORD_PLACEHOLDER = 'At least 10 characters';

export const PASSWORD_RULES_MESSAGE =
  'Password must be at least 10 characters and include uppercase, lowercase, and a number.';

export function validatePassword(password: string): string | null {
  if (
    password.length < 10 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return PASSWORD_RULES_MESSAGE;
  }
  return null;
}

export function cleanupPasswordError(message: string): string {
  return /password\s+should/i.test(message) ? PASSWORD_RULES_MESSAGE : message;
}
