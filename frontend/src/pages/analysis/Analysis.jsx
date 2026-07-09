import { useEffect, useState } from "react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";

import AnalysisLoader from "../../components/analysis/AnalysisLoader";
import AnalysisCard from "../../components/analysis/AnalysisCard";

import {
  getRecruiterJobs,
  getResumesByJob,
  analyzeResume,
  getAnalysis,
} from "../../services/analysisService";

/*
|--------------------------------------------------------------------------
| Analysis Page
|--------------------------------------------------------------------------
| Responsibilities
|
| • Select a job
| • Display uploaded resumes
| • Analyze a resume
| • Display AI analysis
|--------------------------------------------------------------------------
*/

export default function Analysis() {

  // -------------------------
  // Data
  // -------------------------

  const [jobs, setJobs] = useState([]);

  const [selectedJobId, setSelectedJobId] = useState("");

  const [resumes, setResumes] = useState([]);

  const [selectedResume, setSelectedResume] = useState(null);

  const [analysis, setAnalysis] = useState(null);

  // -------------------------
  // Loading
  // -------------------------

  const [loadingJobs, setLoadingJobs] = useState(true);

  const [loadingResumes, setLoadingResumes] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);

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
  // Fetch Resumes
  // -------------------------

  const fetchResumes = async (jobId) => {
    if (!jobId) {
      setResumes([]);
      return;
    }

    try {
      setLoadingResumes(true);

      const data = await getResumesByJob(jobId);

      setResumes(data.resumes || []);

      // Clear previous selection whenever job changes
      setSelectedResume(null);
      setAnalysis(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load resumes.");
    } finally {
      setLoadingResumes(false);
    }
  };

  // -------------------------
  // Load Existing Analysis
  // -------------------------

  const loadExistingAnalysis = async (resumeId) => {
    try {
      const data = await getAnalysis(resumeId);

      setAnalysis(data.analysis);
    } catch (err) {
      // No analysis yet is perfectly valid.
      setAnalysis(null);
    }
  };

  // -------------------------
  // Initial Load
  // -------------------------

  useEffect(() => {
    fetchJobs();
  }, []);

  // -------------------------
  // Load resumes whenever
  // selected job changes
  // -------------------------

  useEffect(() => {
    if (selectedJobId) {
      fetchResumes(selectedJobId);
    }
  }, [selectedJobId]);


    // -------------------------
  // Select Resume
  // -------------------------

  const handleResumeSelect = async (resume) => {
    setSelectedResume(resume);
    setAnalysis(null);
    setError("");

    // Try loading an existing analysis first.
    await loadExistingAnalysis(resume.id);
  };

  // -------------------------
  // Analyze Resume
  // -------------------------

  const handleAnalyze = async () => {
    if (!selectedResume) return;

    try {
      setAnalyzing(true);
      setError("");

      const data = await analyzeResume(selectedResume.id);

      // Store the newly created analysis
      setAnalysis(data.analysis);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to analyze resume."
      );
    } finally {
      setAnalyzing(false);
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
          AI Resume Analysis
        </h1>

        <p className="mt-2 text-gray-500">
          Analyze uploaded resumes using AI.
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

      {/* Resume List */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">
          Uploaded Resumes
        </h2>

        {loadingResumes ? (
          <Loader label="Loading resumes..." />
        ) : resumes.length === 0 ? (
          <p className="text-gray-500">
            No resumes uploaded for this job.
          </p>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                onClick={() => handleResumeSelect(resume)}
                className={`cursor-pointer rounded-lg border p-4 transition ${
                  selectedResume?.id === resume.id
                    ? "border-accent bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">

                  <div>
                    <h3 className="font-semibold">
                      {resume.originalName}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {new Date(
                        resume.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  {selectedResume?.id === resume.id && (
                    <span className="rounded-full bg-accent px-3 py-1 text-sm text-white">
                      Selected
                    </span>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analyze Button */}
      {selectedResume && (
        <div className="flex justify-end">
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing
              ? "Analyzing..."
              : "Analyze Resume"}
          </Button>
        </div>
      )}

      {/* AI Loader */}
      {analyzing && <AnalysisLoader />}

      {/* Analysis Result */}
      {!analyzing && analysis && (
        <AnalysisCard analysis={analysis} />
      )}
    </div>
  );
}