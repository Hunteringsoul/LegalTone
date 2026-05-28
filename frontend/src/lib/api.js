import axios from "axios";

const api = axios.create({
  baseURL: "https://legaltone-backenddd.onrender.com",
});

export default api;
