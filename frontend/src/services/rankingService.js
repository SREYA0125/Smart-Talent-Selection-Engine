import api from "./api";

/*
|--------------------------------------------------------------------------
| Ranking Service
|--------------------------------------------------------------------------
| All Candidate Ranking API calls live here.
|--------------------------------------------------------------------------
*/

export const getRecruiterJobs = async () => {
  const response = await api.get("/jobs");
  return response.data;
};

export const getRanking = async (jobId, params = {}) => {
  const response = await api.get(`/ranking/${jobId}`, { params });
  return response.data;
};

export const exportRanking = async (jobId, params = {}) => {
  if (params.format === "csv") {
    const response = await api.get(`/ranking/${jobId}/export`, {
      params,
      responseType: "blob",
    });
    return response.data;
  }

  const response = await api.get(`/ranking/${jobId}/export`, { params });
  return response.data;
};