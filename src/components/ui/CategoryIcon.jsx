// Category icon component with colored background

import {
  Users, Mail, Landmark, Briefcase, ShoppingBag,
  Gamepad2, Code, MoreHorizontal, Globe
} from 'lucide-react';
import { CATEGORY_MAP } from '../../utils/constants';

const iconMap = {
  Users, Mail, Landmark, Briefcase, ShoppingBag,
  Gamepad2, Code, MoreHorizontal, Globe,
};

export default function CategoryIcon({ categoryId, size = 36 }) {
  const category = CATEGORY_MAP[categoryId];
  const iconName = category?.icon || 'Globe';
  const color = category?.color || '#9A9A9A';
  const Icon = iconMap[iconName] || Globe;
  const iconSize = size * 0.5;

  return (
    <div
      className="category-icon"
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: size * 0.28,
        backgroundColor: color + '18',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={iconSize} color={color} strokeWidth={2} />
    </div>
  );
}
