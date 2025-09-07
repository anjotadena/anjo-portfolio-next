"use client";

import { Fragment } from "react";

export default function Projects() {
  const projects = [
    {
      title: "UCCOne",
      subtitle: "Streamline UCC Filings with Efficiency and Precision",
      description: ` is a robust and user-friendly platform designed to simplify the management and processing of Uniform Commercial Code (UCC) filings. It enables businesses and legal professionals to seamlessly manage filings, search records, and ensure compliance with UCC regulations. With its intuitive interface and powerful features, UCCOne enhances productivity, accuracy, and compliance for UCC-related tasks.`,
      achievements: [
        "Architected a secure, cloud-native solution leveraging AWS, enabling scalability, reliability, and compliance with industry standards.",
        "Developed an intuitive platform with file upload capabilities that reduced manual filing efforts by 40% through automated workflows, enhancing efficiency and accuracy in UCC filing management.",
        "Designed a powerful search system with filters for filing number, business details, and secured party data, enabling precise and rapid record retrieval.",
        "Enhanced database query performance by 50% through advanced indexing, optimization techniques, and the integration of OpenSearch for efficient data retrieval, ensuring a seamless user experience even under high workloads.",
      ],
      technologies: ["aws", "typescript", "react", "serverless", "nodejs"],
      image: "/assets/img/uccone.png", // Replace with your image path
    },
    {
      title: "Xelphahealth",
      subtitle: "Empowering Healthcare Through Technology and Innovation",
      description: `XELPHAhealth is a digital healthcare solutions company dedicated to enhancing healthcare delivery through technology. By facilitating engagement between providers and patients, as well as empowering individuals to connect with their health data, XELPHAhealth aims to improve healthcare outcomes and overall quality of life`,
      achievements: [
        "Ensured compatibility across desktop, tablet, and mobile devices for a seamless user experience.",
        "Included dynamic components such as navigation menus, call-to-action buttons, and form submissions for better engagement.",
        "Implemented best practices for faster load times, including lazy loading of assets and optimized bundling.",
        "Integrated meta tags, structured data, and accessible design to enhance search engine visibility and user inclusivity.",
      ],
      technologies: ["typescript", "angular"],
      image: "/assets/img/xelpha.png", // Replace with your image path
    },
    {
      "title": "Toledo City Water District Admin Dashboard",
      "subtitle": "Streamlining Operations and Elevating Customer Engagement",
      "description": "The TCWD Admin Dashboard is a comprehensive platform designed to manage accounts, announcements, complaints, forms, tickets, and reports. It empowers TCWD to enhance operational efficiency and provide exceptional service to its customers.",
      "achievements": [
        "Developed a responsive and user-friendly admin interface accessible on all devices to accommodate diverse user needs.",
        "Integrated a real-time ticket and complaint management system, reducing resolution time by 50%.",
        "Automated generation of reports with actionable insights, saving over 30% of administrative effort.",
        "Implemented secure role-based access control (RBAC) to ensure data integrity and compliance with organizational policies.",
        "Introduced a digital form submission system, eliminating paperwork and improving data tracking.",
        "Analyzed existing workflows and tools used by the Toledo City Water District to identify inefficiencies and gaps.",
        "Benchmarked industry standards for ticket management and report generation to ensure best practices.",
        "Conducted surveys and interviews with end-users to understand their needs and pain points.",
        "Explored and evaluated modern technologies like Laravel, Angular, and Chart.js to deliver a scalable solution.",
        "Held regular meetings with TCWD stakeholders to align on project goals and timelines.",
        "Provided prototypes and demos for feedback during development phases.",
        "Delivered comprehensive documentation and user guides to facilitate smooth onboarding.",
        "Set up a dedicated communication channel for real-time updates and issue resolution.",
        "Post-deployment, ensured ongoing support and training sessions for the TCWD team."
      ],
      "technologies": ["laravel", "mysql", "angular"],
      "image": "/assets/img/tcwd.png"
    }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center dark:text-white">Projects</h1>
        <p className="text-lg text-gray-700 mb-12 text-center dark:text-gray-200">
          A collection of projects where I contributed in a technical leadership
          role.
        </p>
        <div className="space-y-12">
          {projects.map((project, index) => {
            return (
              <Fragment key={index}>
                {index !== 0 && (
                  <hr className="w-48 h-1 mx-auto my-16 bg-blue-500 border-0 rounded dark:bg-blue-700"></hr>
                )}
                <div
                  key={index}
                  className={`flex flex-col lg:flex-row ${
                    index % 2 === 0 ? "lg:flex-row-reverse" : ""
                  } items-start space-y-6 lg:space-y-0 lg:space-x-8`}
                >
                  {/* Image Section */}
                  <div className="flex-shrink-0">
                    <img
                      src={project.image}
                      alt={`${project.title} dashboard`}
                      className="rounded-lg border-2 border-blue-400"
                      width={400}
                    />
                  </div>
                  {/* Content Section */}
                  <div>
                    <h2 className="text-3xl font-bold mb-2 text-gray-600 dark:text-white">
                      {project.title}
                    </h2>
                    <h3 className="text-xl text-gray-700 font-medium mb-4 dark:text-gray-200">
                      {project.subtitle}
                    </h3>
                    <p className="text-gray-700 le7ding-relaxed mb-6 whitespace-pre-line dark:text-gray-400">
                      {project.description}
                    </p>
                    <h4 className="text-lg font-bold mb-2 dark:text-gray-200">Achievements</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-400">
                      {project.achievements.map((achievement, i) => (
                        <li key={i}>{achievement}</li>
                      ))}
                    </ul>
                    <div className="flex flex-col space-x-4 mt-6">
                      <h4 className="text-lg font-bold mb-2 dark:text-gray-200">Technology Used:</h4>
                      <div className="flex space-x-4 mt-6">
                        {project.technologies.map((tech, i) => (
                          <img
                            key={i}
                            src={`/assets/tools/${tech}.png`} // Path to tech icons
                            alt={tech}
                            className="h-8"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
