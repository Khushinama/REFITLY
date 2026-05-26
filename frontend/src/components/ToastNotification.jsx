import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideToast } from '../store/slices/toastSlice';
import { CheckCircle, X } from 'lucide-react';

const ToastNotification = () => {
  const dispatch = useDispatch();
  const { message, type, visible } = useSelector((state) => state.toast);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, dispatch]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in-up">
      <div className="flex items-center gap-3 px-5 py-4 bg-white/95 backdrop-blur-md rounded-2xl border border-[rgba(129,166,198,0.2)] shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[#81A6C6]/10 text-[#81A6C6]">
          <CheckCircle className="w-4 h-4" />
        </div>
        <p className="text-xs font-semibold text-[#1A1A2E] tracking-wide">
          {message}
        </p>
        <button 
          onClick={() => dispatch(hideToast())}
          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
