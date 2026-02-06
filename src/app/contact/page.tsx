import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/site/Container";
import { site } from "@/config/site";
import { on } from "@/utils";

export const metadata: Metadata = {
  title: "Contact",
  description: "Email, LinkedIn, GitHub, and resume download.",
};

export default function ContactPage() {
  return (
    <Container className="py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
          Reach out for collaboration, consulting, or leadership opportunities.
        </p>
      </header>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <Card title="Email">
          <a className={linkClass} href={`mailto:${site.links.email}`}>
            {site.links.email}
          </a>
        </Card>
        <Card title="LinkedIn">
          <a className={linkClass} href={site.links.linkedin} target="_blank" rel="noopener noreferrer">
            {site.links.linkedin.replace("https://", "")}
          </a>
        </Card>
        <Card title="GitHub">
          <a className={linkClass} href={site.links.github} target="_blank" rel="noopener noreferrer">
            {site.links.github.replace("https://", "")}
          </a>
        </Card>
        <Card title="Resume">
          <a
            href={site.links.resumePdf}
            download="Anjo_Tadena_Software_Engineer_Resume.pdf"
            className={on(
              "inline-flex items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white",
              "hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
              "dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50"
            )}
          >
            Download resume (PDF)
          </a>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Prefer a quick overview? Check the <Link className={linkClass} href="/about">About</Link> page.
          </p>
        </Card>
      </section>
    </Container>
  );
}

const linkClass = on(
  "text-sm text-zinc-700 underline-offset-4 hover:underline",
  "focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
  "dark:text-zinc-200 dark:focus:ring-zinc-50"
);

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}
