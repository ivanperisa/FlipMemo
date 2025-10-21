import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8080", 
});


const token = localStorage.getItem("token") || sessionStorage.getItem("token");
if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export default axiosInstance;