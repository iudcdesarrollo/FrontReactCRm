import React, { useState } from 'react';
import {
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Calendar,
  MessageSquare,
  LogOut,
  BadgeDollarSign,
  Target,
  Mail,
  TrendingUp
} from 'lucide-react';
import '../../css/clonHubSpot/MenuLateral.css';

const Logo = () => (
  <svg
    className="marketing-logo"
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z"
      fill="#6366F1"
    />
    <path
      d="M23 16.5c0 .828-.672 1.5-1.5 1.5h-1c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5h1c.828 0 1.5.672 1.5 1.5z"
      fill="white"
    />
    <path
      d="M18 12.5c0 .828-.672 1.5-1.5 1.5h-1c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5h1c.828 0 1.5.672 1.5 1.5z"
      fill="white"
    />
    <path
      d="M13 20.5c0 .828-.672 1.5-1.5 1.5h-1c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5h1c.828 0 1.5.672 1.5 1.5z"
      fill="white"
    />
    <path
      d="M9 11l14 10"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { icon: <TrendingUp size={20} />, label: 'Dashboard', path: '/' },
  { icon: <Target size={20} />, label: 'Campaigns', path: '/campaigns' },
  { icon: <BadgeDollarSign size={20} />, label: 'Marketing', path: '/marketing' },
  { icon: <Mail size={20} />, label: 'Email', path: '/email' },
  { icon: <BarChart2 size={20} />, label: 'Analytics', path: '/analytics' },
  { icon: <Calendar size={20} />, label: 'Calendar', path: '/calendar' },
  { icon: <MessageSquare size={20} />, label: 'Messages', path: '/messages' },
  { icon: <Settings size={20} />, label: 'Settings', path: '/settings' }
];

const SidebarMenu: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('Dashboard');

  const handleMenuClick = (label: string) => {
    setActiveItem(label);
    const event = new CustomEvent('menuClick', {
      detail: {
        section: label
      }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="flex h-screen">
      <div className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        <div className="logo-section">
          <div className="logo-container">
            <Logo />
            {!isCollapsed && (
              <span className="app-title">
                Comunicaciones<span className="app-title-dot">.</span>
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="collapse-button"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="nav-section">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => handleMenuClick(item.label)}
              className={`nav-button ${activeItem === item.label ? 'active' : ''}`}
              style={{ '--index': index } as React.CSSProperties}
            >
              <span className="icon-wrapper">
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="label">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="bottom-section">
          <button className="logout-button">
            <span className="icon-wrapper">
              <LogOut size={20} />
            </span>
            {!isCollapsed && (
              <span className="label">Logout</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SidebarMenu;