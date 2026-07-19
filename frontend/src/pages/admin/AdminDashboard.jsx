import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { Users, Briefcase, FileText, Brain, Calendar } from "lucide-react";
import Loader from "../../components/common/Loader.jsx";
import { DashboardStatSkeleton, TableSkeleton } from "../../components/common/Skeletons.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import ScoreBadge from "../../components/analysis/ScoreBadge.jsx";
import { getAdminStats } from "../../services/adminService.js";

/*
|--------------------------------------------------------------------------
| Admin Dashboard Page
|--------------------------------------------------------------------------
| Displays global platform statistics, recently posted jobs, and recent
| candidate resume analyses across the whole application.
|--------------------------------------------------------------------------
*/

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAdminStats();
      setData(res);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to load admin dashboard stats."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = data?.stats || {};
  const recentJobs = data?.recentJobs || [];
  const recentCandidates = data?.recentCandidates || [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Platform Overview 👋
        </h1>
        <p className="mt-2 text-gray-500">
          Administrator view for managing global Smart Talent Selection Engine metrics.
        </p>
      </div>

      {error ? (
        <ErrorState
          title="Unable to load dashboard stats"
          message={error}
          onRetry={fetchStats}
        />
      ) : loading ? (
        <div className="space-y-6">
          <DashboardStatSkeleton />
          <div className="grid gap-6 lg:grid-cols-2">
            <TableSkeleton rows={3} />
            <TableSkeleton rows={3} />
          </div>
        </div>
      ) : (
        <>
          {/* Global Stat Cards */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Recruiters"
              value={stats.totalRecruiters || 0}
              icon={<Users size={26} className="text-white" />}
              color="bg-purple-500"
            />
            <StatCard
              title="Platform Jobs"
              value={stats.totalJobs || 0}
              icon={<Briefcase size={26} className="text-white" />}
              color="bg-blue-500"
            />
            <StatCard
              title="Resumes Uploaded"
              value={stats.totalResumes || 0}
              icon={<FileText size={26} className="text-white" />}
              color="bg-green-500"
            />
            <StatCard
              title="Analyses Completed"
              value={stats.totalAnalyses || 0}
              icon={<Brain size={26} className="text-white" />}
              color="bg-teal-500"
            />
          </div>

          {/* Bottom tables */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Jobs */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-800">Recent Jobs</h2>
              </div>
              {recentJobs.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No jobs posted on the platform yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="rounded-lg border p-4 transition hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">{job.title}</h3>
                          <p className="mt-1 text-sm text-gray-500">Recruiter: {job.recruiter?.name}</p>
                          <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                            <Calendar size={12} />
                            <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          job.status === "OPEN" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Candidates */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-800">Recent Candidates</h2>
              </div>
              {recentCandidates.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No analyses performed yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentCandidates.map((candidate) => (
                    <div key={candidate.id} className="rounded-lg border p-4 transition hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">{candidate.candidateName}</h3>
                          <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                            <Calendar size={14} />
                            <span>Analyzed: {new Date(candidate.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <ScoreBadge score={candidate.overallScore} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
