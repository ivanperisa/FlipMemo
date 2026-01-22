
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import Header from "../components/Header";
import { Button, Empty, Input, Space, Table, type TableProps,Tag, Typography } from "antd";
import axiosInstance from "../api/axiosInstance";
import { ArrowLeftOutlined, CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import { Mosaic } from "react-loading-indicators";
import { useAuth } from "../context/AuthProvider";
import debounce from "lodash/debounce";
import { useNavigate } from "react-router";

const UserControl = () => {

    const navigate = useNavigate();
    const {logout} =useAuth();

    const [searchText, setSearchText] = useState("");
    const [Loading,setLoading]=useState(true);
    const [users,setUsers]=useState<User[]>([]);
    const [errorMessage, setErrorMessage] = useState<"">("");
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    //MODELI

    interface User{
        id:number,
        email:string,
        role:string
    }

    const columns:TableProps<User>['columns']=[
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Uloga',
            key: 'role',
            dataIndex: 'role',
            render: (_, { role }) => {
            const color = role === 'Admin' ? 'green' : 'geekblue';
            return <Tag color={color}>{role}</Tag>;
            },
        },
        {
            title: 'Akcije',
            key: 'action',
            render: (_, record) => (
            <Space size="middle">
                {record.role!='Admin' ? 
                <Typography.Link  style={{color:'green'}} onClick={()=>{promoteUser(record)}}>Promoviraj</Typography.Link>
                :
                <Typography.Link style={{color:'orange'}} onClick={()=>{demoteUser(record)}}>Demotiraj</Typography.Link>
                }
                <Typography.Link style={{color:'red'}} onClick={()=>{deleteUser(record)}}>Izbriši</Typography.Link>
            </Space>
            ),
        },

    ];

    const tableColumns = columns.map((item) => ({ ...item, ellipsis: {showTitle: false} }));

    //FUNKCIJE

    async function fetchUsers(){
        setShowErrorMessage(false);
        await axiosInstance.get('/api/v1/User')
        .then((response)=>{
            setLoading(false);
            console.log(response.data);
            setUsers(response.data);
        }).catch((error)=>{
            setLoading(false);
            if(error.response.status=='401'){ logout()}
            const errorMsg = error.response?.data?.message
                || (typeof error.response?.data === 'string' ? error.response.data : JSON.stringify(error.response?.data))
                || "Greška pri dohvaćanju riječi!";
            setErrorMessage(errorMsg);
            setShowErrorMessage(true);

            console.log(error);
        })

    }

    useEffect(()=>{
        fetchUsers()
    },[]);

    async function deleteUser(user:User){
        setShowErrorMessage(false);
        await axiosInstance.delete('/api/v1/User/'+user.id)
        .then((response)=>{
            fetchUsers();
            console.log(response);
        })
        .catch((error)=>{
            const errorMsg = error.response?.data?.message
                || (typeof error.response?.data === 'string' ? error.response.data : JSON.stringify(error.response?.data))
                || "Greška pri dohvaćanju riječi!";
            setErrorMessage(errorMsg);
            setShowErrorMessage(true);
        });

    }

    async function promoteUser(user:User){
        setShowErrorMessage(false);
        await axiosInstance.put('/api/v1/User/'+user.id+'/promote')
        .then(()=>{
            fetchUsers();
        })
        .catch((error)=>{
            const errorMsg = error.response?.data?.message
                || (typeof error.response?.data === 'string' ? error.response.data : JSON.stringify(error.response?.data))
                || "Greška pri dohvaćanju riječi!";
            setErrorMessage(errorMsg);
            setShowErrorMessage(true);
        });


    }

    async function demoteUser(user:User){
        setShowErrorMessage(false);
        await axiosInstance.put('/api/v1/User/'+user.id+'/demote')
        .then(()=>{
            fetchUsers();
        })
        .catch((error)=>{
            const errorMsg = error.response?.data?.message
                || (typeof error.response?.data === 'string' ? error.response.data : JSON.stringify(error.response?.data))
                || "Greška pri dohvaćanju riječi!";
            setErrorMessage(errorMsg);
            setShowErrorMessage(true);
        });
    }

    const handleSearch = debounce((value) => {
        setSearchText(value);
    }, 200);

    const filteredData = users.filter((item) => 
        [item.email]
            .some(field => String(field).toLowerCase().includes(searchText.toLowerCase()))
    );

    const rowClassName = (_record: User, index: number) => (index % 2 === 0 ? 'table-row-even' : 'table-row-odd');
    
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

                {/* Header */}
                <Header />

                {Loading ? 
                (
                    <div className="flex flex-col items-center justify-center flex-1 w-full mb-20">
                        <Mosaic color="var(--color-primary-dark)" size="medium" text="" textColor="" />
                    </div>
                ):(
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

                        <div className="w-[70%] mb-3">
                            <div className="flex items-center gap-4">
                                <Button type="default" icon={<ArrowLeftOutlined />} className="back-button" 
                                    onClick={() => navigate("/admin")}
                                />
                                <h2 className="text-2xl font-semibold m-0" style={{ fontFamily: 'var(--font-space)', color: 'var(--color-text-on-primary)' }}>
                                    Spremljene riječi
                                </h2>
                            </div>
                        </div>

                        <div className="w-[70%]">
                            <div className="flex items-center gap-4 mb-3">
                                <Input
                                    defaultValue={searchText}
                                    placeholder="Pretraži..."
                                    onChange={(e) => handleSearch(e.target.value)}
                                    prefix={<SearchOutlined style={{ color: 'var(--color-primary-dark)' }} />}
                                    className="custom-search-input"
                                    style={{ width: '320px' }}
                                />
                                <Tag color="var(--color-primary-light)" style={{ color: 'var(--color-primary-extra-dark)', fontFamily: 'var(--font-space)' }}>{filteredData.length} riječi</Tag>
                            </div>
                            <div className="admin-table-container">
                                <Table
                                    virtual
                                    dataSource={filteredData} 
                                    columns={tableColumns} 
                                    bordered={false}
                                    className="w-full mt-6 mb-3 custom-admin-table" 
                                    pagination={ false } 
                                    scroll={{ y: 260, x: 800 }}
                                    rowKey="id"
                                    rowClassName={rowClassName}
                                    locale={{
                                        emptyText: <Empty description="Nema podataka" />,
                                    }}
                                />
                            </div>
                        </div>
                    </>
                )}

                
            </div>
        </PageTransition>
    );
};

export default UserControl;
