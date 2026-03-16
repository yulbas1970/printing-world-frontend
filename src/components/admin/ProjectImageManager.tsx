import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { X, Upload, Trash2, Image as ImageIcon } from 'lucide-react'; // Renamed Image to ImageIcon to avoid conflict

export interface ProjectImage {
  id: number;
  projectId: number;
  imageUrl: string;
  category: string;
  title?: string;
  description?: string;
  mimeType?: string;
}

interface ProjectImageManagerProps {
  projectId: number;
  onClose: () => void;
}

const ProjectImageManager: React.FC<ProjectImageManagerProps> = ({ projectId, onClose }) => {
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('general'); // Default category
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageCategories = [
    { id: 'general', name: 'General' },
    { id: 'salones', name: 'Salones' },
    { id: 'cocinas', name: 'Cocinas' },
    { id: 'infantiles', name: 'Infantiles' },
    { id: 'baños', name: 'Baños' },
    { id: 'pasillos', name: 'Pasillos' },
    { id: 'otros', name: 'Otros' },
  ];

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/projects/${projectId}/images`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar imágenes del proyecto.');
      }

      const data: ProjectImage[] = await response.json();
      setImages(data);
    } catch (err) {
      console.error('Error fetching project images:', err);
      setError((err as Error).message);
      toast.error(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [projectId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Por favor, selecciona un fichero para subir.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('category', uploadCategory);
    formData.append('title', uploadTitle || selectedFile.name);
    formData.append('description', uploadDescription || '');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/projects/${projectId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data' // Do NOT set Content-Type for FormData, browser does it
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir la imagen.');
      }

      toast.success('Imagen subida con éxito.');
      setSelectedFile(null);
      setUploadTitle('');
      setUploadDescription('');
      if (fileInputRef.current) fileInputRef.current.value = ''; // Clear file input
      fetchImages(); // Refresh image list
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error(`Error al subir la imagen: ${(err as Error).message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImageClick = (imageId: number) => {
    setImageToDelete(imageId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteImage = async () => {
    if (imageToDelete === null) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/images/${imageToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar la imagen.');
      }

      toast.success('Imagen eliminada con éxito.');
      fetchImages(); // Refresh the list
    } catch (err) {
      console.error('Error deleting image:', err);
      toast.error(`Error al eliminar la imagen: ${(err as Error).message}`);
    } finally {
      setShowDeleteConfirm(false);
      setImageToDelete(null);
    }
  };

  const cancelDeleteImage = () => {
    setShowDeleteConfirm(false);
    setImageToDelete(null);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
      <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 max-w-2xl w-full border border-white/30 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Gestionar Imágenes del Proyecto {projectId}</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Image Upload Form */}
        <form onSubmit={handleUploadImage} className="space-y-4 mb-8 p-4 border border-white/20 rounded-lg">
          <h4 className="text-xl font-bold">Subir Nueva Imagen</h4>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Categoría</label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              disabled={isUploading}
            >
              {imageCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Título (opcional)</label>
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="Título de la imagen"
              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              disabled={isUploading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Descripción (opcional)</label>
            <textarea
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="Descripción de la imagen"
              rows={2}
              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 resize-none"
              disabled={isUploading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Seleccionar Fichero</label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-white bg-white/10 border border-white/30 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
              disabled={isUploading}
            />
          </div>
          <button
            type="submit"
            disabled={isUploading || !selectedFile}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-5 h-5" />
            <span>{isUploading ? 'Subiendo...' : 'Subir Imagen'}</span>
          </button>
        </form>

        {/* Existing Images Display */}
        <h4 className="text-xl font-bold mb-4">Imágenes Existentes</h4>
        {loading ? (
          <div className="text-center text-white py-4">Cargando imágenes...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">Error: {error}</div>
        ) : images.length === 0 ? (
          <div className="text-center text-gray-400 py-4">No hay imágenes para este proyecto.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group border border-white/20 rounded-lg overflow-hidden">
                <img src={`http://localhost:5000${image.imageUrl}`} alt={image.title || 'Imagen de proyecto'} className="w-full h-32 object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDeleteImageClick(image.id)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
                    title="Eliminar Imagen"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">{image.title || 'Sin título'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && imageToDelete && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/30">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-white mb-2">Confirmar Eliminación</h3>
                <p className="text-gray-300">¿Estás seguro que quieres eliminar esta imagen? Esta acción no se puede deshacer.</p>
              </div>
              <div className="flex space-x-3">
                <button onClick={confirmDeleteImage} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-all">Sí, Eliminar</button>
                <button onClick={cancelDeleteImage} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-semibold transition-all">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectImageManager;