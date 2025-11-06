import AnimatedFace from "../components/AnimatedFace";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import { Form, Input } from "antd";
import { LockOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Missing from "./Missing";

const ResetPassword = () => {
    const { search } = useLocation();
    const query = new URLSearchParams(search);
    const [email, token] = [query.get("email"), query.get("token")];

    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    const onFinish = (values: {new_password: string; confirm_new_password: string;}) => {
        console.log("Changing forgoten password for ", email);

        if (values.new_password != values.confirm_new_password) {
            setErrorMessage("Lozinke se ne podudaraju!");
            setShowErrorMessage(true);
            return;
        }

        const body = { NewPassword: values.new_password, ConfirmNewPassword: values.confirm_new_password};
        const params = { Email: email, Token: token};

        axiosInstance.post('api/v1/Auth/reset-password', body, { params })
        .then((response) => {
            console.log("Password changed succesfully: ", response.data);
            navigate('/login');
        }).catch((error) => {
            console.error("Password change failed:", error.response?.data || error.message);

            const errorMsg = error.response?.data?.message || error.response?.data || "Greška pri promjeni lozinke!";
            setErrorMessage(errorMsg);
            setShowErrorMessage(true);
        });
    }

    const onFinishFailed = (errorInfo: any) => {
        console.log("Password Reset failed: ", errorInfo);
    }

    if (!email || !token) {
        return <Missing></Missing>
    }

    return (
        <PageTransition>
            <div className={`flex flex-row gap-2 mt-4 fixed top-0 left-1/2 -translate-x-1/2 bg-red-400 text-white font-semibold rounded-md px-4 py-2 shadow-md z-50 transition-all duration-500 transform ${showErrorMessage ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                {errorMessage}
                <button onClick={() => setShowErrorMessage(false)} >
                    <CloseCircleOutlined className="rounded cursor-pointer filter hover:brightness-90 transition-colors duration-200" />
                </button>
            </div>
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

                <div className="mt-20 w-full max-w-[400px] flex flex-col gap-4 relative">
                    <label
                        className={"z-1 font-space text-[#8B6B7A]"}
                    >
                        Unesite i potvrdite novu lozinku:
                    </label>

                    <Form
                        form={form}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        layout="vertical"
                    >
                        <Form.Item
                            name="new_password"
                            rules={[
                                { required: true, message: 'Molimo unesite novu lozinku!' }
                            ]}
                            style={{ marginBottom: '16px' }}
                        >
                            <Input.Password
                                size="large"
                                placeholder="Nova lozinka"
                                prefix={<LockOutlined style={{ color: '#FFB6C1' }} />}
                                className="rounded-[25px] shadow-md border-none"
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirm_new_password"
                            rules={[
                                { required: true, message: 'Molimo potvrdite novu lozinku!' }
                            ]}
                            style={{ marginBottom: '16px' }}
                        >
                            <Input.Password
                                size="large"
                                placeholder="Potvrda nove lozinke"
                                prefix={<LockOutlined style={{ color: '#FFB6C1' }} />}
                                className="rounded-[25px] shadow-md border-none"
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }}
                            />
                        </Form.Item>

                        <div className="flex flex-col items-center gap-4 mt-6">
                            {/* Change Password button */}
                            <button
                                type="submit"
                                className="rounded-full bg-(--color-primary) w-[320px] sm:w-[360px] h-[56px] transition-all hover:opacity-90 hover:shadow-xl text-white shadow-lg
                             font-space text-[18px] tracking-wide hover:cursor-pointer z-1"
                            >
                                Promijeni lozinku
                            </button>
                        </div>
                        
                    </Form>

                </div>
            </div>

        </PageTransition>
    )

}

export default ResetPassword;