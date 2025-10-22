import {createContext, useContext, useEffect, useMemo, useState} from "react";
import React from "react";
import axiosInstance from "../api/axiosInstance";


interface AuthContextType {
    token: string | null;
    setToken: (newToken: string | null, rememberMe?: boolean) => void;
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

    
    const [token, setToken_] = useState<string | null>(getInitialToken());

   
    const setToken = (newToken: string | null, rememberMe: boolean = false) => {
        setToken_(newToken);
        
        if (newToken) {
            if (rememberMe) {
              
                localStorage.setItem('token', newToken);
                sessionStorage.removeItem('token');
            } else {
                
                sessionStorage.setItem('token', newToken);
                localStorage.removeItem('token');
            }
        }
    };

 
    const logout = () => {
        setToken_(null);
    };

    useEffect(() => {
        if (token) {
            axiosInstance.defaults.headers.common["Authorization"] = "Bearer " + token;
            
        } else {
            delete axiosInstance.defaults.headers.common["Authorization"];
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
        }
    }, [token]);

    
    const contextValue = useMemo(
        () => ({
            token,
            setToken,
            logout,
            isAuthenticated: !!token,
        }),
        [token]
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