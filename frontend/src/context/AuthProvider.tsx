import {createContext, useContext, useEffect, useMemo, useState} from "react";
import React from "react";
import axios from "axios";

// Define the shape of our auth context
interface AuthContextType {
    token: string | null;
    refreshToken: string | null;
    username: string | null;
    setToken: (newToken: string | null, newRefreshToken?: string | null, newUsername?: string | null) => void;
    setRefreshToken: (newRefreshToken: string | null) => void;
    logout: () => void;
}

// Define props type for AuthProvider
interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: AuthProviderProps) => {
    // State to hold the authentication token
    const [token, setToken_] = useState(sessionStorage.getItem("token"));
    const [refreshToken, setRefreshToken_] = useState(sessionStorage.getItem("refreshToken"));
    const [username, setUsername_] = useState(sessionStorage.getItem("username"));

    // Function to set the authentication token
    const setToken = (newToken: string | null, newRefreshToken: string | null = null, newUsername: string | null = null) => {
        setToken_(newToken);
        if (newRefreshToken) {
            setRefreshToken_(newRefreshToken);
        }
        if (newUsername) {
            setUsername_(newUsername);
        }
    };

    // Function to set only the refresh token
    const setRefreshToken = (newRefreshToken: string | null) => {
        setRefreshToken_(newRefreshToken);
    };

    // Function to logout and clear tokens
    const logout = () => {
        setToken_(null);
        setRefreshToken_(null);
        setUsername_(null);
    };

    useEffect(() => {
        if (token) {
            // TODO: Configure axios instance when available
            // axiosInstance.defaults.headers.common["Authorization"] = "Bearer " + token;
            axios.defaults.headers.common["Authorization"] = "Bearer " + token;
            sessionStorage.setItem('token', token);
        } else {
            // TODO: Configure axios instance when available
            // delete axiosInstance.defaults.headers.common["Authorization"];
            axios.defaults.headers.common["Authorization"]="";
            sessionStorage.removeItem('token');
        }
    }, [token]);

    useEffect(() => {
        if (refreshToken) {
            sessionStorage.setItem('refreshToken', refreshToken);
        } else {
            sessionStorage.removeItem('refreshToken');
        }
    }, [refreshToken]);

    useEffect(() => {
        if (username) {
            sessionStorage.setItem('username', username);
        } else {
            sessionStorage.removeItem('username');
        }
    }, [username]);

    // Memoized value of the authentication context
    const contextValue = useMemo(
        () => ({
            token,
            refreshToken,
            username,
            setToken,
            setRefreshToken,
            logout,
        }),
        [token, refreshToken, username]
    );

    // Provide the authentication context to the children components
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