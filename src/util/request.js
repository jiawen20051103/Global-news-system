import axios from "axios";

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return '';
};

const request = axios.create({
  baseURL: getBaseURL(),
  timeout: 5000 
});

export default request;