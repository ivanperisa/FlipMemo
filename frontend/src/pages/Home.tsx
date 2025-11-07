import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import { BookOutlined, UserOutlined, LogoutOutlined, CheckCircleOutlined, LockOutlined, DownOutlined, BgColorsOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import ColorPicker from "../components/ColorPicker";
import Header from "../components/Header";

const Home = () => {
    const { logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleChangePassword = () => {
        navigate("/changePassword");
    };

    const menuItems: MenuProps['items'] = [
        {
            key: 'colorPicker',
            label: (
                <div onClick={(e) => e.stopPropagation()}>
                    <ColorPicker />
                </div>
            ),
        },
        {
            type: 'divider',
        },
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
                    <button onClick={() => navigate('/chooseStyle')} className="cursor-pointer px-12 py-4 bg-(--color-primary-dark) text-on-dark font-space text-lg font-bold rounded-full shadow-lg hover:shadow-2xl transition-all hover:scale-105 active:scale-95">
                        Započnite Učenje 🚀
                    </button>
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