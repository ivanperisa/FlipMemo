import './styles/styles.css'
import { BrowserRouter, Route, Routes } from "react-router";
import { Home, Login, Logout, Missing, Welcome, ForgotPassword, Register, ChangePassword, ChooseStyle,ChooseWordSet } from './pages/PagesImport.ts'
import AuthProvider from "./context/AuthProvider.tsx";
import ProtectedRoutes from "./routes/ProtectedRoutes.tsx";
import AdminProtectedRoute from "./routes/AdminProtectedRoute.tsx";
import { AnimatePresence } from 'framer-motion';
import ResetPassword from './pages/ResetPassword.tsx';
import AdminPage from './pages/AdminPage.tsx';

const AnimatedRoutes = () => {
    return (
        <div style={{
            position: 'relative',
            width: '100%',
            overflowX:'hidden',
            minHeight: '100vh',
            background: 'linear-gradient(180deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%)',
            
        }}>
            <AnimatePresence>
            <Routes>
                {/* zasticene rute */}
            <Route element={<ProtectedRoutes />}>
             <Route path="/chooseStyle" element={<ChooseStyle />} />
             <Route path="/home" element={<Home />} />
             <Route path="/chooseWordSet" element={<ChooseWordSet />} />
               
            </Route>

                {/* admin zasticene rute */}
                <Route element={<AdminProtectedRoute />}>
                <Route path="/admin" element={<AdminPage />} />
                    {/* TODO: Dodati /admin/add-dictionary i /admin/add-words */}
                </Route>

                {/* nezasticene rute */}
                
                <Route path="/" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/forgotPassword" element={<ForgotPassword />} />
                <Route path="/register" element={<Register />} />
                <Route path="/changePassword" element={<ChangePassword />} />
                <Route path="/resetPassword" element={<ResetPassword />} />
                
                {/* ostale rute*/}
                <Route path="*" element={<Missing />} />
            </Routes>
            </AnimatePresence>
        </div>
    );
};

const App: React.FC = () => {


    return (
        <div className={"App"}>
            <AuthProvider>
                <BrowserRouter>
                    <AnimatedRoutes />
                </BrowserRouter>
            </AuthProvider>
        </div>


    )
}

export default App