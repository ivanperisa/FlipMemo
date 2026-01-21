
import { DownOutlined, UserOutlined, LockOutlined, LogoutOutlined, SettingOutlined, DeleteOutlined, BookOutlined, CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Dropdown, type MenuProps, Modal, Spin, message } from 'antd';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthProvider';
import ColorPicker from './ColorPicker';
import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

interface UserStats {
    firstBox: number;
    secondBox: number;
    thirdBox: number;
    fourthBox: number;
    learned: number;
    readyForReview: number;
}

const Header = () => {

    //KONTEKSTI
    const { logout, role, id } = useAuth();
    const navigate = useNavigate();
    
    // Stanje za statistiku
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Dohvati statistiku kada se dropdown otvori
    useEffect(() => {
        if (dropdownOpen && !stats) {
            fetchStats();
        }
    }, [dropdownOpen]);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const response = await axiosInstance.put('/api/v1/User/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Greška pri dohvaćanju statistike:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleChangePassword = () => {
        navigate("/changePassword");
    };

    const handleDeleteAccount = () => {
        Modal.confirm({
            title: 'Brisanje računa',
            content: 'Jeste li sigurni da želite obrisati svoj račun? Ova radnja je nepovratna i svi vaši podaci će biti trajno izbrisani.',
            okText: 'Da, obriši',
            cancelText: 'Odustani',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await axiosInstance.delete(`/api/v1/User/${id}`);
                    message.success('Račun je uspješno obrisan.');
                    logout();
                    navigate("/login");
                } catch (error) {
                    console.error('Greška pri brisanju računa:', error);
                    message.error('Došlo je do greške pri brisanju računa.');
                }
            },
        });
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
        // Statistika korisnika
        {
            key: 'stats',
            label: (
                <div onClick={(e) => e.stopPropagation()} className="px-4 py-3 min-w-[280px]">
                    <div className="flex items-center gap-2 mb-3">
                        <BookOutlined style={{ fontSize: '16px', color: '#8B6B7A' }} />
                        <span className="font-space font-semibold text-[#8B6B7A] text-sm">
                            Moja statistika
                        </span>
                    </div>
                    {loadingStats ? (
                        <div className="flex justify-center py-2">
                            <Spin size="small" />
                        </div>
                    ) : stats ? (
                        <div className="space-y-2">
                            {/* Kutije za učenje */}
                            <div className="grid grid-cols-4 gap-1 text-center">
                                {[
                                    { label: '1.', value: stats.firstBox },
                                    { label: '2.', value: stats.secondBox },
                                    { label: '3.', value: stats.thirdBox },
                                    { label: '4.', value: stats.fourthBox },
                                ].map((box, idx) => (
                                    <div key={idx} className="bg-gray-100 rounded-lg p-1.5">
                                        <div className="text-[10px] text-gray-500 font-space">{box.label} kutija</div>
                                        <div className="text-sm font-bold text-[#8B6B7A] font-space">{box.value}</div>
                                    </div>
                                ))}
                            </div>
                            {/* Naučeno i za ponavljanje */}
                            <div className="flex gap-2 mt-2">
                                <div className="flex-1 flex items-center gap-2 bg-green-50 rounded-lg px-2 py-1.5">
                                    <CheckCircleOutlined className="text-green-500 text-sm" />
                                    <div>
                                        <div className="text-[10px] text-gray-500 font-space">Naučeno</div>
                                        <div className="text-sm font-bold text-green-600 font-space">{stats.learned}</div>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center gap-2 bg-orange-50 rounded-lg px-2 py-1.5">
                                    <SyncOutlined className="text-orange-500 text-sm" />
                                    <div>
                                        <div className="text-[10px] text-gray-500 font-space">Za ponavljanje</div>
                                        <div className="text-sm font-bold text-orange-600 font-space">{stats.readyForReview}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs text-gray-400 font-space text-center py-2">
                            Statistika nije dostupna
                        </div>
                    )}
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
            key: 'deleteAccount',
            label: 'Obriši račun',
            icon: <DeleteOutlined />,
            onClick: handleDeleteAccount,
            danger: true,
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

 <div className="w-full max-w-[1200px] flex justify-between items-center mt-8 mb-12 z-10 px-5">
    <div className="flex justify-between items-center gap-[10px]">
                   <Link to={'/home'}> <h1 className="font-space text-4xl font-bold text-[var(--color-text-on-primary)]">
                        FlipMemo
                    </h1></Link>

                    {/* Admin Button - Visible only for admins */}
                {role === 'Admin' && (
                    <div className="">
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
</div>
                    <Dropdown 
                        menu={{ items: menuItems }} 
                        trigger={['click']} 
                        placement="bottomRight"
                        onOpenChange={(open) => setDropdownOpen(open)}
                    >
                        <button className="flex items-center gap-2 px-6 py-3 bg-white/90 rounded-full shadow-lg hover:shadow-xl transition-all hover:opacity-80 font-space text-[#8B6B7A] cursor-pointer">
                            <UserOutlined />
                            Profil
                            <DownOutlined style={{ fontSize: '12px' }} />
                        </button>
                    </Dropdown>
                </div>
    );
}

export default Header;