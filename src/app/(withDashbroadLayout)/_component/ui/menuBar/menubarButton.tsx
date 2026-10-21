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
  onClick?: () => void;
}

const MenubarButton: React.FC<MenubarButtonProps> = ({
  href,
  title,
  icon,
  delay = 0,
  className,
  onClick,
}) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const pathname = usePathname();

  // Determine if the current button is active
  const isActive = pathname === href;

  return (
    <motion.div onClick={onClick} className={`${className}`}>
      <Link
        className={`flex items-center justify-start gap-3 border border-default-200 rounded-md p-2 transition-colors-opacity duration-300 cursor-pointer ${
          isActive
            ? 'bg-gradient-to-br from-sage-700 to-sage-600 text-white border-sage-600 rounded-md'
            : 'bg-default-50 hover:bg-default-200 rounded-md'
        }`}
        href={href ? href : '#'}
        title={title}
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
