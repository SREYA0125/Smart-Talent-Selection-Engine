import { prisma } from "../config/prisma.js";
import { logger } from "../utils/logger.js";
import bcrypt from "bcryptjs";

/*
|--------------------------------------------------------------------------
| Admin Controller
|--------------------------------------------------------------------------
| Handles admin-only logic for platform stats, user management, and analytics.
|--------------------------------------------------------------------------
*/

// GET /api/admin/dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalRecruiters = await prisma.user.count({
      where: { role: "RECRUITER" },
    });

    const totalJobs = await prisma.job.count();
    const totalResumes = await prisma.resume.count();
    const totalAnalyses = await prisma.analysis.count();

    const recentJobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        recruiter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const recentCandidates = await prisma.analysis.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        resume: {
          select: {
            originalName: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalRecruiters,
        totalJobs,
        totalResumes,
        totalAnalyses,
      },
      recentJobs: recentJobs.map((j) => ({
        id: j.id,
        title: j.title,
        createdAt: j.createdAt,
        recruiterName: j.recruiter.name,
        recruiterEmail: j.recruiter.email,
      })),
      recentCandidates: recentCandidates.map((c) => ({
        id: c.id,
        candidateName: c.resume.originalName,
        overallScore: c.overallScore,
        createdAt: c.createdAt,
      })),
    });
  } catch (err) {
    logger.error("Admin dashboard stats failed", { error: err.message });
    return res.status(500).json({ success: false, message: "Server error while fetching admin dashboard stats" });
  }
};

// GET /api/admin/recruiters
export const getRecruiters = async (req, res) => {
  try {
    const { search, page, limit } = req.query;

    const where = { role: "RECRUITER" };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const totalItems = await prisma.user.count({ where });

    let recruiters;
    let pageNum = null;
    let limitNum = null;
    let totalPages = null;

    const selectOptions = {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      jobs: {
        select: {
          id: true,
          _count: {
            select: {
              resumes: true,
              analyses: true,
            },
          },
        },
      },
    };

    if (page || limit) {
      pageNum = parseInt(page, 10) || 1;
      limitNum = parseInt(limit, 10) || 10;
      const skip = (pageNum - 1) * limitNum;

      recruiters = await prisma.user.findMany({
        where,
        select: selectOptions,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      });
      totalPages = Math.ceil(totalItems / limitNum);
    } else {
      recruiters = await prisma.user.findMany({
        where,
        select: selectOptions,
        orderBy: { createdAt: "desc" },
      });
    }

    const formattedRecruiters = recruiters.map((recruiter) => {
      const totalJobs = recruiter.jobs.length;
      let totalResumes = 0;
      let totalAnalyses = 0;

      recruiter.jobs.forEach((job) => {
        totalResumes += job._count.resumes;
        totalAnalyses += job._count.analyses;
      });

      return {
        id: recruiter.id,
        name: recruiter.name,
        email: recruiter.email,
        role: recruiter.role,
        createdAt: recruiter.createdAt,
        stats: {
          totalJobs,
          totalResumes,
          totalAnalyses,
        },
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedRecruiters.length,
      recruiters: formattedRecruiters,
      items: formattedRecruiters,
      totalItems,
      currentPage: pageNum,
      totalPages: totalPages,
    });
  } catch (err) {
    logger.error("Admin get recruiters failed", { error: err.message });
    return res.status(500).json({ success: false, message: "Server error while fetching recruiters" });
  }
};

// POST /api/admin/recruiters
export const createRecruiter = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    if (!password || !password.trim()) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === "ADMIN" ? "ADMIN" : "RECRUITER";

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: userRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ success: true, recruiter: user });
  } catch (err) {
    logger.error("Admin create recruiter failed", { error: err.message });
    return res.status(500).json({ success: false, message: "Server error while creating recruiter" });
  }
};

// PUT /api/admin/recruiters/:id
export const updateRecruiter = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const { id } = req.params;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const data = {};

    if (name !== undefined) {
      data.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== existingUser.email) {
        const emailTaken = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (emailTaken) {
          return res.status(409).json({
            success: false,
            message: "An account with this email already exists",
          });
        }
        data.email = normalizedEmail;
      }
    }

    if (role !== undefined) {
      if (role !== "ADMIN" && role !== "RECRUITER") {
        return res.status(400).json({ success: false, message: "Invalid role" });
      }
      data.role = role;
    }

    if (password !== undefined && password.trim() !== "") {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(200).json({ success: true, recruiter: updatedUser });
  } catch (err) {
    logger.error("Admin update recruiter failed", { error: err.message });
    return res.status(500).json({ success: false, message: "Server error while updating recruiter" });
  }
};

// DELETE /api/admin/recruiters/:id
export const deleteRecruiter = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: "You cannot delete your own admin account" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await prisma.user.delete({
      where: { id },
    });

    return res.status(200).json({ success: true, message: "Recruiter deleted successfully" });
  } catch (err) {
    logger.error("Admin delete recruiter failed", { error: err.message });
    return res.status(500).json({ success: false, message: "Server error while deleting recruiter" });
  }
};

// GET /api/admin/jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        recruiter: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            resumes: true,
            analyses: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs: jobs.map((job) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        status: job.status,
        createdAt: job.createdAt,
        recruiterName: job.recruiter.name,
        recruiterEmail: job.recruiter.email,
        resumeCount: job._count.resumes,
        analysisCount: job._count.analyses,
      })),
    });
  } catch (err) {
    logger.error("Admin get jobs failed", { error: err.message });
    return res.status(500).json({ success: false, message: "Server error while fetching jobs" });
  }
};

// GET /api/admin/dashboard/analytics
export const getPlatformAnalytics = async (req, res) => {
  try {
    // 1. Hiring Trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const jobs = await prisma.job.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    });

    const resumes = await prisma.resume.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trendsMap = {};

    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      trendsMap[monthKey] = { month: monthKey, jobs: 0, resumes: 0, sortKey: d.getTime() };
    }

    jobs.forEach((job) => {
      const date = new Date(job.createdAt);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (trendsMap[monthKey]) {
        trendsMap[monthKey].jobs++;
      }
    });

    resumes.forEach((resume) => {
      const date = new Date(resume.createdAt);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (trendsMap[monthKey]) {
        trendsMap[monthKey].resumes++;
      }
    });

    const hiringTrends = Object.values(trendsMap)
      .sort((a, b) => a.sortKey - b.sortKey)
      .map((item) => ({
        month: item.month,
        jobs: item.jobs,
        resumes: item.resumes,
      }));

    // 2. Candidate Score Distribution
    const analyses = await prisma.analysis.findMany({
      select: { overallScore: true },
    });

    const distribution = {
      "0-20": 0,
      "21-40": 0,
      "41-60": 0,
      "61-80": 0,
      "81-100": 0,
    };

    analyses.forEach((analysis) => {
      const score = analysis.overallScore;
      if (score <= 20) distribution["0-20"]++;
      else if (score <= 40) distribution["21-40"]++;
      else if (score <= 60) distribution["41-60"]++;
      else if (score <= 80) distribution["61-80"]++;
      else distribution["81-100"]++;
    });

    const scoreDistribution = Object.keys(distribution).map((range) => ({
      range,
      count: distribution[range],
    }));

    // 3. Top Recruiters (recruiters with the most jobs & resumes)
    const recruiters = await prisma.user.findMany({
      where: { role: "RECRUITER" },
      select: {
        id: true,
        name: true,
        email: true,
        jobs: {
          select: {
            _count: {
              select: {
                resumes: true,
              },
            },
          },
        },
      },
    });

    const recruitersWithCounts = recruiters.map((recruiter) => {
      const jobCount = recruiter.jobs.length;
      let resumeCount = 0;
      recruiter.jobs.forEach((job) => {
        resumeCount += job._count.resumes;
      });

      return {
        id: recruiter.id,
        name: recruiter.name,
        email: recruiter.email,
        jobCount,
        resumeCount,
      };
    });

    const topRecruiters = recruitersWithCounts
      .sort((a, b) => (b.jobCount + b.resumeCount) - (a.jobCount + a.resumeCount))
      .slice(0, 5);

    // 4. Resume Analysis Counts
    const totalResumes = await prisma.resume.count();
    const totalAnalyses = await prisma.analysis.count();

    return res.status(200).json({
      success: true,
      hiringTrends,
      scoreDistribution,
      topRecruiters,
      analysisCounts: {
        totalResumes,
        analyzedResumes: totalAnalyses,
        unanalyzedResumes: Math.max(0, totalResumes - totalAnalyses),
      },
    });
  } catch (err) {
    logger.error("Admin platform analytics failed", { error: err.message });
    return res.status(500).json({ success: false, message: "Server error while fetching platform analytics" });
  }
};

// GET /api/admin/recruiters/export
export const exportRecruiters = async (req, res) => {
  try {
    const { search, format } = req.query;

    const where = {
      role: "RECRUITER",
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const recruiters = await prisma.user.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      include: {
        jobs: {
          select: {
            createdAt: true,
            resumes: {
              select: {
                id: true,
                analyses: {
                  select: { overallScore: true },
                },
              },
            },
          },
        },
      },
    });

    const formattedRecruiters = recruiters.map((recruiter) => {
      let totalJobs = recruiter.jobs.length;
      let totalResumes = 0;
      let totalScoreSum = 0;
      let totalAnalyses = 0;

      let lastActive = recruiter.updatedAt;

      recruiter.jobs.forEach((job) => {
        if (job.createdAt > lastActive) {
          lastActive = job.createdAt;
        }

        totalResumes += job.resumes.length;
        job.resumes.forEach((resume) => {
          if (resume.analyses && resume.analyses.length > 0) {
            totalAnalyses += resume.analyses.length;
            resume.analyses.forEach((analysis) => {
              totalScoreSum += analysis.overallScore;
            });
          }
        });
      });

      const averageScore = totalAnalyses > 0 ? Math.round(totalScoreSum / totalAnalyses) : 0;

      return {
        id: recruiter.id,
        name: recruiter.name,
        email: recruiter.email,
        jobsPosted: totalJobs,
        resumesProcessed: totalResumes,
        averageCandidateScore: averageScore,
        lastActiveDate: lastActive,
      };
    });

    if (format === "csv") {
      let csvContent = "\uFEFF"; // UTF-8 BOM
      csvContent += "Rank,Recruiter Name,Email,Jobs Posted,Resumes Processed,Average Candidate Score,Last Active Date\n";

      const escapeCsv = (val) => {
        if (val === undefined || val === null) return "";
        let str = typeof val === "string" ? val : String(val);
        str = str.replace(/"/g, '""');
        if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
          str = `"${str}"`;
        }
        return str;
      };

      formattedRecruiters.forEach((row, idx) => {
        csvContent += `${idx + 1},`;
        csvContent += `${escapeCsv(row.name)},`;
        csvContent += `${escapeCsv(row.email)},`;
        csvContent += `${row.jobsPosted},`;
        csvContent += `${row.resumesProcessed},`;
        csvContent += `${row.averageCandidateScore},`;
        csvContent += `${escapeCsv(new Date(row.lastActiveDate).toLocaleDateString())}\n`;
      });

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="recruiter_activity_report.csv"');
      return res.status(200).send(csvContent);
    }

    // Default JSON response for print PDF rendering
    return res.status(200).json({
      success: true,
      recruiters: formattedRecruiters,
    });
  } catch (err) {
    logger.error("Admin export recruiters failed", { error: err.message });
    return res.status(500).json({ success: false, message: "Server error while exporting recruiters" });
  }
};
