import api from "./api";

/*
|--------------------------------------------------------------------------
| Job Service
|--------------------------------------------------------------------------
| Why this file exists:
| - Keeps all Job-related API calls in one place.
| - Components never call axios directly.
| - If backend routes change later, only this file needs updating.
|--------------------------------------------------------------------------
*/

/**
 * GET /api/jobs
 * Fetch all jobs belonging to the authenticated recruiter.
 */
export const getJobs = async (params = {}) => {
  const response = await api.get("/jobs", { params });
  return response.data;
};

/**
 * GET /api/jobs/:id
 * Fetch a single job by ID.
 */
export const getJobById = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
};

/**
 * POST /api/jobs
 * Create a new job.
 */
export const createJob = async (jobData) => {
  const response = await api.post("/jobs", jobData);
  return response.data;
};

/**
 * PATCH /api/jobs/:id
 * Update an existing job.
 */
export const updateJob = async (jobId, jobData) => {
  const response = await api.patch(`/jobs/${jobId}`, jobData);
  return response.data;
};

/**
 * DELETE /api/jobs/:id
 * Delete a job.
 */
export const deleteJob = async (jobId) => {
  const response = await api.delete(`/jobs/${jobId}`);
  return response.data;
};

export const exportJobReport = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}/report`);
  return response.data;
};