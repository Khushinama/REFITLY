import React from 'react';
import { RefreshCw } from 'lucide-react';

const ShuffleButton = ({ onClick, isLoading }) => {
  return (
    <div className="flex justify-center py-12">
      <button
        onClick={onClick}
        disabled={isLoading}
        className="group relative flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-rose-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
      >
        {/* Background glow animation */}
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        
        <RefreshCw className={`w-6 h-6 transition-transform duration-500 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
        <span className="relative">Show me more styles</span>
      </button>
    </div>
  );
};

export default ShuffleButton;
