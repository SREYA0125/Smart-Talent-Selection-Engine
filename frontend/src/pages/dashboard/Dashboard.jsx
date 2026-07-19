import { useAuth } from "../../hooks/useAuth";

import { useEffect, useState } from "react";
import {
  Briefcase,
  FileText,
  Brain,
  Trophy,
} from "lucide-react";

import Loader from "../../components/common/Loader";
import { DashboardStatSkeleton, TableSkeleton } from "../../components/common/Skeletons";
import ErrorState from "../../components/common/ErrorState";

import StatCard from "../../components/dashboard/StatCard";
import TopCandidate from "../../components/dashboard/TopCandidate";
import RecentJobs from "../../components/dashboard/RecentJobs";
import RecentCandidates from "../../components/dashboard/RecentCandidates";
import QuickActions from "../../components/dashboard/QuickActions";

import { getDashboard } from "../../services/dashboardService";

/*
|--------------------------------------------------------------------------
| Dashboard Page
|--------------------------------------------------------------------------
| Responsibilities
|
| • Load dashboard data
| • Display recruiter statistics
| • Show top candidate
| • Show recent jobs
| • Show recent candidates
|--------------------------------------------------------------------------
*/

export default function Dashboard() {

  // -------------------------
  // Dashboard Data
  // -------------------------
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);

  // -------------------------
  // Loading
  // -------------------------

  const [loading, setLoading] = useState(true);

  // -------------------------
  // Error
  // -------------------------

  const [error, setError] = useState("");

    // -------------------------
  // Fetch Dashboard Data
  // -------------------------

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDashboard();

      setDashboard(data);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Initial Load
  // -------------------------

  useEffect(() => {
    fetchDashboard();
  }, []);



  const stats = dashboard?.stats || {};
  const topCandidate = dashboard?.topCandidate;
  const recentJobs = dashboard?.recentJobs || [];
  const recentCandidates = dashboard?.recentCandidates || [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user?.name || "Recruiter"} 👋
        </h1>
        <p className="mt-2 text-gray-500">
          Here's an overview of your recruitment activity.
        </p>
      </div>

      {error ? (
        <ErrorState
          title="Unable to load dashboard stats"
          message={error}
          onRetry={fetchDashboard}
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
          {/* Statistics */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Jobs"
              value={stats.totalJobs || 0}
              icon={<Briefcase size={26} className="text-white" />}
              color="bg-blue-500"
            />
            <StatCard
              title="Total Resumes"
              value={stats.totalResumes || 0}
              icon={<FileText size={26} className="text-white" />}
              color="bg-green-500"
            />
            <StatCard
              title="AI Analyses"
              value={stats.totalAnalyses || 0}
              icon={<Brain size={26} className="text-white" />}
              color="bg-purple-500"
            />
            <StatCard
              title="Highest Score"
              value={stats.highestScore || 0}
              icon={<Trophy size={26} className="text-white" />}
              color="bg-yellow-500"
            />
          </div>

          {/* Top Candidate */}
          <TopCandidate candidate={topCandidate} />

          {/* Bottom Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RecentJobs jobs={recentJobs} />
            <RecentCandidates candidates={recentCandidates} />
          </div>

          {/* Quick Actions */}
          <QuickActions />
        </>
      )}
    </div>
  );
}