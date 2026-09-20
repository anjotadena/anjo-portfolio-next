"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/utils";
import type { NavItem } from "./nav-config";
import { NavIcon } from "./nav-icon";

export interface SidebarNavProps {
  primary: NavItem[];
  topics: NavItem[];
  /** Called after navigation (closes the mobile drawer). */
  onNavigate?: () => void;
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({ primary, topics, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  const renderItem = (item: NavItem) => {
    const active = isActive(pathname, item.href);
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <NavIcon name={item.icon} className={cn("h-4 w-4 shrink-0", active ? "text-accent-foreground" : "text-muted-foreground")} />
          <span className="truncate">{item.label}</span>
        </Link>
      </li>
    );
  };

  return (
    <nav aria-label="Primary" className="flex flex-col gap-6">
      <ul className="flex flex-col gap-0.5">{primary.map(renderItem)}</ul>
      {topics.length > 0 && (
        <div>
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Topics</p>
          <ul className="flex flex-col gap-0.5">{topics.map(renderItem)}</ul>
        </div>
      )}
    </nav>
  );
}
