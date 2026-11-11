"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/utils";
import type { NavItem } from "./nav-config";
import { NavIcon } from "./nav-icon";

export interface NavSection {
  label?: string;
  items: NavItem[];
}

export interface SidebarNavProps {
  sections: NavSection[];
  /** Called after navigation (closes the mobile menu). */
  onNavigate?: () => void;
}

function isActive(pathname: string, href: string): boolean {
  if (href.includes("#")) return false; // section anchors are not pages
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Vertical navigation list used by the mobile menu. */
export function SidebarNav({ sections, onNavigate }: SidebarNavProps) {
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
            "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
    <nav aria-label="Menu" className="flex flex-col gap-6">
      {sections.map((section, index) =>
        section.items.length > 0 ? (
          <div key={section.label ?? index}>
            {section.label && <p className="mb-1.5 px-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{section.label}</p>}
            <ul className="flex flex-col gap-0.5">{section.items.map(renderItem)}</ul>
          </div>
        ) : null,
      )}
    </nav>
  );
}
