import { useNavigate } from "react-router";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import Header from "../components/Header";
import { BookOutlined, PlusCircleOutlined } from '@ant-design/icons';

const AdminPage = () => {
    const navigate = useNavigate();

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

                {/* Admin Panel Title */}
                <div className="flex w-full items-start justify-start mb-8 mt-8">
                    <div className="bg-[var(--color-primary-extra-dark)] z-10 rounded-r-full py-6 px-16 text-on-primary font-space text-2xl font-semibold">
                        Admin Panel
                    </div>
                </div>

                {/* Admin Action Cards */}
                <div className="w-full max-w-[800px] px-5 z-10 flex flex-col gap-6">
                    
                    {/* Add Dictionary Card */}
                    <button
                        onClick={() => navigate('/admin/add-dictionary')}
                        className="w-full bg-white/90 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all hover:scale-105 cursor-pointer"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-[var(--color-primary-dark)] rounded-full flex items-center justify-center">
                                <BookOutlined className="text-3xl text-white" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-space text-2xl font-bold text-[#8B6B7A] mb-2">
                                    Dodaj Rječnik
                                </h3>
                                <p className="font-space text-[#8B6B7A]/70">
                                    Kreiraj novi rječnik za učenje
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Add Words to Dictionary Card */}
                    <button
                        onClick={() => navigate('/admin/add-words')}
                        className="w-full bg-white/90 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all hover:scale-105 cursor-pointer"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-[var(--color-primary-dark)] rounded-full flex items-center justify-center">
                                <PlusCircleOutlined className="text-3xl text-white" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-space text-2xl font-bold text-[#8B6B7A] mb-2">
                                    Dodaj Riječi u Rječnik
                                </h3>
                                <p className="font-space text-[#8B6B7A]/70">
                                    Dodaj nove riječi u postojeći rječnik
                                </p>
                            </div>
                        </div>
                    </button>

                </div>
            </div>
        </PageTransition>
    );
};

export default AdminPage;
