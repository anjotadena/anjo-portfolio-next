export const projects = [
  {
    id: "ai-powered-analytics",
    title: "AI-Powered Analytics Platform",
    description: "Built a scalable analytics platform that processes 10M+ events daily",
    problem: "Enterprise clients needed real-time insights from massive data streams without infrastructure overhead.",
    solution: "Designed a distributed architecture using microservices, event streaming, and ML-based anomaly detection.",
    impact: "Reduced query times by 85%, processing 10M+ events daily with 99.9% uptime.",
    tech: ["TypeScript", "Node.js", "Python", "TensorFlow", "Kafka", "PostgreSQL", "Redis"],
    metrics: {
      performance: "85% faster queries",
      scale: "10M+ events/day",
      uptime: "99.9%"
    },
    featured: true
  },
  {
    id: "production-deployment-system",
    title: "Zero-Downtime Deployment System",
    description: "Engineered CI/CD pipeline reducing deployment time by 70%",
    problem: "Manual deployments caused frequent downtime and slowed release cycles.",
    solution: "Built automated CI/CD with blue-green deployments, automated testing, and rollback mechanisms.",
    impact: "70% faster deployments, zero downtime, 95% reduction in deployment failures.",
    tech: ["Docker", "Kubernetes", "GitHub Actions", "Terraform", "AWS"],
    metrics: {
      deploymentTime: "70% faster",
      downtime: "Zero",
      failures: "95% reduction"
    },
    featured: true
  },
  {
    id: "ai-content-generation",
    title: "AI Content Generation Engine",
    description: "Created intelligent content generation system serving 100K+ users",
    problem: "Content creators spent hours on repetitive writing tasks with inconsistent quality.",
    solution: "Developed AI-powered engine with custom fine-tuned models, context management, and quality scoring.",
    impact: "Serving 100K+ users, 90% time savings, 4.8/5 user satisfaction.",
    tech: ["Python", "OpenAI API", "FastAPI", "React", "PostgreSQL", "Redis"],
    metrics: {
      users: "100K+",
      timeSaved: "90%",
      satisfaction: "4.8/5"
    },
    featured: true
  },
  {
    id: "microservices-architecture",
    title: "Microservices Migration",
    description: "Led migration from monolith to microservices for 1M+ user platform",
    problem: "Legacy monolith couldn't scale, deployments risky, teams blocked each other.",
    solution: "Designed and executed phased migration to domain-driven microservices with event sourcing.",
    impact: "3x faster feature delivery, independent team deployments, 99.95% availability.",
    tech: ["Node.js", "GraphQL", "MongoDB", "RabbitMQ", "Docker", "AWS ECS"],
    metrics: {
      speed: "3x faster delivery",
      availability: "99.95%",
      teams: "6 independent teams"
    },
    featured: false
  }
];

export const services = [
  {
    title: "Full-Stack Development",
    description: "End-to-end application development from architecture to deployment",
    outcome: "Production-ready, scalable systems that grow with your business",
    icon: "code"
  },
  {
    title: "AI Integration",
    description: "Intelligent features powered by modern AI/ML technologies",
    outcome: "Enhanced user experiences and automated workflows that save time",
    icon: "brain"
  },
  {
    title: "System Architecture",
    description: "Scalable, maintainable architectures for complex applications",
    outcome: "Robust foundations that handle millions of users and requests",
    icon: "network"
  },
  {
    title: "Performance Optimization",
    description: "Speed improvements and efficiency gains across your stack",
    outcome: "Faster load times, reduced costs, better user satisfaction",
    icon: "zap"
  },
  {
    title: "Team Leadership",
    description: "Technical leadership and mentorship for engineering teams",
    outcome: "High-performing teams delivering quality code consistently",
    icon: "users"
  },
  {
    title: "DevOps & Infrastructure",
    description: "Automated pipelines, containerization, and cloud infrastructure",
    outcome: "Reliable deployments, zero downtime, scalable infrastructure",
    icon: "server"
  }
];

export const blogPosts = [
  {
    id: "building-scalable-systems",
    title: "Building Scalable Systems: Lessons from 10M+ Daily Users",
    excerpt: "Key architectural decisions and patterns that helped us scale from 0 to 10M daily active users without major rewrites.",
    date: "2026-03-15",
    readTime: "8 min read",
    tags: ["Architecture", "Scalability", "Performance"]
  },
  {
    id: "ai-integration-patterns",
    title: "AI Integration Patterns for Production Applications",
    excerpt: "Practical approaches to integrating AI features into existing applications, with real-world examples and performance considerations.",
    date: "2026-03-01",
    readTime: "12 min read",
    tags: ["AI", "Integration", "Best Practices"]
  },
  {
    id: "zero-downtime-deployments",
    title: "Achieving Zero-Downtime Deployments",
    excerpt: "A comprehensive guide to implementing blue-green deployments, feature flags, and database migrations without service interruptions.",
    date: "2026-02-20",
    readTime: "10 min read",
    tags: ["DevOps", "Deployment", "Infrastructure"]
  },
  {
    id: "microservices-communication",
    title: "Microservices Communication: Events vs APIs",
    excerpt: "When to use synchronous APIs versus event-driven patterns in microservices architectures, with trade-offs and examples.",
    date: "2026-02-05",
    readTime: "9 min read",
    tags: ["Microservices", "Architecture", "Design Patterns"]
  }
];

export const techStack = [
  { name: "TypeScript", category: "language" },
  { name: "Python", category: "language" },
  { name: "React", category: "frontend" },
  { name: "Node.js", category: "backend" },
  { name: "PostgreSQL", category: "database" },
  { name: "MongoDB", category: "database" },
  { name: "Redis", category: "database" },
  { name: "Docker", category: "devops" },
  { name: "Kubernetes", category: "devops" },
  { name: "AWS", category: "cloud" },
  { name: "TensorFlow", category: "ai" },
  { name: "OpenAI", category: "ai" },
];
