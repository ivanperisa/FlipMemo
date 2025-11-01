import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthProvider";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";



const Logout = () => {
    const { setToken } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const logout = async () => {
            try {
                await axiosInstance.post('/api/v1/Auth/logout');
                setToken(null);
                navigate("/");
            } catch (error) {
                console.error("Logout failed:", error);
            }
        };

        logout();
    }, [setToken, navigate]);

    return null;
};

export default Logout;