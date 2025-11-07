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
            <button className="flex items-center gap-2 px-6 py-3 bg-white/90 rounded-full shadow-lg hover:shadow-xl transition-all hover:opacity-80 font-space text-[#8B6B7A] cursor-pointer">
                <BgColorsOutlined />
                Tema
                <DownOutlined style={{ fontSize: '12px' }} />
            </button>
        </Dropdown>
    );
}

export default ThemeButton;
