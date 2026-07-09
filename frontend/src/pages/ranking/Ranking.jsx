import { useEffect, useState } from "react";

import Loader from "../../components/common/Loader";

import RankingList from "../../components/ranking/RankingList";
import EmptyRanking from "../../components/ranking/EmptyRanking";

import {
  getRecruiterJobs,
  getRanking,
} from "../../services/rankingService";

/*
|--------------------------------------------------------------------------
| Ranking Page
|--------------------------------------------------------------------------
| Responsibilities
|
| • Load recruiter's jobs
| • Select a job
| • Fetch candidate rankings
| • Display ranked candidates
|--------------------------------------------------------------------------
*/

export default function Ranking() {

  // -------------------------
  // Data
  // -------------------------

  const [jobs, setJobs] = useState([]);

  const [selectedJobId, setSelectedJobId] = useState("");

  const [rankings, setRankings] = useState([]);

  // -------------------------
  // Loading
  // -------------------------

  const [loadingJobs, setLoadingJobs] = useState(true);

  const [loadingRankings, setLoadingRankings] = useState(false);

  // -------------------------
  // Errors
  // -------------------------

  const [error, setError] = useState("");


    // -------------------------
  // Fetch Recruiter's Jobs
  // -------------------------

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      setError("");

      const data = await getRecruiterJobs();

      const recruiterJobs = data.jobs || [];

      setJobs(recruiterJobs);

      // Automatically select the first job
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

  // -------------------------
  // Fetch Candidate Rankings
  // -------------------------

  const fetchRankings = async (jobId) => {
    if (!jobId) {
      setRankings([]);
      return;
    }

    try {
      setLoadingRankings(true);
      setError("");

      const data = await getRanking(jobId);

      setRankings(data.rankings || []);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to load candidate rankings."
      );

      setRankings([]);
    } finally {
      setLoadingRankings(false);
    }
  };

  // -------------------------
  // Initial Load
  // -------------------------

  useEffect(() => {
    fetchJobs();
  }, []);

  // -------------------------
  // Reload rankings whenever
  // selected job changes
  // -------------------------

  useEffect(() => {
    if (selectedJobId) {
      fetchRankings(selectedJobId);
    }
  }, [selectedJobId]);


    // -------------------------
  // Refresh Rankings
  // -------------------------

  const handleRefresh = () => {
    if (selectedJobId) {
      fetchRankings(selectedJobId);
    }
  };


    // -------------------------
  // Loading
  // -------------------------

  if (loadingJobs) {
    return <Loader label="Loading jobs..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Candidate Ranking
        </h1>

        <p className="mt-2 text-gray-500">
          View AI-ranked candidates for each job.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Job Selector */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Select Job
        </label>

        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {jobs.map((job) => (
            <option
              key={job.id}
              value={job.id}
            >
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          className="rounded-lg bg-accent px-5 py-2 text-white transition hover:opacity-90"
        >
          Refresh Rankings
        </button>
      </div>

      {/* Ranking List */}
      {loadingRankings ? (
        <Loader label="Loading rankings..." />
      ) : rankings.length === 0 ? (
        <EmptyRanking />
      ) : (
        <RankingList candidates={rankings} />
      )}
    </div>
  );
}