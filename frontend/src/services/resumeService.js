import api from "./api";

/*
|--------------------------------------------------------------------------
| Resume Service
|--------------------------------------------------------------------------
| All Resume-related API calls live here.
| Components never use axios directly.
|--------------------------------------------------------------------------
*/

/**
 * GET /api/jobs
 * Fetch recruiter's jobs for the dropdown.
 */
export const getRecruiterJobs = async () => {
  const response = await api.get("/jobs");
  return response.data;
};

/**
 * GET /api/resumes/:jobId
 */
export const getResumesByJob = async (jobId) => {
  const response = await api.get(`/resumes/${jobId}`);
  return response.data;
};

/**
 * POST /api/resumes/:jobId/upload
 */
export const uploadResumes = async (
  jobId,
  files,
  onUploadProgress
) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("resumes", file);
  });

  const response = await api.post(
    `/resumes/${jobId}/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    }
  );

  return response.data;
};