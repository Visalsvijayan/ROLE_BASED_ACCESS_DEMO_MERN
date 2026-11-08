import axios from "axios";

/** True when a request was cancelled on purpose (user navigated away, newer search typed...). */
export const isCancel = (error) => axios.isCancel(error);

/** Turns any error into one friendly sentence for the user. */
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  const serverMessage = error?.response?.data?.message;
  if (serverMessage) return serverMessage;
  if (error?.code === "ECONNABORTED") return "The request took too long. Please try again.";
  if (error?.request && !error?.response) {
    return "Cannot reach the server. Check your internet connection and try again.";
  }
  return fallback;
};

/**
 * The backend answers validation problems like
 *   { message, errors: [{ path: "price", message: "Price cannot be negative" }] }
 * This returns { price: "Price cannot be negative" } so a form can show each
 * message under its own field.
 */
export const getFieldErrors = (error) => {
  const list = error?.response?.data?.errors;
  if (!Array.isArray(list)) return {};
  const result = {};
  for (const { path, message } of list) {
    if (path && !result[path]) result[path] = message;
  }
  return result;
};
