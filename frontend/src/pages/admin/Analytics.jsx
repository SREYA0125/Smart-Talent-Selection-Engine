import { useEffect, useState } from "react";
import { TrendingUp, Award, BarChart3, PieChart, Users, Briefcase, FileText } from "lucide-react";
import Loader from "../../components/common/Loader.jsx";
import { ChartSkeleton } from "../../components/common/Skeletons.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import { getAdminAnalytics } from "../../services/adminService.js";

/*
|--------------------------------------------------------------------------
| Analytics Page
|--------------------------------------------------------------------------
| Visualizes platform metrics: hiring trends (6-month bar chart), top
| recruiters leaderboard, candidate score distribution, and resume parsing
| conversion ratios. Implemented using premium custom SVG / Tailwind charts
| for performance, instant rendering, and responsiveness.
|--------------------------------------------------------------------------
*/

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAdminAnalytics();
      setData(res);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const hiringTrends = data?.hiringTrends || [];
  const scoreDistribution = data?.scoreDistribution || [];
  const topRecruiters = data?.topRecruiters || [];
  const analysisCounts = data?.analysisCounts || { totalResumes: 0, analyzedResumes: 0, unanalyzedResumes: 0 };

  const maxTrendVal = Math.max(
    ...hiringTrends.map((t) => Math.max(t.jobs, t.resumes)),
    1
  );

  const maxScoreCount = Math.max(...scoreDistribution.map((d) => d.count), 1);

  const totalResumes = analysisCounts.totalResumes || 0;
  const analyzedResumes = analysisCounts.analyzedResumes || 0;
  const analyzedPercent = totalResumes > 0 ? Math.round((analyzedResumes / totalResumes) * 100) : 0;
  const unanalyzedPercent = 100 - analyzedPercent;

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (analyzedPercent / 100) * circumference;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Platform Analytics</h1>
        <p className="mt-2 text-gray-500">
          Visual insights into candidate scoring, recruiter usage, and hiring pipelines.
        </p>
      </div>

      {error ? (
        <ErrorState
          title="Unable to load analytics stats"
          message={error}
          onRetry={fetchAnalytics}
        />
      ) : loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart 1: Hiring Trends */}
        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col justify-between h-[380px]">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp size={24} className="text-accent" />
                <h2 className="text-xl font-semibold text-gray-800">Hiring Trends</h2>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-blue-500"></span>
                  Jobs Created
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-green-500"></span>
                  Resumes Uploaded
                </div>
              </div>
            </div>
          </div>

          {hiringTrends.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              No historical data available.
            </div>
          ) : (
            <div className="flex-1 flex items-end justify-between gap-2 px-2 h-48">
              {hiringTrends.map((trend, idx) => {
                const jobHeightPercent = (trend.jobs / maxTrendVal) * 100;
                const resumeHeightPercent = (trend.resumes / maxTrendVal) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="w-full flex items-end justify-center gap-1 h-36">
                      {/* Job Bar */}
                      <div
                        style={{ height: `${Math.max(jobHeightPercent, 4)}%` }}
                        className="w-3 sm:w-4 rounded-t bg-blue-500 hover:bg-blue-600 transition-all relative group cursor-pointer"
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap shadow-md">
                          {trend.jobs} Job{trend.jobs !== 1 && "s"}
                        </div>
                      </div>
                      {/* Resume Bar */}
                      <div
                        style={{ height: `${Math.max(resumeHeightPercent, 4)}%` }}
                        className="w-3 sm:w-4 rounded-t bg-green-500 hover:bg-green-600 transition-all relative group cursor-pointer"
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap shadow-md">
                          {trend.resumes} Resume{trend.resumes !== 1 && "s"}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-medium truncate w-full text-center">
                      {trend.month}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chart 2: Candidate Score Distribution */}
        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col justify-between h-[380px]">
          <div className="mb-4 flex items-center gap-3">
            <BarChart3 size={24} className="text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">Score Distribution</h2>
          </div>

          {scoreDistribution.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              No score records found.
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center space-y-4">
              {scoreDistribution.map((item) => {
                const percent = (item.count / maxScoreCount) * 100;
                let barColor = "bg-red-500";
                if (item.range === "81-100") barColor = "bg-green-500";
                else if (item.range === "61-80") barColor = "bg-emerald-400";
                else if (item.range === "41-60") barColor = "bg-yellow-400";
                else if (item.range === "21-40") barColor = "bg-orange-400";

                return (
                  <div key={item.range} className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-600 w-16 text-right">
                      {item.range}
                    </span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden relative group">
                      <div
                        style={{ width: `${Math.max(percent, 2)}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      />
                      <div className="absolute inset-0 flex items-center pl-3">
                        <span className="text-[10px] font-bold text-gray-700 hidden group-hover:inline">
                          {percent.toFixed(0)}% relative
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-800 w-8">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Donut Chart: Resume Parsing Counts */}
        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col justify-between lg:col-span-1 h-[380px]">
          <div className="mb-4 flex items-center gap-3">
            <PieChart size={24} className="text-teal-600" />
            <h2 className="text-xl font-semibold text-gray-800">Resume Metrics</h2>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative">
            {totalResumes === 0 ? (
              <div className="text-gray-400 text-sm">No resumes uploaded.</div>
            ) : (
              <>
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="text-gray-100"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="text-teal-500"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold text-gray-800">{analyzedPercent}%</span>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Analyzed</p>
                </div>
              </>
            )}
          </div>

          {totalResumes > 0 && (
            <div className="mt-4 border-t pt-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="text-xs text-gray-400 font-semibold block">Parsed</span>
                <span className="text-lg font-bold text-teal-600">{analyzedResumes}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 font-semibold block">Pending</span>
                <span className="text-lg font-bold text-gray-500">{totalResumes - analyzedResumes}</span>
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard: Top Recruiters */}
        <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2 flex flex-col justify-between h-[380px]">
          <div className="mb-4 flex items-center gap-3">
            <Award size={24} className="text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-800">Top Recruiters</h2>
          </div>

          {topRecruiters.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              No recruiter records available.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4">
              {topRecruiters.map((recruiter, idx) => (
                <div
                  key={recruiter.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-full bg-yellow-50 flex items-center justify-center font-bold text-yellow-600 text-xs shrink-0 border border-yellow-200">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-900">{recruiter.name}</div>
                      <div className="text-xs text-gray-400">{recruiter.email}</div>
                    </div>
                  </div>

                  <div className="flex gap-6 text-right">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Jobs</span>
                      <span className="text-sm font-bold text-gray-700">{recruiter.jobCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Resumes</span>
                      <span className="text-sm font-bold text-gray-700">{recruiter.resumeCount}</span>
                    </div>
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
