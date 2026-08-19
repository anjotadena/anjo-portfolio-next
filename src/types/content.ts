export type ContentStatus = "verified" | "draft";
export type ContentCategory =
  | "profile" | "skills" | "philosophy" | "ai-engineering"
  | "experience" | "projects" | "contact";

export interface ContentDocument {
  slug: string;
  title: string;
  category: ContentCategory;
  status: ContentStatus;
  summary: string;
  tags: string[];
  related: string[];
  body: string;
  sourcePath: string;
}

export interface ContentChunk {
  id: string;
  documentSlug: string;
  documentTitle: string;
  category: ContentCategory;
  heading: string | null;
  text: string;
  tags: string[];
  related: string[];
}
