import { prisma } from "../config/prisma.js";
import { logger } from "../utils/logger.js";

// GET /api/ranking/:jobId
// Reads candidates analysis data.
// Supports query parameters: search, scoreMin, scoreMax, sort, page, limit.
export const getRankings = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { search, scoreMin, scoreMax, sort, page, limit } = req.query;

    // Check ownership. If admin, bypass recruiterId restriction
    const jobQuery = { id: jobId };
    if (req.user.role !== "ADMIN") {
      jobQuery.recruiterId = req.user.id;
    }

    const job = await prisma.job.findFirst({
      where: jobQuery,
      select: { id: true, title: true },
    });

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const resumeCount = await prisma.resume.count({ where: { jobId: job.id } });

    if (resumeCount === 0) {
      return res.status(200).json({
        success: true,
        job,
        candidateCount: 0,
        rankings: [],
        items: [],
        message: "No resumes have been uploaded for this job yet",
      });
    }

    // Build filtering options
    const where = { jobId: job.id };

    if (search) {
      where.resume = {
        originalName: { contains: search, mode: "insensitive" },
      };
    }

    if (scoreMin !== undefined || scoreMax !== undefined) {
      where.overallScore = {};
      if (scoreMin !== undefined && scoreMin !== "") {
        where.overallScore.gte = parseInt(scoreMin, 10);
      }
      if (scoreMax !== undefined && scoreMax !== "") {
        where.overallScore.lte = parseInt(scoreMax, 10);
      }
    }

    // Build sorting options
    let orderBy = [{ overallScore: "desc" }, { createdAt: "asc" }];
    if (sort === "lowest_score") {
      orderBy = [{ overallScore: "asc" }, { createdAt: "asc" }];
    } else if (sort === "recently_analyzed") {
      orderBy = [{ createdAt: "desc" }];
    }

    const totalItems = await prisma.analysis.count({ where });

    let analyses;
    let pageNum = null;
    let limitNum = null;
    let totalPages = null;

    const selectOptions = {
      overallScore: true,
      summary: true,
      matchingSkills: true,
      missingSkills: true,
      resume: {
        select: { id: true, originalName: true },
      },
    };

    if (page || limit) {
      pageNum = parseInt(page, 10) || 1;
      limitNum = parseInt(limit, 10) || 10;
      const skip = (pageNum - 1) * limitNum;

      analyses = await prisma.analysis.findMany({
        where,
        orderBy,
        select: selectOptions,
        skip,
        take: limitNum,
      });
      totalPages = Math.ceil(totalItems / limitNum);
    } else {
      analyses = await prisma.analysis.findMany({
        where,
        orderBy,
        select: selectOptions,
      });
    }

    // Calculate global rank positions relative to the page index
    const startRank = pageNum ? (pageNum - 1) * limitNum : 0;
    const rankings = analyses.map((analysis, index) => ({
      rank: startRank + index + 1,
      resumeId: analysis.resume.id,
      candidateName: analysis.resume.originalName,
      overallScore: analysis.overallScore,
      summary: analysis.summary,
      matchingSkills: analysis.matchingSkills,
      missingSkills: analysis.missingSkills,
    }));

    return res.status(200).json({
      success: true,
      job,
      candidateCount: rankings.length,
      rankings,
      items: rankings,
      totalItems,
      currentPage: pageNum,
      totalPages: totalPages,
    });
  } catch (err) {
    logger.error("Get rankings failed", { error: err.message, jobId: req.params.jobId });
    return res.status(500).json({ success: false, message: "Server error while ranking candidates" });
  }
};

// GET /api/ranking/:jobId/export
export const exportRankings = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { search, scoreMin, scoreMax, sort, format } = req.query;

    const jobQuery = { id: jobId };
    if (req.user.role !== "ADMIN") {
      jobQuery.recruiterId = req.user.id;
    }

    const job = await prisma.job.findFirst({
      where: jobQuery,
      select: { id: true, title: true },
    });

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const where = { jobId: job.id };

    if (search) {
      where.resume = {
        originalName: { contains: search, mode: "insensitive" },
      };
    }

    if (scoreMin !== undefined || scoreMax !== undefined) {
      where.overallScore = {};
      if (scoreMin !== undefined && scoreMin !== "") {
        where.overallScore.gte = parseInt(scoreMin, 10);
      }
      if (scoreMax !== undefined && scoreMax !== "") {
        where.overallScore.lte = parseInt(scoreMax, 10);
      }
    }

    let orderBy = [{ overallScore: "desc" }, { createdAt: "asc" }];
    if (sort === "lowest_score") {
      orderBy = [{ overallScore: "asc" }, { createdAt: "asc" }];
    } else if (sort === "recently_analyzed") {
      orderBy = [{ createdAt: "desc" }];
    }

    const analyses = await prisma.analysis.findMany({
      where,
      orderBy,
      select: {
        overallScore: true,
        summary: true,
        matchingSkills: true,
        missingSkills: true,
        createdAt: true,
        resume: {
          select: {
            id: true,
            originalName: true,
            rawText: true,
          },
        },
      },
    });

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

    const exportData = analyses.map((analysis, index) => {
      const match = analysis.resume.rawText ? analysis.resume.rawText.match(emailRegex) : null;
      const email = match ? match[0] : "N/A";
      
      // Clean candidate name (strip file extension)
      let candidateName = analysis.resume.originalName;
      if (candidateName.includes(".")) {
        candidateName = candidateName.substring(0, candidateName.lastIndexOf("."));
      }
      candidateName = candidateName.replace(/[_-]/g, " ");

      return {
        rank: index + 1,
        candidateName,
        email,
        overallScore: analysis.overallScore,
        matchingSkills: analysis.matchingSkills,
        missingSkills: analysis.missingSkills,
        summary: analysis.summary,
        analysisDate: analysis.createdAt,
      };
    });

    if (format === "csv") {
      let csvContent = "\uFEFF"; // UTF-8 BOM
      csvContent += "Rank,Candidate Name,Email,Overall Match Score,Matched Skills,Missing Skills,AI Summary,Analysis Date\n";

      const escapeCsv = (val) => {
        if (val === undefined || val === null) return "";
        let str = typeof val === "string" ? val : String(val);
        str = str.replace(/"/g, '""');
        if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
          str = `"${str}"`;
        }
        return str;
      };

      exportData.forEach((row) => {
        csvContent += `${row.rank},`;
        csvContent += `${escapeCsv(row.candidateName)},`;
        csvContent += `${escapeCsv(row.email)},`;
        csvContent += `${row.overallScore},`;
        csvContent += `${escapeCsv(row.matchingSkills.join(", "))},`;
        csvContent += `${escapeCsv(row.missingSkills.join(", "))},`;
        csvContent += `${escapeCsv(row.summary)},`;
        csvContent += `${escapeCsv(new Date(row.analysisDate).toLocaleDateString())}\n`;
      });

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="candidate_ranking_${job.title.replace(/\s+/g, "_")}.csv"`);
      return res.status(200).send(csvContent);
    }

    // Default JSON structure for client-side PDF rendering
    return res.status(200).json({
      success: true,
      job,
      exportData,
    });
  } catch (err) {
    logger.error("Export rankings failed", { error: err.message, jobId: req.params.jobId });
    return res.status(500).json({ success: false, message: "Server error while exporting rankings" });
  }
};
