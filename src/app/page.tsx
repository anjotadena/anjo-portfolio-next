import type { Metadata } from "next";

import { AskInput } from "@/components/site/AskInput";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Home",
  description: "Senior Software Engineer / Lead Developer portfolio.",
};

export default function Page() {
  return (
    <div className="w-full max-w-xl px-4 text-center">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Hey, I&apos;m {site.name.split(" ")[0]}.
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {site.title}
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-zinc-700 dark:text-zinc-200">
          {site.tagline}
        </p>

        <div className="mt-8">
          <AskInput />
        </div>
      </div>
  );
}
