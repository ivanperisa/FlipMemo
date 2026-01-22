import { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import { useAdminContext } from "../context/AdminContext";
import { useNavigate } from "react-router";
import { CloseCircleOutlined, IdcardOutlined, MinusCircleOutlined, PlusOutlined, SwapOutlined, TranslationOutlined } from '@ant-design/icons'
import { Button, Form, Input } from "antd";
import axiosInstance from "../api/axiosInstance";
import { Mosaic } from "react-loading-indicators";
import qs from "qs";

interface Word {
    id: number;
    sourceWord: string;
    targetWord: string;
    sourcePhrases: string[];
    targetPhrases: string[];
}

interface UsageServerResponse {
    dictionaries: DictionaryDTO[];
}

interface DictionaryDTO {
    dictionaryId: number;
    dictionaryName: string;
}

const AdminEditWord = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const timersRef = useRef<number[]>([]);
    const userScrolledRef = useRef(false);
    const [Loading, setLoading] = useState(false);

    const { selectedWord, setSelectedWord } = useAdminContext();
    // const [editedWord, setEditedWord] = useState(selectedWord);
    const [errorMessage, setErrorMessage] = useState("");
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const [dictArray, setDictArray] = useState<DictionaryDTO[]>([]);
    const [showDictArray, setShowDictArray] = useState(false);

    useEffect(() => {
        console.log(selectedWord);
        if (!selectedWord) {
            navigate("/admin", {replace: true});
        }
    }, [selectedWord, navigate]);

        useEffect(() => {
            if (showSuccessMessage) {
                const timeoutId = setTimeout(() => {
                    setShowSuccessMessage(false);
                }, 5000)

                return () => {
                    if (timeoutId) clearTimeout(timeoutId);
                }
            }
        }, [showSuccessMessage]);

    // Robustly scroll the viewport and the scrollable container to top,
    // but only when the error/success is opened (not closed) or when selectedWord changes.
    const prevShowErrorRef = useRef<boolean>(false);
    const prevShowSuccessRef = useRef<boolean>(false);
    const prevSelectedWordRef = useRef<typeof selectedWord | null>(null);

    useEffect(() => {
        const scrollAllToTop = () => {
            try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch {};
            try { document.documentElement.scrollTop = 0; } catch {};
            try { document.body.scrollTop = 0; } catch {};
            if (scrollRef.current) {
                try { scrollRef.current.scrollTop = 0; } catch {}
                try { scrollRef.current.scrollTo({ top: 0, behavior: 'auto' }); } catch {}
            }
        };

        const clearTimers = () => {
            timersRef.current.forEach(t => clearTimeout(t));
            timersRef.current = [];
        };

        const onUserScroll = () => {
            userScrolledRef.current = true;
            clearTimers();
        };

        // Determine whether we should trigger auto-scroll:
        const openedError = showErrorMessage && !prevShowErrorRef.current;
        const openedSuccess = showSuccessMessage && !prevShowSuccessRef.current;
        const changedSelected = selectedWord !== prevSelectedWordRef.current;

        // Update prev refs for next run
        prevShowErrorRef.current = showErrorMessage;
        prevShowSuccessRef.current = showSuccessMessage;
        prevSelectedWordRef.current = selectedWord;

        // Only proceed if an error/success opened or the selected word changed
        if (!openedError && !openedSuccess && !changedSelected) return;

        // attach user scroll listeners to cancel auto-scroll attempts
        window.addEventListener('scroll', onUserScroll, { passive: true });
        if (scrollRef.current) scrollRef.current.addEventListener('scroll', onUserScroll, { passive: true });

        // immediate attempt
        scrollAllToTop();

        // Run multiple delayed attempts to handle layout/animation timing.
        const delays = [40, 120, 250, 500, 900];
        delays.forEach((d) => {
            const t = window.setTimeout(() => {
                if (userScrolledRef.current) return;
                scrollAllToTop();
                // also try to bring the card into view explicitly
                if (cardRef.current) {
                    try { cardRef.current.scrollIntoView({ block: 'start', behavior: 'auto' }); } catch {}
                }
                // if already at top, clear remaining timers
                const atTop = (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop) === 0
                    && (!scrollRef.current || scrollRef.current.scrollTop === 0);
                if (atTop) clearTimers();
            }, d);
            timersRef.current.push(t);
        });

        return () => {
            clearTimers();
            window.removeEventListener('scroll', onUserScroll);
            if (scrollRef.current) scrollRef.current.removeEventListener('scroll', onUserScroll as EventListener);
            userScrolledRef.current = false;
        };
    }, [showErrorMessage, showSuccessMessage, selectedWord]);

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

    const onFinishEdit = (values: { sourcePhrases: string[]; targetPhrases: string[]; }) => {
        setShowErrorMessage(false);
        setShowSuccessMessage(false);
        setLoading(true);
        console.log("Submitano")
        axiosInstance.post<Word>("/api/v1/word/changePhrases", { Polje: "vrijednost" }, {
            params: {
                Id: selectedWord?.id, 
                SourcePhrases: values.sourcePhrases, 
                TargetPhrases: values.targetPhrases
            },
            paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
        })
        .then((response) => {
            setSelectedWord(response.data);
            setSuccessMessage("Riječ uspješno ažurirana");
            setShowSuccessMessage(true);
        })
        .catch((error) => {
            const errorMsg = error.response?.data?.message
                || (typeof error.response?.data === 'string' ? error.response.data : JSON.stringify(error.response?.data))
                || "Greška pri ažuriranju riječi!";
            setErrorMessage(errorMsg);
            setShowErrorMessage(true);
        })
        .finally(() => {
            setLoading(false);
            
        })
    };

    const fetchDictionaryUsage = () => {
        if (!selectedWord) return;
        setShowDictArray(false);
        axiosInstance.get<UsageServerResponse>(`/api/v1/dictionary/${selectedWord.id}/usage`)
        .then((response) => {
            setDictArray(response.data.dictionaries);
            setShowDictArray(true);
        })
        .catch((error) => {
            console.log(error);
        })
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

                <div ref={scrollRef} className="overflow-auto w-full flex justify-center">
                    <div ref={cardRef} className="w-full max-w-[700px] p-6 rounded-xl shadow-lg relative z-10" style={{ backgroundColor: '#FFFFFF', border: '2px solid var(--color-gradient-start)', fontFamily: 'var(--font-space)' }}>

                        <div
                            className={`
                            overflow-hidden transition-all duration-500 ease-out
                            ${showErrorMessage ? "max-h-40 mb-4" : "max-h-0 mb-0"}
                            `}
                        >
                            <div className="flex flex-row items-center justify-between w-full bg-red-50 border-2 border-red-300 rounded-2xl p-3 z-10">
                            <p className="font-space text-sm text-red-600 text-center">
                                {errorMessage}
                            </p>
                            <button
                                className="text-red-600" 
                                onClick={() => setShowErrorMessage(false)}
                            >
                                <CloseCircleOutlined className="cursor-pointer" />
                            </button>
                            </div>
                        </div>
                        
                        {showSuccessMessage && !showErrorMessage && (
                            <div 
                                className="mb-4 relative flex items-center justify-between w-full bg-green-50 border-2 border-green-300 rounded-2xl p-3 z-10 overflow-hidden"
                            >
                                <p className="font-space text-sm text-green-600 text-center">
                                    {successMessage}
                                </p>

                                <button
                                    onClick={() => setShowSuccessMessage(false)}
                                    className="text-green-600"
                                >
                                    <CloseCircleOutlined className="cursor-pointer" />
                                </button>

                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-200">
                                    <div className="h-full bg-green-500 animate-success-timer" />
                                </div>
                            </div>
                        )}

                        <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'var(--font-space)', color: 'var(--color-gradient-start)' }}>
                            Uredi riječ
                        </h2>

                        <div className="mb-4">
                            <p className="text-sm italic mb-2" style={{ fontFamily: 'var(--font-space)', color: 'var(--color-gradient-start)' }}>
                                *Napomena: mijenjanje riječi će ju promijeniti za svaki riječnik u kojem se koristi
                            </p>

                            <div className="flex items-center gap-2 mb-2">
                                <Button type="default" onClick={fetchDictionaryUsage} style={{ backgroundColor: 'var(--color-gradient-start)', color: 'var(--color-on-dark, #ffffff)', borderColor: 'transparent', fontFamily: 'var(--font-space)' }}>
                                    Provjeri korištenje
                                </Button>
                            </div>

                            {showDictArray && dictArray.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {dictArray.map(d => (
                                        <div key={d.dictionaryId} className="px-3 py-1 rounded-full text-sm" style={{ border: '1px solid var(--color-gradient-start)', color: 'var(--color-gradient-start)', fontFamily: 'var(--font-space)', backgroundColor: 'transparent' }}>
                                            {d.dictionaryName}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

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
                            <button type="button" onClick={resetSourcePhrases} className="cursor-pointer text-sm px-2 py-1 rounded hover:bg-[rgba(0,0,0,0.03)]" style={{ color: 'var(--color-gradient-start)', fontFamily: 'var(--font-space)', textDecoration: 'underline' }}>
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
                            <label className="text-sm mt-4" style={{ fontFamily: 'var(--font-space)', color: 'var(--color-gradient-start)' }}>Fraze na ciljnom jeziku</label>
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
                                                <Input placeholder="Fraza na ciljnom jeziku" className="w-full rounded-md" style={{ fontFamily: 'var(--font-space)', fontSize: 16, padding: '10px' }} />
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
                                                Dodaj frazu na ciljnom jeziku
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Form.List>

                        <div className="w-full flex justify-center mt-6">
                            {Loading ? (
                                <Mosaic
                                    color="var(--color-primary-dark)" 
                                    size="small" 
                                    text="" 
                                    textColor="" 
                                />
                            ) : (
                                <div className="w-full max-w-[420px] flex justify-center">
                                    <button
                                        type="submit"
                                        className="rounded-full bg-(--color-primary-dark) w-[320px] sm:w-[360px] h-[56px] transition-all hover:opacity-90 hover:shadow-xl text-on-dark shadow-lg font-space text-[18px] tracking-wide hover:cursor-pointer z-1"
                                    >
                                        Spremi
                                    </button>
                                </div>  
                            )}
                        </div>

                    </Form>

                </div>
                </div>
            </div>

        </PageTransition>   
    );

};

export default AdminEditWord;