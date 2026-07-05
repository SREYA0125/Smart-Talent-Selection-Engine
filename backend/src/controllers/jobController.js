import { prisma } from "../config/prisma.js";
import { extractJobSkills } from "../services/aiScoring.js";
import { upsertSkills } from "../services/skillService.js";

// Shapes a Prisma Job (with nested JobSkill -> Skill rows) into the flat
// { requiredSkills: [string] } format the frontend already expects —
// keeps the API contract identical even though the DB is now relational.
const formatJob = (job) => ({
  _id: job.id,
  title: job.title,
  description: job.description,
  status: job.status.toLowerCase(),
  requiredSkills: job.requiredSkills.map((js) => js.skill.name),
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
});

export const createJob = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }

    const skillNames = await extractJobSkills(description);
    const skills = await upsertSkills(skillNames);

    const job = await prisma.job.create({
      data: {
        title,
        description,
        recruiterId: req.user.id,
        requiredSkills: {
          create: skills.map((skill) => ({ skillId: skill.id })),
        },
      },
      include: { requiredSkills: { include: { skill: true } } },
    });

    res.status(201).json({ success: true, job: formatJob(job) });
  } catch (err) {
    next(err);
  }
};

export const getJobs = async (req, res, next) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { recruiterId: req.user.id },
      include: { requiredSkills: { include: { skill: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, jobs: jobs.map(formatJob) });
  } catch (err) {
    next(err);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: req.params.id, recruiterId: req.user.id },
      include: { requiredSkills: { include: { skill: true } } },
    });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    res.json({ success: true, job: formatJob(job) });
  } catch (err) {
    next(err);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: req.params.id, recruiterId: req.user.id },
    });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    // Applications, ApplicationSkill and Score rows cascade-delete via the
    // onDelete: Cascade relations defined in schema.prisma.
    await prisma.job.delete({ where: { id: job.id } });

    res.json({ success: true, message: "Job deleted" });
  } catch (err) {
    next(err);
  }
};
