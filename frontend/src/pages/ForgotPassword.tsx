import Particles from "../styles/Particles.tsx";
import AnimatedFace from "../components/AnimatedFace.tsx";
import { Form, Input } from "antd";
import { MailOutlined } from "@ant-design/icons";
import PageTransition from '../components/PageTransition.tsx';
import AnimatedSendButton, { type AnimatedSendButtonRef } from "../components/AnimatedSendbutton.tsx";
import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import axiosInstance from "../api/axiosInstance.ts";
import ThemeButton from "../components/ThemeButton.tsx";

const ForgotPassword = () => {
    const [form] = Form.useForm();
    const buttonRef = useRef<AnimatedSendButtonRef>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const inputContainerRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLLabelElement>(null);
    const [showModal, setShowModal] = useState(false);
    const [hideInputs, setHideInputs] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (hideInputs && inputContainerRef.current && labelRef.current) {
            
            gsap.to([inputContainerRef.current, labelRef.current], {
                opacity: 0,
                duration: 0.4,
                ease: "power2.out"
            });
        }
    }, [hideInputs]);

    useEffect(() => {
        if (showModal && modalRef.current) {
            
            gsap.set(modalRef.current, {
                opacity: 0,
                scale: 0.8,
                y: -20
            });

            
            gsap.to(modalRef.current, {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.6,
                ease: "back.out(1.7)"
            });
        }
    }, [showModal]);

    const onFinish = (values: { email: string }) => {
        
        if (isSubmitting) return;

        console.log("Form validation success:", values);

        axiosInstance.post('/api/v1/Auth/forgot-password', {
            email: values.email,
        }).then((response) => {
            console.log("Forgot password email sent:", response.data);
        }).catch((error) => {
            console.error("Error sending forgot password email:", error);
        });

        setIsSubmitting(true);

        
        setHideInputs(true);

        
        if (buttonRef.current) {
            buttonRef.current.triggerAnimation();
        }

        
        setTimeout(() => {
            setShowModal(true);
        }, 1500);
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log("Form validation failed:", errorInfo);
    };

    const handleAnimationComplete = () => {
        console.log("Animation complete! Email sent.");
        // You can re-enable the button here if needed, or navigate away
        // setIsSubmitting(false); // Uncomment if you want to allow re-sending
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

                {/* Email Container */}
                <div className="w-full max-w-[400px] flex flex-col gap-4 relative">

                    <label
                        ref={labelRef}
                        className={"font-space"}
                        style={{ color: 'var(--color-text-on-primary)', zIndex: 100 }}
                    >
                        Unesite E-mail adresu vašeg računa:
                    </label>

                    <Form
                        form={form}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        layout="vertical"
                    >
                        {/* Email Input */}
                        <div ref={inputContainerRef}>
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
                                    prefix={<MailOutlined style={{ color: 'var(--color-primary)' }} />}
                                    className="rounded-5xl shadow-md w-screen"
                                    style={{
                                        padding: '12px 20px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    }}
                                    disabled={isSubmitting}
                                />
                            </Form.Item>
                        </div>

                        {/* Success Modal */}
                        {showModal && (
                            <div
                                ref={modalRef}
                                className="w-full max-w-[380px] bg-white rounded-3xl shadow-2xl p-6 z-50 mx-auto mb-4"
                                style={{
                                    border: '2px solid var(--color-primary)',
                                }}
                            >
                                <div className="flex flex-col items-center gap-3">
                                    {/* Icon */}
                                    <div className="w-16 h-16 rounded-full bg-(--color-primary) flex items-center justify-center">
                                        <MailOutlined style={{ fontSize: '32px', color: 'white' }} />
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-space text-xl font-bold text-[#8B6B7A] text-center">
                                        Email Poslan!
                                    </h3>

                                    {/* Message */}
                                    <p className="font-space text-sm text-[#8B6B7A] text-center">
                                        Provjerite svoj inbox za link za resetiranje lozinke.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Buttons Container - Centered */}
                        <div className="flex flex-col items-center gap-4 mt-6">
                            <AnimatedSendButton
                                ref={buttonRef}
                                type="submit"
                                sendText="POŠALJI E-MAIL"
                                successText="POSLANO!"
                                onSuccess={handleAnimationComplete}
                                bgColor="var(--color-primary)"
                                borderColor="var(--color-primary)"
                                loaderColor="white"
                                successTextColor="var(--color-primary)"
                                disabled={isSubmitting}
                                className="z-1 w-[320px] sm:w-[360px] font-space text-[18px] tracking-wide shadow-lg"
                            />
                        </div>
                    </Form>
                </div>
            </div>
        </PageTransition>
    );
};

export default ForgotPassword;