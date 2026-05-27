import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  fetchUserProfile, 
  updateUserProfile, 
  deleteAccount,
  clearError 
} from '../store/slices/authSlice';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import AvatarUpload from '../components/AvatarUpload';
import ProfileForm from '../components/ProfileForm';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { 
  Save, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: 'Prefer not to say',
    preferences: [],
    bodyType: ''
  });
  
  const [image, setImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      console.log("Profile Page - Syncing state with user data:", user.name);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        gender: user.gender || 'Prefer not to say',
        preferences: user.preferences || [],
        bodyType: user.bodyType || ''
      });
      setImage(null);
      setRemoveImage(false);
      setIsModified(false);
    }
  }, [user]);

  // Track modifications
  useEffect(() => {
    if (!user) return;
    const hasChanged = 
      formData.name !== (user.name || '') ||
      formData.gender !== (user.gender || 'Prefer not to say') ||
      JSON.stringify(formData.preferences) !== JSON.stringify(user.preferences || []) ||
      image !== null ||
      removeImage === true;
    
    setIsModified(hasChanged);
  }, [formData, image, removeImage, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Profile Page - Submitting changes...");
    console.log("Profile Page - removeImage flag:", removeImage);
    console.log("Profile Page - Newly selected image:", image ? image.name : "None");

    const data = new FormData();
    data.append('name', formData.name);
    data.append('gender', formData.gender);
    data.append('preferences', JSON.stringify(formData.preferences));
    data.append('removeImage', removeImage);
    
    if (image) {
      data.append('image', image);
    }

    const resultAction = await dispatch(updateUserProfile(data));
    if (updateUserProfile.fulfilled.match(resultAction)) {
      console.log("Profile Page - Update successful!");
      setShowSuccess(true);
      toast.success("Profile updated successfully!");
      setTimeout(() => setShowSuccess(false), 4000);
    } else {
      console.error("Profile Page - Update failed:", resultAction.payload);
      toast.error(resultAction.payload || "Failed to update profile");
    }
  };

  const handleDeleteAccount = async () => {
    const resultAction = await dispatch(deleteAccount());
    if (deleteAccount.fulfilled.match(resultAction)) {
      navigate('/');
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F0E8] overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar 
          title="Profile" 
          showAddButton={false} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col gap-2 mb-10">
              <h2 className="text-3xl font-['Playfair_Display'] text-[#1A1A2E]">Your Profile</h2>
              <p className="text-[#8A8A9A] text-sm md:text-base">Manage your personal details and account settings</p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in duration-300">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{error}</span>
                <button onClick={() => dispatch(clearError())} className="ml-auto text-red-400 hover:text-red-500 text-xl font-bold">×</button>
              </div>
            )}

            {showSuccess && (
              <div className="mb-6 p-5 bg-[#81A6C6]/10 border border-[#81A6C6]/20 rounded-2xl flex items-center gap-4 text-[#81A6C6] animate-in slide-in-from-top-4 duration-500 ease-out fill-mode-both">
                <div className="bg-[#81A6C6] p-1.5 rounded-full">
                  <CheckCircle2 size={18} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Update Successful</h4>
                  <p className="text-xs opacity-80">Your profile changes have been saved.</p>
                </div>
              </div>
            )}

            {/* Profile Content Card */}
            <div className="bg-white rounded-[2rem] border border-[rgba(180,165,148,0.2)] shadow-[0_2px_16px_rgba(129,166,198,0.06)] overflow-hidden">
              <form onSubmit={handleSubmit} className="p-8 md:p-12">
                <div className="flex flex-col lg:flex-row gap-12">
                  {/* Left Column: Avatar */}
                  <div className="flex-shrink-0 lg:w-48">
                    <AvatarUpload 
                      currentImage={user?.profileImage}
                      removeImage={removeImage}
                      onImageChange={(file) => {
                        setImage(file);
                        setRemoveImage(false);
                      }}
                      onImageRemove={() => {
                        setImage(null);
                        setRemoveImage(true);
                      }}
                    />
                  </div>

                  {/* Right Column: Fields */}
                  <div className="flex-1">
                    <ProfileForm 
                      formData={formData} 
                      setFormData={setFormData}
                      loading={loading}
                    />
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-[rgba(180,165,148,0.1)] flex flex-wrap items-center justify-between gap-6">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-[#3D3D4E] uppercase tracking-wider">Account Control</p>
                    <button 
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
                    >
                      <ShieldAlert size={14} />
                      Delete my account permanently
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!isModified || loading}
                    className={`
                      px-10 py-4 rounded-full text-sm font-bold tracking-wide shadow-lg transition-all duration-300 flex items-center gap-2
                      ${(!isModified || loading) 
                        ? 'bg-[#F0F0F0] text-[#B0B0B0] cursor-not-allowed shadow-none' 
                        : 'bg-[#81A6C6] text-white hover:bg-[#6B90B0] hover:translate-x-1 hover:shadow-[0_8px_24px_rgba(129,166,198,0.3)]'}
                    `}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <DeleteConfirmationModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account?"
        message="This action is permanent and will delete all your personal information and wardrobe items. Are you sure?"
      />
    </div>
  );
};

export default Profile;
