import PageTransition from "../components/PageTransition"
import Header from "../components/Header"
import Particles from "../styles/Particles"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import axiosInstance from "../api/axiosInstance"
import { Table, Input, type TableProps, Modal, Button, message, Tag, Space, Empty } from "antd"
import useResponsiveTableHeight from "../utils/useResponsiveTableHeight"
import { Mosaic } from "react-loading-indicators"
import debounce from "lodash/debounce";
import { useAdminContext } from "../context/AdminContext"
import { ArrowLeftOutlined, ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons"
    
const AdminDictionary = () => {
    const navigate = useNavigate();

    const { setSelectedDictionary } = useAdminContext();

    const [Loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    type Dictionary = { id: number; name: string; language: string };
    const [dictArray, setDictArray] = useState<Dictionary[]>([]);
    
    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [dictionaryToDelete, setDictionaryToDelete] = useState<Dictionary | null>(null);

    const handleDeleteClick = (dictionary: Dictionary) => {
        setDictionaryToDelete(dictionary);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!dictionaryToDelete) return;
        
        setDeleteLoading(true);
        try {
            await axiosInstance.delete(`/api/v1/Dictionary/${dictionaryToDelete.id}`);
            message.success(`Rječnik "${dictionaryToDelete.name}" je uspješno obrisan.`);
            setDictArray(prev => prev.filter(d => d.id !== dictionaryToDelete.id));
            setDeleteModalOpen(false);
            setDictionaryToDelete(null);
        } catch (error) {
            console.error('Greška pri brisanju rječnika:', error);
            message.error('Došlo je do greške pri brisanju rječnika.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const columns: TableProps<Dictionary>['columns'] = [
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id,
            sortDirections: ['descend', null],
        },
        {
            title: 'Naziv',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Jezik',
            dataIndex: 'language',
            key: 'language',
            sorter: (a, b) => a.language.localeCompare(b.language),
        },
        {
            title: "Akcije",
            key: "actions",
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link"
                        onClick={() => {
                            setSelectedDictionary(record);
                            navigate("/admin/dictionary/words");
                        }}
                        style={{ color: 'var(--color-primary-dark)', padding: 0 }}
                    >
                        Pregled riječi
                    </Button>
                    <Button type="link" danger
                        onClick={() => handleDeleteClick(record)}
                        style={{ padding: 0 }}
                    >
                        Izbriši
                    </Button>
                </Space>
            ),
        },
    ];

    const handleSearch = debounce((value) => {
        setSearchText(value);
    }, 200);

    const filteredData = dictArray.filter((item) =>
        [item.id, item.name, item.language]
            .some(field => String(field).toLowerCase().includes(searchText.toLowerCase()))
    );

        const tableHeight = useResponsiveTableHeight(380, 260, '#app-header');
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const rowClassName = (_record: Dictionary, index: number) => (index % 2 === 0 ? 'table-row-even' : 'table-row-odd');

    useEffect(() => {
        axiosInstance.get('/api/v1/Dictionary')
        .then((response) => {
            setDictArray(response.data.dictionaries.sort((d1: Dictionary, d2: Dictionary) => d1.id - d2.id));
            setLoading(false);
        })
        .catch((error) => {
            console.log(error);
        });
    }, [])

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

                {Loading ? (
                    <div className="flex flex-col items-center justify-center flex-1 w-full mb-20">
                        <Mosaic color="var(--color-primary-dark)" size="medium" text="" textColor="" />
                    </div>
                ) : (
                    <>
                        <div className="w-[70%] mb-3">
                            <div className="flex items-center gap-4">
                                <Button type="default" icon={<ArrowLeftOutlined />} className="back-button"
                                    onClick={() => navigate("/admin")}
                                />
                                <h2 className="text-2xl font-semibold m-0" style={{ fontFamily: 'var(--font-space)', color: 'var(--color-text-on-primary)' }}>
                                    Spremljeni rječnici
                                </h2>
                            </div>
                        </div>

                        <div className="w-[70%]">
                            <div className="flex items-center gap-4 mb-3">
                                <Input
                                    defaultValue={searchText}
                                    placeholder="Pretraži..."
                                    onChange={(e) => handleSearch(e.target.value)}
                                    style={{ width: "320px" }}
                                    prefix={<SearchOutlined style={{ color: 'var(--color-primary-dark)' }} />}
                                    className="custom-search-input"
                                />
                                <Tag color="var(--color-primary-light)" style={{ color: 'var(--color-primary-extra-dark)', fontFamily: 'var(--font-space)' }}>
                                    {`${filteredData.length} ${filteredData.length % 10 === 1 ? 'rječnik' : 'rječnika'}`}
                                </Tag>
                            </div>
                            <div className="admin-table-container">
                                <Table
                                    // title={() => <h2 className="text-lg font-semibold">Riječnici</h2>}
                                        virtual={!isMobile}
                                    dataSource={filteredData}
                                    columns={columns}
                                    bordered={false}
                                    className="w-full mt-6 mb-3 custom-admin-table"
                                    pagination={false}
                                    scroll={{ y: tableHeight, x: 800 }}
                                    rowKey="id"
                                    showSorterTooltip={false}
                                    rowClassName={rowClassName}
                                    locale={{
                                        emptyText: <Empty description="Nema podataka" />,
                                    }}
                                />
                            </div>
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
                        </div>
                    </>
                )}

                {/* Delete Dictionary Modal */}
                <Modal
                    title={
                        <div className="flex items-center gap-2 text-red-500">
                            <ExclamationCircleOutlined />
                            <span>Brisanje rječnika</span>
                        </div>
                    }
                    open={deleteModalOpen}
                    onCancel={() => {
                        setDeleteModalOpen(false);
                        setDictionaryToDelete(null);
                    }}
                    centered
                    footer={[
                        <Button key="cancel" onClick={() => {
                            setDeleteModalOpen(false);
                            setDictionaryToDelete(null);
                        }}>
                            Odustani
                        </Button>,
                        <Button 
                            key="delete" 
                            danger 
                            type="primary" 
                            loading={deleteLoading}
                            onClick={confirmDelete}
                        >
                            Da, obriši
                        </Button>,
                    ]}
                >
                    <p className="text-gray-600 py-4">
                        Jeste li sigurni da želite obrisati rječnik <strong>"{dictionaryToDelete?.name}"</strong>?
                        <br /><br />
                        <strong className="text-red-500">Ova radnja je nepovratna</strong> i sve riječi u ovom rječniku će biti trajno izbrisane.
                    </p>
                </Modal>

            </div>

        </PageTransition>
    )
};


export default AdminDictionary;