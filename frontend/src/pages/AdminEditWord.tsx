import { useEffect, useState } from "react";
import Header from "../components/Header";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import { useAdminContext } from "../context/AdminContext";
import { useNavigate } from "react-router";
import { CloseCircleOutlined, IdcardOutlined, MinusCircleOutlined, PlusOutlined, SwapOutlined, TranslationOutlined } from '@ant-design/icons'
import { Button, Form, Input, Space } from "antd";
import { div } from "framer-motion/client";

const AdminEditWord = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    
    const { selectedWord } = useAdminContext();
    // const [editedWord, setEditedWord] = useState(selectedWord);
    const [errorMessage] = useState("");
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [successMessage] = useState("");
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    useEffect(() => {
        console.log(selectedWord);
        if (!selectedWord) {
            navigate("/admin", {replace: true});
        }
    }, [selectedWord, navigate]);

    const resetSourcePhrases = () => {
        if (!selectedWord) return;

        form.setFieldsValue({
            sourcePhrases: selectedWord.sourcePhrases,
        });
    }

    const resetTargetPhrases = () => {
        if (!selectedWord) return;

        form.setFieldsValue({
            targetPhrases: selectedWord.targetPhrases,
        });
    }

    const onFinishEdit = () => {
        console.log("Submitano")
    }

    return (
        
        <PageTransition>    
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

                <div className="w-full flex justify-center">
                    <div className="w-full max-w-[700px] p-6 rounded-xl shadow-lg relative z-10" style={{ backgroundColor: '#FFFFFF', border: '2px solid var(--color-gradient-start)', fontFamily: 'var(--font-space)' }}>

                        <div className={`overflow-hidden transition-all duration-500 ease-out ${showErrorMessage ? "max-h-40" : "max-h-0"}`}>
                            <div className="flex flex-row items-center justify-between w-full rounded-lg p-3 mb-3" style={{ backgroundColor: 'rgba(255,0,0,0.06)', border: '1px solid rgba(255,0,0,0.12)', color: 'var(--color-gradient-start)' }}>
                                <p className="text-sm text-center" style={{ fontFamily: 'var(--font-space)' }}>{errorMessage}</p>
                                <button className="text-sm" onClick={() => setShowErrorMessage(false)} style={{ color: 'var(--color-gradient-start)' }}>
                                    <CloseCircleOutlined className="cursor-pointer" />
                                </button>
                            </div>
                        </div>

                        {showSuccessMessage && !showErrorMessage && (
                            <div className="relative flex items-center justify-between w-full rounded-lg p-3 mb-3" style={{ backgroundColor: 'rgba(0,128,0,0.05)', border: '1px solid rgba(0,128,0,0.12)', color: 'var(--color-primary-dark)' }}>
                                <p className="text-sm text-center" style={{ fontFamily: 'var(--font-space)' }}>{successMessage}</p>
                                <button onClick={() => setShowSuccessMessage(false)} className="text-sm" style={{ color: 'var(--color-primary-dark)' }}>
                                    <CloseCircleOutlined className="cursor-pointer" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                                    <div className="h-full bg-[var(--color-primary-dark)] animate-success-timer" />
                                </div>
                            </div>
                        )}

                        <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'var(--font-space)', color: 'var(--color-gradient-start)' }}>
                            Uredi riječ
                        </h2>

                        <Form 
                            form={form}
                            onFinish={onFinishEdit}
                            layout="vertical"
                            initialValues={{ sourcePhrases: selectedWord?.sourcePhrases, targetPhrases: selectedWord?.targetPhrases}}
                        >
                        
                            <Form.Item name="id">
                                <label className="text-sm mb-2 block" style={{ fontFamily: 'var(--font-space)', color: 'var(--color-gradient-start)' }}>ID</label>
                                <Input
                                    disabled
                                    size="small"
                                    value={selectedWord?.id}
                                    prefix={<IdcardOutlined style={{ color: 'var(--color-gradient-start)' }} />}
                                    className="rounded-full shadow-sm w-full"
                                    style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' }}
                                />
                            </Form.Item>
                            <Form.Item name="sourceWord">
                                <label className="text-sm mb-2 block" style={{ fontFamily: 'var(--font-space)', color: 'var(--color-gradient-start)' }}>Izvorna riječ</label>
                                <Input
                                    disabled
                                    size="large"
                                    value={selectedWord?.sourceWord}
                                    prefix={<TranslationOutlined style={{ color: 'var(--color-gradient-start)' }} />}
                                    className="rounded-full shadow-sm w-full"
                                    style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' }}
                                />
                            </Form.Item>

                        

                            <Form.Item name="targetWord">
                                <label className="text-sm mb-2 block" style={{ fontFamily: 'var(--font-space)', color: 'var(--color-gradient-start)' }}>Prijevod</label>
                                <Input
                                    disabled
                                    size="large"
                                    value={selectedWord?.targetWord}
                                    prefix={<SwapOutlined style={{ color: 'var(--color-gradient-start)' }} />}
                                    className="rounded-full shadow-sm w-full"
                                    style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' }}
                                />
                            </Form.Item>

                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm" style={{ fontFamily: 'var(--font-space)', color: 'var(--color-gradient-start)' }}>Fraze na izvornom jeziku</label>
                            <button type="button" onClick={resetSourcePhrases} className="text-sm px-2 py-1 rounded hover:bg-[rgba(0,0,0,0.03)]" style={{ color: 'var(--color-gradient-start)', fontFamily: 'var(--font-space)', textDecoration: 'underline' }}>
                                resetiraj vrijednosti
                            </button>
                        </div>
                        <Form.List name="sourcePhrases">
                            {(fields, { add, remove }) => (
                                <div className="flex flex-col gap-3">
                                    {fields.map(({ key, name, ...restField }) => (
                                        <div key={key} className="flex items-start gap-3">
                                            <Form.Item className="flex-1 m-0" {...restField} name={name} rules={[{ required:true, message: "Molimo upišite frazu" }]}>
                                                <Input placeholder="Fraza na izvornom jeziku" className="w-full rounded-md" style={{ fontFamily: 'var(--font-space)', fontSize: 16, padding: '10px' }} />
                                            </Form.Item>
                                            <button type="button" onClick={() => remove(name)} aria-label="Ukloni frazu" className="cursor-pointer p-2 rounded-full hover:bg-[rgba(0,0,0,0.04)]" style={{ color: 'var(--color-gradient-start)' }}>
                                                <MinusCircleOutlined />
                                            </button>
                                        </div>
                                    ))}

                                    <div>
                                        {fields.length >= 5 ? (
                                            <div className="w-full flex justify-center">
                                                <div className="w-full max-w-[420px]">
                                                    <div className="text-center px-4 py-2 rounded-md" style={{ border: '1px solid var(--color-gradient-start)', color: 'var(--color-gradient-start)', fontFamily: 'var(--font-space)', backgroundColor: 'transparent' }}>
                                                        Maksimalan broj izvornih fraza dosegnut
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ borderColor: 'var(--color-gradient-start)', color: 'var(--color-gradient-start)', fontFamily: 'var(--font-space)' }}>
                                                Dodaj frazu na izvornom jeziku
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Form.List>

                        <div className="w-full mt-6 mb-2" style={{ borderTop: '1px solid var(--color-gradient-end)' }} />
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm mt-4" style={{ fontFamily: 'var(--font-space)', color: 'var(--color-gradient-start)' }}>Fraze na hrvatskom jeziku</label>
                            <button type="button" onClick={resetTargetPhrases} className="text-sm px-2 py-1 rounded hover:bg-[rgba(0,0,0,0.03)]" style={{ color: 'var(--color-gradient-start)', fontFamily: 'var(--font-space)', textDecoration: 'underline' }}>
                                resetiraj vrijednosti
                            </button>
                        </div>
                        <Form.List name="targetPhrases">
                            {(fields, { add, remove }) => (
                                <div className="flex flex-col gap-3">
                                    {fields.map(({ key, name, ...restField }) => (
                                        <div key={key} className="flex items-start gap-3">
                                            <Form.Item className="flex-1 m-0" {...restField} name={name} rules={[{ required:true, message: "Molimo upišite frazu" }]}>
                                                <Input placeholder="Fraza na izvornom jeziku" className="w-full rounded-md" style={{ fontFamily: 'var(--font-space)', fontSize: 16, padding: '10px' }} />
                                            </Form.Item>
                                            <button type="button" onClick={() => remove(name)} aria-label="Ukloni frazu" className="cursor-pointer p-2 rounded-full hover:bg-[rgba(0,0,0,0.04)]" style={{ color: 'var(--color-gradient-start)' }}>
                                                <MinusCircleOutlined />
                                            </button>
                                        </div>
                                    ))}

                                    <div>
                                        {fields.length >= 5 ? (
                                            <div className="w-full mt-2 flex justify-center">
                                                <div className="w-full max-w-[420px]">
                                                    <div className="text-center px-4 py-2 rounded-md" style={{ border: '1px solid var(--color-gradient-start)', color: 'var(--color-gradient-start)', fontFamily: 'var(--font-space)', backgroundColor: 'transparent' }}>
                                                        Maksimalan broj prevedenih fraza dosegnut
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ borderColor: 'var(--color-gradient-start)', color: 'var(--color-gradient-start)', fontFamily: 'var(--font-space)' }}>
                                                Dodaj frazu na hrvatskom jeziku
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Form.List>

                        <div className="w-full flex justify-center mt-6">
                            <div className="w-full max-w-[420px] flex justify-center">
                                <button
                                    type="submit"
                                    onClick={() => onFinishEdit()}
                                    className="rounded-full bg-(--color-primary-dark) w-[320px] sm:w-[360px] h-[56px] transition-all hover:opacity-90 hover:shadow-xl text-on-dark shadow-lg font-space text-[18px] tracking-wide hover:cursor-pointer z-1"
                                >
                                    Spremi
                                </button>
                            </div>
                        </div>

                    </Form>

                </div>
                </div>
            </div>

        </PageTransition>   
    );

};

export default AdminEditWord;