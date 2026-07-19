import { useEffect, useState, useCallback } from "react";

import JobCard from "../../components/jobs/JobCard";
import JobForm from "../../components/jobs/JobForm";
import Modal from "../../components/common/Modal";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import { useToast } from "../../contexts/ToastContext.jsx";
import { ProfileSkeleton } from "../../components/common/Skeletons.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";
import { Search, Briefcase } from "lucide-react";

import SearchBar from "../../components/common/SearchBar";
import FilterDropdown from "../../components/common/FilterDropdown";
import SortDropdown from "../../components/common/SortDropdown";
import Pagination from "../../components/common/Pagination";

import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  exportJobReport,
} from "../../services/jobService";

/*
|--------------------------------------------------------------------------
| Jobs Page
|--------------------------------------------------------------------------
| Responsibilities:
| - Fetch recruiter jobs with search, filtering, sorting, and pagination
| - Create, edit, and delete jobs
| - Display non-blocking loading & clean search empty states
|--------------------------------------------------------------------------
*/

export default function Jobs() {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Search & Pagination States
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedJob, setSelectedJob] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const fetchJobsList = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit,
        sort,
      };

      if (search.trim()) {
        params.search = search;
      }
      if (status !== "ALL") {
        params.status = status;
      }

      const data = await getJobs(params);
      setJobs(data.jobs || []);
      setTotalItems(data.totalItems || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError("Failed to load jobs.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [page, limit, sort, search, status]);

  useEffect(() => {
    fetchJobsList();
  }, [fetchJobsList]);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (val) => {
    setStatus(val);
    setPage(1);
  };

  const handleSortChange = (val) => {
    setSort(val);
    setPage(1);
  };

  const handleCreateJob = async (formData) => {
    try {
      setSubmitting(true);
      const response = await createJob(formData);
      // Refetch list so the sorting and pagination details remain accurate
      fetchJobsList();
      showToast("Job created successfully!", "success");
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to create job.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditJob = async (formData) => {
    try {
      setSubmitting(true);
      await updateJob(selectedJob.id, formData);
      fetchJobsList();
      showToast("Job updated successfully!", "success");
      setSelectedJob(null);
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to update job.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async () => {
    try {
      setDeleting(true);
      await deleteJob(selectedJob.id);
      fetchJobsList();
      showToast("Job deleted successfully!", "success");
      setSelectedJob(null);
      setShowDeleteModal(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to delete job.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleView = (job) => {
    setSelectedJob(job);
    setShowViewModal(true);
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setShowEditModal(true);
  };

  const handleDelete = (job) => {
    setSelectedJob(job);
    setShowDeleteModal(true);
  };

  const handleExportReport = async (job) => {
    try {
      const data = await exportJobReport(job.id);
      const { report } = data;

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        showToast("Pop-up blocker is active. Please enable pop-ups to generate reports.", "warning");
        return;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Job Summary Report - ${report.jobTitle}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #1f2937; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 2px solid #a855f7; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 20px; font-weight: 800; color: #a855f7; text-transform: uppercase; letter-spacing: 1px; }
            .title { font-size: 24px; color: #111827; margin: 5px 0 0 0; }
            .summary-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
            .card { background: #fdfdfd; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            .card-label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
            .card-value { font-size: 32px; font-weight: 800; color: #111827; margin-top: 8px; }
            .score-stats { display: flex; gap: 15px; margin-top: 10px; }
            .score-stat { flex: 1; text-align: center; background: #fafafa; border: 1px solid #f3f4f6; border-radius: 8px; padding: 10px; }
            .score-stat-label { font-size: 11px; color: #9ca3af; text-transform: uppercase; }
            .score-stat-value { font-size: 18px; font-weight: 700; color: #374151; margin-top: 4px; }
            .distribution-list { list-style: none; padding: 0; margin: 0; }
            .distribution-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px dashed #e5e7eb; }
            .distribution-item:last-child { border-bottom: none; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
            .badge-excellent { background: #def7ec; color: #03543f; }
            .badge-good { background: #e1effe; color: #1e429f; }
            .badge-average { background: #fef3c7; color: #92400e; }
            .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 15px; font-size: 11px; color: #9ca3af; text-align: center; }
            @media print {
              body { padding: 0; margin: 20mm; font-size: 13px; }
              .card { box-shadow: none; background: #fff; }
              .score-stat { background: #fff; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">Smart Talent Selection Engine</div>
              <h1 class="title">Job Summary Report</h1>
              <h2 style="font-size:14px;font-weight:500;color:#6b7280;margin:5px 0 0 0;">Position: ${report.jobTitle}</h2>
            </div>
            <div style="text-align:right; font-size:12px; color:#4b5563;">
              <div><strong>Generated:</strong> ${new Date().toLocaleDateString()}</div>
              <div><strong>Status:</strong> Active Job Posting</div>
            </div>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="card-label">Total Applicants</div>
              <div class="card-value">${report.totalApplicants}</div>
              <div style="font-size:12px;color:#9ca3af;margin-top:6px;">Resumes Uploaded & Analyzed</div>
            </div>
            <div class="card">
              <div class="card-label">Average Match Score</div>
              <div class="card-value">${report.averageMatchScore}/100</div>
              <div class="score-stats">
                <div class="score-stat">
                  <div class="score-stat-label">Min</div>
                  <div class="score-stat-value">${report.lowestMatchScore}</div>
                </div>
                <div class="score-stat">
                  <div class="score-stat-label">Max</div>
                  <div class="score-stat-value">${report.highestMatchScore}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="card" style="margin-bottom: 20px;">
            <div class="card-label" style="margin-bottom: 15px;">Candidate Tier Distribution</div>
            <ul class="distribution-list">
              <li class="distribution-item">
                <div style="display:flex;align-items:center;gap:10px;">
                  <span class="badge badge-excellent">90+ Excellent</span>
                  <span style="font-size:13px;color:#4b5563;">Outstanding profile match</span>
                </div>
                <div style="font-weight:700;font-size:16px;color:#111827;">${report.excellentCandidates} candidates</div>
              </li>
              <li class="distribution-item">
                <div style="display:flex;align-items:center;gap:10px;">
                  <span class="badge badge-good">80-89 Good</span>
                  <span style="font-size:13px;color:#4b5563;">Strong fit matching requirements</span>
                </div>
                <div style="font-weight:700;font-size:16px;color:#111827;">${report.goodCandidates} candidates</div>
              </li>
              <li class="distribution-item">
                <div style="display:flex;align-items:center;gap:10px;">
                  <span class="badge badge-average">70-79 Average</span>
                  <span style="font-size:13px;color:#4b5563;">Fulfills core capabilities</span>
                </div>
                <div style="font-weight:700;font-size:16px;color:#111827;">${report.averageCandidates} candidates</div>
              </li>
            </ul>
          </div>

          <div class="footer">
            Confidential Platform Report &bull; Smart Talent Selection Engine
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
      showToast("Job report exported successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to export Job Summary report.", "error");
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Jobs</h1>
            <p className="mt-1 text-gray-500">Manage your job postings.</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>+ Create Job</Button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <SearchBar
            value={search}
            onSearch={handleSearch}
            placeholder="Search by job title or description..."
          />
          <div className="flex flex-wrap items-center gap-3">
            <FilterDropdown
              label="Status"
              value={status}
              onChange={handleStatusChange}
              options={[
                { label: "All Statuses", value: "ALL" },
                { label: "Open", value: "OPEN" },
                { label: "Closed", value: "CLOSED" },
              ]}
            />
            <SortDropdown
              value={sort}
              onChange={handleSortChange}
              options={[
                { label: "Newest First", value: "newest" },
                { label: "Oldest First", value: "oldest" },
                { label: "Alphabetical", value: "alphabetical" },
              ]}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <ErrorState
            title="Unable to load jobs list"
            message={error}
            onRetry={fetchJobsList}
          />
        )}

        {/* Main Content List Area */}
        {initialLoading || loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ProfileSkeleton />
            <ProfileSkeleton />
            <ProfileSkeleton />
          </div>
        ) : jobs.length === 0 ? (
          search || status !== "ALL" ? (
            <EmptyState
              icon={Search}
              title="No jobs match your search"
              description="Try adjusting your search query or status filters."
            />
          ) : (
            <EmptyState
              icon={Briefcase}
              title="No jobs created yet"
              description="Create your first job posting to begin parsing and ranking candidates."
              actionLabel="Create Job"
              onAction={() => setShowCreateModal(true)}
            />
          )
        ) : (
          <>
            <div className="space-y-5">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onExportReport={handleExportReport}
                />
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </div>

      {/* -------------------------------- */}
      {/* Create Job */}
      {/* -------------------------------- */}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Job"
      >
        <JobForm
          onSubmit={handleCreateJob}
          onCancel={() => setShowCreateModal(false)}
          submitting={submitting}
        />
      </Modal>

      {/* -------------------------------- */}
      {/* Edit Job */}
      {/* -------------------------------- */}

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedJob(null);
        }}
        title="Edit Job"
      >
        <JobForm
          initialData={selectedJob}
          onSubmit={handleEditJob}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedJob(null);
          }}
          submitting={submitting}
        />
      </Modal>

      {/* -------------------------------- */}
      {/* Delete */}
      {/* -------------------------------- */}

      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedJob(null);
        }}
        title="Delete Job"
        message={`Are you sure you want to permanently delete the job "${selectedJob?.title}"?`}
        confirmLabel="Delete"
        onConfirm={handleDeleteJob}
        loading={deleting}
      />

      {/* -------------------------------- */}
      {/* View */}
      {/* -------------------------------- */}

      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedJob(null);
        }}
        title="Job Details"
      >
        {selectedJob && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold">
                {selectedJob.title}
              </h2>

              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                  selectedJob.status === "OPEN"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {selectedJob.status}
              </span>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">
                Description
              </h3>

              <p className="mt-2 whitespace-pre-wrap text-gray-600">
                {selectedJob.description}
              </p>
            </div>

            <div className="text-sm text-gray-500">
              Created on{" "}
              {new Date(selectedJob.createdAt).toLocaleString()}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}