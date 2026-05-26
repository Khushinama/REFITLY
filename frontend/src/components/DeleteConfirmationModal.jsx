import React from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A1A2E]/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ease-out border border-[rgba(180,165,148,0.2)]">
        {/* Header with Close */}
        <div className="flex justify-end p-4 pb-0">
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-[rgba(129,166,198,0.1)] rounded-full transition-colors text-[#8A8A9A]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 pt-2 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4 transition-transform duration-500 animate-bounce-subtle">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          
          <h3 className="font-['Playfair_Display'] text-xl text-[#1A1A2E] mb-2 font-semibold">
            {title || "Delete Item?"}
          </h3>
          <p className="text-sm text-[#8A8A9A] leading-relaxed mb-8 px-2">
            {message || "This action cannot be undone. This item will be permanently removed from your wardrobe."}
          </p>

          {/* Buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-[#F7F0E8] hover:bg-[#EAE0D5] text-[#3D3D4E] text-xs font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Delete Now"
              ) || "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
