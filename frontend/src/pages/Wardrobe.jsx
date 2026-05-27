import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteItem } from '../store/slices/wardrobeSlice';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import WardrobeGrid from '../components/WardrobeGrid';
import AddItemModal from '../components/AddItemModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import toast from 'react-hot-toast';

const Wardrobe = () => {
  const dispatch = useDispatch();
  const { itemCount } = useSelector((state) => state.wardrobe);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const handleItemAdded = () => {
    setSelectedItem(null);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    setIsDeleteLoading(true);
    const actionResult = await dispatch(deleteItem(selectedItem._id));
    if (deleteItem.fulfilled.match(actionResult)) {
      toast.success('Item deleted successfully');
    } else {
      toast.error('Failed to delete item');
    }
    setIsDeleteLoading(false);
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F0E8] font-['Inter'] text-[#3D3D4E]">
      {/* Inject Google Fonts */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
          }
          
          h1, h2, h3, .font-playfair {
            font-family: 'Playfair Display', serif;
          }
        `}
      </style>

      {/* Sidebar - Fixed width */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* Topbar - Sticky */}
        <Topbar 
          itemCount={itemCount} 
          onMenuClick={() => setIsSidebarOpen(true)} 
          onAddClick={handleAddClick}
        />

        {/* Dynamic Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <WardrobeGrid 
            onAddClick={handleAddClick}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </main>

        {/* Add Item Modal */}
        <AddItemModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }} 
          onItemAdded={handleItemAdded}
          editItem={selectedItem}
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
          }}
          onConfirm={confirmDelete}
          loading={isDeleteLoading}
          title="Delete Wardrobe Item?"
          message={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
        />
      </div>
    </div>
  );
};

export default Wardrobe;