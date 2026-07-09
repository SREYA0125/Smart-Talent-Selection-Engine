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

export const getRanking = async (jobId) => {
  const response = await api.get(`/ranking/${jobId}`);
  return response.data;
};