export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "1",
    quote:
      "Anjo consistently delivered high-quality solutions and mentored junior developers with patience and clarity. His architectural decisions were always well-thought-out and scalable.",
    author: "Sarah Chen",
    role: "Engineering Manager",
    company: "TechCorp Inc.",
  },
  {
    id: "2",
    quote:
      "Working with Anjo was a game-changer for our team. He brought structure to our codebase and introduced best practices that significantly improved our deployment velocity.",
    author: "Michael Rodriguez",
    role: "CTO",
    company: "StartupXYZ",
  },
  {
    id: "3",
    quote:
      "Anjo's ability to break down complex problems and communicate technical concepts to non-technical stakeholders is exceptional. A true full-stack engineer.",
    author: "Emily Watson",
    role: "Product Director",
    company: "Digital Solutions Ltd.",
  },
];
