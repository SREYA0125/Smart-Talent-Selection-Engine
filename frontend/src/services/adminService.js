import api from "./api.js";

/*
|--------------------------------------------------------------------------
| Admin Service
|--------------------------------------------------------------------------
| Handles all Axios API wrapper calls for the Admin module.
|--------------------------------------------------------------------------
*/

export const getAdminStats = async () => {
  const response = await api.get("/admin/dashboard/stats");
  return response.data;
};

export const getAdminAnalytics = async () => {
  const response = await api.get("/admin/dashboard/analytics");
  return response.data;
};

export const getRecruiters = async () => {
  const response = await api.get("/admin/recruiters");
  return response.data;
};

export const createRecruiter = async (data) => {
  const response = await api.post("/admin/recruiters", data);
  return response.data;
};

export const updateRecruiter = async (id, data) => {
  const response = await api.put(`/admin/recruiters/${id}`, data);
  return response.data;
};

export const deleteRecruiter = async (id) => {
  const response = await api.delete(`/admin/recruiters/${id}`);
  return response.data;
};

export const getPlatformJobs = async () => {
  const response = await api.get("/admin/jobs");
  return response.data;
};
