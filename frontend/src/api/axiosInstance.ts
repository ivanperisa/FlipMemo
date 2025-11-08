import axios from "axios";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const axiosInstance = axios.create({
    baseURL: VITE_BACKEND_URL, 
});


const token = localStorage.getItem("token") || sessionStorage.getItem("token");
if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export default axiosInstance;