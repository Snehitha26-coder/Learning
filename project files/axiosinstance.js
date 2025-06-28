// src/Helpers/axiosinstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://lms-server-vd61.onrender.com/api/v1", // ✅ Corrected
  withCredentials: true, // ✅ Important for cookies/session
});

export default axiosInstance;
