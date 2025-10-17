import './styles/styles.css'
import {BrowserRouter, Route, Routes, useLocation} from "react-router";
import {Home,Login,Logout,Missing,Welcome,ForgotPassword} from './pages/PagesImport.ts'
import AuthProvider from "./context/AuthProvider.tsx";
import ProtectedRoutes from "./routes/ProtectedRoutes.tsx";
import { AnimatePresence } from 'framer-motion';



const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <div style={{ 
            position: 'relative', 
            width: '100%', 
            height: '100vh',
            background: 'linear-gradient(180deg, #FFC0CB 0%, #FFE5EC 100%)',
            overflow: 'hidden'
        }}>
            <AnimatePresence mode="popLayout" initial={false}>
                <Routes location={location} key={location.pathname}>
                    {/* Unprotected Routes */}
                    <Route path="/" element={<Welcome/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/logout" element={<Logout />}/>
                    <Route path="*" element={<Missing />}/>
                    <Route path="/ForgotPassword" element={<ForgotPassword/>}/>

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoutes/>}>
                        <Route path="/Home" element={<Home />} />
                    </Route>
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