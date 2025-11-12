import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthProvider";

const AdminProtectedRoute = () => {
    const { isAuthenticated, role } = useAuth();

    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    
    if (role !== 'Admin') {
        return <Navigate to="/home" replace />;
    }

   
    return <Outlet />;
};

export default AdminProtectedRoute;
