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
      <h1 className="text-4xl font-bold mb-6 text-center dark:text-white">About Me</h1>
      <p className="text-md text-gray-700 mb-12 text-center dark:text-gray-200">
        I am a dedicated and results-driven Lead Software Engineer with
        extensive experience in full-stack development and a strong focus on
        delivering innovative, high-quality solutions. My expertise spans a wide
        range of technologies, including ASP.NET Core, Angular, TypeScript,
        ReactJS, VueJS, C#, Laravel, Node.js, MongoDB, SQL Server, AWS, and
        Azure. I have successfully led and collaborated on projects involving
        monolithic and microservices architectures, demonstrating proficiency in
        cloud-native development, CI/CD pipelines, and modern UI frameworks.
        Beyond technical skills, I value mentorship, fostering team growth, and
        continuous learning to drive project success.
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-3xl font-bold mb-6 text-center dark:text-white">Why Work with Me?</h2>
      <p className="text-md text-gray-700 mb-12 text-center dark:text-gray-200">
        I bring a combination of technical expertise, proven experience, and a
        collaborative approach to every project. My skills in modern
        technologies, full-stack development, and scalable architectures ensure
        efficient and innovative solutions. I excel in working closely with
        clients and teams to align goals, deliver high-quality results, and
        foster growth. With a strong focus on leadership, adaptability, and a
        passion for excellence, I am committed to creating impactful software
        that drives success. Partnering with me means working with someone who
        values both technical precision and lasting relationships.
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-3xl font-bold mb-6 text-center dark:text-white">
        Technology Expertise
      </h2>
      <p className="text-md text-gray-700 mb-12 text-center dark:text-gray-200">
        My technical stack includes experience with modern frameworks and tools.
        While I am continually expanding my skill set, here are the core
        technologies I work with:
      </p>
      {technologiesUsed.map((tech, index) => (
        <div key={index} className="text-center my-4">
          <h3 className="font-medium text-gray-800 mb-2 dark:text-white">{tech.name}</h3>
          <div className="flex justify-center gap-2 items-center align-center">
            {tech.items.map((item, itemIndex) => (
              <span
                key={itemIndex}
                className="text-blue-600 dark:text-white border dark:border-white border-blue-600 px-2 rounded-sm hover:bg-blue-600 hover:text-white hover:cursor-pointer"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
      <p className="text-md text-gray-700 mt-12 text-center dark:text-gray-200">
        Working with me means partnering with a professional who is passionate
        about creating impactful software while building strong, lasting
        relationships with clients and teams. Let's collaborate to turn your
        vision into reality!
      </p>
    </section>
  </div>
);

export default About;
