import PageTransition from "../components/PageTransition"
import Header from "../components/Header"
import Particles from "../styles/Particles"
import { BookOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import axiosInstance from "../api/axiosInstance"
import { Table, Input, Typography, type TableProps, Space } from "antd"
import { Mosaic } from "react-loading-indicators"
import debounce from "lodash/debounce";
import { useAdminContext } from "../context/AdminContext"

interface ServerResponse {
    words: Word[];
}

interface Word {
    id: number;
    sourceWord: string;
    sourcePhrases: string[];
    targetWord: string;
    targetPhrases: string[];
}

interface Dictionary {
    id: number; 
    name: string; 
    language: string;
}


const AdminWord = () => {
    const navigate = useNavigate();

    const { setSelectedWord } = useAdminContext();
    const [errorMessage, setErrorMessage] = useState("");
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [Loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [wordArray, setWordArray] = useState<Word[]>([]);

    const [selectedAddWord, setSelectedAddWord] = useState<Word | null>(null);
    const [showAddToDictionaryModal, setShowAddToDictionaryModal] = useState(false);
    const [dictArray, setDictArray] = useState<Dictionary[]>([]);
    const [selectedDihs, setSelectedDihs] = useState<number[]>([]);

    const [selectedDeleteWord, setSelectedDeleteWord] = useState<Word | null>(null);
    const [showDeleteWordModal, setShowDeleteWordModal] = useState(false);

        const columns: TableProps<Word>['columns'] = [
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Source Word',
            dataIndex: 'sourceWord',
            key: 'sourceWord',
        },
        {
            title: 'Target Word',
            dataIndex: 'targetWord',
            key: 'targetWord',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">  
                    <Typography.Link 
                        style={{color: "blue"}} 
                        onClick={() => {
                            setSelectedWord(record);
                            navigate("/admin/word/edit");
                        }}
                    >
                        Edit
                    </Typography.Link>
                    <Typography.Link 
                        style={{color: "red"}} 
                        onClick={() => handleDeleteWordClick(record)}
                    >
                        Delete
                    </Typography.Link>
                    <Typography.Link
                        style={{color: "green"}}
                        onClick={() => {
                            setSelectedAddWord(record);
                            handleAddWordToDihs();
                        }}
                    >
                        Dodaj u rječnike
                    </Typography.Link>
                </Space>
            ),
        },
    ];

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

    useEffect(() => {
        setLoading(true);
        axiosInstance.get<ServerResponse>(`/api/v1/word/allWords`)
        .then((response) => {
            if (response.data.words) {
                console.log(response.data.words);
                setWordArray(response.data.words);
            }
        })
        .catch((error) => {
            const errorMsg = error.response?.data?.message
                || (typeof error.response?.data === 'string' ? error.response.data : JSON.stringify(error.response?.data))
                || "Greška pri dohvaćanju riječi!";
            setErrorMessage(errorMsg);
            setShowErrorMessage(true);
        })
        .finally(() => {
            setLoading(false);
        })
    }, []);

    const handleAddWordToDihs = () => {
        setLoading(true);
        axiosInstance.get("api/v1/Dictionary")
        .then((response) => {
            setDictArray(response.data.dictionaries);
            setShowAddToDictionaryModal(true);
        })
        .catch(() => {
            setErrorMessage("Greška prilikom dohvaćanja rječnika.");
            setShowErrorMessage(true);
        })
        .finally(() => setLoading(false));
    }

    const handleDeleteWord = async (wordId: number) => {
        setLoading(true);
        setShowDeleteWordModal(false);
        setSelectedDeleteWord(null);
        axiosInstance.delete(`/api/v1/word/${wordId}`)
        .then(() => {
            setWordArray(prev => prev.filter(w => w.id !== wordId));
            setSuccessMessage("Riječ uspješno izbrisana");
            setShowSuccessMessage(true);
        })
        .catch((error) => {
            const errorMsg = error.response?.data?.message
                || (typeof error.response?.data === 'string' ? error.response.data : JSON.stringify(error.response?.data))
                || "Greška pri dohvaćanju riječi!";
            setErrorMessage(errorMsg);
            setShowErrorMessage(true);
        })
        .finally(() => {
            setLoading(false);
        })
    }

    const handleDeleteWordClick = (word: Word) => {
        setSelectedDeleteWord(word);
        setShowDeleteWordModal(true);
    }

    const toggleSelectDict = (id: number) => {
        setSelectedDihs((prev) =>
        prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
        );
    };

    const handleAddWord = () => {
        setShowErrorMessage(false);
        setLoading(true);

        if (selectedDihs.length === 0) {  
            console.log(selectedDihs.length);  
            setErrorMessage("Molimo odaberite barem jedan rječnik.");
            setShowErrorMessage(true);
            return;
        }
        
        setShowAddToDictionaryModal(false);
        

        const body = {
            DictionaryIds: selectedDihs,
        };

        axiosInstance.post(`/api/v1/dictionary/${selectedAddWord?.id}`, body)
        .then((response) => {
            setSelectedDihs([]);
            setSelectedWord(null);
            setSuccessMessage("Riječ uspješno dodana u rječnike!");
            setShowSuccessMessage(true);
            console.log(response);
        })
        .catch((error) => {
            setShowAddToDictionaryModal(true);
            const errorMsg = error.response?.data?.message
                    || (typeof error.response?.data === 'string' ? error.response.data : JSON.stringify(error.response?.data))
                    || "Greška pri dodavanju riječi u rječnik!";
            setErrorMessage(errorMsg);
            setShowErrorMessage(true);
        })
        .finally(() => {
            setLoading(false);
        })
    };

    const handleSearch = debounce((value) => {
        setSearchText(value);
    }, 200);

    const filteredData = wordArray.filter((item) => 
        [item.id, item.sourceWord, item.targetWord]
            .some(field => String(field).toLowerCase().includes(searchText.toLowerCase()))
    );

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

                {Loading && (
                    <div className="flex flex-col items-center justify-center flex-1 w-full mb-20">
                        <Mosaic color="var(--color-primary-dark)" size="medium" text="" textColor="" />
                    </div>
                )}

                {(!Loading && showAddToDictionaryModal) && (
                    <>
                        <div className="w-full max-w-[600px] flex flex-col gap-4 relative overflow-hidden transition-all duration-500 ease-out">
                            <h2
                            className="font-bold text-[var(--color-text-on-primary)] font-space text-2xl text-center"
                            >{`Dodajte riječ "${selectedAddWord?.sourceWord}" u jedan ili više rječnika`}</h2>

                            <div className="w-full bg-white/80 rounded-2xl shadow-md p-3 mt-2">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-space text-sm text-[var(--color-primary-dark)]">Rječnici</span>
                                <span className="font-space text-xs text-gray-500">Kliknite za odabir</span>
                            </div>

                            <div className="max-h-[320px] overflow-y-auto flex flex-col gap-2 pr-2">
                                {dictArray.length === 0 && (
                                <div className="text-sm text-gray-500">Nema dostupnih rječnika</div>
                                )}

                                {dictArray.map((d) => {
                                const isSelected = selectedDihs.includes(d.id);
                                return (
                                    <button
                                    key={d.id}
                                    onClick={() => toggleSelectDict(d.id)}
                                    className={`cursor-pointer w-full text-left flex items-center justify-between p-3 rounded-xl shadow-sm transition-all duration-200 transform hover:scale-[1.01] ${isSelected ? 'bg-[var(--color-primary-dark)] text-[var(--color-text-on-dark)]' : 'bg-[var(--color-primary-light)] text-[var(--color-text-on-primary)]'}`}
                                    >
                                    <div className="flex items-center gap-3">
                                        <BookOutlined style={{ color: 'var(--color-primary)', fontSize: 18 }} />
                                        <span className="font-space font-medium">{d.name}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="border-2 rounded px-1 py-0.5 min-w-[32px] text-center">
                                        <span className="font-inter italic not-italic md:italic text-sm tracking-wide">{d.language.toUpperCase()}</span>
                                        </div>
                                        {/* {isSelected && <CheckOutlined style={{ color: 'white' }} />} */}
                                    </div>
                                    </button>
                                );
                                })}
                            </div>
                            </div>

                            <div
                                className={`
                                overflow-hidden transition-all duration-500 ease-out
                                ${(showErrorMessage && showAddToDictionaryModal) ? "max-h-40" : "max-h-0"}
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
                            
                            {/* Bottom button - now normal flow, not fixed */}
                            <div className="w-full flex justify-center items-center">
                                <button
                                    onClick={handleAddWord}
                                    className="cursor-pointer rounded-full px-8 py-3 bg-[var(--color-primary-dark)] text-[var(--color-text-on-dark)] shadow-xl font-space text-lg hover:opacity-95 transition-colors"
                                >
                                    Dodaj riječ
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {(!Loading && !showAddToDictionaryModal) && (
                    <>
                        <div
                            className={`relative overflow-hidden transition-all duration-500 ease-out ${showErrorMessage ? "max-h-40" : "max-h-0"}`}
                        >
                            <div className="flex flex-row items-center justify-between w-full bg-red-50 border-2 border-red-300 rounded-2xl p-3 z-10">
                                <p>{errorMessage}</p>
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
                            className="max-w-[400px] relative flex items-center justify-between w-full bg-green-50 border-2 border-green-300 rounded-2xl p-3 z-10 overflow-hidden"
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

                        <div className="w-[70%] mb-3">
                            <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-space)', color: 'var(--color-primary-extra-dark)' }}>
                                Spremljene riječi
                            </h2>
                        </div>
                    
                        <div className="w-[70%]">
                            <Input
                                defaultValue={searchText}
                                placeholder="Pretraži..."
                                onChange={(e) => handleSearch(e.target.value)}
                                style={{ width: "30%" }}
                            />
                            <Table
                                dataSource={filteredData} 
                                columns={columns} 
                                bordered={true} 
                                className="w-full mt-6" 
                                pagination={ { pageSize: 5} } 
                                rowKey="id"
                            />
                            <div className="flex flex-col items-center g-4 mt-4">
                                <button
                                    onClick={() => navigate("/admin/dictionary/add")}
                                    type="submit"
                                    className="rounded-full bg-(--color-primary-dark) w-[320px] sm:w-[360px] h-[56px] transition-all hover:opacity-90 hover:shadow-xl text-on-dark shadow-lg
                                    font-space text-[18px] tracking-wide hover:cursor-pointer z-1"
                                >
                                    Dodaj novi rječnik
                                </button>
                            </div>
                            {showDeleteWordModal && selectedDeleteWord && (
                                <div
                                    className="fixed inset-0 z-50 flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
                                    onClick={() => setShowDeleteWordModal(false)}
                                >
                                        <div
                                            className="w-[90%] max-w-md rounded-lg p-6 shadow-2xl"
                                            style={{
                                                backgroundColor: '#FFFFFF',
                                                border: '2px solid var(--color-gradient-start)',
                                                color: 'var(--color-gradient-start)',
                                                fontFamily: 'var(--font-space)'
                                            }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <h3 className="text-lg font-semibold mb-3 text-center">
                                            Potvrdite brisanje riječi
                                        </h3>
                                        <p className="text-center mb-6" style={{ color: 'var(--color-gradient-start)' }}>
                                            Jeste li sigurni da <strong>potpuno</strong> izbrisati riječ <strong>{selectedDeleteWord.sourceWord}</strong>?
                                        </p>
                                        <div className="flex items-center justify-center space-x-4">
                                            <button
                                                onClick={() => handleDeleteWord(selectedDeleteWord.id)}
                                                className="px-6 py-2 rounded-full text-[16px] font-medium shadow cursor-pointer"
                                                style={{
                                                    backgroundColor: 'var(--color-gradient-start)',
                                                    color: '#FFFFFF',
                                                    fontFamily: 'var(--font-space)'
                                                }}
                                            >
                                                Obriši
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteWordModal(false)}
                                                className="px-6 py-2 rounded-full text-[16px] font-medium cursor-pointer"
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    border: '2px solid var(--color-gradient-start)',
                                                    color: 'var(--color-gradient-start)',
                                                    fontFamily: 'var(--font-space)'
                                                }}
                                            >
                                                Odustani
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </>
                )}
                

            </div>

        </PageTransition>
    )  
    
};

export default AdminWord;