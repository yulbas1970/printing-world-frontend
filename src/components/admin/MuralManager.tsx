import React, { useState, useRef } from 'react';
import { Palette, Upload, Trash2, Edit, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface MuralManagerProps {
  galleryMurals: {[key: string]: Array<{id: number, projectId: number, imageUrl: string, category: string, title?: string, description?: string}>};
  fetchProjectFiles: () => Promise<void>;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  muralToDelete: number | null;
  setMuralToDelete: (id: number | null) => void;
}

const MuralManager: React.FC<MuralManagerProps> = ({
  galleryMurals,
  fetchProjectFiles,
  showDeleteConfirm,
  setShowDeleteConfirm,
  muralToDelete,
  setMuralToDelete,
}) => {
  const [isGalleryEditMode, setIsGalleryEditMode] = useState(false);
  const [showGalleryUpload, setShowGalleryUpload] = useState(false);
  const [activeGalleryCategory, setActiveGalleryCategory] = useState('salones');
  const [selectedUploadCategory, setSelectedUploadCategory] = useState('salones');
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const galleryCategories = [
    { id: 'salones', name: 'Salones', icon: '🛋️' },
    { id: 'cocinas', name: 'Cocinas', icon: '🍽️' },
    { id: 'infantiles', name: 'Infantiles', icon: '🧸' },
    { id: 'baños', name: 'Baños', icon: '🛁' },
    { id: 'pasillos', name: 'Pasillos', icon: '🚶' },
  ];

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected.');
      return;
    }

    console.log(`Uploading file: ${file.name} to category: ${selectedUploadCategory}`);

    const formData = new FormData();
    console.log(`DEBUG FRONTEND: selectedUploadCategory antes de enviar: ${selectedUploadCategory}`); // ADDED DEBUG LOG
    formData.append('image', file);
    formData.append('category', selectedUploadCategory);
    formData.append('title', 'Nuevo Mural'); 
    formData.append('description', '');

    try {
      const projectId = 1; 
      const response = await fetch(`http://localhost:5000/projects/${projectId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir el fichero.');
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      toast.success('Mural subido con éxito!');
      
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = '';
      }
      setShowGalleryUpload(false);
      await fetchProjectFiles();

    } catch (error) {
      console.error('Error uploading gallery image:', error);
      toast.error(`Error al subir el mural: ${(error as Error).message}`);
    }
  };

  const handleDeleteMural = (muralId: number) => {
    console.log('Delete mural triggered for ID:', muralId);
    setMuralToDelete(muralId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteMural = async () => {
    if (muralToDelete === null) return;

    try {
      const response = await fetch(`http://localhost:5000/images/${muralToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar el mural.');
      }

      toast.success('Mural eliminado con éxito.');
      await fetchProjectFiles();

    } catch (error) {
      console.error('Error deleting mural:', error);
      toast.error(`Error al eliminar el mural: ${(error as Error).message}`);
    } finally {
      setShowDeleteConfirm(false);
      setMuralToDelete(null);
    }
  };

  const cancelDeleteMural = () => {
    setShowDeleteConfirm(false);
    setMuralToDelete(null);
  };

  return (
    <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <h4 className="text-xl font-bold mb-4 flex items-center">
        <Palette className="w-6 h-6 mr-2 text-yellow-400" />
        Gestión de Murales
      </h4>
      
      <div className="space-y-4">
        {/* Category Selection for Viewing/Editing */}
        <select
            value={activeGalleryCategory}
            onChange={(e) => setActiveGalleryCategory(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:border-yellow-400"
        >
            {galleryCategories.map((category) => (
            <option key={category.id} value={category.id}>
                {category.icon} {category.name} ({galleryMurals[category.id]?.length || 0})
            </option>
            ))}
        </select>

        {/* Display Murals for Active Category */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-60 overflow-y-auto">
            {galleryMurals[activeGalleryCategory]?.map((mural) => (
            <div key={mural.id} className="relative group">
                <img src={`http://localhost:5000${mural.imageUrl}`} alt={mural.title || 'Mural'} className="w-full h-24 object-cover rounded-lg" />
                {isGalleryEditMode && (
                <button
                    onClick={() => handleDeleteMural(mural.id)}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar Mural"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
                )}
            </div>
            ))}
            {galleryMurals[activeGalleryCategory]?.length === 0 && (
                <p className="text-gray-400 col-span-full text-center">No hay murales en esta categoría.</p>
            )}
        </div>
        
        <div className="space-y-3">
        <button
            onClick={() => setShowGalleryUpload(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
        >
            <Upload className="w-5 h-5" />
            <span>Agregar Mural</span>
        </button>
        
        <button
            onClick={() => setIsGalleryEditMode(!isGalleryEditMode)}
            className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
            isGalleryEditMode 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
        >
            {isGalleryEditMode ? (
            <>
                <X className="w-5 h-5" />
                <span>Cancelar Edición</span>
            </>
            ) : (
            <>
                <Edit className="w-5 h-5" />
                <span>Editar Murales</span>
            </>
            )}
        </button>
        </div>
      </div>

      {/* Gallery Upload Modal */}
      {showGalleryUpload && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 max-w-md w-full border border-white/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Agregar Mural</h3>
              <button onClick={() => setShowGalleryUpload(false)} className="hover:bg-white/20 p-2 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold">Agregar Mural</h3>
              <p className="text-lg font-semibold">Selecciona la categoría y sube la imagen</p>
            </div>
            <div className="space-y-4">
              {/* Category Selection */}
              <select
                value={selectedUploadCategory}
                onChange={(e) => setSelectedUploadCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              >
                {galleryCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              <button onClick={() => galleryFileInputRef.current?.click()} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Seleccionar Imagen del Mural</span>
              </button>
              <input ref={galleryFileInputRef} type="file" accept="image/*" onChange={handleGalleryUpload} className="hidden" />
              <p className="text-sm text-gray-400 text-center">Formatos soportados: JPG, PNG<br />Tamaño máximo: 10MB</p>
            </div>
          </div>
        </div>
      )}

      {/* Mural Delete Confirmation Modal */}
      {showDeleteConfirm && muralToDelete && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/30">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-white mb-2">Confirmar Eliminación</h3>
              <p className="text-gray-300">¿Estás seguro que quieres eliminar este mural? Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={confirmDeleteMural} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-all">Sí, Eliminar</button>
              <button onClick={cancelDeleteMural} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-semibold transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuralManager;