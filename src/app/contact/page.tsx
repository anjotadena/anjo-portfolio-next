import type { Metadata } from "next";
import { Download, Github, Linkedin, Mail, MapPin } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { AskAiLink } from "@/components/portfolio/ask-ai-link";
import { DocumentBody } from "@/components/portfolio/document-body";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { getProfile, getPublicDocumentsByType } from "@/lib/knowledge/repository";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Anjo Tadena by email, LinkedIn, or GitHub, or download his résumé.",
  alternates: { canonical: "/contact" },
};

const cardClassName =
  "flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function ContactPage() {
  const { profile } = getProfile();
  const contactDoc = getPublicDocumentsByType("contact")[0];
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ];

  const channels = [
    { href: `mailto:${profile.email}`, icon: Mail, label: "Email", value: profile.email, external: false },
    { href: profile.linkedInUrl, icon: Linkedin, label: "LinkedIn", value: profile.linkedInUrl.replace(/^https?:\/\/(www\.)?/, ""), external: true },
    { href: profile.githubUrl, icon: Github, label: "GitHub", value: profile.githubUrl.replace(/^https?:\/\/(www\.)?/, ""), external: true },
    ...(profile.resumeHref ? [{ href: profile.resumeHref, icon: Download, label: "Résumé", value: "Download PDF", external: false }] : []),
  ];

  return (
    <PageLayout title="Get in touch" description={contactDoc?.summary ?? profile.headline} eyebrow="Contact" crumbs={crumbs} actions={<AskAiLink question="How can I contact him?" label="Ask AI how to reach Anjo" />}>
      <BreadcrumbJsonLd items={crumbs} />
      <p className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" aria-hidden="true" /> {profile.location}
        {profile.availability && (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-success">{profile.availability}</span>
          </>
        )}
      </p>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {channels.map((channel) => (
          <li key={channel.label}>
            <a
              href={channel.href}
              target={channel.external ? "_blank" : undefined}
              rel={channel.external ? "noopener noreferrer" : undefined}
              download={channel.label === "Résumé" ? true : undefined}
              className={cardClassName}
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <channel.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">{channel.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{channel.value}</span>
                {channel.external && <span className="sr-only">(opens in a new tab)</span>}
              </span>
            </a>
          </li>
        ))}
      </ul>
      {contactDoc && <DocumentBody body={contactDoc.body} className="mt-10" />}
    </PageLayout>
  );
}
