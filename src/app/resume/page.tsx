import React from "react";

const Resume = () => {
  const timelineData = [
    {
      date: "December 2023 — PRESENT",
      title: "Software Engineer",
      company: "Nelnet Philippines Inc. - Manila",
      description:
        "Nelnet Philippines Inc., is a software services subsidiary of Nelnet, Inc., a diversified company focusing on education-related products, services, and student loan asset management. NPI supports IT development teams across Nelnet Business Services, collaborating on applications for the education, nonprofit, and religious sectors. The company offers opportunities in various programming languages and technologies.",
      points: [
        "Design and implement scalable, secure, and maintainable applications using ASP.NET Core, Angular, and modern technologies.",
        "Architect, develop, and optimize microservices-based solutions to improve scalability, performance, and reliability.",
        "Leverage AWS and Azure for building cloud-native solutions, including serverless architectures and containerized services.",
        "Guide and support junior engineers through code reviews and technical mentorship, fostering skill development within the team.",
        "Drive process optimizations, CI/CD pipeline enhancements, and the adoption of emerging technologies to improve team efficiency and product quality.",
      ],
    },
    {
      date: "May 2023 — October 2023",
      title: "Senior Software Engineer",
      company: "Prosource BPO - Manila",
      description:
        "ProSource BPO is a business process outsourcing company based in Makati, Philippines, with additional offices in Hong Kong. It specializes in building and managing distributed teams for global clients, focusing on highly technical roles and expertise in technologies such as .NET, AWS, Angular, Java, Salesforce, and more.",
      points: [
        "Enhanced and maintained an existing client product using C#, Angular, Azure, VueJS, and Ionic.",
        "Designed and implemented new features to meet client requirements while ensuring product quality and reliability.",
        "Reported directly to the Product Owner, providing updates and aligning on project goals and deliverables.",
        "Collaborated with cross-functional teams to ensure smooth project execution and timely delivery of tasks.",
        "Leveraged Azure for cloud-based solutions and utilized modern frameworks like VueJS and Ionic for enhanced user experience.",
      ],
    },
    {
      date: "March 2022 - March 2023",
      title: "Software Engineer",
      company: "Arcanys/XLR8 Hub Inc. - Cebu",
      description:
        "Arcanys is a Swiss software development outsourcing company founded in 2010 by entrepreneurs Alan Debonneville and Frederic Joye. Based in the Philippines, Arcanys specializes in building dedicated teams of skilled developers for tech-enabled businesses, offering services such as user interface design, business analysis, prototyping, software testing, and application development. The company caters to various sectors, including fintech, media, and healthcare, emphasizing a people-centric approach to foster a collaborative work environment and ensure high employee satisfaction and retention rates.",
      points: [
        "Designed, developed, and maintained client-specific systems utilizing ReactJS for front-end development and C# for back-end services.",
        "Engaged directly with the client to gather requirements, provide progress updates, and ensure the delivered solutions met their expectations.",
        "Implemented best practices in coding standards, conducted code reviews, and performed thorough testing to ensure high-quality deliverables.",
        "Collaborated with cross-functional teams, including designers, testers, and project managers, to ensure seamless integration and functionality of the system.",
        "Created and maintained comprehensive documentation of the system architecture, codebase, and user guides to facilitate knowledge sharing and future maintenance.",
      ],
    },
    {
      date: "August 2019 - March 2022",
      title: "Software Engineer",
      company: "Sprobe Inc. - Cebu",
      description:
        "Sprobe Inc. is a Japan-affiliated company located in Cebu Business Park, Philippines, specializing in both IT Outsourcing (ITO) and Business Process Outsourcing (BPO) services. Established in 2012, Sprobe delivers software development and systems integration projects for clients primarily from Japan and Singapore, encompassing web and mobile applications, UI/UX design, and creative services. The company emphasizes core values such as Self-Discipline, Professionalism, Respect, Openness, Balance, and Excellence, fostering a family-like, innovative, and energetic work environment.",
      points: [
        "Designed, developed, and maintained client-specific systems utilizing ReactJS for front-end development and C# for back-end services.",
        "Engaged directly with clients to gather requirements, provide progress updates, and ensure the delivered solutions met their expectations.",
        "Implemented best practices in coding standards, conducted code reviews, and performed thorough testing to ensure high-quality deliverables.",
        "Collaborated with cross-functional teams, including designers, testers, and project managers, to ensure seamless integration and functionality of the system.",
        "Created and maintained comprehensive documentation of the system architecture, codebase, and user guides to facilitate knowledge sharing and future maintenance.",
      ],
    },
    {
      date: "January 2016 - August 2019",
      title: "Software Engineer",
      company: "Code Republic/Ark Creative Studio - Cebu",
      description:
        "Code Republiq is a technology division of RGC, a full-service digital agency based in Cebu, Philippines. The company specializes in providing technology and engineering services, including web development, mobile app development, UX/UI design, e-commerce solutions, and online business strategies. Code Republiq collaborates with other RGC divisions to deliver comprehensive digital transformation and creative solutions. It emphasizes innovative and efficient approaches to meet diverse client needs.",
      points: [
        "Designed, developed, and maintained client-specific systems using ReactJS, NodeJS, Laravel, Angular, and serverless technologies.",
        "Built scalable and serverless applications, ensuring seamless integration with backend services and optimal system performance.",
        "Worked directly with clients to gather requirements, provide progress updates, and deliver tailored solutions to meet their business objectives.",
        "Ensured high-quality deliverables through best coding practices, regular code reviews, and thorough testing procedures.",
        "Collaborated with designers, testers, and project managers to ensure the timely delivery of robust and user-friendly solutions.",
        "Created and maintained comprehensive technical documentation, including system architecture, API references, and user guides, to facilitate seamless knowledge sharing and system maintenance.",
      ],
    },
    {
      date: "April 2015 - August 2015",
      title: "Software Engineer",
      company: "Central Mindanao University - Mindanao",
      description:
        "Central Mindanao University (CMU) is a premier state university located in the Philippines, renowned for its excellence in instruction, research, and extension services. CMU focuses on providing high-quality education and fostering innovation across various disciplines. Its IT initiatives include developing and maintaining digital systems to support academic and administrative functions.",
      points: [
        "Designed and developed the Library System for Research and Thesis Management from scratch using VueJS for the front-end and Laravel for the back-end.",
        "Implemented features allowing students and graduates to upload, categorize, and search for research and thesis entries, ensuring ease of use and accessibility.",
        "Integrated logic to identify and flag potential duplicate submissions, promoting originality and integrity in academic research.",
        "Designed and optimized the database schema to store and manage large volumes of research data efficiently.",
        "Engaged with university administrators, librarians, and students to gather requirements and ensure the system met their specific needs.",
        "Deployed the system, provided technical support, and trained end-users to ensure smooth adoption and usage across the university.",
      ],
    },
    {
      date: "Graduated 2014",
      title: "Bachelor of Science in Information Technology",
      company: "Central Mindanao University - Mindanao",
      description: "",
      points: [],
    },
  ];

  return (
    <div className="py-10 px-6 sm:px-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center dark:text-white">
          Resume
        </h1>
        <p className="text-lg text-gray-700 mb-8 text-center dark:text-gray-200">
          An overview of my professional experience and key accomplishments in
          each role.
        </p>

        {/* Timeline as a List */}
        <ol className="relative border-s border-gray-300 dark:border-gray-200">
          {timelineData.map((item, index) => (
            <li key={index} className="mb-10 ml-6">
              {/* Dot */}
              <span className="absolute w-3 h-3 bg-gray-400 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-200 dark:bg-gray-100"></span>

              {/* Date */}
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {item.date}
              </p>

              {/* Title and Company */}
              <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-100">
                {item.title}
              </h3>
              <h4 className="text-xs font-light text-gray-500 dark:text-gray-300">
                {item.company}
              </h4>

              {/* Description */}
              <p className="mt-2 text-gray-900 dark:text-gray-400">
                {item.description}
              </p>

              {/* Bullet Points */}
              {item.points.length > 0 && (
                <h5 className="mt-4 font-semibold text-gray-900 dark:text-gray-100">
                  Key Responsibilities:
                </h5>
              )}

              <ul className="mt-4 space-y-2 text-gray-900 list-disc list-inside">
                {item.points.map((point, i) => (
                  <li key={i} className="flex items-start dark:text-gray-400">
                    <span className="dark:text-gray-200 text-blue-500 mt-1 mr-2">
                      *
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        {/* Bottom Download Section */}
        <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Need a copy for your records?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Download my complete resume as a PDF document
            </p>
            <a
              href="/anjo_tadena_software_engineer_resume.pdf"
              download="Anjo_Tadena_Software_Engineer_Resume.pdf"
              className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm hover:shadow-md"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
              Download PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resume;
