import PageTransition from "../components/PageTransition"
import Header from "../components/Header"
import Particles from "../styles/Particles"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import axiosInstance from "../api/axiosInstance"
import { Table, Input, Typography, type TableProps } from "antd"
import { Mosaic } from "react-loading-indicators"
import debounce from "lodash/debounce";
import { useAdminContext } from "../context/AdminContext"
    
const AdminDictionary = () => {
    const navigate = useNavigate();

    const { setSelectedDictionary } = useAdminContext();

    const [Loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    type Dictionary = { id: number; name: string; language: string };
    const [dictArray, setDictArray] = useState<Dictionary[]>([]);
    const columns: TableProps<Dictionary>['columns'] = [
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Language',
            dataIndex: 'language',
            key: 'language'
        },
        {
            title: "Words",
            key: "words",
            render: (_, record) => (
            <Typography.Link style={{color:'blue'}} onClick={() => { 
                    setSelectedDictionary(record);
                    navigate("/admin/dictionary/words");
                }}
            >
                View Words</Typography.Link>
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

    useEffect(() => {
        axiosInstance.get('/api/v1/Dictionary')
        .then((response) => {
            setDictArray(response.data.dictionaries);
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
                    <div className="w-[70%]">
                        <Input
                            placeholder="Pretraži..."
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
                    </div>
                )}

            </div>

        </PageTransition>
    )
};


export default AdminDictionary;