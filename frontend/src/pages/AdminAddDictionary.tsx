import PageTransition from "../components/PageTransition"
import Header from "../components/Header"
import Particles from "../styles/Particles"
import { BookOutlined, CloseCircleOutlined, TranslationOutlined } from '@ant-design/icons'
import { useEffect, useState } from "react"
import axiosInstance from "../api/axiosInstance"
import { Form, Input, Select } from "antd"
import { useForm } from "antd/es/form/Form"

const AdminAddDictionary = () => {

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [form] = useForm();

        useEffect(() => {
            if (successMessage) {
                const timeoutId = setTimeout(() => {
                    setSuccessMessage("");
                }, 5000)

                return () => {
                    if (timeoutId) clearTimeout(timeoutId);
                }
            }
        }, [successMessage]);

        const onFinish = (values: { dictionaryName: string; dictionaryLanguage: string; }) => {
        console.log("Adding dictionary");

        const body = { name: values.dictionaryName, language: values.dictionaryLanguage};

        axiosInstance.post('api/v1/Dictionary', body)
        .then((response) => {
            console.log("Dictionary added successfuly: ", response.data);
            setErrorMessage("");
            setSuccessMessage("Rječnik uspješno dodan!");
            form.resetFields();
        }).catch((error) => {
            console.error("Dictionary adding failed", error.response?.data || error.message);

            const errorMsg = error.response?.data?.message || error.response?.data || "Greška pri dodavanju rječnika!";
            setSuccessMessage("");
            setErrorMessage(errorMsg);
        });
    }

    const onFinishFailed = (errorInfo: any) => {
        console.log("Dictionary adding failed ", errorInfo);
    }

    return (
        <PageTransition>
            <div className={`flex flex-row gap-2 mt-4 fixed top-0 left-1/2 -translate-x-1/2 bg-green-400 text-white font-semibold rounded-md px-4 py-2 shadow-md z-50 transition-all duration-500 transform ${successMessage ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                {successMessage}
                <button onClick={() => setSuccessMessage("")} >
                    <CloseCircleOutlined className="rounded cursor-pointer filter hover:brightness-90 transition-colors duration-200" />
                </button>
            </div>
            
            <div className="min-h-screen flex flex-col items-center justify-start w-screen">
                <div className={"absolute z-0 w-screen h-screen"}>
                    <Particles 
                        particleColors={['#ffffff', '#ffffff']}
                        particleCount={150}
                        particleSpread={8}
                        speed={0.08}
                        particleBaseSize={180}
                        moveParticlesOnHover={true}
                        alphaParticles={false}
                        disableRotation={false}
                    />
                </div>

                <Header />

                <div className="mt-20 w-full max-w-[400px] flex flex-col gap-4 relative">

                    <label className={"z-1 font-space text-[var(--color-text-on-primary)] text-lg"}>
                        Unesite ime i jezik novog rječnika
                    </label>

                    {errorMessage && (
                        <div 
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
                        <Form.Item
                            name="dictionaryName"
                            rules={[
                                { required: true, message: 'Molimo unesite ime rječnika!' }
                            ]}
                            style={{
                                marginBottom: "16px",
                            }}
                        >
                            <Input
                                size="large"
                                placeholder="Ime rječnika"
                                prefix={<BookOutlined 
                                    className="text-l"
                                    style={{ color: 'var(--color-primary)' }} />}
                                className="rounded-5xl shadow-md w-screen text-xl p-4 h-16"
                                style={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }}
                            />

                        </Form.Item>

                        <Form.Item
                            name="dictionaryLanguage"
                            rules={[
                                { required: true, message: 'Molimo odaberite jezik rječnika' }
                            ]}
                        >
                            <Select
                                size="large"
                                placeholder="Odaberite jezik rječnika"
                                prefix={<TranslationOutlined 
                                    className="text-l"
                                    style={{ color: 'var(--color-primary)' }} />
                                }
                                className="rounded-5xl shadow-md w-screen text-xl p-4 h-16 text-xl p-4 h-16"
                            >
                                <Select.Option value="en">Engleski</Select.Option>
                            </Select>
                            
                        </Form.Item>

                        <div className="flex flex-col items-center gap-4 mt-6">
                            <button
                                type="submit"
                                className="rounded-full bg-(--color-primary-dark) w-[320px] sm:w-[360px] h-[56px] transition-all hover:opacity-90 hover:shadow-xl text-on-dark shadow-lg
                                font-space text-[18px] tracking-wide hover:cursor-pointer z-1"
                            >
                                Dodaj rječnik
                            </button>
                        </div>

                    </Form>

                </div>
                

            </div>

        </PageTransition>
    )

};

export default AdminAddDictionary;