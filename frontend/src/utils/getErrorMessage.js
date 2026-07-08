// Turns a raw Axios error into a message a recruiter can actually read,
// used by both Login and Register so the two forms don't each hand-roll
// slightly different error text. Kept as a pure function (no React, no
// context) so it's trivially reusable by any future form that hits the API.
export function getErrorMessage(error) {
  // Axios sets error.response only when the server actually responded.
  // No response at all means the request never completed — wrong API URL,
  // backend not running, no internet connection, CORS blocking the call, etc.
  if (!error.response) {
    return "Network error. Please check your connection and try again.";
  }

  const status = error.response.status;
  const serverMessage = error.response.data?.message;

  if (status === 401) {
    return serverMessage || "Invalid email or password.";
  }
  if (status === 409) {
    return serverMessage || "An account with this email already exists.";
  }
  if (status === 400) {
    return serverMessage || "Please check the information you entered.";
  }

  return serverMessage || "Something went wrong. Please try again.";
}
