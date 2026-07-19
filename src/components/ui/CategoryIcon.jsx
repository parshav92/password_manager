// Category icon with tinted background

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
  const color = category?.color || '#8A9AA3';
  const Icon = iconMap[iconName] || Globe;
  const iconSize = Math.round(size * 0.44);

  return (
    <div
      className="flex items-center justify-center shrink-0 rounded-[28%]"
      style={{
        width: size,
        height: size,
        minWidth: size,
        backgroundColor: `${color}1A`,
      }}
    >
      <Icon size={iconSize} color={color} strokeWidth={2} />
    </div>
  );
}
