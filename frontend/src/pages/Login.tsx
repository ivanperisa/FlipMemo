import  { useState } from 'react';
import { Input, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-5" 
             style={{ background: 'linear-gradient(180deg, #FFC0CB 0%, #FFE5EC 100%)' }}>
            
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

                {/* Remember Me Checkbox */}
                <div className="text-center mt-2">
                    <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    >
                        <span style={{ color: '#8B6B7A' }}>Zapamti me???</span>
                    </Checkbox>
                </div>

                {/* Buttons Container - Centered */}
                <div className="flex flex-col items-center gap-4 mt-6">
                    {/* Login Button */}
                    <button
                        className="rounded-full bg-(--color-primary) w-[320px] sm:w-[360px] h-[56px] transition-all hover:opacity-90 hover:shadow-xl text-white shadow-lg font-normal text-[18px] tracking-wide"

                    >
                        Nastavi
                    </button>

                    {/* Forgot Password Button */}
                    <button
                        className="rounded-full bg-(--color-primary) w-[320px] sm:w-[360px] h-[56px] transition-all hover:opacity-90 hover:shadow-xl text-white shadow-lg font-normal text-[18px] tracking-wide"
                    >
                        Promijeni lozinku
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;