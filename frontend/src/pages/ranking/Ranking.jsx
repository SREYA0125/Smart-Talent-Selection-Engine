import { useEffect, useState, useCallback } from "react";

import Loader from "../../components/common/Loader";
import { TableSkeleton } from "../../components/common/Skeletons.jsx";
import RankingList from "../../components/ranking/RankingList";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import { Award, Filter, Search } from "lucide-react";
import SearchBar from "../../components/common/SearchBar";
import FilterDropdown from "../../components/common/FilterDropdown";
import SortDropdown from "../../components/common/SortDropdown";
import Pagination from "../../components/common/Pagination";

import {
  getRecruiterJobs,
  getRanking,
  exportRanking,
} from "../../services/rankingService";
import { useToast } from "../../contexts/ToastContext.jsx";

/*
|--------------------------------------------------------------------------
| Ranking Page
|--------------------------------------------------------------------------
| Responsibilities
|
| • Load recruiter's jobs
| • Select a job
| • Fetch candidate rankings with search, filtering, sorting, and pagination
| • Export candidate ranking reports (CSV and PDF) with current filters
|--------------------------------------------------------------------------
*/

export default function Ranking() {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [rankings, setRankings] = useState([]);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [error, setError] = useState("");

  // Search & Pagination States
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState("ALL");
  const [sort, setSort] = useState("highest_score");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Export Loading States
  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      setError("");
      const data = await getRecruiterJobs();
      const recruiterJobs = data.jobs || [];
      setJobs(recruiterJobs);

      if (recruiterJobs.length > 0) {
        setSelectedJobId(recruiterJobs[0].id);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load jobs.");
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchRankings = useCallback(async (jobId) => {
    if (!jobId) {
      setRankings([]);
      return;
    }

    try {
      setLoadingRankings(true);
      setError("");

      const params = {
        page,
        limit,
        sort,
      };

      if (search.trim()) {
        params.search = search;
      }

      if (scoreFilter === "90+") {
        params.scoreMin = 90;
      } else if (scoreFilter === "80+") {
        params.scoreMin = 80;
      } else if (scoreFilter === "70+") {
        params.scoreMin = 70;
      }

      const data = await getRanking(jobId, params);
      setRankings(data.rankings || []);
      setTotalItems(data.totalItems || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to load candidate rankings."
      );
      setRankings([]);
    } finally {
      setLoadingRankings(false);
    }
  }, [page, limit, sort, search, scoreFilter]);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchRankings(selectedJobId);
    }
  }, [selectedJobId, fetchRankings]);

  const handleJobChange = (jobId) => {
    setSelectedJobId(jobId);
    setPage(1);
    setSearch("");
    setScoreFilter("ALL");
    setSort("highest_score");
  };

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleScoreFilterChange = (val) => {
    setScoreFilter(val);
    setPage(1);
  };

  const handleSortChange = (val) => {
    setSort(val);
    setPage(1);
  };

  const handleRefresh = () => {
    if (selectedJobId) {
      fetchRankings(selectedJobId);
    }
  };

  const getExportParams = () => {
    const params = {
      sort,
    };
    if (search.trim()) {
      params.search = search;
    }
    if (scoreFilter === "90+") {
      params.scoreMin = 90;
    } else if (scoreFilter === "80+") {
      params.scoreMin = 80;
    } else if (scoreFilter === "70+") {
      params.scoreMin = 70;
    }
    return params;
  };

  const handleExportCSV = async () => {
    try {
      setExportingCSV(true);
      const params = {
        ...getExportParams(),
        format: "csv",
      };

      const data = await exportRanking(selectedJobId, params);
      const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const jobTitle = jobs.find(j => j.id === selectedJobId)?.title || "ranking";
      
      link.href = url;
      link.setAttribute("download", `candidate_ranking_${jobTitle.replace(/\s+/g, "_")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("CSV report exported successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to export CSV report.", "error");
    } finally {
      setExportingCSV(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      const params = {
        ...getExportParams(),
        format: "json",
      };

      const data = await exportRanking(selectedJobId, params);
      const { job, exportData } = data;

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        showToast("Pop-up blocker is active. Please enable pop-ups to generate reports.", "warning");
        return;
      }

      const skillsHtml = (skills) => skills && skills.length > 0
        ? skills.map(s => `<span style="display:inline-block;background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;padding:3px 8px;border-radius:12px;font-size:11px;margin:2px;font-weight:500;">${s}</span>`).join("")
        : "None";

      const rowsHtml = exportData.map(row => `
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:12px 10px;text-align:center;font-weight:bold;color:#4b5563;">#${row.rank}</td>
          <td style="padding:12px 10px;">
            <div style="font-weight:600;color:#111827;font-size:14px;">${row.candidateName}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:2px;">${row.email}</div>
          </td>
          <td style="padding:12px 10px;text-align:center;">
            <span style="display:inline-block;padding:4px 10px;border-radius:12px;font-weight:bold;font-size:13px;background:${row.overallScore >= 80 ? '#def7ec;color:#03543f;border:1px solid #bcf0da;' : row.overallScore >= 60 ? '#fef3c7;color:#92400e;border:1px solid #fde68a;' : '#fde8e8;color:#9b1c1c;border:1px solid #fecaca;'}">
              ${row.overallScore}/100
            </span>
          </td>
          <td style="padding:12px 10px;font-size:12px;">
            <div style="font-weight:bold;color:#047857;margin-bottom:3px;">Matching Skills:</div>
            <div>${skillsHtml(row.matchingSkills)}</div>
            <div style="font-weight:bold;color:#b91c1c;margin-top:6px;margin-bottom:3px;">Missing Skills:</div>
            <div>${skillsHtml(row.missingSkills)}</div>
          </td>
          <td style="padding:12px 10px;font-size:12px;color:#4b5563;line-height:1.5;max-width:250px;">${row.summary}</td>
          <td style="padding:12px 10px;font-size:12px;color:#9ca3af;white-space:nowrap;text-align:right;">${new Date(row.analysisDate).toLocaleDateString()}</td>
        </tr>
      `).join("");

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Candidate Ranking Report - ${job.title}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #1f2937; padding: 40px; max-width: 1000px; margin: 0 auto; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f9fafb; border-bottom: 2px solid #e5e7eb; padding: 12px 10px; font-size: 11px; text-transform: uppercase; font-weight: 600; color: #4b5563; text-align: left; }
            .header { border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 20px; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; }
            .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 15px; font-size: 11px; color: #9ca3af; display: flex; justify-content: space-between; }
            @media print {
              body { padding: 0; margin: 15mm; font-size: 13px; }
              .header { margin-bottom: 20px; }
              .footer { position: fixed; bottom: 0; left: 0; right: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">Smart Talent Selection Engine</div>
              <h1 style="font-size:24px;margin:5px 0 0 0;color:#111827;">Candidate Ranking Report</h1>
              <h2 style="font-size:14px;font-weight:500;color:#6b7280;margin:4px 0 0 0;">Job Posting: ${job.title}</h2>
            </div>
            <div style="text-align:right; font-size:12px; color:#4b5563; line-height:1.4;">
              <div><strong>Generated:</strong> ${new Date().toLocaleDateString()}</div>
              <div><strong>Status:</strong> Active Pipeline</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width:50px;text-align:center;">Rank</th>
                <th>Candidate Details</th>
                <th style="width:100px;text-align:center;">Match Score</th>
                <th style="width:250px;">Skills Analysis</th>
                <th style="width:300px;">AI Fit Summary</th>
                <th style="width:100px;text-align:right;">Analysis Date</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="footer">
            <span>Confidential ATS Report</span>
            <span>Page 1 of 1</span>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 300);
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      showToast("PDF report generated successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to generate PDF report.", "error");
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Candidate Ranking</h1>
        <p className="mt-2 text-gray-500">View AI-ranked candidates for each job.</p>
      </div>

      {/* Error */}
      {error && (
        <ErrorState
          title="Unable to load rankings data"
          message={error}
          onRetry={handleRefresh}
        />
      )}

      {/* Job Selector */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Select Job
        </label>
        {loadingJobs ? (
          <Loader label="Loading jobs list..." />
        ) : (
          <select
            value={selectedJobId}
            onChange={(e) => handleJobChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent bg-white text-gray-800"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      {selectedJobId && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <SearchBar
            value={search}
            onSearch={handleSearch}
            placeholder="Search by candidate name..."
          />
          <div className="flex flex-wrap items-center gap-3">
            <FilterDropdown
              label="Score"
              value={scoreFilter}
              onChange={handleScoreFilterChange}
              options={[
                { label: "All Scores", value: "ALL" },
                { label: "90+ Excellent", value: "90+" },
                { label: "80+ Good", value: "80+" },
                { label: "70+ Average", value: "70+" },
              ]}
            />
            <SortDropdown
              value={sort}
              onChange={handleSortChange}
              options={[
                { label: "Highest Score", value: "highest_score" },
                { label: "Lowest Score", value: "lowest_score" },
                { label: "Recently Analyzed", value: "recently_analyzed" },
              ]}
            />
          </div>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            disabled={exportingCSV || rankings.length === 0}
            onClick={handleExportCSV}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 transition font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingCSV ? "Exporting CSV..." : "Export CSV"}
          </button>
          <button
            disabled={exportingPDF || rankings.length === 0}
            onClick={handleExportPDF}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 transition font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingPDF ? "Generating PDF..." : "Export PDF"}
          </button>
        </div>

        <button
          onClick={handleRefresh}
          className="rounded-lg bg-accent px-5 py-2 text-white transition hover:opacity-90 font-medium text-sm"
        >
          Refresh Rankings
        </button>
      </div>

      {/* Ranking List */}
      {loadingRankings ? (
        <TableSkeleton rows={5} />
      ) : rankings.length === 0 ? (
        search || scoreFilter !== "ALL" ? (
          <EmptyState
            icon={Filter}
            title="No candidates satisfy this filter"
            description="Try adjusting your search query or minimum score thresholds."
          />
        ) : (
          <EmptyState
            icon={Award}
            title="No analyzed candidates yet"
            description="Upload candidate resumes and run Groq AI analysis to generate rankings."
          />
        )
      ) : (
        <>
          <RankingList candidates={rankings} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}
    </div>
  );
}