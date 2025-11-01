import AnimatedFace from "../components/AnimatedFace";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import { Form, Input } from "antd";
import { MailOutlined } from "@ant-design/icons";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router";
import AnimatedSendButton, { type AnimatedSendButtonRef } from "../components/AnimatedSendbutton.tsx";
import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";

const Register = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const buttonRef = useRef<AnimatedSendButtonRef>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const inputContainerRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLLabelElement>(null);
    const errorMessageRef = useRef<HTMLDivElement>(null);
    const [showModal, setShowModal] = useState(false);
    const [hideInputs, setHideInputs] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

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

    const onFinish = (values: { email: string; }) => {
        
        if (isSubmitting) return;

        console.log("Registration success:", values);

        
        setErrorMessage("");
        
        setIsSubmitting(true);

        
        setHideInputs(true);

        
        if (buttonRef.current) {
            buttonRef.current.triggerAnimation();
        }

        
        axiosInstance.post("/api/v1/Auth/register", {
            email: values.email
        }).then((response) => {
            console.log("Registration successful:", response.data);
            
            
            setTimeout(() => {
                setShowModal(true);
            }, 1500);

          
            setTimeout(() => {
                navigate("/login");
            }, 6000);
            
        }).catch((error: any) => {
            console.error("Registration failed:", error.response?.data || error.message);
            
           
            setHideInputs(false);
            setIsSubmitting(false);
            
            
            if (buttonRef.current) {
                buttonRef.current.reset();
            }
            
           
            if (inputContainerRef.current && labelRef.current) {
                gsap.to([inputContainerRef.current, labelRef.current], {
                    opacity: 1,
                    duration: 0.4,
                    ease: "power2.out"
                });
            }
            
           
            const errorMsg = error.response?.data?.message || error.response?.data || "Korisnik s ovom email adresom već postoji!";
            setErrorMessage(errorMsg);
        });
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log("Login failed:", errorInfo);
       
    };

    const handleAnimationComplete = () => {
        console.log("Animation complete! Registration successful.");
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
                        ref={labelRef}
                        className={"z-1 font-space text-[#8B6B7A]"}
                    >
                        Unesite E-mail adresu za izradu vašeg računa:
                    </label>

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
                    >

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
                                    prefix={<MailOutlined style={{ color: '#FFB6C1' }} />}
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
                                        Registracija Uspješna!
                                    </h3>

                                    {/* Message */}
                                    <p className="font-space text-sm text-[#8B6B7A] text-center">
                                        Provjerite svoj inbox za potvrdu računa.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col items-center gap-4 mt-6">
                            {/* Registriraj se button */}
                            <AnimatedSendButton
                                ref={buttonRef}
                                type="submit"
                                sendText="REGISTRIRAJ SE"
                                successText="USPJEŠNO!"
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

export default Register;