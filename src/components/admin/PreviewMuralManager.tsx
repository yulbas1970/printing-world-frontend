import React, { useEffect, useState } from 'react';
import { Upload, Trash2, Pencil, Save, X } from 'lucide-react';
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
  updateDoc,
} from 'firebase/firestore';

const CLOUD_NAME = 'dwptjttz8';
const UPLOAD_PRESET = 'mural_upload';

interface PreviewMural {
  id: string;
  imageUrl: string;
  title: string;
  createdAt?: unknown;
}

const PreviewMuralManager = () => {
  const [murals, setMurals] = useState<PreviewMural[]>([]);
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const loadPreviewMurals = async () => {
    try {
      const q = query(
        collection(db, 'previewMurals'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);

      const data: PreviewMural[] = snapshot.docs.map((document) => {
        const item = document.data();

        return {
          id: document.id,
          imageUrl: item.imageUrl || '',
          title: item.title || 'Mural para vista previa',
          createdAt: item.createdAt,
        };
      });

      setMurals(data);
    } catch (error) {
      console.error('Error cargando murales de vista previa:', error);
      toast.error('No se pudieron cargar los murales de vista previa.');
    }
  };

  useEffect(() => {
    loadPreviewMurals();
  }, []);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'preview-murals');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Error al subir la imagen a Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      const imageUrl = await uploadToCloudinary(file);

      await addDoc(collection(db, 'previewMurals'), {
        imageUrl,
        title: newTitle.trim() || 'Mural para vista previa',
        createdAt: serverTimestamp(),
      });

      setNewTitle('');
      toast.success('Mural para vista previa subido correctamente.');
      await loadPreviewMurals();
    } catch (error) {
      console.error('Error subiendo mural de vista previa:', error);
      toast.error('No se pudo subir el mural de vista previa.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const startEditing = (mural: PreviewMural) => {
    setEditingId(mural.id);
    setEditingTitle(mural.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const saveTitle = async (id: string) => {
    const cleanTitle = editingTitle.trim();

    if (!cleanTitle) {
      toast.error('El título no puede estar vacío.');
      return;
    }

    try {
      await updateDoc(doc(db, 'previewMurals', id), {
        title: cleanTitle,
      });

      toast.success('Título actualizado correctamente.');
      setEditingId(null);
      setEditingTitle('');
      await loadPreviewMurals();
    } catch (error) {
      console.error('Error actualizando título:', error);
      toast.error('No se pudo actualizar el título.');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      '¿Seguro que quieres eliminar este mural de vista previa?'
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'previewMurals', id));
      toast.success('Mural eliminado correctamente.');
      await loadPreviewMurals();
    } catch (error) {
      console.error('Error eliminando mural de vista previa:', error);
      toast.error('No se pudo eliminar el mural.');
    }
  };

  return (
    <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
      <h2 className="text-2xl font-bold text-white mb-2">
        Murales para Vista Previa
      </h2>

      <p className="text-gray-300 mb-6">
        Aquí subiremos los murales limpios que los clientes podrán probar en su
        espacio.
      </p>

      <input
        type="text"
        placeholder="Título del nuevo mural"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-800 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
      />

      <label className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-4 rounded-xl cursor-pointer transition-colors mb-6">
        <Upload className="w-5 h-5" />
        {uploading ? 'Subiendo...' : 'Subir mural para simulador'}

        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {murals.length === 0 ? (
        <p className="text-gray-400 text-sm">
          Todavía no hay murales para vista previa.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {murals.map((mural) => (
            <div
              key={mural.id}
              className="relative bg-black/30 rounded-xl overflow-hidden border border-white/20"
            >
              <img
                src={mural.imageUrl}
                alt={mural.title}
                className="w-full h-28 object-cover"
              />

              <button
                onClick={() => handleDelete(mural.id)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                title="Eliminar mural"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="p-2">
                {editingId === mural.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="w-full px-2 py-2 rounded bg-gray-800 border border-white/20 text-white text-xs"
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => saveTitle(mural.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded flex items-center justify-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        Guardar
                      </button>

                      <button
                        onClick={cancelEditing}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs py-2 rounded flex items-center justify-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-300 truncate">
                      {mural.title}
                    </p>

                    <button
                      onClick={() => startEditing(mural)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded"
                      title="Editar título"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PreviewMuralManager;