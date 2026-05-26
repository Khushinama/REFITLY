import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addItem, updateItem, addOptimisticItem } from '../store/slices/wardrobeSlice';
import { X, Upload, Check, AlertCircle, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

const AddItemModal = ({ isOpen, onClose, onItemAdded, editItem = null }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Top',
    event: [],
    season: 'All',
    color: 'Auto-Detect',
    fit: 'Fitted',
    pattern: 'Solid',
    styleTags: ''
  });
  const [detectedColor, setDetectedColor] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    if (editItem && isOpen) {
      const reverseCategoryMapping = {
        'top': 'Top',
        'bottom': 'Bottom',
        'footwear': 'Footwear',
        'accessory': 'Accessory',
        'dress': 'Dress',
        'layer': 'Outerwear'
      };

      setFormData({
        name: editItem.name || '',
        category: reverseCategoryMapping[editItem.category] || editItem.category || 'Top',
        event: Array.isArray(editItem.event) ? editItem.event : (editItem.event ? [editItem.event] : []),
        season: editItem.season || 'All',
        color: editItem.color || 'Auto-Detect',
        fit: editItem.fit || 'Fitted',
        pattern: editItem.pattern || 'Solid',
        styleTags: Array.isArray(editItem.styleTags) ? editItem.styleTags.join(', ') : ''
      });
      setImagePreview(editItem.image || null);
      setDetectedColor(null);
    } else if (!isOpen) {
      // Reset when closed
      setFormData({
        name: '',
        category: 'Top',
        event: [],
        season: 'All',
        color: 'Auto-Detect',
        fit: 'Fitted',
        pattern: 'Solid',
        styleTags: ''
      });
      setImage(null);
      setImagePreview(null);
      setDetectedColor(null);
      setError('');
      setSuccess(false);
    }
  }, [editItem, isOpen]);

  const categories = ['Top', 'Bottom', 'Footwear', 'Accessory', 'Dress', 'Outerwear'];
  const events = ['Casual', 'Party', 'Formal', 'Sports', 'Ethnic'];
  const seasons = ['Summer', 'Winter', 'All'];
  const colors = ['Auto-Detect', 'White', 'Black', 'Navy', 'Grey', 'Beige', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple'];
  const fits = ['Loose', 'Fitted', 'Oversized', 'Slim', 'Regular'];
  const patterns = ['Solid', 'Printed', 'Striped', 'Checkered', 'Floral'];

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEventToggle = (ev) => {
    setFormData(prev => {
      const currentEvents = [...prev.event];
      if (currentEvents.includes(ev)) {
        return { ...prev, event: currentEvents.filter(e => e !== ev) };
      } else {
        return { ...prev, event: [...currentEvents, ev] };
      }
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setError('Please upload a valid image (JPG or PNG)');
        return;
      }
      setImage(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error('Compression error:', error);
      return file;
    }
  };

  const extractColorFromImage = async (previewUrl) => {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const size = 50; // Resize for speed
          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, 0, 0, size, size);
          
          const data = ctx.getImageData(0, 0, size, size).data;
          let r = 0, g = 0, b = 0;
          let count = 0;
          
          // Sample every 4th pixel for even more speed
          for (let i = 0; i < data.length; i += 16) {
            r += data[i];
            g += data[i+1];
            b += data[i+2];
            count++;
          }
          
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          
          const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
          resolve({ hex });
        };
        img.onerror = () => resolve(null);
        img.src = previewUrl;
      } catch (err) {
        console.error('Color extraction failed:', err);
        resolve(null);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image && !editItem) {
      setError('Please upload an image of the item');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Parallel Processing: Compression + Color Detection
      let finalImage = image;
      let detectedColorHex = null;

      const tasks = [];
      
      if (image && !editItem) {
        // Only compress and detect color for new uploads
        tasks.push(
          compressImage(image).then(compressed => {
            finalImage = compressed;
          })
        );
        
        if (formData.color === 'Auto-Detect') {
          tasks.push(
            extractColorFromImage(imagePreview).then(colorData => {
              if (colorData) detectedColorHex = colorData.hex;
            })
          );
        }
      }

      await Promise.all(tasks);

      // Map UI categories to normalized internal categories
      const categoryMapping = {
        'Top': 'top',
        'Bottom': 'bottom',
        'Footwear': 'footwear',
        'Accessory': 'accessory',
        'Dress': 'dress',
        'Outerwear': 'layer'
      };

      const normalizedCategory = categoryMapping[formData.category] || formData.category.toLowerCase();

      // 2. Optimistic UI Update
      if (!editItem) {
        const optimisticId = 'temp-' + Date.now();
        dispatch(addOptimisticItem({
          _id: optimisticId,
          name: formData.name,
          category: normalizedCategory,
          image: imagePreview, // Use local preview immediately
          color: formData.color === 'Auto-Detect' ? 'Detecting...' : formData.color,
          isOptimistic: true,
          season: formData.season,
          event: formData.event
        }));
      }

      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', normalizedCategory);
      data.append('event', formData.event.join(','));
      data.append('season', formData.season);
      data.append('color', formData.color);
      data.append('fit', formData.fit);
      data.append('pattern', formData.pattern);
      data.append('styleTags', formData.styleTags);
      
      if (detectedColorHex) {
        data.append('detectedColorHex', detectedColorHex);
      }
      
      if (finalImage) {
        data.append('image', finalImage);
      }

      let resultAction;
      if (editItem) {
        resultAction = await dispatch(updateItem({ id: editItem._id, formData: data }));
      } else {
        resultAction = await dispatch(addItem(data));
      }

      if (addItem.fulfilled.match(resultAction) || updateItem.fulfilled.match(resultAction)) {
        setSuccess(true);
        if (resultAction.payload.detectedColor) {
          setDetectedColor(resultAction.payload.detectedColor);
        }
        setTimeout(() => {
          onItemAdded();
          handleClose();
        }, 2000);
      } else {
        setError(resultAction.payload || `Failed to ${editItem ? 'update' : 'add'} item.`);
      }
    } catch (err) {
      setError(`An unexpected error occurred. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      category: 'Top',
      event: [],
      season: 'All',
      color: 'Auto-Detect',
      fit: 'Fitted',
      pattern: 'Solid',
      styleTags: ''
    });
    setImage(null);
    setImagePreview(null);
    setDetectedColor(null);
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1A1A2E]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 ease-out flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 border-b border-[rgba(180,165,148,0.2)] flex justify-between items-center bg-[#FDFBF8] flex-shrink-0">
          <h3 className="font-['Playfair_Display'] text-lg sm:text-xl text-[#1A1A2E]">
            {editItem ? 'Edit Item' : 'Add New Item'}
          </h3>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-[rgba(129,166,198,0.1)] rounded-full transition-colors text-[#8A8A9A]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5">
            {/* Image Upload Area */}
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-[#8A8A9A] font-medium">Item Image</label>
            <div 
              onClick={() => !imagePreview && fileInputRef.current.click()}
              className={`relative h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden
                ${imagePreview ? 'border-transparent' : 'border-[rgba(180,165,148,0.4)] hover:border-[#81A6C6] hover:bg-[rgba(129,166,198,0.03)]'}
              `}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                      className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs rounded-full hover:bg-white/30 transition-all font-medium"
                    >
                      Replace
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                      className="px-4 py-2 bg-red-500/20 backdrop-blur-md border border-red-500/30 text-white text-xs rounded-full hover:bg-red-500/30 transition-all font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-[rgba(129,166,198,0.08)] rounded-full flex items-center justify-center mb-3 mx-auto">
                    <Upload size={24} className="text-[#81A6C6]" />
                  </div>
                  <p className="text-sm text-[#1A1A2E] font-medium">Click to upload image</p>
                  <p className="text-xs text-[#8A8A9A] mt-1">Supports JPG and PNG</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] tracking-widest uppercase text-[#8A8A9A] font-medium">Item Name</label>
              <input 
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Classic White Linen Shirt"
                required
                className="w-full px-4 py-2.5 bg-[#FDFBF8] border border-[rgba(180,165,148,0.3)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#81A6C6]/20 focus:border-[#81A6C6] transition-all"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[10px] tracking-widest uppercase text-[#8A8A9A] font-medium">Category</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-[#FDFBF8] border border-[rgba(180,165,148,0.3)] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#81A6C6] cursor-pointer"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              {formData.category === 'Outerwear' && (
                <p className="text-[9px] text-[#81A6C6] mt-1 font-medium italic animate-in fade-in slide-in-from-top-1">
                  Tip: Add tags like jacket, blazer, hoodie for better styling ✨
                </p>
              )}
            </div>

            {/* Color */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] tracking-widest uppercase text-[#8A8A9A] font-medium">Color</label>
                {formData.color === 'Auto-Detect' && (
                  <span className="text-[8px] text-[#81A6C6] italic font-semibold">(auto-detect active)</span>
                )}
              </div>
              <select 
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 bg-[#FDFBF8] border rounded-xl text-sm focus:outline-none transition-all cursor-pointer ${
                  formData.color === 'Auto-Detect' 
                  ? 'border-[#81A6C6] ring-1 ring-[#81A6C6]/20' 
                  : 'border-[rgba(180,165,148,0.3)] focus:ring-1 focus:ring-[#81A6C6]'
                }`}
              >
                {colors.map(col => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>

            {/* Event (Multi-select) */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] tracking-widest uppercase text-[#8A8A9A] font-medium">Event (Select multiple)</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {events.map(ev => (
                  <button
                    key={ev}
                    type="button"
                    onClick={() => handleEventToggle(ev)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
                      formData.event.includes(ev)
                        ? 'bg-[#81A6C6] text-white border-[#81A6C6]'
                        : 'bg-[#FDFBF8] text-[#3D3D4E] border-[rgba(180,165,148,0.3)] hover:border-[#81A6C6]'
                    }`}
                  >
                    {ev}
                  </button>
                ))}
              </div>
            </div>

            {/* Fit */}
            <div className="space-y-1.5">
              <label className="text-[10px] tracking-widest uppercase text-[#8A8A9A] font-medium">Fit</label>
              <select 
                name="fit"
                value={formData.fit}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-[#FDFBF8] border border-[rgba(180,165,148,0.3)] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#81A6C6] cursor-pointer"
              >
                {fits.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Pattern */}
            <div className="space-y-1.5">
              <label className="text-[10px] tracking-widest uppercase text-[#8A8A9A] font-medium">Pattern</label>
              <select 
                name="pattern"
                value={formData.pattern}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-[#FDFBF8] border border-[rgba(180,165,148,0.3)] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#81A6C6] cursor-pointer"
              >
                {patterns.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Style Tags */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] tracking-widest uppercase text-[#8A8A9A] font-medium">Style Tags (comma separated)</label>
              <input 
                type="text"
                name="styleTags"
                value={formData.styleTags}
                onChange={handleInputChange}
                placeholder="e.g. Vintage, Sustainable, Oversized"
                className="w-full px-4 py-2.5 bg-[#FDFBF8] border border-[rgba(180,165,148,0.3)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#81A6C6]/20 focus:border-[#81A6C6] transition-all"
              />
            </div>

            {/* Season */}
            <div className="space-y-1.5">
              <label className="text-[10px] tracking-widest uppercase text-[#8A8A9A] font-medium">Season</label>
              <select 
                name="season"
                value={formData.season}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-[#FDFBF8] border border-[rgba(180,165,148,0.3)] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#81A6C6] cursor-pointer"
              >
                {seasons.map(ss => <option key={ss} value={ss}>{ss}</option>)}
              </select>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex flex-col gap-1 px-4 py-3 bg-green-50 border border-green-100 text-green-600 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <Check size={16} />
                <span className="font-medium">Item {editItem ? 'updated' : 'added'} successfully!</span>
              </div>
              {detectedColor && (
                <p className="ml-6 text-[10px] text-green-500/80 italic">
                  Detected Color: {detectedColor} ✨
                </p>
              )}
            </div>
          )}

            {/* Submit */}
            <button 
              type="submit"
              disabled={loading || success}
              className={`w-full py-3.5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-300 shadow-lg
                ${success 
                  ? 'bg-green-500 text-white cursor-default' 
                  : 'bg-[#81A6C6] hover:bg-[#6B90B0] text-white active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-[0_8px_24px_rgba(129,166,198,0.3)]'}
              `}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : success ? (
                <>
                  <Check size={20} />
                  <span>{editItem ? 'Updated Successfully' : 'Added Successfully'}</span>
                </>
              ) : (
                <span>{editItem ? 'Save Changes' : 'Add to Wardrobe'}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
