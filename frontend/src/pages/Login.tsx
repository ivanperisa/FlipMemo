import  { useState } from 'react';
import { Input, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import {useNavigate, Link} from "react-router";

import AnimatedFace from '../components/AnimatedFace.tsx';
import Particles from "../styles/Particles.tsx";
import PageTransition from '../components/PageTransition.tsx';


const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const navigate=useNavigate();

    function navigateToRegister(){
        navigate("/Register");
    }



    return (



        <PageTransition>
        <div className="min-h-screen flex flex-col items-center justify-center p-5 w-screen">
        <div className={"absolute z-0 w-screen h-screen "}>
            <Particles  particleColors={['#ffffff', '#ffffff']}
                        particleCount={200}
                        particleSpread={10}
                        speed={0.1}
                        particleBaseSize={200}
                        moveParticlesOnHover={true}
                        alphaParticles={false}
                        disableRotation={false}
                        />
        </div>

            <AnimatedFace />



            {/* Login Form Container */}
            <div className="w-full max-w-[400px] flex flex-col gap-4">
                {/* Username Input */}
                <Input
                    size="large"
                    placeholder="Korisničko ime"
                    prefix={<UserOutlined style={{ color: '#FFB6C1' }} />}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="rounded-5xl shadow-md w-screen"
                    style={{
                        padding: '12px 20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    }}
                />

                {/* Password Input */}
                <Input.Password
                    size="large"
                    placeholder="Lozinka"
                    prefix={<LockOutlined style={{ color: '#FFB6C1' }} />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-[25px] shadow-md border-none"
                    style={{
                        padding: '12px 20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    }}
                />
                <Link to="/ForgotPassword" className={"font-space z-1"} style={{ color: '#8B6B7A' }}>Zaboravili ste lozinku?</Link>

                {/* Remember Me Checkbox */}
                <div className="text-center mt-2 z-1">
                    <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    >
                        <span className={"font-space z-1"} style={{ color: '#8B6B7A' }}>Zapamti me???</span>
                    </Checkbox>


                </div>

                {/* Buttons Container - Centered */}
                <div className="flex flex-col items-center gap-4 mt-6">
                    {/* Login Button */}
                    <button
                        className="rounded-full bg-(--color-primary) w-[320px] sm:w-[360px] h-[56px] transition-all hover:opacity-90 hover:shadow-xl text-white shadow-lg
                         font-space text-[18px] tracking-wide hover:cursor-pointer z-1"

                    >
                        Nastavi
                    </button>

                    {/* Registration Button */}
                    <button onClick={navigateToRegister}
                        className="rounded-full bg-(--color-primary) w-[320px] sm:w-[360px] h-[56px] transition-all hover:opacity-90 hover:shadow-xl text-white shadow-lg
                        font-space text-[18px] tracking-wide hover:cursor-pointer z-1"
                    >
                        Registracija
                    </button>




                </div>
            </div>
        </div>
        </PageTransition>

    );
};

export default Login;