import AnimatedFace from "../components/AnimatedFace";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import { Form, Input } from "antd";
import { MailOutlined } from "@ant-design/icons";

const Register = () => {
    const [form] = Form.useForm();

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

                <div className="w-full max-w-[400px] flex flex-col gap-4 relative">
                    <label
                        className={"z-1 font-space text-[#8B6B7A]"}
                    >
                        Unesite E-mail adresu za izradu vašeg računa:
                    </label>

                    <Form
                        form={form}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        layout="vertical"
                    >

                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Molimo unesite email!' },
                                { type: 'email', message: 'Molimo unesite validan email!' }
                            ]}
                            style={{ marginBottom: 0 }}
                        >
                            <Input
                                type="email"
                                size="large"
                                placeholder="Email"
                                prefix={<MailOutlined style={{ color: '#FFB6C1' }} />}
                                className="rounded-5xl shadow-md w-screen"
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }}
                            />

                        </Form.Item>

                        <div className="flex flex-col items-center gap-4 mt-6">
                            {/* Registriraj se button */}
                            <button
                                type="submit"
                                className="rounded-full bg-(--color-primary) w-[320px] sm:w-[360px] h-[56px] transition-all hover:opacity-90 hover:shadow-xl text-white shadow-lg
                             font-space text-[18px] tracking-wide hover:cursor-pointer z-1"
                            >
                                Registriraj se
                            </button>
                        </div>

                    </Form>

                </div>

            </div>
        </PageTransition>

    );
};

export default Register;