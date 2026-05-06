import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CLOUD_NAME = 'dwptjttz8';
const UPLOAD_PRESET = 'mural_upload';

interface GalleryUploadModalProps {
  show: boolean;
  onClose: () => void;
  galleryCategories: Array<{ id: string; name: string; icon: string }>;
  fetchProjectFiles: () => Promise<void>;
}

const GalleryUploadModal: React.FC<GalleryUploadModalProps> = ({
  show,
  onClose,
  galleryCategories,
  fetchProjectFiles
}) => {
  const [selectedUploadCategory, setSelectedUploadCategory] = useState('salones');
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', `murales/${selectedUploadCategory}`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Error al subir imagen a Cloudinary');
      }

      const savedMurals = JSON.parse(localStorage.getItem('printingworld-gallery-murals') || '[]');

      savedMurals.push({
        id: Date.now(),
        imageUrl: data.secure_url,
        cloudinaryPublicId: data.public_id,
        category: selectedUploadCategory,
        title: 'Nuevo Mural',
        description: '',
        createdAt: Date.now()
      });

      localStorage.setItem('printingworld-gallery-murals', JSON.stringify(savedMurals));

      toast.success('Mural subido con éxito');

      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = '';
      }

      onClose();
      await fetchProjectFiles();
    } catch (error) {
      console.error('Error uploading gallery image:', error);
      toast.error(`Error al subir el mural: ${(error as Error).message}`);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 max-w-md w-full border border-white/30">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Agregar Mural</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold">Agregar Mural</h3>
          <p className="text-lg font-semibold">Selecciona la categoría y sube la imagen</p>
        </div>

        <div className="space-y-4">
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

          <button
            onClick={() => galleryFileInputRef.current?.click()}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>Seleccionar Imagen del Mural</span>
          </button>

          <input
            ref={galleryFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleGalleryUpload}
            className="hidden"
          />

          <p className="text-sm text-gray-400 text-center">
            Formatos soportados: JPG, PNG, WEBP
          </p>
        </div>
      </div>
    </div>
  );
};

export default GalleryUploadModal;
