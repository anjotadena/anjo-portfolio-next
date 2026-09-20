import { Suspense } from "react";
import { ChatContainer } from "@/components/chat/chat-container";
import { HomeRail } from "@/components/portfolio/home-rail";
import { PersonJsonLd } from "@/components/seo/json-ld";
import { buildSuggestedPrompts } from "@/lib/ai/follow-ups";
import { getFeaturedProjects, getProfile, getPublicDocuments } from "@/lib/knowledge/repository";
import { initialsFor } from "@/lib/utils/initials";

export default function HomePage() {
  const { profile } = getProfile();
  const prompts = buildSuggestedPrompts(getPublicDocuments(), 8);
  const initials = initialsFor(profile.name);
  const firstName = profile.name.split(" ")[0] ?? profile.name;

  return (
    <div className="flex min-h-0 flex-1">
      <PersonJsonLd />
      <Suspense fallback={null}>
        <ChatContainer assistantName="Anjo AI" assistantInitials={initials} ownerFirstName={firstName} suggestedPrompts={prompts} />
      </Suspense>
      <HomeRail profile={profile} tagline={profile.tagline} projects={getFeaturedProjects(3)} />
    </div>
  );
}
