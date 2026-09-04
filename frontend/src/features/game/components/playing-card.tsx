import type { ReactNode } from "react";
import { motion } from "framer-motion";

type PlayingCardVariant = "white" | "black";

interface PlayingCardProps {
  variant?: PlayingCardVariant;
  children: ReactNode;
  footer?: ReactNode;
  selected?: boolean;
  highlighted?: boolean;
  disabled?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  index?: number;
}

export function PlayingCard({
  variant = "white",
  children,
  footer,
  selected = false,
  highlighted = false,
  disabled = false,
  interactive = false,
  onClick,
  className = "",
  index = 0,
}: PlayingCardProps) {
  const isBlack = variant === "black";
  const canPress = interactive && !disabled;

  return (
    <motion.button
      type="button"
      disabled={!interactive || disabled}
      onClick={canPress ? onClick : undefined}
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{
        opacity: 1,
        y: selected ? -10 : highlighted ? -6 : 0,
        scale: 1,
      }}
      transition={{
        opacity: { duration: 0.25, delay: index * 0.04 },
        scale: { type: "spring", stiffness: 400, damping: 28 },
        y: { type: "spring", stiffness: 350, damping: 22 },
      }}
      whileHover={canPress ? { y: -8, scale: 1.03 } : undefined}
      whileTap={canPress ? { scale: 0.97 } : undefined}
      className={`relative flex aspect-5/7 w-full flex-col justify-between overflow-hidden rounded-2xl border-2 p-4 text-left shadow-lg ${
        isBlack
          ? "border-black bg-linear-to-br from-neutral-900 to-black text-white"
          : "border-neutral-200 bg-linear-to-br from-white to-neutral-50 text-black"
      } ${canPress ? "cursor-pointer" : "cursor-default"} ${
        selected ? "border-danger shadow-danger/30 shadow-2xl ring-4 ring-danger" : ""
      } ${
        highlighted
          ? "border-warning shadow-warning/30 shadow-2xl ring-4 ring-warning"
          : ""
      } ${disabled && interactive ? "cursor-not-allowed opacity-35" : ""} ${className}`}
    >
      {selected && (
        <motion.span
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-xs font-bold text-danger-foreground"
        >
          ✓
        </motion.span>
      )}
      {highlighted && (
        <motion.span
          initial={{ scale: 0, rotate: 15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-warning text-sm text-warning-foreground"
        >
          ★
        </motion.span>
      )}
      <span className="font-display text-base leading-snug font-semibold">
        {children}
      </span>
      <span
        className={`font-mono text-[9px] tracking-wide uppercase ${
          isBlack ? "text-white/40" : "text-black/30"
        }`}
      >
        {footer ?? "Cartas Contra a Humanidade"}
      </span>
    </motion.button>
  );
}
