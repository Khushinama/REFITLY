import { LayoutDashboard, Shirt, Sparkles, UserCircle, X, History } from 'lucide-react';
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import BrandLogo from './common/BrandLogo';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Wardrobe', icon: Shirt, path: '/wardrobe' },
    { label: 'Outfits', icon: Sparkles, path: '/outfits' },
    { label: 'History', icon: History, path: '/history' },
  ];

  const navigate = useNavigate()
  const activeStyles = "bg-[rgba(129,166,198,0.14)] text-[#1A1A2E] font-medium border-l-2 border-[#81A6C6]";
  const inactiveStyles = "bg-transparent text-[#8A8A9A] hover:bg-[rgba(129,166,198,0.08)] hover:text-[#3D3D4E] hover:translate-x-[2px]";

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 lg:static lg:h-screen w-[240px] bg-[#EFEBE4] border-r border-[rgba(180,165,148,0.2)] flex flex-col justify-between px-5 pt-3.5 pb-7 overflow-hidden flex-shrink-0 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div>
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between w-full px-5 py-5 border-b border-[#EAE4DC] overflow-hidden">

            {/* Logo */}
            <div className="flex justify-center lg:justify-start overflow-hidden">
              <BrandLogo
                variant="sidebar"
                onClick={() => navigate("/")}
              />
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-[#8A8A9A] hover:bg-[rgba(129,166,198,0.08)] rounded-xl transition-colors"
            >
              <X size={20} />
            </button>

          </div>

          {/* Divider */}
          <div className="h-[1px] bg-[rgba(180,165,148,0.25)] mt-2.5 mb-4" />

          {/* Navigation */}
          <div className="flex flex-col gap-1">
            <p className="text-[9px] tracking-[0.2em] text-[#8A8A9A] uppercase mb-3 px-3">
              MENU
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ease-out group ${isActive ? activeStyles : inactiveStyles
                  }`
                }
              >
                <item.icon
                  size={16}
                  className={`transition-colors duration-300 ${({ isActive }) => isActive ? 'text-[#81A6C6]' : 'text-[#8A8A9A] group-hover:text-[#81A6C6]'
                    }`}
                />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          {/* Bottom Divider */}
          <div className="h-[1px] bg-[rgba(180,165,148,0.25)] mb-6" />

          {/* Profile Link */}
          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ease-out group ${isActive ? activeStyles : inactiveStyles
              }`
            }
          >
            <UserCircle size={16} className="text-[#8A8A9A] group-hover:text-[#81A6C6]" />
            <span>Profile</span>
          </NavLink>

          {/* App Version */}
          <p className="text-[9px] tracking-widest text-[#8A8A9A] uppercase mt-4 px-3">
            ReFitly v1.0
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
