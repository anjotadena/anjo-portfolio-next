"use client"; // If you're using interactivity

export default function Projects() {
  const projects = [
    {
      title: "Project 1",
      subtitle: "POS middleware & real-time dashboard",
      description: `Led the design and development of a custom middleware system to optimize Domino's delivery and customer service operations.

The middleware system ingested and mapped orders from multiple channels (marketplace aggregators and a call center CRM) into a normalized format. Orders were then sent in real-time to the correct Domino's outlet using a SOAP-based API accessed through an internet-isolated VPN.

All order and customer details were exposed through a customer service and analytics dashboard, which the call center staff could use to monitor order fulfillment in real-time.`,
      achievements: [
        "Facilitated the call center in meeting Domino's strict delivery SLAs by completely removing the need for manual data entry into the POS.",
        "Increased the effectiveness of Domino's delivery and customer service operations by exposing order status, customer information, and delivery details through a real-time dashboard.",
      ],
      technologies: ["aws", "typescript", "react", "nextjs", "nodejs"],
      image: "/assets/images/dominos-dashboard.png", // Replace with your image path
    },
  ];

  return (
    <div className="min-h-screen  text-white p-6">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Projects</h1>
        <p className="text-lg text-gray-400 mb-12 text-center">
          A list of projects I've been involved with in a technical leadership capacity.
        </p>
        <div className="space-y-12">
          {projects.map((project, index) => (
            <div
              key={index}
              className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8"
            >
              {/* Image Section */}
              <div className="flex-shrink-0">
                <img
                  src={project.image}
                  alt={`${project.title} dashboard`}
                  className="rounded-lg border-4 border-purple-600"
                  width={400}
                />
              </div>
              {/* Content Section */}
              <div>
                <h2 className="text-3xl font-bold mb-2">{project.title}</h2>
                <h3 className="text-xl text-purple-400 font-medium mb-4">{project.subtitle}</h3>
                <p className="text-gray-300 leading-relaxed mb-6 whitespace-pre-line">
                  {project.description}
                </p>
                <h4 className="text-lg font-bold mb-2">Achievements</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  {project.achievements.map((achievement, i) => (
                    <li key={i}>{achievement}</li>
                  ))}
                </ul>
                <div className="flex space-x-4 mt-6">
                  {project.technologies.map((tech, i) => (
                    <img
                      key={i}
                      src={`/assets/icons/${tech}.svg`} // Path to tech icons
                      alt={tech}
                      className="h-8 w-8"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
