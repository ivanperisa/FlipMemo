import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axiosInstance from "../api/axiosInstance";
import { Input, Space, Table, Typography, type TableProps } from "antd";
import { CloseCircleOutlined } from '@ant-design/icons'
import debounce from "lodash/debounce";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import Header from "../components/Header";
import { Mosaic } from "react-loading-indicators";
import { tr } from "framer-motion/client";
import { useAdminContext } from "../context/AdminContext";
import { replace } from "lodash";

interface Word {
    id: number; 
    sourceWord: string; 
    sourcePhrases: string[]; 
    targetWord: string; 
    targetPhrases: string[];
}

interface ServerResponse {
    words: Word[]
}


const AdminDictionaryWords = () => {
    const navigate = useNavigate();

    const { selectedDictionary, setSelectedWord } = useAdminContext();

    const [errorMessage, setErrorMessage] = useState("");
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [Loading, setLoading] = useState(false);
    const [wordArray, setWordArray] = useState<Word[]>([]);

    const [selectedRemoveWord, setSelectedRemoveWord] = useState<Word | null>(null);
    const [showDeleteModule, setShowDeleteModule] = useState(false);

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
                        Remove
                    </Typography.Link>
                </Space>
            ),
        }
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
        if (selectedDictionary === null) {
            navigate("/admin/dictionary", {replace: true});
        }
        else {
            setLoading(true);
            axiosInstance.get<ServerResponse>(`/api/v1/Dictionary/${selectedDictionary.id}/words`)
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
        }
    }, [selectedDictionary, navigate]);

    const handleDeleteWordClick = (word: Word) => {
        setSelectedRemoveWord(word);
        setShowDeleteModule(true);
    }

    const handleRemoveWord = async (wordId: number, dictionaryId: number | undefined) => {
        if (dictionaryId !== null) {
            setLoading(true);
            setShowDeleteModule(false);
            setSelectedRemoveWord(null);
            axiosInstance.delete(`/api/v1/dictionary/${dictionaryId}/${wordId}`)
            .then(() => {
                setWordArray(prev => prev.filter(w => w.id !== wordId));
                setSuccessMessage("Riječ uspješno izbrisana iz rječnika");
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
    }

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

                {Loading || selectedDictionary?.id === null ? (
                    <div className="flex flex-col items-center justify-center flex-1 w-full mb-20">
                        <Mosaic color="var(--color-primary-dark)" size="medium" text="" textColor="" />
                    </div>
                ) : (
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

                        {selectedDictionary && (
                            <div className="w-[70%] mb-3">
                                <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-space)', color: 'var(--color-primary-extra-dark)' }}>
                                    {selectedDictionary.name} ({selectedDictionary.language})
                                </h2>
                            </div>
                        )}
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
                                pagination={ { pageSize: 6} } 
                                rowKey="id"
                            />
                            {showDeleteModule && selectedRemoveWord && (
                                <div
                                    className="fixed inset-0 z-50 flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
                                    onClick={() => setShowDeleteModule(false)}
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
                                            Potvrdite brisanje
                                        </h3>
                                        <p className="text-center mb-6" style={{ color: 'var(--color-gradient-start)' }}>
                                            Jeste li sigurni da želite maknuti riječ <strong>{selectedRemoveWord.sourceWord}</strong> iz rječnika <strong>{selectedDictionary?.name}</strong>?
                                        </p>
                                        <div className="flex items-center justify-center space-x-4">
                                            <button
                                                onClick={() => handleRemoveWord(selectedRemoveWord.id, selectedDictionary?.id)}
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
                                                onClick={() => setShowDeleteModule(false)}
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

export default AdminDictionaryWords;