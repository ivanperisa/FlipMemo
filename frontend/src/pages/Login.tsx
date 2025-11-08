import { Form, Input, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from "react-router";
import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { GoogleLogin } from '@react-oauth/google';

import AnimatedFace from '../components/AnimatedFace.tsx';
import Particles from "../styles/Particles.tsx";
import PageTransition from '../components/PageTransition.tsx';

import axiosInstance from '../api/axiosInstance.ts';
import { useAuth } from '../context/AuthProvider.tsx';
import ThemeButton from '../components/ThemeButton.tsx';



const Login = () => {
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
        navigate("/register");
    }

    const handleGoogleLogin = async (googleToken: string | undefined) => {
  
        try {
   
            setErrorMessage("");
            console.log("Google login successful:", googleToken);
            const response = await axiosInstance.post('/api/v1/Auth/google-login', {
                googleToken: googleToken 
            });

            console.log("Google login successful2:", response.data);
            setToken(response.data.token, response.data.id, true);
            navigate("/home");
 
        } catch (error: any) {
            console.error("Google login failed:", error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || 
                     error.response?.data || 
                     "Google login nije uspio!";
                     setErrorMessage(errorMsg);
                    }
                };

    const onFinish = (values: { email: string; password: string; rememberMe?: boolean }) => {

        console.log("Login success:", values);
        setErrorMessage("");

        axiosInstance.post('/api/v1/Auth/login', {
            email: values.email,
            password: values.password,
        }).then((response) => {
            console.log("Login successful:", response.data);
            
            //tu spremamo token i ovisno o tome dal je remember me ili ne se spremi u local storage ili session storage
            setToken(response.data.token, response.data.id, values.rememberMe || false);

            if (response.data.mustChangePassword) {
                
                navigate("/changePassword");
            } else {
                
                navigate("/home");
            }
        }).catch((error) => {
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

                        <GoogleLogin onSuccess={(credentialResponse) => {
                            console.log(credentialResponse);
                            handleGoogleLogin(credentialResponse.credential);
                        }}
                            onError={() => {
                                console.log('Login Failed');
                                setErrorMessage("Google login nije uspio!");
                        }}/>
                        
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
            </div>
        </PageTransition>
    );
};

export default Login;