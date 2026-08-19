"use client";

import { useRef, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const LIMITS = { name: 100, email: 254, message: 2000 } as const;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_EMAIL = "tadena.anjo@gmail.com";

type ContactField = "name" | "email" | "message";
type FieldErrors = Partial<Record<ContactField, string>>;

type SubmitState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "success" }
  | { status: "rate-limited" }
  | { status: "email-not-configured"; mailtoHref: string }
  | { status: "error"; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readCode(payload: unknown): string | undefined {
  return isRecord(payload) && typeof payload.code === "string" ? payload.code : undefined;
}

const FIELD_ERROR_MESSAGES: Record<string, string> = {
  required: "This field is required.",
  too_long: "This is too long.",
  invalid: "This isn't valid.",
  invalid_email: "Enter a valid email address.",
};

function describeServerFieldError(code: string): string {
  return FIELD_ERROR_MESSAGES[code.toLowerCase()] ?? "This field is invalid.";
}

/** Parses the server's `400` field-level error codes into display messages. */
function readServerFieldErrors(payload: unknown): FieldErrors {
  if (!isRecord(payload) || !isRecord(payload.fields)) return {};
  const errors: FieldErrors = {};
  for (const field of ["name", "email", "message"] as const) {
    const value = payload.fields[field];
    if (typeof value === "string" && value.length > 0) {
      errors[field] = describeServerFieldError(value);
    }
  }
  return errors;
}

/** Mirrors the server's field limits for fast feedback — never a substitute for server-side validation. */
function validate(values: { name: string; email: string; message: string }): FieldErrors {
  const errors: FieldErrors = {};

  const name = values.name.trim();
  if (!name) errors.name = "Enter your name.";
  else if (values.name.length > LIMITS.name) errors.name = `Keep this under ${LIMITS.name} characters.`;

  const email = values.email.trim();
  if (!email) errors.email = "Enter your email.";
  else if (values.email.length > LIMITS.email) errors.email = `Keep this under ${LIMITS.email} characters.`;
  else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";

  const message = values.message.trim();
  if (!message) errors.message = "Enter a message.";
  else if (values.message.length > LIMITS.message)
    errors.message = `Keep this under ${LIMITS.message} characters.`;

  return errors;
}

export interface ContactFormProps {
  className?: string;
}

/**
 * Contact form: Name, Email, Message, Send. POSTs JSON to `/api/contact` and
 * handles every documented server response, including the expected-for-now
 * `503 EMAIL_NOT_CONFIGURED` case with a `mailto:` fallback prefilled with
 * the visitor's message.
 */
export function ContactForm({ className }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  function focusFirstInvalid(errors: FieldErrors) {
    if (errors.name) nameRef.current?.focus();
    else if (errors.email) emailRef.current?.focus();
    else if (errors.message) messageRef.current?.focus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (honeypot.length > 0) {
      // A field only a bot would fill was filled: pretend to succeed, send nothing.
      setSubmitState({ status: "success" });
      return;
    }

    const clientErrors = validate({ name, email, message });
    setFieldErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      focusFirstInvalid(clientErrors);
      return;
    }

    setSubmitState({ status: "pending" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (response.status === 200) {
        setFieldErrors({});
        setSubmitState({ status: "success" });
        setName("");
        setEmail("");
        setMessage("");
        return;
      }

      const payload: unknown = await response.json().catch(() => undefined);

      if (response.status === 400) {
        const serverErrors = readServerFieldErrors(payload);
        setFieldErrors(serverErrors);
        focusFirstInvalid(serverErrors);
        setSubmitState({ status: "idle" });
        return;
      }

      if (response.status === 429) {
        setSubmitState({ status: "rate-limited" });
        return;
      }

      if (response.status === 503 && readCode(payload) === "EMAIL_NOT_CONFIGURED") {
        const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
          `Portfolio contact from ${name.trim() || "website visitor"}`,
        )}&body=${encodeURIComponent(message)}`;
        setSubmitState({ status: "email-not-configured", mailtoHref });
        return;
      }

      setSubmitState({ status: "error", message: "Something went wrong. Please try again." });
    } catch {
      setSubmitState({
        status: "error",
        message: "Something went wrong. Please check your connection and try again.",
      });
    }
  }

  const isPending = submitState.status === "pending";

  return (
    <form onSubmit={handleSubmit} noValidate className={className}>
      <div className="flex flex-col gap-5">
        <Field label="Name" required error={fieldErrors.name}>
          {(controlProps) => (
            <Input
              {...controlProps}
              ref={nameRef}
              name="name"
              type="text"
              autoComplete="name"
              maxLength={LIMITS.name + 20}
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isPending}
            />
          )}
        </Field>

        <Field label="Email" required error={fieldErrors.email}>
          {(controlProps) => (
            <Input
              {...controlProps}
              ref={emailRef}
              name="email"
              type="email"
              autoComplete="email"
              maxLength={LIMITS.email + 20}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isPending}
            />
          )}
        </Field>

        <Field label="Message" required error={fieldErrors.message}>
          {(controlProps) => (
            <Textarea
              {...controlProps}
              ref={messageRef}
              name="message"
              maxLength={LIMITS.message + 200}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              disabled={isPending}
            />
          )}
        </Field>

        {/*
         * Honeypot: invisible to sighted users and screen readers alike, but
         * still a normal `text` input (not `type="hidden"`) so bots that
         * blindly fill every visible-typed field still get caught. Hidden
         * via off-screen absolute positioning rather than `display:none`,
         * which some bots explicitly detect and skip.
         */}
        <div className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="contact-website">Leave this field empty</label>
          <input
            id="contact-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </div>

        {submitState.status === "success" && (
          <p role="status" className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            Thanks — your message is on its way.
          </p>
        )}

        {submitState.status === "rate-limited" && (
          <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            You&apos;ve sent a few messages recently — please wait a bit before trying again.
          </p>
        )}

        {submitState.status === "email-not-configured" && (
          <div
            role="alert"
            className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 p-4 text-sm text-foreground"
          >
            <p>
              Email delivery isn&apos;t configured on this site yet, so the form can&apos;t send your
              message right now.
            </p>
            <a
              href={submitState.mailtoHref}
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Email {CONTACT_EMAIL} directly instead
            </a>
          </div>
        )}

        {submitState.status === "error" && (
          <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {submitState.message}
          </p>
        )}

        <Button type="submit" disabled={isPending} aria-busy={isPending} className="self-start">
          {isPending ? "Sending…" : "Send"}
        </Button>
      </div>
    </form>
  );
}
