const technologiesUsed = [
  {
    name: "Backend Development",
    items: ["ASP.NET", "TSQL", "C#", "Laravel", "PHP", "NodeJS", "Serverless"],
  },
  {
    name: "Frontend Development",
    items: ["Angular", "Typescript", "ReactJS", "NextJS", "TailwindCSS"],
  },
  {
    name: "Mobile Development",
    items: ["React Native", ".NET MAUI"],
  },
  {
    name: "Databases",
    items: ["MongoDB", "MSSQL", "Postgres", "MySQL"],
  },
  {
    name: "DevOps",
    items: [
      "Azure",
      "GitHub Actions",
      "Docker",
      "Circle CI",
      "Travis CI",
      "GitLab",
    ],
  },
  {
    name: "Architecture",
    items: [
      "Microservices",
      "Event Sourcing",
      "CQRS",
      "CQRS/ES",
      "CQRS/ES with Event Sourcing",
      "Serverless",
    ],
  },
  {
    name: "Tools",
    items: [
      "Visual Studio",
      "Visual Studio Code",
      "Postman",
      "Vim",
      "Git",
      "Jira",
      "Azure DevOps",
      "Bitbucket",
    ],
  },
  {
    name: "Operating Systems",
    items: ["Windows", "Linux", "MacOS"],
  },
];

const About = () => (
  <div className="min-h-[85vh] max-w-4xl mx-auto flex flex-col items-center">
    <section className="mb-6 mt-6">
      <h1 className="text-4xl font-bold mb-6 text-center">About Me</h1>
      <p className="text-md text-gray-700 mb-12 text-center">
        I am a software engineer with a growing passion for leading and
        collaborating with teams to deliver high-quality software solutions.
        Currently, I am honing my skills in designing and building scalable web
        and mobile applications, while taking on new challenges as a team
        leader.
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Why Work with Me?</h2>
      <p className="text-md text-gray-700 mb-12 text-center">
        I bring a proactive approach to problem-solving and collaboration. While
        I am still growing in my leadership journey, I am dedicated to fostering
        a positive team environment and ensuring the successful delivery of
        projects. My focus is on continuous learning, both technically and
        professionally, to provide value to any project I contribute to.
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Technology Expertise
      </h2>
      <p className="text-md text-gray-700 mb-12 text-center">
        My technical stack includes experience with modern frameworks and tools.
        While I am continually expanding my skill set, here are the core
        technologies I work with:
      </p>
      {technologiesUsed.map((tech, index) => (
        <div key={index} className="text-center my-4">
          <h3 className="font-medium text-gray-800 mb-2">{tech.name}</h3>
          <div className="flex justify-center gap-2 items-center align-center">
            {tech.items.map((item, itemIndex) => (
              <span
                key={itemIndex}
                className="text-blue-600 border border-blue-600 px-2 rounded-sm hover:bg-blue-600 hover:text-white hover:cursor-pointer"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
      <p className="text-md text-gray-700 mt-12 text-center">
        I am committed to continuous improvement and adapting to the needs of
        each project. Whether working on new features, debugging issues, or
        exploring innovative solutions, I bring enthusiasm and a growth mindset
        to every challenge.
      </p>
    </section>
  </div>
);

export default About;
