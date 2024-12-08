const About = () => (
  <div className="min-h-[85vh] max-w-4xl mx-auto flex flex-col items-center">
    <section className="mb-6 mt-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2 border-b">
        About Me
      </h2>
      <p className="text-md text-gray-600">
        I am a software engineer with a growing passion for leading and
        collaborating with teams to deliver high-quality software solutions.
        Currently, I am honing my skills in designing and building scalable web
        and mobile applications, while taking on new challenges as a team
        leader.
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2 border-b">
        Why Work with Me?
      </h2>
      <p className="text-md text-gray-600">
        I bring a proactive approach to problem-solving and collaboration. While
        I am still growing in my leadership journey, I am dedicated to fostering
        a positive team environment and ensuring the successful delivery of
        projects. My focus is on continuous learning, both technically and
        professionally, to provide value to any project I contribute to.
      </p>
    </section>

    <section className="mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        Technology Expertise
      </h2>
      <p className="text-md text-gray-600 mb-4">
        My technical stack includes experience with modern frameworks and tools.
        While I am continually expanding my skill set, here are the core
        technologies I work with:
      </p>
      <ul className="list-disc list-inside text-md text-gray-600 space-y-2">
        <li>
          <span className="font-medium text-gray-800">
            Backend Development:
          </span>{" "}
          ASP.NET, C#, MongoDB, MSSQL
        </li>
        <li>
          <span className="font-medium text-gray-800">
            Frontend Development:
          </span>{" "}
          Angular, ReactJS, TypeScript
        </li>
        <li>
          <span className="font-medium text-gray-800">Mobile Development:</span>{" "}
          React Native, .NET MAUI
        </li>
        <li>
          <span className="font-medium text-gray-800">Cloud Solutions:</span>{" "}
          Azure, AWS
        </li>
        <li>
          <span className="font-medium text-gray-800">DevOps Practices:</span>{" "}
          CI/CD pipelines
        </li>
      </ul>
      <p className="text-md text-gray-600 mt-4">
        I am committed to continuous improvement and adapting to the needs of
        each project. Whether working on new features, debugging issues, or
        exploring innovative solutions, I bring enthusiasm and a growth mindset
        to every challenge.
      </p>
    </section>
  </div>
);

export default About;
