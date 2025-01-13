import React from 'react';
import SidebarMenu from '../MenuLateral';
import MainContent from './MainContent';

const Layout: React.FC = () => {
    return (
        <div className="flex h-screen w-full overflow-hidden">
            <SidebarMenu />
            <MainContent />
        </div>
    );
};

export default Layout;