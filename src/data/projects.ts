export type Project = {
  slug: string;
  name: string;
  role: string;
  stack: string[];
  impact: string;
  problem: string;
  architectureOverview: string;
  keyDecisions: string[];
  impactMetrics: string[];
  featured?: boolean;
  image?: string;
};

export const projects: Project[] = [
  {
    slug: "ucc-filing-search",
    name: "UCC Filing Search System",
    role: "Tech Lead / Full-stack Engineer",
    stack: ["Next.js", "TypeScript", "Node.js", "AWS", "OpenSearch"],
    impact: "Reduced query latency by ~60% and automated ingestion workflows to cut manual effort by ~40%.",
    problem:
      "UCC filing workflows were slow, error-prone, and difficult to search at scale across large document sets.",
    architectureOverview:
      "Event-driven ingestion pipeline + indexed search layer; client app optimized for fast, filterable retrieval.",
    keyDecisions: [
      "Indexed read models for search-heavy UX instead of overloading the transactional store.",
      "Explicit observability for ingestion and search quality (latency, error rate, freshness).",
      "Guardrails for data quality (dedupe, schema validation) at ingestion boundaries.",
    ],
    impactMetrics: [
      "~60% faster search responses via indexing and query optimization",
      "~40% less manual filing work via automated ingestion",
      "Improved recall/precision through structured filters and tuned relevance",
    ],
    featured: true,
    image: "/assets/img/uccone.png",
  },
  {
    slug: "health-dashboard-api",
    name: "Health Dashboard & API",
    role: "Senior Frontend Engineer",
    stack: ["React", "TypeScript", "REST", "CI/CD"],
    impact: "Improved dashboard responsiveness and reduced UX friction across common clinical workflows.",
    problem:
      "Teams needed a unified view of health data with reliable performance and consistent UI patterns.",
    architectureOverview:
      "Component-driven UI, predictable data fetching, and shared design primitives to keep the surface area maintainable.",
    keyDecisions: [
      "Normalized API shapes at the edge to reduce UI conditionals and inconsistent states.",
      "Small, composable components with clear semantics and accessible interactions.",
      "Performance budget mindset (avoid over-fetching; defer non-critical UI).",
    ],
    impactMetrics: [
      "Faster perceived performance through deferred rendering of non-critical sections",
      "Reduced UI regressions via shared primitives and stricter component contracts",
    ],
    featured: true,
    image: "/assets/img/xelpha.png",
  },
  {
    slug: "internal-devops-platform",
    name: "Internal DevOps Platform",
    role: "Engineering Lead",
    stack: ["AWS", "Terraform", "Kubernetes", "Observability"],
    impact: "Standardized CI/CD patterns and reduced deployment variance across teams.",
    problem:
      "Teams shipped inconsistently across environments with duplicated pipelines and unclear ownership boundaries.",
    architectureOverview:
      "Opinionated templates, automated environment provisioning, and centralized observability for faster incident response.",
    keyDecisions: [
      "Golden-path templates over bespoke pipelines to reduce long-term maintenance cost.",
      "Least-privilege access model with auditable changes by default.",
      "Clear ownership boundaries: platform provides primitives; teams own services and SLOs.",
    ],
    impactMetrics: [
      "Reduced deployment variance via standardized pipelines and templates",
      "Faster onboarding through documented golden paths",
    ],
    featured: true,
  },
  {
    slug: "tcwd-admin-dashboard",
    name: "Water District Admin Dashboard",
    role: "Full-stack Engineer",
    stack: ["Angular", "Laravel", "MySQL"],
    impact: "Reduced ticket resolution time by ~50% with a unified admin workflow.",
    problem:
      "Operational workflows were fragmented, leading to slow complaint and ticket handling with limited reporting.",
    architectureOverview:
      "Role-based admin surface with modular sections (tickets, complaints, announcements) and automated reporting.",
    keyDecisions: [
      "RBAC-first approach to reduce accidental data exposure.",
      "Report generation optimized for operational visibility and monthly exports.",
    ],
    impactMetrics: ["~50% reduction in ticket resolution time", "Less admin overhead via automated reporting"],
    image: "/assets/img/tcwd.png",
  },
];

export const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);

export function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug) ?? null;
}

