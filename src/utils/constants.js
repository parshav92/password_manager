// Application constants

export const CATEGORIES = [
  { id: 'social', label: 'Social', icon: 'Users', color: '#6C8EBF' },
  { id: 'email', label: 'Email', icon: 'Mail', color: '#D4726A' },
  { id: 'banking', label: 'Banking', icon: 'Landmark', color: '#6AAF6E' },
  { id: 'work', label: 'Work', icon: 'Briefcase', color: '#D4A04A' },
  { id: 'shopping', label: 'Shopping', icon: 'ShoppingBag', color: '#C97BC4' },
  { id: 'entertainment', label: 'Entertainment', icon: 'Gamepad2', color: '#E07B54' },
  { id: 'devtech', label: 'Dev / Tech', icon: 'Code', color: '#8B7EC8' },
  { id: 'other', label: 'Other', icon: 'MoreHorizontal', color: '#9A9A9A' },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map(c => [c.id, c])
);

export const PASSWORD_CHARS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  ambiguous: 'Il1O0',
};

export const AUTO_LOCK_OPTIONS = [
  { value: 1, label: '1 minute' },
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 0, label: 'Never' },
];

export const CLIPBOARD_CLEAR_OPTIONS = [
  { value: 15, label: '15 seconds' },
  { value: 30, label: '30 seconds' },
  { value: 60, label: '60 seconds' },
  { value: 0, label: 'Never' },
];
