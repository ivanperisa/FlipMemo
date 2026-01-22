
import { useNavigate } from "react-router";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { Mosaic } from "react-loading-indicators";
import { 
    SwapOutlined, 
    SoundOutlined, 
    AudioOutlined, 
    CheckCircleOutlined, 
    SyncOutlined,
    BookOutlined
} from "@ant-design/icons";

// Statistika po modu
interface ModeStats {
    mode: number;
    total: number;
    firstBox: number;
    secondBox: number;
    thirdBox: number;
    fourthBox: number;
    learned: number;
    readyForReview: number;
    remaining: number;
}

interface UserStatsResponse {
    userStats: ModeStats[];
}

// Konfiguracija za svaki mod
const modeConfig = [
    { 
        mode: 1, 
        name: "Prevedi (Izvor → Cilj)", 
        icon: <SwapOutlined className="text-xl" />,
    },
    { 
        mode: 2, 
        name: "Prevedi (Cilj → Izvor)", 
        icon: <SwapOutlined className="text-xl rotate-180" />,
    },
    { 
        mode: 3, 
        name: "Slušanje", 
        icon: <SoundOutlined className="text-xl" />,
    },
    { 
        mode: 4, 
        name: "Govor", 
        icon: <AudioOutlined className="text-xl" />,
    },
];

const Home = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<ModeStats[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const response = await axiosInstance.put<UserStatsResponse>('/api/v1/User/stats');
            setStats(response.data.userStats || []);
        } catch (error) {
            console.error('Greška pri dohvaćanju statistike:', error);
            setStats([]);
        } finally {
            setLoadingStats(false);
        }
    };

    // Komponenta za prikaz statistike jednog moda
    const ModeStatsCard = ({ modeStats, config }: { modeStats: ModeStats | undefined, config: typeof modeConfig[0] }) => {
        const hasData = modeStats && modeStats.total > 0;
        
        return (
            <div className="bg-white/90 rounded-3xl shadow-lg p-5 hover:shadow-xl transition-all">
                {/* Header s ikonom i imenom */}
                <div className="flex items-center gap-3 mb-4 p-3 rounded-full bg-[var(--color-primary-dark)] text-on-dark">
                    {config.icon}
                    <span className="font-space font-semibold text-sm">{config.name}</span>
                </div>

                {!hasData ? (
                    <div className="text-center py-4 text-[#8B6B7A]/50 font-space text-sm">
                        Nema podataka
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Ukupno riječi */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[#8B6B7A]/70 font-space flex items-center gap-2">
                                <BookOutlined />
                                Ukupno riječi
                            </span>
                            <span className="font-bold text-[#8B6B7A] font-space">{modeStats.total}</span>
                        </div>

                        {/* Kutije za učenje */}
                        <div className="grid grid-cols-4 gap-1 text-center">
                            {[
                                { label: '1.', value: modeStats.firstBox },
                                { label: '2.', value: modeStats.secondBox },
                                { label: '3.', value: modeStats.thirdBox },
                                { label: '4.', value: modeStats.fourthBox },
                            ].map((box, idx) => (
                                <div key={idx} className="bg-[var(--color-primary)]/10 rounded-xl p-2">
                                    <div className="text-[10px] text-[#8B6B7A]/60 font-space">{box.label} kutija</div>
                                    <div className="text-sm font-bold text-[#8B6B7A] font-space">{box.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Naučeno i za ponavljanje */}
                        <div className="flex gap-2">
                            <div className="flex-1 flex items-center gap-2 bg-green-100 rounded-xl px-2 py-2">
                                    <CheckCircleOutlined className="text-green-600" />
                                <div>
                                    <div className="text-[10px] text-[#8B6B7A]/60 font-space">Naučeno</div>
                                    <div className="text-sm font-bold text-[#8B6B7A] font-space">{modeStats.learned}</div>
                                </div>
                            </div>
                                <div className="flex-1 flex items-center gap-2 bg-yellow-100 rounded-xl px-2 py-2">
                                    <SyncOutlined className="text-yellow-600" />
                                <div>
                                    <div className="text-[10px] text-[#8B6B7A]/60 font-space">Za ponavljanje</div>
                                    <div className="text-sm font-bold text-[#8B6B7A] font-space">{modeStats.readyForReview}</div>
                                </div>
                            </div>
                        </div>

                        {/* Preostalo */}
                        <div className="flex items-center justify-between text-sm pt-2 border-t border-[var(--color-primary)]/20">
                            <span className="text-[#8B6B7A]/70 font-space">Preostalo za učenje</span>
                            <span className="font-bold text-[#8B6B7A] font-space">{modeStats.remaining}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };


    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col items-center justify-start p-5 w-screen">
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
                <Header />

                {/* Start Learning Section */}
                <div className="w-full max-w-[1200px] bg-white/90 rounded-3xl shadow-2xl p-12 mb-8 z-10 text-center">
                    <h2 className="font-space text-3xl font-bold text-[#8B6B7A] mb-4">
                        Dobrodošli u FlipMemo! 🎓
                    </h2>
                    <p className="font-space text-lg text-[#8B6B7A]/70 mb-8">
                        Započnite svoje putovanje učenja s flashcard karticama
                    </p>
                    <button onClick={() => navigate('/chooseWordSet')} className="cursor-pointer px-12 py-4 bg-[var(--color-primary-dark)] text-on-dark font-space text-lg font-bold rounded-full shadow-lg hover:shadow-2xl transition-all hover:scale-105 active:scale-95">
                        Započnite Učenje 🚀
                    </button>
                </div>

                {/* Statistics Section */}
                <div className="w-full max-w-[1200px] z-10 mb-8 flex flex-col justify-center items-center">
                    <div className="bg-[var(--color-primary-extra-dark)] rounded-full py-4 px-8 mb-6 inline-block">
                        <h3 className="font-space text-xl font-semibold text-on-dark">
                            📊 Moja Statistika
                        </h3>
                    </div>
                    
                    {loadingStats ? (
                        <div className="flex justify-center py-12">
                            <Mosaic color="var(--color-primary-dark)" size="medium" text="" textColor="" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {modeConfig.map((config) => (
                                <ModeStatsCard 
                                    key={config.mode}
                                    modeStats={stats.find(s => s.mode === config.mode)}
                                    config={config}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default Home;