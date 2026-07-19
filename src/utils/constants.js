// Application constants

export const CATEGORIES = [
  { id: 'social', label: 'Social', icon: 'Users', color: '#3B82A0' },
  { id: 'email', label: 'Email', icon: 'Mail', color: '#C45C52' },
  { id: 'banking', label: 'Banking', icon: 'Landmark', color: '#2F9E5F' },
  { id: 'work', label: 'Work', icon: 'Briefcase', color: '#C4892A' },
  { id: 'shopping', label: 'Shopping', icon: 'ShoppingBag', color: '#B85A9A' },
  { id: 'entertainment', label: 'Entertainment', icon: 'Gamepad2', color: '#D06B45' },
  { id: 'devtech', label: 'Dev / Tech', icon: 'Code', color: '#0F766E' },
  { id: 'other', label: 'Other', icon: 'MoreHorizontal', color: '#8A9AA3' },
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
