import {
  Award,
  BookOpen,
  Briefcase,
  Cloud,
  Compass,
  FolderKanban,
  GitBranch,
  Layers,
  Mail,
  MessageSquare,
  Sparkles,
  User,
} from "lucide-react";
import type { NavIcon as NavIconKey } from "./nav-config";

const ICONS = {
  chat: MessageSquare,
  user: User,
  briefcase: Briefcase,
  folder: FolderKanban,
  sparkles: Sparkles,
  cloud: Cloud,
  git: GitBranch,
  layers: Layers,
  award: Award,
  mail: Mail,
  book: BookOpen,
  compass: Compass,
} as const;

export function NavIcon({ name, className }: { name: NavIconKey; className?: string }) {
  const Icon = ICONS[name];
  return <Icon className={className ?? "h-4 w-4"} aria-hidden="true" />;
}
