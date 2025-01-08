import TypingEffect from "@/components/ui/TypingEffect";
import Image from "next/image";

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

const ProfilePicture = () => (
  <div className="flex flex-col">
    <Image
      src="/assets/img/anjo_solo.png" /* Replace with your image path */
      alt="Anjo Tadena"
      width={250}
      height={250}
      className="object-cover rounded-full mx-auto thumbnail bg-gray-400 dark:bg-gray-200"
    />
    <SocialLinks />
  </div>
);

const SocialLinks = () => (
  <div className="flex align-center item-center justify-center py-8 gap gap-4">
    <a
      href="https://github.com/anjotadena" /* Replace with your GitHub link */
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-300 hover:text-blue-600 dark:hover:text-white"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
        className="w-6 h-6"
      >
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.799 8.207 11.387.6.11.793-.261.793-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.384-1.332-1.753-1.332-1.753-1.089-.745.082-.729.082-.729 1.205.085 1.839 1.238 1.839 1.238 1.07 1.835 2.809 1.305 3.495.998.108-.775.42-1.305.762-1.606-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.468-2.381 1.236-3.221-.124-.303-.535-1.522.117-3.176 0 0 1.008-.323 3.3 1.23.957-.266 1.984-.399 3.006-.403 1.02.004 2.049.137 3.006.403 2.291-1.553 3.297-1.23 3.297-1.23.653 1.654.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.804 5.624-5.476 5.921.43.371.823 1.102.823 2.222 0 1.606-.014 2.901-.014 3.292 0 .319.192.694.8.576C20.565 21.795 24 17.297 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    </a>

    {/* LinkedIn */}
    <a
      href="https://www.linkedin.com/in/anjotadena" /* Replace with your LinkedIn link */
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-300 hover:text-blue-600 dark:hover:text-white"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
        className="w-6 h-6"
      >
        <path d="M22.225 0H1.771C.792 0 0 .772 0 1.721v20.456C0 23.228.792 24 1.771 24h20.451C23.208 24 24 23.228 24 22.177V1.721C24 .772 23.208 0 22.225 0zM7.121 20.452H3.563V9.04h3.558v11.412zM5.342 7.655c-1.146 0-2.075-.93-2.075-2.076S4.196 3.504 5.342 3.504s2.075.93 2.075 2.075c0 1.147-.93 2.076-2.075 2.076zM20.452 20.452h-3.558v-5.805c0-1.383-.027-3.162-1.926-3.162-1.926 0-2.221 1.505-2.221 3.059v5.908h-3.557V9.04h3.413v1.561h.049c.474-.896 1.632-1.839 3.36-1.839 3.591 0 4.253 2.362 4.253 5.437v6.253z" />
      </svg>
    </a>
  </div>
);

export default function Page() {
  return (
    <>
      {/* Hero Section */}
      <section className="h-[84vh] md:flex md:items-center md:justify-center">
        <div className="max-w-4xl mx-auto mt-[100px] grid grid-cols-1 md:grid-cols-4 md:gap-6 items-center">
          {/* Headline Section */}
          <div className="col-span-3 order-2 md:order-1">
            <Headline />
          </div>

          {/* Profile Picture Section */}
          <div className="col-span-1 flex justify-center order-1 md:order-2">
            <ProfilePicture />
          </div>
        </div>
      </section>
    </>
  );
}
