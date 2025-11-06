import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import { BookOutlined, UserOutlined, LogoutOutlined, CheckCircleOutlined, LockOutlined, DownOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { useState } from "react";
import { useLearning } from "../context/LearningContext";

const Home = () => {

    //VARIJABLE
    const [currentWordSet, setCurrentWordSet] = useState<string | null>(null);


    //KONTEKSTI
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { setSelectedWordSet } = useLearning();

    //FUNKCIJE
    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleChangePassword = () => {
        navigate("/changePassword");
    };


    //MODELI
    const menuItems: MenuProps['items'] = [
        {
            key: 'changePassword',
            label: 'Promijeni lozinku',
            icon: <LockOutlined />,
            onClick: handleChangePassword,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: 'Odjava',
            icon: <LogoutOutlined />,
            onClick: handleLogout,
            danger: true,
        },
    ];

    const WordSets = [
    { id: 'set1', name: 'Osnovni riječi', words: ['riječ1', 'riječ2', 'riječ3'] },
    { id: 'set2', name: 'Napredni riječi', words: ['riječ4', 'riječ5', 'riječ6'] },
    { id: 'set3', name: 'Stručni riječi', words: ['riječ7', 'riječ8', 'riječ9'] },
];

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col items-center justify-start w-screen">
                <div className={"absolute z-0 w-screen h-screen "}>
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
                <div className="w-full max-w-[1200px] flex justify-between items-center mt-8 mb-12 z-10 px-5">
                    <h1 className="font-space text-4xl font-bold text-[#8B6B7A]">
                        FlipMemo
                    </h1>
                    <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                        <button className="flex items-center gap-2 px-6 py-3 bg-white/90 rounded-full shadow-lg hover:shadow-xl transition-all hover:opacity-80 font-space text-[#8B6B7A] cursor-pointer">
                            <UserOutlined />
                            Profil
                            <DownOutlined style={{ fontSize: '12px' }} />
                        </button>
                    </Dropdown>
                </div>

                {/* Main Content */}
                {/* PITANJE */}
                <div className="flex w-full items-start justify-start mb-8">
                <div className="bg-(--color-primary) z-10 rounded-r-full py-6 px-16 text-white font-space text-2xl font-semibold">Odaberite rječnik:</div>
              </div>

    {/* OPCIJE I GUMB */}
    <div className="w-full max-w-[600px] rounded-3xl  p-8 z-10 mx-5">
                        <div className="space-y-4">
                {WordSets.map(set => (
                    <button
                    key={set.id}
                    onClick={() => setCurrentWordSet(set.id)}
                    type="button"
        className={`
            w-full flex items-center gap-4 px-6 py-4 
            bg-white rounded-full shadow-md
            transition-all cursor-pointer
            ${currentWordSet === set.id 
                ? 'ring-4 ring-pink-300 bg-pink-50' 
                : 'hover:shadow-lg hover:scale-105'
            }
        `}
    >
        {/* Pink circle indicator */}
        <div className={`
            w-6 h-6 rounded-full border-2 
            ${currentWordSet === set.id 
                ? 'bg-pink-400 border-pink-400' 
                : 'bg-white border-gray-300'
            }
        `} />
        
        {/* Label */}
        <span className="font-space text-[#8B6B7A]">
            {set.name}
        </span>
    </button>
                ))}
            </div>
            
            {/* Gumb za nastavak */}
            <button 
                disabled={!currentWordSet}
                onClick={() => {
                    if (!currentWordSet) return;
                    
                    const selected = WordSets.find(s => s.id === currentWordSet);
                    if (selected) {
                        setSelectedWordSet({
                            id: selected.id,
                            name: selected.name,
                            words: [] // TODO: dodati prave Word objekte
                        });
                    }
                    
                    navigate('/learningSession');
                }}
                className="mt-8 w-full py-4 bg-(--color-primary) text-white font-space rounded-full disabled:opacity-30"
            >
                Dalje
            </button>
        </div>
        
            </div>   
           
        </PageTransition>

        
    );
};


export default Home;