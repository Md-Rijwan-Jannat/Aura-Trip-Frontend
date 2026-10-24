"use client";

/**
 * AURA TRIP — Community UI kit.
 * Shared primitives for Groups / Shorts / Notifications so every community
 * surface shares one polished, sage-branded look: soft mint surfaces,
 * rounded-2xl cards, pill buttons, gentle motion.
 */

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "@nextui-org/avatar";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/modal";
import { Input } from "@nextui-org/input";
import { Chip } from "@nextui-org/chip";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/dropdown";
import { FaSearch } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const formatRelative = (date?: string | null): string => {
  if (!date) return "";
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "";
  }
};

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

interface CommunityCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function CommunityCard({ children, className = "", hover = false, onClick }: CommunityCardProps) {
  const base =
    "rounded-2xl bg-surface border border-borderSubtle shadow-[0_1px_2px_rgba(31,78,61,0.04),0_8px_24px_-12px_rgba(31,78,61,0.12)]";
  const hoverCls = hover
    ? "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(31,78,61,0.06),0_16px_32px_-12px_rgba(31,78,61,0.2)] hover:border-sage-300 dark:hover:border-borderSubtle"
    : "";

  if (onClick) {
    return (
      <button type='button' onClick={onClick} className={`${base} ${hoverCls} ${className} text-left w-full cursor-pointer`}>
        {children}
      </button>
    );
  }

  return <div className={`${base} ${hoverCls} ${className}`}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Buttons — plain elements so our sage styles always win (no NextUI   */
/* class conflicts), guaranteed icon→text order, and nowrap labels.    */
/* ------------------------------------------------------------------ */

type CommunityButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "dangerGhost" | "onDark";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
  isLoading?: boolean;
  isDisabled?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  onPress?: () => void;
  href?: string;
  as?: React.ElementType;
};

const buttonVariants: Record<string, string> = {
  primary: "bg-sage-600 text-white hover:bg-sage-700 dark:bg-sage-500 dark:text-sage-900 dark:hover:bg-sage-400 shadow-sm",
  secondary:
    "bg-sage-50 text-sage-700 border border-sage-600/40 hover:bg-sage-600 hover:text-white dark:bg-transparent dark:text-sage-300 dark:border-sage-400/40 dark:hover:bg-sage-500 dark:hover:text-sage-900",
  ghost:
    "bg-transparent text-default-600 hover:bg-default-100 hover:text-default-800 dark:text-default-400 dark:hover:bg-white/10 dark:hover:text-default-200",
  danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
  dangerGhost:
    "bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30 dark:hover:bg-red-500 dark:hover:text-white",
  onDark: "bg-white/15 text-white border border-white/30 hover:bg-white hover:text-sage-700 backdrop-blur-sm",
};

const buttonSizes: Record<string, string> = {
  sm: "h-8 px-3.5 text-xs gap-1",
  md: "h-9 px-4 text-xs md:text-sm gap-1.5",
  lg: "h-10 px-5 text-sm gap-2",
};

function ButtonSpinner() {
  return (
    <svg className='animate-spin h-4 w-4 flex-shrink-0' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z' />
    </svg>
  );
}

export function CommunityButton({
  variant = "primary",
  size = "md",
  className = "",
  children,
  isLoading = false,
  isDisabled = false,
  startContent,
  endContent,
  onPress,
  href,
  type,
  disabled,
  onClick,
  ...rest
}: CommunityButtonProps) {
  const off = isDisabled || isLoading || disabled;
  const cls = [
    "inline-flex items-center justify-center select-none rounded-full font-semibold leading-none",
    "transition-all duration-200 whitespace-nowrap text-center",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/60",
    "active:scale-[0.98]",
    off ? "opacity-55 pointer-events-none cursor-not-allowed" : "",
    buttonSizes[size],
    buttonVariants[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {isLoading ? <ButtonSpinner /> : startContent}
      <span className='truncate'>{children}</span>
      {!isLoading && endContent}
    </>
  );

  if (href && !off) {
    return (
      <Link
        href={href}
        className={cls}
        onClick={(e) => {
          const handler = onClick || onPress;
          if (handler) {
            if (typeof handler === "function" && handler.length === 0) {
              // onPress style function
              (handler as () => void)();
            } else if (typeof handler === "function") {
              // onClick style function
              (handler as React.MouseEventHandler<HTMLAnchorElement>)(e);
            }
          }
        }}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type || "button"}
      className={cls}
      disabled={off}
      onClick={(e) => {
        const handler = onPress || onClick;
        if (handler) {
          if ("length" in handler && handler.length === 0) {
            // onPress style function
            (handler as () => void)();
          } else {
            // onClick style function
            (handler as React.MouseEventHandler<HTMLButtonElement>)(e);
          }
        }
      }}
      {...rest}
    >
      {content}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Badges                                                              */
/* ------------------------------------------------------------------ */

const badgeColors: Record<string, "default" | "primary" | "secondary" | "warning" | "danger" | "success"> = {
  OWNER: "warning",
  ADMIN: "primary",
  MODERATOR: "secondary",
  MEMBER: "default",
  PUBLIC: "success",
  PRIVATE: "warning",
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  REMOVED: "danger",
  BANNED: "danger",
  LEFT: "default",
  NONE: "default",
  ACTIVE: "success",
  REVOKED: "danger",
  VALID: "success",
  EXPIRED: "danger",
  EXHAUSTED: "warning",
  GROUP_UNAVAILABLE: "danger",
};

export function Badge({ children, color, className = "" }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <Chip
      size='sm'
      variant='flat'
      color={(color || badgeColors[String(children)] || "default") as any}
      classNames={{
        base: "px-2",
        content: "text-[11px] font-semibold tracking-wide",
      }}
      className={className}
    >
      {children}
    </Chip>
  );
}

/* ------------------------------------------------------------------ */
/* Pill tabs — animated sage underline                                 */
/* ------------------------------------------------------------------ */

export function PillTabs({
  tabs,
  value,
  onChange,
  className = "",
}: {
  tabs: { key: string; label: string; count?: number }[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex flex-wrap items-center gap-1 p-1 rounded-full bg-default-100/70 border border-borderSubtle ${className}`}
      role='tablist'
    >
      {tabs.map((tab) => {
        const active = tab.key === value;

        return (
          <button
            key={tab.key}
            type='button'
            role='tab'
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${
              active ? "text-white" : "text-default-600 hover:text-default-900"
            }`}
          >
            {active && (
              <motion.span
                layoutId='pill-tab-active'
                className='absolute inset-0 rounded-full bg-sage-600 dark:bg-sage-500 dark:text-sage-900'
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className='relative z-10 inline-flex items-center gap-1.5'>
              {tab.label}
              {typeof tab.count === "number" && (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                    active ? "bg-white/20 text-white" : "bg-default-200 text-default-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* NavPills — link-based pill navigation with active state             */
/* ------------------------------------------------------------------ */

export function NavPills({
  tabs,
  className = "",
}: {
  tabs: { key: string; label: string; href: string; icon?: React.ReactNode }[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      className={`inline-flex flex-nowrap items-center gap-1 p-1 rounded-full bg-default-100/70 border border-borderSubtle ${className}`}
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href || (tab.href !== `/groups` && pathname.startsWith(tab.href));

        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${
              active ? "text-white" : "text-default-600 hover:text-default-900"
            }`}
          >
            {active && (
              <motion.span
                layoutId='nav-pill-active'
                className='absolute inset-0 rounded-full bg-sage-600 dark:bg-sage-500 dark:text-sage-900'
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className='relative z-10 inline-flex items-center gap-1.5'>
              {tab.icon}
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center text-center py-10 sm:py-14 px-4 sm:px-6 rounded-2xl border border-dashed border-borderSubtle bg-surface/60 ${className}`}
    >
      <div className='w-14 h-14 rounded-2xl bg-sage-100 dark:bg-sage-500/10 text-sage-600 dark:text-sage-400 flex items-center justify-center text-2xl mb-4'>
        {icon || <FaSearch />}
      </div>
      <h3 className='font-semibold text-default-800'>{title}</h3>
      {description && <p className='text-sm text-default-500 mt-1 max-w-sm'>{description}</p>}
      {action && <div className='mt-4'>{action}</div>}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Confirm dialog                                                      */
/* ------------------------------------------------------------------ */

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  children,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='sm' placement='center'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>{title}</ModalHeader>
            <ModalBody>
              {description && <p className='text-sm text-default-500'>{description}</p>}
              {children}
            </ModalBody>
            <ModalFooter className='flex flex-wrap justify-stretch sm:justify-end gap-2'>
              <CommunityButton variant='ghost' className='flex-1 sm:flex-none' onPress={onClose}>
                {cancelLabel}
              </CommunityButton>
              <CommunityButton
                variant={danger ? "danger" : "primary"}
                className='flex-1 sm:flex-none'
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
              >
                {confirmLabel}
              </CommunityButton>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Search input                                                        */
/* ------------------------------------------------------------------ */

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      radius='full'
      variant='bordered'
      startContent={<FaSearch className='text-default-400 text-sm' />}
      classNames={{
        inputWrapper: "bg-surface border-borderSubtle hover:border-sage-300 focus-within:border-sage-500 h-9",
      }}
      className={className}
    />
  );
}

/* ------------------------------------------------------------------ */
/* DropdownSelect — small single-select like news-feed's filter        */
/* ------------------------------------------------------------------ */

export function DropdownSelect({
  value,
  onChange,
  options,
  align = "end",
  ariaLabel = "Select option",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { key: string; label: string }[];
  align?: "start" | "end";
  ariaLabel?: string;
}) {
  const current = options.find((o) => o.key === value) || options[0];

  return (
    <Dropdown size='sm'>
      <DropdownTrigger>
        <button
          type='button'
          className='h-9 px-3.5 rounded-lg border border-default-200 bg-default-50 text-xs md:text-sm font-medium text-default-700 hover:bg-default-100 transition-colors capitalize inline-flex items-center gap-1.5'
        >
          {current?.label}
          <span className='text-[9px] opacity-60 mt-px'>&#9662;</span>
        </button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={ariaLabel}
        selectionMode='single'
        selectedKeys={new Set([value])}
        onSelectionChange={(key) => onChange(Array.from(key)[0] as string)}
        className='max-h-[60vh] overflow-y-auto'
      >
        {options.map((o) => (
          <DropdownItem key={o.key} className='text-xs'>
            {o.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

/* ------------------------------------------------------------------ */
/* Category chips — horizontal selector                                */
/* ------------------------------------------------------------------ */

export function ChipSelector({
  options,
  value,
  onChange,
  allowAll = true,
  allLabel = "All",
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  allowAll?: boolean;
  allLabel?: string;
}) {
  return (
    <div className='flex flex-wrap gap-2'>
      {allowAll && (
        <button
          type='button'
          onClick={() => onChange("")}
          className={`px-3.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
            value === ""
              ? "bg-sage-600 text-white border-sage-600 shadow-sm"
              : "bg-surface text-default-600 border-borderSubtle hover:border-sage-400 hover:text-sage-700 dark:bg-white/[0.05] dark:text-default-300 dark:border-white/10 dark:hover:text-sage-300 dark:hover:border-sage-400"
          }`}
        >
          {allLabel}
        </button>
      )}
      {options.map((opt) => (
        <button
          key={opt}
          type='button'
          onClick={() => onChange(opt)}
          className={`px-3.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
            value === opt
              ? "bg-sage-600 text-white border-sage-600 shadow-sm"
              : "bg-surface text-default-600 border-borderSubtle hover:border-sage-400 hover:text-sage-700 dark:bg-white/[0.05] dark:text-default-300 dark:border-white/10 dark:hover:text-sage-300 dark:hover:border-sage-400"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SelectCard — radio-style option card (nicer than a dropdown)        */
/* ------------------------------------------------------------------ */

export function SelectCard({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: { value: string; label: string; hint?: string; icon?: React.ReactNode }[];
  value: string;
  onChange: (v: string) => void;
  columns?: 1 | 2 | 3;
}) {
  const grid = columns === 3 ? "grid-cols-1 md:grid-cols-3" : columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1";

  return (
    <div className={`grid ${grid} gap-2`}>
      {options.map((opt) => {
        const active = opt.value === value;

        return (
          <button
            key={opt.value}
            type='button'
            onClick={() => onChange(opt.value)}
            className={`text-left rounded-xl border p-3 transition-all duration-200 ${
              active
                ? "border-sage-500 bg-sage-50 dark:bg-sage-500/10 ring-1 ring-sage-500"
                : "border-borderSubtle bg-surface hover:border-sage-300"
            }`}
          >
            <div className='flex items-start gap-2.5'>
              {opt.icon && <span className={`mt-0.5 text-lg ${active ? "text-sage-600" : "text-default-400"}`}>{opt.icon}</span>}
              <div className='min-w-0'>
                <p className={`text-sm font-semibold break-words ${active ? "text-sage-700 dark:text-sage-300" : "text-default-700"}`}>
                  {opt.label}
                </p>
                {opt.hint && <p className='text-xs text-default-500 mt-0.5 break-words'>{opt.hint}</p>}
              </div>
              <span
                className={`ml-auto mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  active ? "border-sage-600 bg-sage-600" : "border-default-300"
                }`}
              >
                {active && <span className='w-1.5 h-1.5 rounded-full bg-white' />}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SettingRow — label + hint + toggle                                   */
/* ------------------------------------------------------------------ */

export function SettingRow({
  icon,
  label,
  hint,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='flex items-center justify-between gap-4 py-3 border-b border-borderSubtle last:border-0'>
      <div className='flex items-start gap-3 min-w-0'>
        {icon && (
          <span className='mt-0.5 w-9 h-9 rounded-xl bg-sage-100 dark:bg-sage-500/10 text-sage-600 dark:text-sage-400 flex items-center justify-center flex-shrink-0'>
            {icon}
          </span>
        )}
        <div className='min-w-0'>
          <p className='text-sm font-semibold text-default-800 break-words'>{label}</p>
          {hint && <p className='text-xs text-default-500 break-words'>{hint}</p>}
        </div>
      </div>
      <span className='flex-shrink-0'>{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Group preview card — cover + avatar + meta. Cover height scales     */
/* with the section width (aspect-ratio), so it fits rail, mobile, etc */
/* ------------------------------------------------------------------ */

export function GroupPreviewCard({
  name,
  description,
  category,
  visibility,
  image,
  coverImage,
  memberCount,
}: {
  name?: string;
  description?: string;
  category?: string;
  visibility?: string;
  image?: string | null;
  coverImage?: string | null;
  memberCount?: number;
}) {
  const memberText = memberCount != null ? `${memberCount} ${memberCount === 1 ? "member" : "members"}` : "1 member";

  return (
    <CommunityCard className='overflow-hidden'>
      {/* Cover scales with card width */}
      <div className='relative aspect-[16/6] min-h-20 max-h-36 bg-gradient-to-br from-sage-600 via-sage-500 to-sage-300 dark:from-sage-800 dark:via-sage-700 dark:to-sage-500'>
        {coverImage && <img src={coverImage} alt='' className='w-full h-full object-cover' />}
        <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent' />
        {visibility && (
          <span className='absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-white text-[11px] font-semibold'>
            {visibility === "PRIVATE" ? "Private" : "Public"}
          </span>
        )}
      </div>
      {/* Avatar overlaps the cover */}
      <div className='px-4 sm:px-5 pb-4 sm:pb-5 -mt-7 sm:-mt-8 relative'>
        <div className='w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ring-4 ring-surface bg-sage-100 dark:bg-sage-500/20 flex items-center justify-center text-sage-600 dark:text-sage-300 text-lg sm:text-xl font-bold overflow-hidden shadow-sm'>
          {image ? <img src={image} alt='' className='w-full h-full object-cover' /> : (name || "G").charAt(0).toUpperCase()}
        </div>
        <h3 className='font-bold text-default-900 text-sm sm:text-base mt-2.5 line-clamp-1 break-words'>{name || "Your group name"}</h3>
        <p className='text-xs sm:text-sm text-default-500 line-clamp-2 mt-1 break-words'>
          {description || "Your description will show up here…"}
        </p>
        <div className='flex flex-wrap items-center gap-2 mt-3 min-w-0'>
          {category && (
            <span className='text-xs px-2.5 py-1 rounded-full bg-sage-100 dark:bg-sage-500/15 text-sage-700 dark:text-sage-300 font-semibold max-w-full truncate'>
              {category}
            </span>
          )}
          <span className='text-xs text-default-400'>{memberText}</span>
        </div>
      </div>
    </CommunityCard>
  );
}

/* ------------------------------------------------------------------ */
/* Cover banner — gradient fallback                                    */
/* ------------------------------------------------------------------ */

export function CoverBanner({
  src,
  alt,
  className = "",
  height = "h-40 sm:h-52",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  height?: string;
}) {
  return (
    <div className={`relative w-full ${height} overflow-hidden rounded-t-2xl ${className}`}>
      {src ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img src={src} alt={alt} className='w-full h-full object-cover' />
      ) : (
        <div className='w-full h-full bg-gradient-to-br from-sage-600 via-sage-500 to-sage-300 dark:from-sage-800 dark:via-sage-700 dark:to-sage-500' />
      )}
      <div className='absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent' />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar stack                                                        */
/* ------------------------------------------------------------------ */

export function AvatarStack({
  users,
  total,
  size = 26,
}: {
  users: { _id?: string; name?: string; image?: string }[];
  total?: number;
  size?: number;
}) {
  const shown = users.slice(0, 4);
  const extra = (total ?? users.length) - shown.length;

  return (
    <div className='flex items-center -space-x-2'>
      {shown.map((u, i) => (
        <Avatar
          key={u._id || i}
          size='sm'
          name={u.name?.charAt(0)?.toUpperCase()}
          src={u.image || undefined}
          className='ring-2 ring-surface'
          style={{ width: size, height: size }}
        />
      ))}
      {extra > 0 && (
        <span
          className='inline-flex items-center justify-center rounded-full bg-sage-100 text-sage-700 dark:bg-sage-500/20 dark:text-sage-300 ring-2 ring-surface text-[10px] font-bold'
          style={{ width: size, height: size }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PageHeader                                                          */
/* ------------------------------------------------------------------ */

export function PageHeader({
  title,
  subtitle,
  action,
  icon,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4'
    >
      <div className='flex items-start gap-3 min-w-0'>
        {icon && (
          <span className='w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-sage-600 text-white flex items-center justify-center text-base sm:text-lg shadow-sm flex-shrink-0'>
            {icon}
          </span>
        )}
        <div className='min-w-0'>
          <h1 className='text-lg sm:text-xl font-bold text-default-900 tracking-tight break-words'>{title}</h1>
          {subtitle && <p className='text-sm text-default-500 mt-0.5 break-words'>{subtitle}</p>}
        </div>
      </div>
      {action && <div className='w-full sm:w-auto sm:flex-shrink-0'>{action}</div>}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Stagger fade-in wrapper                                             */
/* ------------------------------------------------------------------ */

export function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* ListSkeleton                                                        */
/* ------------------------------------------------------------------ */

export function ListSkeleton({ count = 4, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.12 }}
          className='h-20 rounded-2xl bg-default-100/80 border border-borderSubtle'
        />
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5'>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }}
          className='h-64 rounded-2xl bg-default-100/80 border border-borderSubtle'
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Progress bar (invite usage)                                         */
/* ------------------------------------------------------------------ */

export function ProgressBar({ value, max }: { value: number; max: number | null }) {
  if (max == null || max <= 0) return null;
  const pct = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className='w-full h-1.5 rounded-full bg-default-100 overflow-hidden'>
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          pct >= 100 ? "bg-red-400" : pct >= 70 ? "bg-amber-400" : "bg-sage-500"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
