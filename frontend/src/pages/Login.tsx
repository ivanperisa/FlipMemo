import { Form, Input, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import {useNavigate, Link} from "react-router";

import AnimatedFace from '../components/AnimatedFace.tsx';
import Particles from "../styles/Particles.tsx";
import PageTransition from '../components/PageTransition.tsx';


const Login = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    function navigateToRegister(){
        navigate("/Register");
    }

    const onFinish = (values: { username: string; password: string; rememberMe?: boolean }) => {
        console.log("Login success:", values);
        //TODO: Implement login logic here
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log("Login failed:", errorInfo);
        // Your error handling logic here
    };

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col items-center justify-center p-5 w-screen">
                <div className={"absolute z-0 w-screen h-screen "}>
                    <Particles  particleColors={['#ffffff', '#ffffff']}
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
                <div className="w-full max-w-[400px] flex flex-col gap-4">
                    <Form
                        form={form}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        layout="vertical"
                        initialValues={{ rememberMe: false }}
                    >
                        {/* Username Input */}
                        <Form.Item
                            name="username"
                            rules={[
                                { required: true, message: 'Molimo unesite korisničko ime!' }
                            ]}
                            style={{ marginBottom: '16px' }}
                        >
                            <Input
                                size="large"
                                placeholder="Korisničko ime"
                                prefix={<UserOutlined style={{ color: '#FFB6C1' }} />}
                                className="rounded-5xl shadow-md w-screen"
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }}
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
                                prefix={<LockOutlined style={{ color: '#FFB6C1' }} />}
                                className="rounded-[25px] shadow-md border-none"
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }}
                            />
                        </Form.Item>

                        <Link to="/ForgotPassword" className={"font-space z-1"} style={{ color: '#8B6B7A' }}>Zaboravili ste lozinku?</Link>

                        {/* Remember Me Checkbox */}
                        <div className="text-center mt-2 z-1">
                            <Form.Item
                                name="rememberMe"
                                valuePropName="checked"
                                style={{ marginBottom: 0 }}
                            >
                                <Checkbox>
                                    <span className={"font-space z-1"} style={{ color: '#8B6B7A' }}>Zapamti me???</span>
                                </Checkbox>
                            </Form.Item>
                        </div>

                        {/* Buttons Container - Centered */}
                        <div className="flex flex-col items-center gap-4 mt-6">
                            {/* Login Button */}
                            <button
                                type="submit"
                                className="rounded-full bg-(--color-primary) w-[320px] sm:w-[360px] h-[56px] transition-all hover:opacity-90 hover:shadow-xl text-white shadow-lg
                             font-space text-[18px] tracking-wide hover:cursor-pointer z-1"
                            >
                                Nastavi
                            </button>

                            {/* Registration Button */}
                            <button onClick={navigateToRegister}
                                    type="button"
                                    className="rounded-full bg-(--color-primary) w-[320px] sm:w-[360px] h-[56px] transition-all hover:opacity-90 hover:shadow-xl text-white shadow-lg
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