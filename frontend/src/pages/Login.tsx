import { Form, Input, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from "react-router";
import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGoogleLogin } from '@react-oauth/google';

import AnimatedFace from '../components/AnimatedFace.tsx';
import Particles from "../styles/Particles.tsx";
import PageTransition from '../components/PageTransition.tsx';

import axiosInstance from '../api/axiosInstance.ts';
import { useAuth } from '../context/AuthProvider.tsx';
import ThemeButton from '../components/ThemeButton.tsx';
import { Mosaic } from 'react-loading-indicators';






const Login = () => {
    const [Loading, setLoading] = useState<boolean>(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { setToken } = useAuth();
    const [errorMessage, setErrorMessage] = useState<string>("");
    const errorMessageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (errorMessage && errorMessageRef.current) {
            
            gsap.fromTo(errorMessageRef.current, 
                {
                    opacity: 0,
                    y: -10
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: "power2.out"
                }
            );
        }
    }, [errorMessage]);

    function navigateToRegister() {
        setLoading(true);
        navigate("/register");

    }

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                setErrorMessage("");
                
                // Get user info from Google
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const userInfo = await userInfoResponse.json();
                
                console.log("Google login successful:", userInfo);
                
                // Send to your backend
                const response = await axiosInstance.post('/api/v1/Auth/google-login', {
                    googleToken: tokenResponse.access_token,
                    email: userInfo.email
                });

                console.log("Backend response:", response.data);
                setToken(response.data.token, response.data.id, response.data.role, true);
                navigate("/home");
            } catch (error: any) {
                setLoading(false);
                console.error("Google login failed:", error.response?.data || error.message);
                const errorMsg = error.response?.data?.message || 
                         error.response?.data || 
                         "Google login nije uspio!";
                setErrorMessage(errorMsg);
            }
        },
        onError: () => {
            setErrorMessage("Google login nije uspio!");
        }
    });

    const onFinish = (values: { email: string; password: string; rememberMe?: boolean }) => {
        setLoading(true);

        console.log("Login success:", values);
        setErrorMessage("");
        axiosInstance.post('/api/v1/Auth/login', {
            email: values.email,
            password: values.password,
        }).then((response) => {
            console.log("Login successful:", response.data);
            
            //tu spremamo token i ovisno o tome dal je remember me ili ne se spremi u local storage ili session storage
            setToken(response.data.token, response.data.id, response.data.role, values.rememberMe || false);

            if (response.data.mustChangePassword) {
                
                navigate("/changePassword");
            } else {
                
                navigate("/home");
            }
        }).catch((error) => {
            setLoading(false);
            console.error("Login failed:", error.response?.data || error.message);
            
            // Set error message
            const errorMsg = error.response?.data?.message || 
                            error.response?.data || 
                            "Neispravni email ili lozinka!";
            setErrorMessage(errorMsg);
        });
    };
    const onFinishFailed = (errorInfo: any) => {
        console.log("Login failed:", errorInfo);
        //TODO: Your error handling logic here
    };

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col items-center justify-center p-5 w-screen">
                {Loading ? (
                    <Mosaic color="var(--color-primary-dark)" size="medium" text="" textColor="" />
                ) : (
                    <>
                        {/* Theme Button u gornjem desnom kutu */}
                        <div className="fixed top-6 right-6 z-50">
                            <ThemeButton />
                        </div>

                        <div className={"absolute z-0 w-screen h-screen "}>
                            <Particles particleColors={['#ffffff', '#ffffff']}
                                particleCount={300}
                                particleSpread={12}
                                speed={0.1}
                                particleBaseSize={200}
                                moveParticlesOnHover={true}
                                alphaParticles={false}
                                disableRotation={false}
                            />
                        </div>

                        <AnimatedFace />

                        {/* Login Form Container */}
                        <div className="mt-36 w-full max-w-[400px] flex flex-col gap-4">
                    
                    {/* Error Message */}
                    {errorMessage && (
                        <div 
                            ref={errorMessageRef}
                            className="w-full bg-red-50 border-2 border-red-300 rounded-2xl p-3 z-10"
                        >
                            <p className="font-space text-sm text-red-600 text-center">
                                {errorMessage}
                            </p>
                        </div>
                    )}

                    <Form
                        form={form}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        layout="vertical"
                        initialValues={{ rememberMe: true }}
                    >
                        {/* Email Input */}
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Molimo unesite email!' },
                                { type: 'email', message: 'Molimo unesite validan email!' }
                            ]}
                            style={{ marginBottom: '16px' }}
                        >
                            <Input
                                size="large"
                                placeholder="Email"
                                prefix={<UserOutlined style={{ color: 'var(--color-primary)' }} />}
                                className="rounded-5xl shadow-md w-screen"
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }}
                                onChange={() => setErrorMessage("")}
                            />
                        </Form.Item>

                        {/* Password Input */}
                        <Form.Item
                            name="password"
                            rules={[
                                { required: true, message: 'Molimo unesite lozinku!' }
                            ]}
                            style={{ marginBottom: '16px' }}
                        >
                            <Input.Password
                                size="large"
                                placeholder="Lozinka"
                                prefix={<LockOutlined style={{ color: 'var(--color-primary)' }} />}
                                className="rounded-[25px] shadow-md border-none"
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    
                                }}
                                onChange={() => setErrorMessage("")}
                            />
                        </Form.Item>

                        {/* Custom Google Login Button */}
                        <button
                            type="button"
                            onClick={() => googleLogin()}
                            className="flex items-center justify-center gap-3 w-full rounded-full bg-white border-2 border-gray-300 px-6 py-3 transition-all hover:shadow-lg hover:border-gray-400 relative z-10 hover:cursor-pointer"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
                                <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
                                <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49L4.405 11.9z" fill="#FBBC05"/>
                                <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
                            </svg>
                            <span className="font-space text-gray-700 font-medium">
                                Nastavi sa Googleom
                            </span>
                        </button>
                        
                        <br/>
                        <Link to="/forgotPassword" className={"font-space relative"} style={{ color: 'var(--color-text-on-primary)', zIndex: 100 }}>Zaboravili ste lozinku?</Link>

                        {/* Remember Me Checkbox */}
                        <div className="text-center mt-2 z-1">
                            <Form.Item
                                name="rememberMe"
                                valuePropName="checked"
                                style={{ marginBottom: 0 }}
                            >
                                <Checkbox>
                                    <span className={"font-space z-1"} style={{ color: 'var(--color-text-on-primary)' }}>Zapamti me</span>
                                </Checkbox>
                            </Form.Item>
                        </div>

                        {/* Buttons Container - Centered */}
                        <div className="flex flex-col items-center gap-4 mt-6">
                            {/* Login Button */}
                            <button
                                type="submit"
                                className="rounded-full bg-(--color-primary-dark) w-[320px] sm:w-[360px] h-[56px] transition-all hover:opacity-90 hover:shadow-xl text-on-dark shadow-lg
                             font-space text-[18px] tracking-wide hover:cursor-pointer z-1"
                            >
                                Nastavi
                            </button>

                            {/* Registration Button */}
                            <button onClick={navigateToRegister}
                                type="button"
                                className="rounded-full bg-(--color-primary-dark) w-[320px] sm:w-[360px] h-[56px] transition-all hover:opacity-90 hover:shadow-xl text-on-dark shadow-lg
                            font-space text-[18px] tracking-wide hover:cursor-pointer z-1"
                            >
                                Registracija
                            </button>

                            
                        </div>
                    </Form>
                </div>
                    </>
                )}
            </div>
                    
        </PageTransition>
    );
};

export default Login;