import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, User as UserIcon } from 'lucide-react';
import BrandLogo from './common/BrandLogo';

const Topbar = ({ itemCount = 0, title = "Wardrobe", showAddButton = true, onMenuClick, onAddClick }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-10 bg-[#F7F0E8]/80 backdrop-blur-md border-bottom border-[rgba(180,165,148,0.2)] border-b h-16 flex items-center justify-between px-4 md:px-8">
      {/* Left side: Hamburger (Mobile) and Breadcrumb */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-[#1A1A2E] hover:bg-[rgba(129,166,198,0.08)] rounded-xl transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] tracking-widest text-[#8A8A9A] uppercase whitespace-nowrap">
           <p>REFITLY</p>
            <span>/ {title}</span>
          </div>
          <h2 className="font-['Playfair_Display'] text-lg md:text-xl text-[#1A1A2E] mt-0.5">
            {title}
          </h2>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Item count badge (only if wardrobe) */}
        {title === "Wardrobe" && (
          <div className="bg-[rgba(129,166,198,0.1)] rounded-full px-3 py-1 hidden sm:block">
            <span className="text-[10px] tracking-widest uppercase text-[#81A6C6]">
              {itemCount} items
            </span>
          </div>
        )}

        {/* Add Item Button */}
        {showAddButton && (
          <button 
            onClick={onAddClick}
            className="px-4 md:px-5 py-2 md:py-2.5 bg-[#81A6C6] hover:bg-[#6B90B0] text-white text-xs md:text-sm font-medium tracking-wide rounded-full transition-all duration-300 ease-out hover:translate-x-[2px] hover:shadow-[0_6px_20px_rgba(129,166,198,0.3)] cursor-pointer whitespace-nowrap"
          >
            <span className="hidden sm:inline">+ Add Item</span>
            <span className="sm:hidden">+</span>
          </button>
        )}

        {/* Profile Avatar */}
        <div 
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full border border-[rgba(180,165,148,0.3)] bg-white flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#81A6C6] transition-all"
        >
          {user?.profileImage ? (
            <img src={user.profileImage} alt="User Profile" className="w-full h-full object-cover" />
          ) : (
            <UserIcon size={20} className="text-[#81A6C6]" />
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
