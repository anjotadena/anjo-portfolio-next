"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { FileText, Github, Linkedin, Menu, X } from "lucide-react";
import type { NavLink } from "./nav-links";

interface MobileNavProps {
  links: NavLink[];
  resumeHref: string;
  githubUrl: string;
  linkedinUrl: string;
}

const linkClassName =
  "flex items-center gap-2 rounded-md px-3 py-2 text-base text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function MobileNav({ links, resumeHref, githubUrl, linkedinUrl }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute inset-x-0 top-full border-b border-border bg-background px-4 py-4 shadow-sm"
        >
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setOpen(false)} className={linkClassName}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={resumeHref} onClick={() => setOpen(false)} className={linkClassName}>
                <FileText size={16} aria-hidden="true" />
                Résumé
              </a>
            </li>
            <li>
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={linkClassName}
              >
                <Github size={16} aria-hidden="true" />
                GitHub
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={linkClassName}
              >
                <Linkedin size={16} aria-hidden="true" />
                LinkedIn
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
