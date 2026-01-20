import {createContext, useContext, useEffect, useMemo, useState} from "react";
import React from "react";
import axiosInstance from "../api/axiosInstance";


interface AuthContextType {
    token: string | null;
    id: string | null;
    role: string | null;
    setToken: (newToken: string | null, userId?: string | null, userRole?: string | null, rememberMe?: boolean) => void;
    logout: () => void;
    isAuthenticated: boolean;
}


interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: AuthProviderProps) => {
    
    const getInitialToken = () => {
        return localStorage.getItem("token") || sessionStorage.getItem("token");
    };

    const getInitialId = () => {
        return localStorage.getItem("userId") || sessionStorage.getItem("userId");
    };

    const getInitialRole = () => {
        return localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
    };

    
    const [token, setToken_] = useState<string | null>(getInitialToken());
    const [id, setId_] = useState<string | null>(getInitialId());
    const [role, setRole_] = useState<string | null>(getInitialRole());

   
    const setToken = (newToken: string | null, userId: string | null = null, userRole: string | null = null, rememberMe: boolean = false) => {
        setToken_(newToken);
        setId_(userId);
        setRole_(userRole);
        
        if (newToken) {
            if (rememberMe) {
              
                localStorage.setItem('token', newToken);
                sessionStorage.removeItem('token');
                if (userId) {
                    localStorage.setItem('userId', userId);
                    sessionStorage.removeItem('userId');
                }
                if (userRole) {
                    localStorage.setItem('userRole', userRole);
                    sessionStorage.removeItem('userRole');
                }
            } else {
                
                sessionStorage.setItem('token', newToken);
                localStorage.removeItem('token');
                if (userId) {
                    sessionStorage.setItem('userId', userId);
                    localStorage.removeItem('userId');
                }
                if (userRole) {
                    sessionStorage.setItem('userRole', userRole);
                    localStorage.removeItem('userRole');
                }
            }
        }
    };

 
    const logout = () => {
        setToken_(null);
        setId_(null);
        setRole_(null);
    };

    useEffect(() => {
        if (token) {
            axiosInstance.defaults.headers.common["Authorization"] = "Bearer " + token;
            
        } else {
            delete axiosInstance.defaults.headers.common["Authorization"];
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            localStorage.removeItem('userId');
            sessionStorage.removeItem('userId');
            localStorage.removeItem('userRole');
            sessionStorage.removeItem('userRole');
        }
    }, [token]);

    
    const contextValue = useMemo(
        () => ({
            token,
            id,
            role,
            setToken,
            logout,
            isAuthenticated: !!token,
        }),
        [token, id, role]
    );

   
    return (
        <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthProvider;