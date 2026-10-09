import Link from "next/link";
import type { ComponentProps } from "react";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "ghost";
  size?: "md" | "lg";
};

const variants = {
  primary:
    "bg-brand-600 text-white ring-1 ring-brand-300/60 shadow-[0_0_18px_rgb(124_128_255/0.45)] hover:bg-brand-500 hover:shadow-[0_0_26px_rgb(124_128_255/0.65)]",
  ghost:
    "bg-white/[0.03] text-white/90 ring-1 ring-white/25 hover:bg-white/[0.07] hover:text-white hover:shadow-[0_0_18px_rgb(255_255_255/0.12)]",
};

const sizes = {
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 ${variants[variant]} ${sizes[size]} ${className}`}
    />
  );
}
