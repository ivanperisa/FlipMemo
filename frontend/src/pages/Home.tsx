import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import { BookOutlined, UserOutlined, LogoutOutlined, CheckCircleOutlined } from "@ant-design/icons";

const Home = () => {
    const { logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
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
                <div className="w-full max-w-[1200px] flex justify-between items-center mt-8 mb-12 z-10">
                    <h1 className="font-space text-4xl font-bold text-[#8B6B7A]">
                        FlipMemo
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-6 py-3 bg-white/90 rounded-full shadow-lg hover:shadow-xl transition-all hover:opacity-80 font-space text-[#8B6B7A]"
                    >
                        <LogoutOutlined />
                        Odjava
                    </button>
                </div>

                {/* Welcome Section */}
                <div className="w-full max-w-[1200px] bg-white/90 rounded-3xl shadow-2xl p-8 mb-8 z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-(--color-primary) flex items-center justify-center">
                            <UserOutlined style={{ fontSize: '32px', color: 'white' }} />
                        </div>
                        <div>
                            <h2 className="font-space text-2xl font-bold text-[#8B6B7A]">
                                Dobrodošli!
                            </h2>
                            <p className="font-space text-sm text-[#8B6B7A]/70">
                                Uspješno ste se prijavili u FlipMemo aplikaciju
                            </p>
                        </div>
                    </div>
                    
                    <div className="border-t-2 border-[#FFB6C1]/30 pt-6">
                        <p className="font-space text-[#8B6B7A] mb-4">
                            Ovo je privremena početna stranica. Ovdje će se nalaziti vaše flashcard kartice za učenje.
                        </p>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-3 gap-6 z-10">
                    {/* Feature 1 */}
                    <div className="bg-white/90 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                        <div className="w-12 h-12 rounded-full bg-(--color-primary) flex items-center justify-center mb-4">
                            <BookOutlined style={{ fontSize: '24px', color: 'white' }} />
                        </div>
                        <h3 className="font-space text-lg font-bold text-[#8B6B7A] mb-2">
                            Kreirajte Kartice
                        </h3>
                        <p className="font-space text-sm text-[#8B6B7A]/70">
                            Jednostavno kreirajte svoje flashcard kartice za učenje
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white/90 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                        <div className="w-12 h-12 rounded-full bg-(--color-primary) flex items-center justify-center mb-4">
                            <CheckCircleOutlined style={{ fontSize: '24px', color: 'white' }} />
                        </div>
                        <h3 className="font-space text-lg font-bold text-[#8B6B7A] mb-2">
                            Pratite Napredak
                        </h3>
                        <p className="font-space text-sm text-[#8B6B7A]/70">
                            Pratite svoj napredak i statistiku učenja
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white/90 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                        <div className="w-12 h-12 rounded-full bg-(--color-primary) flex items-center justify-center mb-4">
                            <UserOutlined style={{ fontSize: '24px', color: 'white' }} />
                        </div>
                        <h3 className="font-space text-lg font-bold text-[#8B6B7A] mb-2">
                            Vaš Profil
                        </h3>
                        <p className="font-space text-sm text-[#8B6B7A]/70">
                            Personalizirajte svoj profil i postavke
                        </p>
                    </div>
                </div>

                {/* Status Card */}
                <div className="w-full max-w-[1200px] bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl shadow-lg p-6 mt-8 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-space text-lg font-bold text-[#8B6B7A] mb-1">
                                Status Autentifikacije
                            </h3>
                            <p className="font-space text-sm text-[#8B6B7A]/70">
                                {isAuthenticated ? "✅ Prijavljeni ste" : "❌ Niste prijavljeni"}
                            </p>
                        </div>
                        <div className="text-4xl">
                            🎉
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Home;