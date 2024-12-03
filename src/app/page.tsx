
export default function About() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="w-34 md:w-40">
        <img
          src="https://avatars.githubusercontent.com/u/12849968?v=4" /* Replace with your image path */
          alt="WordPress Consultant"
          className="w-full h-full object-cover rounded-[50%]"
        />
        <div className="flex space-x-6 mt-6">
          {/* GitHub */}
          <a
            href="https://github.com/your-profile" /* Replace with your GitHub link */
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white"
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

          {/* Twitter */}
          <a
            href="https://twitter.com/your-profile" /* Replace with your Twitter link */
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6"
            >
              <path d="M24 4.557a9.834 9.834 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724 9.864 9.864 0 0 1-3.127 1.195 4.92 4.92 0 0 0-8.384 4.482A13.957 13.957 0 0 1 1.671 3.149a4.92 4.92 0 0 0 1.524 6.573 4.903 4.903 0 0 1-2.23-.616c-.054 2.281 1.582 4.415 3.949 4.89a4.928 4.928 0 0 1-2.224.085 4.923 4.923 0 0 0 4.604 3.417 9.874 9.874 0 0 1-6.102 2.104c-.396 0-.788-.023-1.175-.068A13.933 13.933 0 0 0 7.548 21c9.056 0 14.01-7.502 14.01-14.01 0-.213-.004-.425-.013-.636A10.01 10.01 0 0 0 24 4.557z" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href="https://linkedin.com/in/your-profile" /* Replace with your LinkedIn link */
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white"
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
      </div>
      <h1 className="text-5xl font-bold mb-4 mt-6">Hi, I'm Anjo</h1>
      <p className="text-center text-xl mb-6 md:w-[70%]">
        Software Engineer with 10 years of full-stack web development
        experience. Have had the opportunity to be part of some exciting
        projects using ASP.NET, Angular, ReactJS, and React Native, and been
        able to explore the power of platforms like Azure and AWS on the cloud.
        Over the years, I have explored different architectures: microservices,
        serverless, and even monolithic systems. And recently, I was interested
        in how AI tools change the way we write software. Scalable, efficient
        solutions and sharing what you learn are things I am enthusiastic about.
      </p>
      <a
        href="/resume"
        className="px-6 py-3 bg-white text-blue-500 font-semibold rounded-md shadow-md hover:bg-gray-200"
      >
        Explore
      </a>
    </div>
  );
}
