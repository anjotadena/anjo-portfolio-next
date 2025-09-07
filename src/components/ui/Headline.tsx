"use client";

import dynamic from "next/dynamic";

// Dynamically import TypingEffect to prevent hydration issues
const TypingEffect = dynamic(() => import("@/components/ui/TypingEffect"), {
  ssr: false,
  loading: () => <span>&nbsp;</span>
});

const Headline = () => (
  <div className="w-full">
    <h1 className="text-6xl font-extrabold text-gray-900 leading-tight dark:text-gray-200">
      {`Hi, I'm Anjo Tadena`}
      <br />|
      <span className="text-blue-600 dark:text-blue">
        <TypingEffect
          texts={["Software Engineer", "Web Developer", "Tech Enthusiast"]}
          speed={200}
          eraseSpeed={150}
          delay={1000}
        />
      </span>
    </h1>
    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
      Software engineer passionate about building impactful web solutions and
      growing as a team leader.
    </p>

    <div className="py-5 flex">
      <a
        href="/contact"
        className="flex items-center text-blue-700 dark:text-white border border-blue-600 dark:border-white dark:bg-blue-700 py-2 px-6 gap-2 rounded inline-flex items-center hover:bg-blue-600 hover:dark:bg-white dark:hover:text-blue-700 hover:text-white hover:cursor-pointer"
      >
        <span>Get in Touch</span>
        <svg
          className="w-4 w-6 h-6 ml-2"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
        </svg>
      </a>
    </div>

    {/* List of links icon such as github, linkedin */}
    <div></div>
  </div>
);

export default Headline;
