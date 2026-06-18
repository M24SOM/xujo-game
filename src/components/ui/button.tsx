import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ghost" | "danger";

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-base font-semibold " +
  "transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-bg select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-strong",
  ghost:
    "bg-surface-2 text-violet-100 border border-border hover:border-primary/60",
  danger: "bg-punish text-white shadow-lg shadow-punish/30 hover:brightness-110",
};

function classes(variant: Variant, className?: string) {
  return `${base} ${variants[variant]} ${className ?? ""}`.trim();
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={classes(variant, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; children: ReactNode }) {
  return (
    <Link className={classes(variant, className)} {...props}>
      {children}
    </Link>
  );
}
