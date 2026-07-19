import { useEffect, useState } from "react";
import { Briefcase, Calendar, FileText, Brain } from "lucide-react";
import Loader from "../../components/common/Loader.jsx";
import { getPlatformJobs } from "../../services/adminService.js";

/*
|--------------------------------------------------------------------------
| Platform Jobs Page
|--------------------------------------------------------------------------
| Displays a comprehensive, read-only dashboard list of all job openings
| created across the entire platform, showing ownership, current status,
| and resume processing counts.
|--------------------------------------------------------------------------
*/

export default function PlatformJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getPlatformJobs();
      setJobs(res.jobs || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load jobs list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (loading) {
    return <Loader label="Loading platform jobs..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Platform Jobs</h1>
        <p className="mt-2 text-gray-500">
          Monitor all active and closed job listings posted on the platform.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      )}

      {/* Jobs Table */}
      {!error && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-700">
              <tr>
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Recruiter</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Resumes Uploaded</th>
                <th className="px-6 py-4 text-center">AI Analyzed</th>
                <th className="px-6 py-4">Date Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 border-t border-gray-200">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-400">
                    No jobs posted on the platform yet.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-2 text-accent">
                          <Briefcase size={18} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{job.title}</div>
                          <div className="text-xs text-gray-400 line-clamp-1 max-w-sm mt-0.5">
                            {job.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{job.recruiterName}</div>
                        <div className="text-xs text-gray-400">{job.recruiterEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          job.status === "OPEN"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-700">
                      <div className="flex items-center justify-center gap-1.5 text-blue-600">
                        <FileText size={15} />
                        {job.resumeCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-700">
                      <div className="flex items-center justify-center gap-1.5 text-purple-600">
                        <Brain size={15} />
                        {job.analysisCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={15} />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
