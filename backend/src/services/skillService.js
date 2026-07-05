import { prisma } from "../config/prisma.js";

// Shared by jobController (required skills) and resumeController (detected
// skills) so "React" only ever exists as one Skill row across the whole DB.
export async function upsertSkills(skillNames) {
  const skills = [];
  for (const rawName of skillNames) {
    const name = rawName.trim().toLowerCase();
    if (!name) continue;
    const skill = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    skills.push(skill);
  }
  return skills;
}
