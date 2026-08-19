import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SkillGroup } from "@/types/portfolio";

export interface SkillGroupsProps {
  groups: SkillGroup[];
}

/**
 * Capability-grouped skills. Deliberately no percentage bars or proficiency
 * meters anywhere — skills are presented as plain labels grouped by
 * capability, not scored.
 */
export function SkillGroups({ groups }: SkillGroupsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <Card key={group.id}>
          <CardHeader>
            <CardTitle>{group.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-wrap gap-1.5">
              {group.skills.map((skill) => (
                <li key={skill}>
                  <Badge variant="neutral">{skill}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
