import type { ComponentProps } from "react";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`rounded-3xl border border-border bg-surface/80 p-5 shadow-xl shadow-black/20 backdrop-blur ${
        className ?? ""
      }`}
      {...props}
    />
  );
}
