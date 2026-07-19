// Password strength scoring algorithm

/**
 * Calculate password strength score (0-100) and label
 * @param {string} password
 * @returns {{ score: number, label: string, color: string }}
 */
export function calculateStrength(password) {
  if (!password) return { score: 0, label: 'None', color: 'var(--text-muted)' };

  let score = 0;

  // Length scoring (up to 30 points)
  score += Math.min(password.length * 2, 30);

  // Character variety (up to 40 points)
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  const varietyCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  score += varietyCount * 10;

  // Bonus for mixing (up to 15 points)
  if (varietyCount >= 3 && password.length >= 10) score += 10;
  if (varietyCount === 4 && password.length >= 12) score += 5;

  // Penalty for common patterns
  if (/^[a-zA-Z]+$/.test(password)) score -= 10;      // Letters only
  if (/^[0-9]+$/.test(password)) score -= 15;          // Numbers only
  if (/(.)\1{2,}/.test(password)) score -= 10;         // Repeated chars (aaa)
  if (/^(123|abc|qwerty|password)/i.test(password)) score -= 20; // Common starts

  // Bonus for length
  if (password.length >= 16) score += 10;
  if (password.length >= 20) score += 5;

  // Clamp
  score = Math.max(0, Math.min(100, score));

  // Map to labels
  if (score < 25) return { score, label: 'Weak', color: 'var(--danger)' };
  if (score < 50) return { score, label: 'Fair', color: 'var(--warning)' };
  if (score < 75) return { score, label: 'Good', color: '#6C8EBF' };
  return { score, label: 'Strong', color: 'var(--success)' };
}
