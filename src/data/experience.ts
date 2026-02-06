export type Experience = {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
  highlights: string[];
  technologies?: string[];
};

export const experiences: Experience[] = [
  {
    id: "lead-engineer",
    company: "XyzTech",
    role: "Lead Engineer",
    period: "2021 - Present",
    location: "Remote",
    description:
      "Leading engineering teams to deliver scalable, production-grade software solutions. Responsible for technical architecture, team mentoring, and cross-functional collaboration.",
    highlights: [
      "Led development of UCC Filing Search System, reducing query latency by 60%",
      "Architected event-driven ingestion pipelines handling millions of records",
      "Mentored 5+ engineers through code reviews and technical coaching",
      "Established golden-path CI/CD templates reducing deployment variance",
    ],
    technologies: ["TypeScript", "Node.js", "AWS", "OpenSearch", "Terraform"],
  },
  {
    id: "senior-engineer",
    company: "HealthTech Solutions",
    role: "Senior Frontend Engineer",
    period: "2019 - 2021",
    location: "Hybrid",
    description:
      "Developed component-driven UIs for health data dashboards with focus on performance and accessibility.",
    highlights: [
      "Built responsive health dashboard serving 10K+ daily users",
      "Reduced UI regressions through shared component libraries",
      "Improved perceived performance via deferred rendering patterns",
      "Collaborated with backend teams on API design and data contracts",
    ],
    technologies: ["React", "TypeScript", "REST APIs", "CI/CD"],
  },
  {
    id: "fullstack-engineer",
    company: "Water District Administration",
    role: "Full-stack Engineer",
    period: "2017 - 2019",
    location: "On-site",
    description:
      "Designed and built admin dashboards for operational workflows, improving efficiency and reducing manual overhead.",
    highlights: [
      "Reduced ticket resolution time by 50% with unified admin workflow",
      "Implemented RBAC-first approach for secure data access",
      "Built automated reporting system for monthly operational exports",
      "Maintained legacy systems while modernizing key modules",
    ],
    technologies: ["Angular", "Laravel", "MySQL", "PHP"],
  },
  {
    id: "software-engineer",
    company: "Various Startups",
    role: "Software Engineer",
    period: "2014 - 2017",
    location: "Remote / On-site",
    description:
      "Worked across multiple early-stage startups building MVPs and production systems from scratch.",
    highlights: [
      "Built e-commerce platforms and content management systems",
      "Developed RESTful APIs and database schemas from scratch",
      "Shipped mobile-responsive web applications",
      "Gained expertise across the full development lifecycle",
    ],
    technologies: ["JavaScript", "PHP", "MySQL", "WordPress", "jQuery"],
  },
];

export const totalYearsExperience = new Date().getFullYear() - 2014;
