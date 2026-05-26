import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, User, Info, Plus, X, ChevronDown, ChevronRight } from 'lucide-react';

const ProfileForm = ({ formData, setFormData, loading }) => {
  const navigate = useNavigate();
  const genderOptions = ["Male", "Female", "Non-binary", "Other", "Prefer not to say"];
  const styleOptions = ["Minimalist", "Vintage", "Casual", "Streetwear", "Formal"];
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStyleSelect = (e) => {
    const selectedStyle = e.target.value;
    if (selectedStyle && !formData.preferences.includes(selectedStyle)) {
      // Limit to 3 styles for better UX (first 2 used for suggestions)
      if (formData.preferences.length >= 3) return;
      
      setFormData(prev => ({
        ...prev,
        preferences: [...prev.preferences, selectedStyle]
      }));
    }
    // Reset select to empty state
    e.target.value = "";
  };

  const removePreference = (pref) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.filter(p => p !== pref)
    }));
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Basic Info Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <User size={16} className="text-[#81A6C6]" />
          <h4 className="text-[10px] tracking-[0.2em] uppercase text-[#8A8A9A] font-bold">Personal Details</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#3D3D4E]">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              className="px-4 py-3 rounded-xl border border-[rgba(180,165,148,0.2)] bg-white/50 focus:bg-white focus:border-[#81A6C6] focus:ring-4 focus:ring-[#81A6C6]/5 outline-none transition-all text-sm"
              placeholder="Your full name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#3D3D4E]">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A9A]" />
              <input
                type="email"
                readOnly
                value={formData.email || ''}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[rgba(180,165,148,0.1)] bg-[rgba(129,166,198,0.03)] text-[#8A8A9A] cursor-not-allowed text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#3D3D4E]">Gender Identity</label>
            <div className="relative">
              <select
                name="gender"
                value={formData.gender || 'Prefer not to say'}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-[rgba(180,165,148,0.2)] bg-white/50 focus:bg-white focus:border-[#81A6C6] focus:ring-4 focus:ring-[#81A6C6]/5 outline-none transition-all text-sm appearance-none cursor-pointer"
              >
                {genderOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8A9A] pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#3D3D4E]">Body Type</label>
             <div 
                onClick={() => navigate('/onboarding')}
                className="px-4 py-3 rounded-xl border border-[rgba(180,165,148,0.1)] bg-[rgba(129,166,198,0.03)] hover:bg-[rgba(129,166,198,0.06)] hover:border-[#81A6C6]/30 text-[#8A8A9A] cursor-pointer text-sm outline-none transition-all flex items-center justify-between group"
              >
                <span>{formData.bodyType || 'Not analyzed yet'}</span>
                <ChevronRight size={14} className="text-[#8A8A9A] group-hover:text-[#81A6C6] transition-colors" />
              </div>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="space-y-6 pt-6 border-t border-[rgba(180,165,148,0.1)]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-[#81A6C6]" />
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-[#8A8A9A] font-bold">Style Concept</h4>
          </div>
          <p className="text-xs text-[#8A8A9A] ml-6">Choose styles that define your personal aesthetic (Max 2-3 recommended)</p>
        </div>

        <div className="flex flex-col gap-5 bg-[rgba(129,166,198,0.03)] p-6 rounded-2xl border border-[rgba(129,166,198,0.08)]">
          <div className="relative">
            <select
              onChange={handleStyleSelect}
              defaultValue=""
              className="w-full px-4 py-3 rounded-xl border border-[rgba(180,165,148,0.2)] bg-white focus:bg-white focus:border-[#81A6C6] focus:ring-4 focus:ring-[#81A6C6]/5 outline-none transition-all text-sm shadow-sm appearance-none cursor-pointer"
            >
              <option value="" disabled>Select a style...</option>
              {styleOptions.map(style => (
                <option 
                  key={style} 
                  value={style}
                  disabled={formData.preferences.includes(style)}
                >
                  {style}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8A9A] pointer-events-none" />
          </div>

          <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
            {(formData.preferences || []).map(pref => (
              <span 
                key={pref}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#1A1A2E] text-xs font-semibold rounded-full border border-[rgba(129,166,198,0.15)] shadow-sm group transition-all hover:border-[#81A6C6] hover:shadow-md animate-in zoom-in-90 duration-300"
              >
                {pref}
                <button 
                  type="button"
                  onClick={() => removePreference(pref)}
                  className="text-[#8A8A9A] hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-red-50"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            {(!formData.preferences || formData.preferences.length === 0) && (
              <p className="text-xs text-[#8A8A9A] italic opacity-60 ml-1">No style tags defined yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
