
import { DownOutlined, UserOutlined, LockOutlined,LogoutOutlined,SettingOutlined } from '@ant-design/icons';
import { Dropdown, type MenuProps } from 'antd';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthProvider';
import ColorPicker from './ColorPicker';

const Header = () => {

    //KONTEKSTI
    const { logout,role } = useAuth();
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
                    <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
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