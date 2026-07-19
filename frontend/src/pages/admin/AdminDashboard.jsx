import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { Users, Briefcase, FileText, Brain, Calendar } from "lucide-react";
import Loader from "../../components/common/Loader.jsx";
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

  if (loading) {
    return <Loader label="Loading platform dashboard..." />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

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

      {/* Global Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Recruiters"
          value={stats.totalRecruiters || 0}
          icon={<Users size={26} className="text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs || 0}
          icon={<Briefcase size={26} className="text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Total Resumes"
          value={stats.totalResumes || 0}
          icon={<FileText size={26} className="text-white" />}
          color="bg-purple-500"
        />
        <StatCard
          title="AI Analyses"
          value={stats.totalAnalyses || 0}
          icon={<Brain size={26} className="text-white" />}
          color="bg-yellow-500"
        />
      </div>

      {/* Lists Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Jobs */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <Briefcase size={24} className="text-accent" />
            <h2 className="text-xl font-semibold text-gray-800">Recent Jobs</h2>
          </div>
          {recentJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No jobs posted yet.
            </div>
          ) : (
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div key={job.id} className="rounded-lg border p-4 transition hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{job.title}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span className="font-medium text-gray-600">
                          Recruiter: {job.recruiterName} ({job.recruiterEmail})
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Candidates */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <Brain size={24} className="text-purple-600" />
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
    </div>
  );
}
