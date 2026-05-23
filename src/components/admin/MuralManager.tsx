import React, { useEffect, useRef, useState } from 'react';
import { Palette, Upload, Trash2, Edit, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../../services/firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { Mural } from '../../utils/loadMurals';

const CLOUD_NAME = 'dwptjttz8';
const UPLOAD_PRESET = 'mural_upload';

interface MuralManagerProps {
  fetchProjectFiles?: () => Promise<void>;
}

const MuralManager: React.FC<MuralManagerProps> = ({ fetchProjectFiles }) => {
  const [murals, setMurals] = useState<Mural[]>([]);
  const [isGalleryEditMode, setIsGalleryEditMode] = useState(false);
  const [showGalleryUpload, setShowGalleryUpload] = useState(false);
  const [activeGalleryCategory, setActiveGalleryCategory] = useState('salones');
  const [selectedUploadCategory, setSelectedUploadCategory] = useState('salones');
  const [muralToDelete, setMuralToDelete] = useState<Mural | null>(null);

  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const galleryCategories = [
    { id: 'salones', name: 'Salones', icon: '🛋️' },
    { id: 'cocinas', name: 'Cocinas', icon: '🍽️' },
    { id: 'dormitorios', name: 'Dormitorios', icon: '🛏️' },
    { id: 'infantiles', name: 'Infantiles', icon: '🧸' },
    { id: 'banos', name: 'Baños', icon: '🛁' },
    { id: 'pasillos', name: 'Pasillos', icon: '🚶' },
    { id: 'general', name: 'General', icon: '🌐' },
  ];

  const refreshMurals = async () => {
    try {
      const q = query(collection(db, 'murals'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const loadedMurals = snapshot.docs.map((document) => {
        const data = document.data();

        return {
          id: document.id,
          title: data.title || 'Mural',
          description: data.description || '',
          imageUrl: data.imageUrl || data.url || '',
          category: data.category || 'general',
          publicId: data.publicId || '',
        } as Mural;
      });

      setMurals(loadedMurals);

      if (fetchProjectFiles) {
        await fetchProjectFiles();
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar los murales');
    }
  };

  useEffect(() => {
    refreshMurals();
  }, []);

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', `murales/${selectedUploadCategory}`);

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const cloudinaryData = await cloudinaryResponse.json();

      if (!cloudinaryResponse.ok) {
        throw new Error(
          cloudinaryData?.error?.message || 'Error al subir imagen a Cloudinary'
        );
      }

      await addDoc(collection(db, 'murals'), {
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: '',
        imageUrl: cloudinaryData.secure_url,
        publicId: cloudinaryData.public_id,
        category: selectedUploadCategory,
        createdAt: serverTimestamp(),
      });

      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = '';
      }

      setShowGalleryUpload(false);
      await refreshMurals();

      toast.success('Mural subido correctamente 🚀');
    } catch (error) {
      console.error(error);
      toast.error(`Error al subir el mural: ${(error as Error).message}`);
    }
  };

  const confirmDeleteMural = async () => {
    if (!muralToDelete?.id) return;

    try {
      await deleteDoc(doc(db, 'murals', muralToDelete.id));

      toast.success('Mural eliminado de la galería');
      setMuralToDelete(null);
      await refreshMurals();
    } catch (error) {
      console.error(error);
      toast.error(`Error al eliminar el mural: ${(error as Error).message}`);
    }
  };

  const currentMurals = murals.filter(
    (mural) => mural.category === activeGalleryCategory
  );

  return (
    <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <h4 className="text-xl font-bold mb-4 flex items-center">
        <Palette className="w-6 h-6 mr-2 text-yellow-400" />
        Gestión de Murales
      </h4>

      <div className="space-y-4">
        <select
          value={activeGalleryCategory}
          onChange={(e) => setActiveGalleryCategory(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:border-yellow-400"
        >
          {galleryCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name} (
              {murals.filter((m) => m.category === category.id).length})
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-60 overflow-y-auto">
          {currentMurals.map((mural) => (
            <div key={mural.id} className="relative group">
              <img
                src={mural.imageUrl}
                alt={mural.title || 'Mural'}
                className="w-full h-24 object-cover rounded-lg"
              />

              {isGalleryEditMode && (
                <button
                  onClick={() => setMuralToDelete(mural)}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar Mural"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {currentMurals.length === 0 && (
            <p className="text-gray-400 col-span-full text-center">
              No hay murales en esta categoría.
            </p>
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

      {showGalleryUpload && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 max-w-md w-full border border-white/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Agregar Mural</h3>
              <button
                onClick={() => setShowGalleryUpload(false)}
                className="hover:bg-white/20 p-2 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
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
      )}

      {muralToDelete && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/30">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Confirmar Eliminación
              </h3>
              <p className="text-gray-300">
                ¿Estás seguro que quieres eliminar este mural?
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={confirmDeleteMural}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-all"
              >
                Sí, Eliminar
              </button>

              <button
                onClick={() => setMuralToDelete(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-semibold transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuralManager;