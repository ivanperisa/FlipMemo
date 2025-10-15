import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const ProtectedRoutes = () => {
    const { token } = useAuth();

    console.log('ProtectedRoute - token:', token);

    return token ? <Outlet /> : <Navigate to="/login" replace />;

};
export default ProtectedRoutes;