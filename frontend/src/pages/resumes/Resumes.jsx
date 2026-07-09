import { useEffect, useState } from "react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";

import UploadDropzone from "../../components/resume/UploadDropzone";
import UploadProgress from "../../components/resume/UploadProgress";
import ResumeList from "../../components/resume/ResumeList";

import {
  getRecruiterJobs,
  getResumesByJob,
  uploadResumes,
} from "../../services/resumeService";

/*
|--------------------------------------------------------------------------
| Resumes Page
|--------------------------------------------------------------------------
| Responsibilities
|
| • Load recruiter's jobs
| • Select one job
| • Upload resumes
| • Show upload progress
| • Display uploaded resumes
|--------------------------------------------------------------------------
*/

export default function Resumes() {

  // -------------------------
  // Data
  // -------------------------

  const [jobs, setJobs] = useState([]);

  const [selectedJobId, setSelectedJobId] = useState("");

  const [resumes, setResumes] = useState([]);

  const [files, setFiles] = useState([]);

  // -------------------------
  // Loading States
  // -------------------------

  const [loadingJobs, setLoadingJobs] = useState(true);

  const [loadingResumes, setLoadingResumes] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);

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

      // Automatically select the first job if available
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

    } catch (err) {
      console.error(err);
      setError("Failed to load resumes.");
    } finally {
      setLoadingResumes(false);
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
  // Upload Resumes
  // -------------------------

  const handleUpload = async () => {
    if (!selectedJobId) {
      setError("Please select a job first.");
      return;
    }

    if (files.length === 0) {
      setError("Please select at least one resume.");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError("");

      const data = await uploadResumes(
        selectedJobId,
        files,
        (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) /
              progressEvent.total
          );

          setUploadProgress(percent);
        }
      );

      // Immediately show uploaded resumes
      if (data.resumes) {
        setResumes((prev) => [...data.resumes, ...prev]);
      }

      // Clear selected files
      setFiles([]);

      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 500);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to upload resumes."
      );
    } finally {
      setUploading(false);
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
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Resume Upload
        </h1>

        <p className="mt-2 text-gray-500">
          Upload candidate resumes for a selected job.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Job Selector */}
      <div className="rounded-xl bg-white border border-gray-200 p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Select Job
        </label>

        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {/* Upload Area */}
      <UploadDropzone
        files={files}
        setFiles={setFiles}
        disabled={uploading}
      />

      {/* Upload Progress */}
      <UploadProgress
        progress={uploadProgress}
        uploading={uploading}
      />

      {/* Upload Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
        >
          {uploading ? "Uploading..." : "Upload Resumes"}
        </Button>
      </div>

      {/* Resume List */}
      <div>
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">
          Uploaded Resumes
        </h2>

        {loadingResumes ? (
          <Loader label="Loading resumes..." />
        ) : (
          <ResumeList resumes={resumes} />
        )}
      </div>
    </div>
  );
}