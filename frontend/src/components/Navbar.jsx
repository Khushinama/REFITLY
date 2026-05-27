import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import BrandLogo from './common/BrandLogo';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated: token, user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Demo', href: '#demo' },
    {name: 'Dashboard',href: "/dashboard"}
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    toast.success('Logged out successfully');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-beige-50/95 backdrop-blur-sm border-b border-beige-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <BrandLogo variant="navbar" onClick={() => navigate("/")} />
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-primary-dark/80 hover:text-primary-dark transition-colors font-medium"
              >
                {link.name}
              </a>
            ))}
             {token ? (
               <div className="flex items-center gap-4">
                 <div 
                   onClick={() => navigate('/profile')} 
                   className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden cursor-pointer hover:border-primary transition-all"
                 >
                   {user?.profileImage ? (
                     <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                       {user?.name?.charAt(0) || 'U'}
                     </div>
                   )}
                 </div>
                 <button
                   onClick={handleLogout}
                   className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-all font-medium text-sm"
                 >
                   Logout
                 </button>
               </div>
      ) : (
        <button
          onClick={() => navigate("/signup")}
          className="bg-primary text-[#FFFFFF] px-6 py-2 rounded-full hover:bg-primary-hover transition-all transform hover:scale-105 font-bold shadow-sm hover:shadow-md"
        >
          Get Started
        </button>
      )}
          </div>

          <button
            className="md:hidden text-primary-dark"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-beige-100 border-t border-beige-300">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block text-primary-dark/80 hover:text-primary-dark transition-colors font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
             {token ? (
        <div className="flex flex-col gap-4 py-2 border-t border-beige-300 mt-2 pt-4">
          <div className="flex items-center gap-3" onClick={() => navigate('/profile')}>
            <div className="w-12 h-12 rounded-full border-2 border-primary/20 overflow-hidden">
               {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-primary-dark">{user?.name}</span>
              <span className="text-xs text-primary-dark/60">View Profile</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-all font-bold text-center"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={() => navigate("/signup")}
          className="bg-primary text-[#FFFFFF] px-6 py-2 rounded-full hover:bg-primary-hover transition-all font-bold w-full text-center"
        >
          Get Started
        </button>
      )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
