
import React from "react";

const Resume = () => {
  const timelineData = [
    {
      date: "August 2023 — NOW",
      title: "Software Consultant",
      company: "Slashnode Pty Ltd (Sydney)",
      description:
        "Slashnode works with SMEs and startups in Australia and abroad to execute web projects using best-in-class processes, tools, and technology stacks, with a focus on Laravel and NestJS frameworks. Slashnode offers a range of services and solutions, including:",
      points: [
        "Fractional CTO services: Acting as the part-time CTO for startups and SMEs. Advising on technology choices, assisting in the hiring process, and optimizing development processes and procedures (including DevOps and deployment automation).",
        "AppSec/Cybersecurity reviews of Laravel and NestJS codebases.",
        "Technical due diligence: Reviewing digital datarooms and code repositories for SMEs during the due diligence phase of company acquisitions.",
      ],
    },
    {
      date: "September 2017 — August 2023",
      title: "CTO",
      company: "Tech Solutions Co.",
      description:
        "Spearheaded technical operations and development strategies for a mid-sized technology company.",
      points: [
        "Led a team of 30+ engineers to deliver multiple enterprise-grade SaaS products.",
        "Optimized CI/CD pipelines, reducing deployment time by 50%.",
        "Oversaw company-wide migration to a microservices architecture, improving system scalability by 300%.",
      ],
    },
    {
      date: "July 2015 — August 2017",
      title: "Full-Stack Developer",
      company: "Innovatech Inc.",
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
        <h2 className="text-4xl font-bold mb-6 text-center">Resume</h2>
        <p className="text-center text-gray-400 mb-12">
          A comprehensive list of my professional experience and relevant achievements in each role.
        </p>

        {/* Timeline as a List */}
        <ol className="relative border-s border-gray-200 dark:border-gray-700">
          {timelineData.map((item, index) => (
            <li key={index} className="mb-10 ml-6">
              {/* Dot */}
              <span className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></span>

              {/* Date */}
              <p className="text-sm text-gray-400">{item.date}</p>

              {/* Title and Company */}
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <h4 className="text-lg font-light text-blue-400">{item.company}</h4>

              {/* Description */}
              <p className="mt-2 text-gray-400">{item.description}</p>

              {/* Bullet Points */}
              <ul className="mt-4 space-y-2 text-gray-300 list-disc list-inside">
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
