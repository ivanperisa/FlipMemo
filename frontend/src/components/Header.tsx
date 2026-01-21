
import { DownOutlined, UserOutlined, LockOutlined, LogoutOutlined, SettingOutlined, DeleteOutlined, BarChartOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Dropdown, type MenuProps, Modal, message, Button } from 'antd';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthProvider';
import ColorPicker from './ColorPicker';
import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const Header = () => {

    //KONTEKSTI
    const { logout, role, id } = useAuth();
    const navigate = useNavigate();
    
    // Stanje za dropdown
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    // Stanje za delete modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleChangePassword = () => {
        navigate("/changePassword");
    };

    const handleViewStats = () => {
        setDropdownOpen(false);
        navigate("/home");
    };

    const handleDeleteAccount = () => {
        setDropdownOpen(false);
        setDeleteModalOpen(true);
    };

    const confirmDeleteAccount = async () => {
        if (!id) {
            message.error('Greška: Korisnik nije prijavljen.');
            return;
        }
        
        setDeleteLoading(true);
        try {
            await axiosInstance.delete(`/api/v1/User/${id}`);
            message.success('Račun je uspješno obrisan.');
            setDeleteModalOpen(false);
            logout();
            navigate("/login");
        } catch (error) {
            console.error('Greška pri brisanju računa:', error);
            message.error('Došlo je do greške pri brisanju računa.');
        } finally {
            setDeleteLoading(false);
        }
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
            key: 'stats',
            label: 'Moja statistika',
            icon: <BarChartOutlined />,
            onClick: handleViewStats,
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

                    {/* Delete Account Modal */}
                    <Modal
                        title={
                            <div className="flex items-center gap-2 text-red-500">
                                <ExclamationCircleOutlined />
                                <span>Brisanje računa</span>
                            </div>
                        }
                        open={deleteModalOpen}
                        onCancel={() => setDeleteModalOpen(false)}
                        centered
                        footer={[
                            <Button key="cancel" onClick={() => setDeleteModalOpen(false)}>
                                Odustani
                            </Button>,
                            <Button 
                                key="delete" 
                                danger 
                                type="primary" 
                                loading={deleteLoading}
                                onClick={confirmDeleteAccount}
                            >
                                Da, obriši
                            </Button>,
                        ]}
                    >
                        <p className="text-gray-600 py-4">
                            Jeste li sigurni da želite obrisati svoj račun? 
                            <br /><br />
                            <strong className="text-red-500">Ova radnja je nepovratna</strong> i svi vaši podaci će biti trajno izbrisani.
                        </p>
                    </Modal>
                </div>
    );
}

export default Header;