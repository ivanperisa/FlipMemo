import PageTransition from "../components/PageTransition"
import Header from "../components/Header"
import Particles from "../styles/Particles"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import axiosInstance from "../api/axiosInstance"
import { Table } from "antd"
import { Mosaic } from "react-loading-indicators"


const AdminDictionary = () => {
    const navigate = useNavigate();

    const [Loading, setLoading] = useState(true);
    type Dictionary = { id: number; name: string; language: string };
    const [dictArray, setDictArray] = useState<Dictionary[]>([]);
    const columns = [
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
        }
    ]

    useEffect(() => {
        axiosInstance.get('/api/v1/Dictionary')
        .then((response) => {
            setDictArray(response.data.dictionaries);
            setLoading(false);
        })
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
                    <Mosaic color="var(--color-primary-dark)" size="medium" text="" textColor="" />
                ) : (
                    <>
                        <Table dataSource={dictArray} columns={columns} bordered={true} className="w-[70%] mt-6" pagination={ { pageSize: 5} } />
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
                    </>
                )}

            </div>

        </PageTransition>
    )
};


export default AdminDictionary;