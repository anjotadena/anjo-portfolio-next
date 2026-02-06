import type { ReactNode } from "react";

import { on } from "@/utils";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={on("mx-auto w-full max-w-5xl px-4", className)}>{children}</div>;
}

