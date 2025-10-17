import './styles/styles.css'
import {BrowserRouter, Route, Routes} from "react-router";
import {Home,Login,Logout,Missing,Welcome,ForgotPassword} from './pages/PagesImport.ts'
import AuthProvider from "./context/AuthProvider.tsx";
import ProtectedRoutes from "./routes/ProtectedRoutes.tsx";



const App: React.FC = () => {


    return (
    <div className={"App"}>
        <AuthProvider>
           <BrowserRouter>
               <Routes>
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


           </BrowserRouter>
        </AuthProvider>
    </div>


    )
}

  export default App