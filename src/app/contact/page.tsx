"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  LuArrowLeft,
  LuCalendar,
  LuCheck,
  LuDownload,
  LuExternalLink,
  LuGithub,
  LuLinkedin,
  LuLoader,
  LuMail,
  LuMapPin,
  LuSend,
} from "react-icons/lu";

import { site } from "@/config/site";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().max(100).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const contactLinks = [
  {
    id: "email",
    icon: LuMail,
    label: "Email",
    value: site.links.email,
    href: `mailto:${site.links.email}`,
    external: false,
    description: "For general inquiries",
  },
  {
    id: "linkedin",
    icon: LuLinkedin,
    label: "LinkedIn",
    value: "Connect with me",
    href: site.links.linkedin,
    external: true,
    description: "Professional network",
  },
  {
    id: "github",
    icon: LuGithub,
    label: "GitHub",
    value: "View my code",
    href: site.links.github,
    external: true,
    description: "Open source work",
  },
  {
    id: "schedule",
    icon: LuCalendar,
    label: "Schedule a Call",
    value: "Book a time",
    href: site.links.schedule,
    external: true,
    description: "30-minute chat",
  },
];

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = useCallback(
    async (data: ContactFormData) => {
      // For now, create a mailto link with the form data
      // In production, you'd send this to an API endpoint
      const subject = encodeURIComponent(`Portfolio Contact: ${data.name}`);
      const body = encodeURIComponent(
        `Name: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company || "Not specified"}\n\nMessage:\n${data.message}`
      );

      window.location.href = `mailto:${site.links.email}?subject=${subject}&body=${body}`;
      setIsSubmitted(true);
      reset();

      // Reset success state after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    },
    [reset]
  );

  return (
    <div className="min-h-screen bg-white pt-20 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-12">
        {/* Back Link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <LuArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            Get in Touch
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Have a project in mind, looking for a technical lead, or just want to connect?
            I&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <div>
            <h2 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Send a Message
            </h2>

            {isSubmitted ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-800/50 dark:bg-green-900/20">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
                  <LuCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                  Message Ready
                </h3>
                <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                  Your email client should open with the message. If not, feel free to email me
                  directly at {site.links.email}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register("name")}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-primary-500"
                    placeholder="Your name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-primary-500"
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Company (Optional) */}
                <div>
                  <label
                    htmlFor="company"
                    className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Company <span className="text-zinc-400">(optional)</span>
                  </label>
                  <input
                    id="company"
                    type="text"
                    {...register("company")}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-primary-500"
                    placeholder="Your company"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    {...register("message")}
                    className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-primary-500"
                    placeholder="Tell me about your project or opportunity..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-primary-700 disabled:opacity-50 sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <LuLoader className="h-4 w-4 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <LuSend className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Links */}
          <div>
            <h2 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Other Ways to Connect
            </h2>

            <div className="space-y-4">
              {contactLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-4 rounded-xl border border-zinc-100 bg-white p-4 transition-all hover:border-primary-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-primary-800"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    <link.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{link.label}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{link.description}</p>
                  </div>
                  {link.external && <LuExternalLink className="h-4 w-4 text-zinc-400" />}
                </a>
              ))}
            </div>

            {/* Resume Download */}
            <div className="mt-8 rounded-xl border border-zinc-100 bg-slate-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Download Resume</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Get a PDF copy of my resume with full work history and qualifications.
              </p>
              <a
                href={site.links.resumePdf}
                download
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
              >
                <LuDownload className="h-4 w-4" />
                Download PDF
              </a>
            </div>

            {/* Location */}
            <div className="mt-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-500">
              <LuMapPin className="h-4 w-4" />
              <span>{site.location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
