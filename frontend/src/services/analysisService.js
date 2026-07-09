import api from "./api";

/*
|--------------------------------------------------------------------------
| Analysis Service
|--------------------------------------------------------------------------
| All AI Analysis API calls live here.
| Components never call axios directly.
|--------------------------------------------------------------------------
*/

/**
 * GET recruiter's jobs
 */
export const getRecruiterJobs = async () => {
  const response = await api.get("/jobs");
  return response.data;
};

/**
 * GET resumes for a job
 */
export const getResumesByJob = async (jobId) => {
  const response = await api.get(`/resumes/${jobId}`);
  return response.data;
};

/**
 * POST analyze a resume
 */
export const analyzeResume = async (resumeId) => {
  const response = await api.post(`/analysis/${resumeId}`);
  return response.data;
};

/**
 * GET existing analysis
 */
export const getAnalysis = async (resumeId) => {
  const response = await api.get(`/analysis/${resumeId}`);
  return response.data;
};