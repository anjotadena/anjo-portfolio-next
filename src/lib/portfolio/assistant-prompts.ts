import { getProfile, getPublicDocumentBySlug, getPublicDocuments } from "@/lib/knowledge/repository";

/**
 * Starter questions for the assistant. Each one is included only when the
 * public document that answers it exists, so the widget never suggests a
 * question the portfolio cannot ground.
 */
export function getAssistantPrompts(): string[] {
  const firstName = getProfile().profile.name.split(" ")[0] ?? "Anjo";
  const docs = getPublicDocuments();
  const hasType = (type: string) => docs.some((doc) => doc.type === type);
  const candidates: Array<[string, boolean]> = [
    ["What is Unexaro?", getPublicDocumentBySlug("unexaro") !== null],
    ["How does Asterweave work?", getPublicDocumentBySlug("asterweave") !== null],
    ["What experience is relevant to my team?", hasType("skills") || hasType("experience")],
    [`How can I contact ${firstName}?`, hasType("contact")],
  ];
  return candidates.filter(([, grounded]) => grounded).map(([prompt]) => prompt);
}
