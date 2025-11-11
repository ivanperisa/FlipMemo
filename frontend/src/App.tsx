import './styles/styles.css'
import { BrowserRouter, Route, Routes } from "react-router";
import { Home, Login, Logout, Missing, Welcome, ForgotPassword, Register,
    ChangePassword, ChooseStyle,ChooseWordSet, AdminDictionary, AdminPage, 
    AdminAddDictionary,
    AdminAddWord, UserControl} from './pages/PagesImport.ts';
import AuthProvider from "./context/AuthProvider.tsx";
import ProtectedRoutes from "./routes/ProtectedRoutes.tsx";
import AdminProtectedRoute from "./routes/AdminProtectedRoute.tsx";
import { AnimatePresence } from 'framer-motion';
import ResetPassword from './pages/ResetPassword.tsx';

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
                <Route path="/userControl" element={<UserControl/>}/>

                <Route path="/admin/dictionary" element={<AdminDictionary/>} />
                <Route path="/admin/dictionary/add" element={<AdminAddDictionary />}/>
                <Route path="/admin/addWord" element={<AdminAddWord />} />
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