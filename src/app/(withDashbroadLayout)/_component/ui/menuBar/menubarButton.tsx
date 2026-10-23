// src/components/CustomButton.tsx
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface MenubarButtonProps {
  href?: string;
  title: string;
  icon: React.ReactNode;
  delay?: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  /** Force the highlighted (active) style, e.g. while the messenger is open. */
  active?: boolean;
}

const MenubarButton: React.FC<MenubarButtonProps> = ({
  href,
  title,
  icon,
  delay = 0,
  className,
  onClick,
  active,
}) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const pathname = usePathname();

  // Determine if the current button is active
  const isActive = active ?? pathname === href;

  return (
    <motion.div onClick={onClick} className={`${className}`}>
      <Link
        className={`flex items-center justify-start gap-3 border rounded-xl p-2 transition-all duration-200 cursor-pointer active:scale-[0.98] ${
          isActive
            ? 'bg-gradient-to-br from-sage-700 to-sage-600 text-white border-sage-600 shadow-[0_4px_12px_-4px_rgba(47,125,98,0.5)] ring-1 ring-sage-500/40'
            : 'bg-surface hover:bg-sage-50 border-borderSubtle hover:border-sage-300 dark:hover:bg-sage-500/10 dark:hover:border-sage-700 text-default-700'
        }`}
        href={href ? href : '#'}
        title={title}
        aria-current={isActive ? 'page' : undefined}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="hidden lg:inline">{title}</span>
        </div>
      </Link>
    </motion.div>
  );
};

export default MenubarButton;
