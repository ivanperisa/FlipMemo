import AnimatedFace from "../components/AnimatedFace";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import { Form, Input } from "antd";
import LockOutlined, { CloseCircleOutlined } from '@ant-design/icons';
import { useRef, useState } from "react";

const ChangePassword = () => {
    const [form] = Form.useForm();
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const timeoutRef = useRef<number | null>(null); //da nestanu errori ankon 4 sek

    const onFinish = (values: { current_password: string; new_password: string; confirm_new_password: string }) => {
        //resetiraj timer i makni error ako postoji
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        //prvo provjeri preko backenda je li trenutno upisan password dobar
        if (values.current_password != 'lozinka') {
            setErrorMessage('Trenutna lozinka nije točna');
            setShowErrorMessage(true);
            setErrorTimeOut();
            return;
        }
        //onda provjeri je li nova lozinka jednaka staroj
        if (values.current_password == values.new_password) {
            setErrorMessage('Nova lozinka ne smije biti jednaka trenutnoj');
            setShowErrorMessage(true);
            setErrorTimeOut();
            return;
        }
        //onda provjeri jesu li nova i potvrdena nova lozinka iste
        if (values.new_password != values.confirm_new_password) {
            setErrorMessage('Nove lozinke se ne podudaraju'); //ovo bi mozda bilo bolje stavit ispod inputa za lozinke
            setShowErrorMessage(true);
            setErrorTimeOut();
            return;
        }

        //ako je sve u redu makni error message ako ga ima
        setShowErrorMessage(false);
        //TODO: Implement login logic here
    };

    const setErrorTimeOut = () => {
        timeoutRef.current = window.setTimeout(() => {
            setShowErrorMessage(false);
        }, 4000)
    }

    const onFinishFailed = (errorInfo: any) => {
        console.log("Login failed:", errorInfo);
        // Your error handling logic here
    };

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
                        Unesite trenutnu i novu lozinku:
                    </label>

                    <Form
                        form={form}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        layout="vertical"
                    >

                        <Form.Item
                            name="current_password"
                            rules={[
                                { required: true, message: 'Molimo unesite trenutnu lozinku!' }
                            ]}
                            style={{ marginBottom: '16px' }}
                        >
                            <Input.Password
                                size="large"
                                placeholder="Trenutna lozinka"
                                prefix={<LockOutlined style={{ color: '#FFB6C1' }} />}
                                className="rounded-[25px] shadow-md border-none"
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }}
                            />
                        </Form.Item>

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
}

export default ChangePassword;