import api from "./api";

/*
|--------------------------------------------------------------------------
| Dashboard Service
|--------------------------------------------------------------------------
| All Dashboard API calls live here.
| Components never import Axios directly.
|--------------------------------------------------------------------------
*/

export const getDashboard = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};