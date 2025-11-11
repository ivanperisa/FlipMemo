import { DownOutlined, BgColorsOutlined } from '@ant-design/icons';
import { Dropdown, type MenuProps } from 'antd';
import ColorPicker from './ColorPicker';

const ThemeButton = () => {

    const menuItems: MenuProps['items'] = [
        {
            key: 'colorPicker',
            label: (
                <div onClick={(e) => e.stopPropagation()}>
                    <ColorPicker />
                </div>
            ),
        },
    ];

    return (
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <button className="flex items-center justify-center gap-2 bg-white/90 rounded-full shadow-lg hover:shadow-xl transition-all hover:opacity-80 font-space text-[#8B6B7A] cursor-pointer
                               px-6 py-3 md:px-6 md:py-3 
                               w-12 h-12 md:w-auto md:h-auto">
                <BgColorsOutlined className="text-lg md:text-base" />
                <span className="hidden md:inline">Tema</span>
                <DownOutlined className="hidden md:inline" style={{ fontSize: '12px' }} />
            </button>
        </Dropdown>
    );
}

export default ThemeButton;
