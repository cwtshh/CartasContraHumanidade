import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

export type AuthMode = "sign-in" | "sign-up";

type AuthTabsProps = {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
};

const tabIndicatorTransition = { type: "spring", stiffness: 500, damping: 35 } as const;

export function AuthTabs({ mode, onChange }: AuthTabsProps) {
  return (
    <div className="mb-8 flex border-b border-border">
      <button
        type="button"
        onClick={() => onChange("sign-in")}
        className={`relative mr-7 pb-3.5 text-sm font-bold tracking-wide uppercase transition-colors ${
          mode === "sign-in"
            ? "text-foreground"
            : "text-muted hover:text-foreground"
        }`}
      >
        Entrar
        {mode === "sign-in" && (
          <motion.span
            layoutId="auth-tab-indicator"
            transition={tabIndicatorTransition}
            className="absolute right-0 -bottom-px left-0 h-0.5 bg-danger"
          />
        )}
      </button>
      <button
        type="button"
        onClick={() => onChange("sign-up")}
        className={`relative mr-7 pb-3.5 text-sm font-bold tracking-wide uppercase transition-colors ${
          mode === "sign-up"
            ? "text-foreground"
            : "text-muted hover:text-foreground"
        }`}
      >
        Criar conta
        {mode === "sign-up" && (
          <motion.span
            layoutId="auth-tab-indicator"
            transition={tabIndicatorTransition}
            className="absolute right-0 -bottom-px left-0 h-0.5 bg-danger"
          />
        )}
      </button>
    </div>
  );
}

type AuthFormTransitionProps = {
  mode: AuthMode;
  children: ReactNode;
};

export function AuthFormTransition({ mode, children }: AuthFormTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
