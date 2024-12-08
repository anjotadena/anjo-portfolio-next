import React from "react";

const Resume = () => {
  const timelineData = [
    {
      date: "December 2023 — PRESENT",
      title: "Software Engineer",
      company: "Nelnet Philippines Inc. - Manila",
      description:
        "Slashnode works with SMEs and startups in Australia and abroad to execute web projects using best-in-class processes, tools, and technology stacks, with a focus on Laravel and NestJS frameworks. Slashnode offers a range of services and solutions, including:",
      points: [
        "Fractional CTO services: Acting as the part-time CTO for startups and SMEs. Advising on technology choices, assisting in the hiring process, and optimizing development processes and procedures (including DevOps and deployment automation).",
        "AppSec/Cybersecurity reviews of Laravel and NestJS codebases.",
        "Technical due diligence: Reviewing digital datarooms and code repositories for SMEs during the due diligence phase of company acquisitions.",
      ],
    },
    {
      date: "May 2023 — October 2023",
      title: "Senior Software Engineer",
      company: "Prosource BPO - Manila",
      description:
        "Spearheaded technical operations and development strategies for a mid-sized technology company.",
      points: [
        "Led a team of 30+ engineers to deliver multiple enterprise-grade SaaS products.",
        "Optimized CI/CD pipelines, reducing deployment time by 50%.",
        "Oversaw company-wide migration to a microservices architecture, improving system scalability by 300%.",
      ],
    },
    {
      date: "March 2022 - March 2023",
      title: "Software Engineer",
      company: "Arcanys/XLR8 Hub Inc. - Cebu",
      description:
        "Developed and maintained web applications for various industries, contributing to the full development lifecycle.",
      points: [
        "Designed and implemented RESTful APIs using Node.js and Express.",
        "Built responsive front-end interfaces with React and Angular.",
        "Collaborated with cross-functional teams to meet client requirements on time.",
      ],
    },
    {
      date: "August 2019 - March 2022",
      title: "Software Engineer",
      company: "Sprobe Inc. - Cebu",
      description:
        "Developed and maintained web applications for various industries, contributing to the full development lifecycle.",
      points: [
        "Designed and implemented RESTful APIs using Node.js and Express.",
        "Built responsive front-end interfaces with React and Angular.",
        "Collaborated with cross-functional teams to meet client requirements on time.",
      ],
    },
    {
      date: "January 2016 - August 2019",
      title: "Software Engineer",
      company: "Code Republic/Ark Creative Studio - Cebu",
      description:
        "Developed and maintained web applications for various industries, contributing to the full development lifecycle.",
      points: [
        "Designed and implemented RESTful APIs using Node.js and Express.",
        "Built responsive front-end interfaces with React and Angular.",
        "Collaborated with cross-functional teams to meet client requirements on time.",
      ],
    },
    {
      date: "April 2015 - August 2015",
      title: "Software Engineer",
      company: "Central Mindanao University - Mindanao",
      description:
        "Developed and maintained web applications for various industries, contributing to the full development lifecycle.",
      points: [
        "Designed and implemented RESTful APIs using Node.js and Express.",
        "Built responsive front-end interfaces with React and Angular.",
        "Collaborated with cross-functional teams to meet client requirements on time.",
      ],
    },
  ];

  return (
    <div className="py-10 px-6 sm:px-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-extrabold text-gray-900 leading-tight text-center">
          Resume
        </h1>
        <p className="text-center mb-12">
          An overview of my professional experience and key accomplishments in
          each role.
        </p>

        {/* Timeline as a List */}
        <ol className="relative border-s border-gray-500 dark:border-gray-700">
          {timelineData.map((item, index) => (
            <li key={index} className="mb-10 ml-6">
              {/* Dot */}
              <span className="absolute w-3 h-3 bg-gray-700 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></span>

              {/* Date */}
              <p className="text-sm text-gray-900">{item.date}</p>

              {/* Title and Company */}
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <h4 className="text-lg font-light text-gray-900">
                {item.company}
              </h4>

              {/* Description */}
              <p className="mt-2 text-gray-900">{item.description}</p>

              {/* Bullet Points */}
              <ul className="mt-4 space-y-2 text-gray-900 list-disc list-inside">
                {item.points.map((point, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-green-400 mt-1 mr-2">✔</span>
                    {point}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default Resume;
