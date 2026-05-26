import React, { useRef, useState, useEffect } from 'react';
import { Camera, Trash2, User, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

const AvatarUpload = ({ currentImage, removeImage, onImageChange, onImageRemove }) => {
  const [preview, setPreview] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef(null);

  // Debugging logs
  useEffect(() => {
    console.log("AvatarUpload - currentImage:", currentImage);
    console.log("AvatarUpload - removeImage flag:", removeImage);
    console.log("AvatarUpload - local preview:", preview ? "Yes" : "No");
  }, [currentImage, removeImage, preview]);

  // Priority logic for display
  const displayImage = preview || (!removeImage && currentImage ? currentImage : null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompressing(true);
      try {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 500,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(compressedFile);
        onImageChange(compressedFile);
      } catch (error) {
        console.error("Compression error:", error);
        onImageChange(file); // Fallback to original
      } finally {
        setCompressing(false);
      }
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageRemove();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-[rgba(129,166,198,0.1)] border-2 border-dashed border-[rgba(129,166,198,0.3)] flex items-center justify-center cursor-pointer overflow-hidden group hover:border-[#81A6C6] transition-all"
      >
        {displayImage ? (
          <img 
            src={displayImage} 
            alt="Profile Avatar" 
            className={`w-full h-full object-cover animate-in fade-in duration-300 ${compressing ? 'opacity-50 blur-[2px]' : ''}`}
          />
        ) : (
          <div className="animate-in fade-in duration-300">
            <User size={48} className="text-[#81A6C6] opacity-40" />
          </div>
        )}

        {compressing && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[1px]">
            <Loader2 size={32} className="text-[#81A6C6] animate-spin" />
          </div>
        )}

        {!compressing && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={24} className="text-white" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-medium text-[#81A6C6] hover:text-[#6B90B0] transition-colors"
        >
          { displayImage ? 'Change Photo' : 'Upload Photo' }
        </button>
        
        { (preview || (!removeImage && currentImage)) && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
          >
            <Trash2 size={12} />
            Remove
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <p className="text-[10px] text-[#8A8A9A] uppercase tracking-widest text-center max-w-[200px]">
        JPG, PNG or GIF. Max size 2MB.
      </p>
    </div>
  );
};

export default AvatarUpload;
