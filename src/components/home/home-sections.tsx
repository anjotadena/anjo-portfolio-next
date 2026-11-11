import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDown, ArrowRight, BookOpenText, Briefcase, CodeXml, Download, Github, Layers, Linkedin, Mail, MapPin, Sparkles, Sprout, Store } from "lucide-react";
import type { ContentDocument, SkillGroup } from "@/types/content";
import { AskAiLink } from "@/components/portfolio/ask-ai-link";
import { cn } from "@/components/ui/utils";

/* Shared bits ------------------------------------------------------------ */

const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-mono text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const secondaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-input px-5 py-2.5 font-mono text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const textLink =
  "inline-flex min-h-9 items-center gap-1.5 rounded font-mono text-[13px] font-semibold text-primary hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function SectionHeading({ id, index, title, intro }: { id: string; index: string; title: string; intro: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4">
        <h2 id={id} className="flex shrink-0 items-baseline gap-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          <span className="font-mono text-sm font-medium text-primary" aria-hidden="true">
            {index} /
          </span>
          {title}
        </h2>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>
      <p className="mt-2 max-w-2xl text-muted-foreground">{intro}</p>
    </div>
  );
}

function Section({ id, labelledBy, children, className }: { id: string; labelledBy: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20", className)}>
      {children}
    </section>
  );
}

/* Hero ------------------------------------------------------------------- */

const TERMINAL_LINES: Array<[string, string]> = [
  ["plan", "scope the real problem"],
  ["build", "small, working increments"],
  ["verify", "tests and evidence"],
  ["ship", "useful software"],
];

/** Decorative terminal vignette. Hidden from assistive technology. */
function TerminalIllustration() {
  return (
    <div aria-hidden="true" className="relative hidden select-none lg:block">
      <div className="bg-dot-grid absolute -inset-8 rounded-3xl opacity-60 [mask-image:radial-gradient(closest-side,black,transparent)]" />
      <div className="relative rounded-xl border border-border bg-card shadow-2xl shadow-black/40">
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
        </div>
        <div className="px-5 py-5 font-mono text-[13px] leading-7">
          <p>
            <span className="text-primary">&gt;</span> <span className="text-primary">build_software()</span>
          </p>
          {TERMINAL_LINES.map(([step, detail]) => (
            <p key={step} className="pl-4 text-muted-foreground">
              <span className="text-border">│</span> <span className="text-foreground">{step}</span> <span className="text-primary">→</span> {detail}
            </p>
          ))}
          <p className="mt-1">
            <span className="text-primary">&gt;</span>
            <span className="animate-caret ml-1 inline-block h-4 w-2 translate-y-0.5 bg-primary" />
          </p>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    // Fills the first screen below the sticky header (64px + top safe area);
    // `svh` keeps it stable while mobile browser toolbars show and hide.
    <section aria-labelledby="hero-heading" className="relative flex min-h-[calc(100svh-4rem-env(safe-area-inset-top,0px))] flex-col">
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]">
        <div>
          <p className="inline-flex flex-wrap items-center gap-x-2 rounded-md border border-border bg-card px-3 py-1.5 font-mono text-xs text-primary">
            <span>Senior Software Engineer</span>
            <span aria-hidden="true" className="text-muted-foreground">·</span>
            <span>AI Integration</span>
            <span aria-hidden="true" className="text-muted-foreground">·</span>
            <span>Cebu, Philippines</span>
          </p>
          <h1 id="hero-heading" className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            I build software that makes work <span className="text-primary">easier</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            I build tools for everyday business operations and help engineering teams ship reliable products. I also integrate AI where it can help people find
            information and complete useful work.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#work" className={primaryButton}>
              See what I&apos;ve built <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="#contact" className={secondaryButton}>
              Let&apos;s talk
            </Link>
          </div>
        </div>
        <TerminalIllustration />
      </div>
      <div className="flex justify-center pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
        <Link
          href="#work"
          className="group inline-flex min-h-11 flex-col items-center gap-1 rounded-md px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Scroll to work
          <ArrowDown className="h-4 w-4 motion-safe:animate-bounce" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

/* Work ------------------------------------------------------------------- */

export interface WorkCardData {
  slug: string;
  title: string;
  icon: "layers" | "code" | "sparkles";
  /** Short status chip, e.g. "In development". */
  status: string;
  audience: string;
  problem: string;
  built: string;
  role: string;
  /** Primary detail route. */
  primary: { href: string; label: string } | { assistant: true; label: string };
  secondary: Array<{ href: string; label: string; external?: boolean }>;
}

const WORK_ICONS = { layers: Layers, code: CodeXml, sparkles: Sparkles } as const;

function WorkCard({ card }: { card: WorkCardData }) {
  const Icon = WORK_ICONS[card.icon];
  return (
    <article aria-labelledby={`work-${card.slug}`} className="flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-input sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary" aria-hidden="true">
            <Icon className="h-5 w-5" />
          </span>
          <h3 id={`work-${card.slug}`} className="text-xl font-bold tracking-tight text-foreground">
            {card.title}
          </h3>
        </div>
        <span className="mt-1 shrink-0 rounded border border-primary/60 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">{card.status}</span>
      </div>

      <dl className="mt-5 flex flex-1 flex-col gap-3 text-sm">
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Problem</dt>
          <dd className="mt-0.5 font-medium leading-relaxed text-foreground">{card.problem}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">What I built</dt>
          <dd className="mt-0.5 leading-relaxed text-muted-foreground">{card.built}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Who it serves</dt>
          <dd className="mt-0.5 leading-relaxed text-muted-foreground">{card.audience}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">My role</dt>
          <dd className="mt-0.5 text-muted-foreground">{card.role}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-border pt-4">
        {"assistant" in card.primary ? (
          <AskAiLink variant="plain" icon={false} className={textLink} label={<>{card.primary.label} <ArrowRight className="h-4 w-4" aria-hidden="true" /></>} />
        ) : (
          <Link href={card.primary.href} className={textLink}>
            {card.primary.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
        {card.secondary.map((link) =>
          link.external ? (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={cn(textLink, "font-medium text-muted-foreground hover:text-foreground")}>
              {link.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <Link key={link.href} href={link.href} className={cn(textLink, "font-medium text-muted-foreground hover:text-foreground")}>
              {link.label}
            </Link>
          ),
        )}
      </div>
    </article>
  );
}

export function WorkSection({ cards }: { cards: WorkCardData[] }) {
  return (
    <Section id="work" labelledBy="work-heading">
      <SectionHeading id="work-heading" index="01" title="Work" intro="Selected projects: the problem each one tackles, who it is for, and what I built." />
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <li key={card.slug}>
            <WorkCard card={card} />
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted-foreground">
        More in{" "}
        <Link href="/projects" className="rounded text-foreground underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          all projects
        </Link>{" "}
        and{" "}
        <Link href="/case-studies" className="rounded text-foreground underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          case studies
        </Link>
        .
      </p>
    </Section>
  );
}

/* How I can help --------------------------------------------------------- */

const HELP = [
  { icon: Briefcase, title: "Employers", body: "Lead delivery, stay hands-on, and help a team build reliable software." },
  { icon: Store, title: "Business owners", body: "Understand daily workflows and turn repetitive manual work into practical software." },
  { icon: Sprout, title: "Investors and founders", body: "Scope an initial product, build a working prototype, and help validate it with customers." },
] as const;

export function HelpSection({ email }: { email: string }) {
  return (
    <Section id="help" labelledBy="help-heading">
      <SectionHeading id="help-heading" index="02" title="How I can help" intro="I work with hiring teams, business owners, and early-stage founders." />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr_1fr_auto]">
        {HELP.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl border border-border bg-card p-5">
            <h3 className="flex items-center gap-3 text-base font-bold text-foreground">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary" aria-hidden="true">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              {title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
        <div className="flex flex-col justify-center gap-3 rounded-xl border border-dashed border-border p-5 lg:max-w-60 lg:border-y-0 lg:border-r-0 lg:border-l lg:pl-6">
          <a href={`mailto:${email}`} className={primaryButton}>
            <Mail className="h-4 w-4" aria-hidden="true" /> Email me
          </a>
          <p className="text-sm text-muted-foreground">Tell me what you&apos;re building or looking for.</p>
        </div>
      </div>
    </Section>
  );
}

/* About ------------------------------------------------------------------ */

export function AboutSection({ profile, overview, approach, skillGroups }: { profile: NonNullable<ContentDocument["profile"]>; overview: string; approach: string[]; skillGroups: SkillGroup[] }) {
  return (
    <Section id="about" labelledBy="about-heading">
      <SectionHeading id="about-heading" index="03" title="About" intro="Background, approach, and the tools I use." />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div>
          <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {profile.location}
            {profile.availability && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-success">{profile.availability}</span>
              </>
            )}
          </p>
          <p className="mt-4 leading-relaxed text-foreground">{overview}</p>
          {approach.length > 0 && (
            <>
              <h3 className="mt-6 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">How I work</h3>
              <ul className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                {approach.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="font-mono text-primary" aria-hidden="true">
                      &gt;
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}
          <Link href="/about" className={cn(textLink, "mt-6")}>
            More about me <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {skillGroups.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Relevant technical experience</h3>
            <dl className="mt-3 flex flex-col gap-3 text-sm">
              {skillGroups.map((group) => (
                <div key={group.id} className="grid grid-cols-[6.5rem_1fr] gap-3">
                  <dt className="font-medium text-foreground">{group.title}</dt>
                  <dd className="text-muted-foreground">{group.skills.join(", ")}</dd>
                </div>
              ))}
            </dl>
            <Link href="/skills" className={cn(textLink, "mt-4")}>
              All skills <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </Section>
  );
}

/* Contact ---------------------------------------------------------------- */

export function ContactSection({ profile, resumeHref }: { profile: NonNullable<ContentDocument["profile"]>; resumeHref: string | null }) {
  const channels = [
    { href: profile.linkedInUrl, label: "LinkedIn", icon: Linkedin, value: profile.linkedInUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") },
    { href: profile.githubUrl, label: "GitHub", icon: Github, value: profile.githubUrl.replace(/^https?:\/\/(www\.)?/, "") },
  ];
  return (
    <Section id="contact" labelledBy="contact-heading">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-10">
        <p className="font-mono text-sm text-primary" aria-hidden="true">
          04 / Contact
        </p>
        <h2 id="contact-heading" className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          What are you working on?
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">Email is the best way to reach me about roles, projects, or a product idea. I&apos;m based in {profile.location}.</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href={`mailto:${profile.email}`} className={primaryButton}>
            <Mail className="h-4 w-4" aria-hidden="true" /> {profile.email}
          </a>
          {channels.map(({ href, label, icon: Icon, value }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{label}</span>
              <span className="sr-only">: {value} (opens in a new tab)</span>
            </a>
          ))}
          {resumeHref && (
            <a href={resumeHref} download className={secondaryButton}>
              <Download className="h-4 w-4" aria-hidden="true" /> Résumé
            </a>
          )}
        </div>
        <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <BookOpenText className="h-4 w-4" aria-hidden="true" /> Prefer to ask first?
          <AskAiLink question="How can I contact Anjo?" label="Ask Anjo AI" variant="plain" icon={false} className={textLink} />
        </p>
      </div>
    </Section>
  );
}
