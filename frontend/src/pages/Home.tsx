
import { useNavigate } from "react-router";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import { SettingOutlined } from '@ant-design/icons';

import Header from "../components/Header";
import { useAuth } from "../context/AuthProvider";

const Home = () => {
    const navigate = useNavigate();
    const { role } = useAuth();

   


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

                {/* Admin Button - Visible only for admins */}
                {role === 'Admin' && (
                    <div className="fixed top-6 left-6 z-50">
                        <button 
                            onClick={() => navigate('/admin')}
                            className="flex items-center justify-center gap-2 bg-[var(--color-primary-dark)] text-on-dark rounded-full shadow-lg hover:shadow-xl transition-all hover:opacity-90 cursor-pointer
                                       px-4 py-3 md:px-6 md:py-3 
                                       w-12 h-12 md:w-auto md:h-auto"
                        >
                            <SettingOutlined className="text-lg md:text-base" />
                            <span className="hidden md:inline font-space">Admin Panel</span>
                        </button>
                    </div>
                )}

                {/* Start Learning Section */}
                <div className="w-full max-w-[1200px] bg-white/90 rounded-3xl shadow-2xl p-12 mb-8 z-10 text-center">
                    <h2 className="font-space text-3xl font-bold text-[#8B6B7A] mb-4">
                        Dobrodošli u FlipMemo! 🎓
                    </h2>
                    <p className="font-space text-lg text-[#8B6B7A]/70 mb-8">
                        Započnite svoje putovanje učenja s flashcard karticama
                    </p>
                    <button onClick={() => navigate('/chooseWordSet')} className="cursor-pointer px-12 py-4 bg-(--color-primary-dark) text-on-dark font-space text-lg font-bold rounded-full shadow-lg hover:shadow-2xl transition-all hover:scale-105 active:scale-95">
                        Započnite Učenje 🚀
                    </button>
                </div>

                
            </div>
        </PageTransition>
    );
};

export default Home;