import Link from "next/link";
import { LuGithub, LuLinkedin, LuMail } from "react-icons/lu";

import { site } from "@/config/site";

const socialLinks = [
  {
    name: "LinkedIn",
    href: site.links.linkedin,
    icon: LuLinkedin,
  },
  {
    name: "GitHub",
    href: site.links.github,
    icon: LuGithub,
  },
  {
    name: "Email",
    href: `mailto:${site.links.email}`,
    icon: LuMail,
  },
];

const footerLinks = [
  { href: "/projects", label: "Projects" },
  { href: "/architecture", label: "Architecture" },
  { href: "/leadership", label: "Leadership" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Name and Copyright */}
          <div className="text-center sm:text-left">
            <Link
              href="/"
              className="text-lg font-semibold text-zinc-900 transition-colors hover:text-primary-600 dark:text-zinc-50 dark:hover:text-primary-400"
            >
              {site.name}
            </Link>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {site.title}
            </p>
          </div>

          {/* Footer Navigation */}
          <nav aria-label="Footer" className="hidden sm:block">
            <ul className="flex items-center gap-6">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target={social.name !== "Email" ? "_blank" : undefined}
                rel={social.name !== "Email" ? "noopener noreferrer" : undefined}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label={social.name}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-zinc-100 pt-6 text-center dark:border-zinc-800">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

