import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axiosInstance from "../api/axiosInstance";
import { Input, Space, Table, Tag, Typography, Modal, Button, type TableProps } from "antd";
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
        if (selectedDictionary === null) {
            navigate("/missing", {replace: true});
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

    const handleRemoveWord = async (wordId: number) => {
        // Placeholder implementation — replace with your real remove logic.
        console.warn("handleRemoveWord not implemented", wordId);
        setShowDeleteModule(false);
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
                    <Mosaic color="var(--color-primary-dark)" size="medium" text="" textColor="" />
                ) : (
                    <div className="w-[70%]">
                        <Input
                            placeholder="Search..."
                            onChange={(e) => handleSearch(e.target.value)}
                            style={{ width: "30%" }}
                        />
                        <Table
                            // title={() => <h2 className="text-lg font-semibold">Riječnici</h2>}
                            dataSource={filteredData} 
                            columns={columns} 
                            bordered={true} 
                            className="w-full mt-6" 
                            pagination={ { pageSize: 5} } 
                            rowKey="id"
                        />
                        <div className="flex flex-col items-center g-4 mt-6">
                            <button
                                onClick={() => navigate("/admin/dictionary/add")}
                                type="submit"
                                className="rounded-full bg-(--color-primary-dark) w-[320px] sm:w-[360px] h-[56px] transition-all hover:opacity-90 hover:shadow-xl text-on-dark shadow-lg
                                font-space text-[18px] tracking-wide hover:cursor-pointer z-1"
                            >
                                Dodaj novi rječnik
                            </button>
                        </div>
                        {showDeleteModule && selectedRemoveWord && (
                            <Modal
                                open={showDeleteModule}
                                centered
                                className="confirm-modal"
                                title="Confirm removal"
                                onOk={() => {
                                    handleRemoveWord(selectedRemoveWord.id);
                                }}
                                onCancel={() => setShowDeleteModule(false)}
                                okText="Remove"
                                cancelText="Cancel"
                                okButtonProps={{ style: { background: 'var(--color-primary-dark)', border: 'none', color: 'var(--color-text-on-dark)', fontFamily: 'var(--font-space)' } }}
                                cancelButtonProps={{ style: { background: 'transparent', border: '1px solid rgba(0,0,0,0.08)', color: 'var(--color-primary-extra-dark)', fontFamily: 'var(--font-space)' } }}
                            >
                                <p style={{ margin: 0, textAlign: 'center' }}>
                                    Are you sure you want to remove the word <strong>{selectedRemoveWord.sourceWord}</strong> from the dictionary <strong>{selectedDictionary?.name}</strong>?
                                </p>
                            </Modal>
                        )}

                    </div>
                )}

            </div>

        </PageTransition>
    )    
};

export default AdminDictionaryWords;