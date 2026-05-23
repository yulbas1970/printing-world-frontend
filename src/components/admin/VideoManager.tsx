import React, { useRef, useState } from 'react';
import { Play, Upload, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../../services/firebase';
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

const CLOUD_NAME = 'dwptjttz8';
const UPLOAD_PRESET = 'mural_upload';

interface VideoManagerProps {
  backendVideos: Array<{
    id: string;
    src: string;
    title: string;
    description: string;
  }>;
  fetchProjectFiles: () => Promise<void>;
}

const VideoManager: React.FC<VideoManagerProps> = ({
  backendVideos,
  fetchProjectFiles,
}) => {
  const [showVideoManager, setShowVideoManager] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [showVideoDeleteConfirm, setShowVideoDeleteConfirm] = useState(false);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const toastId = toast.loading('Subiendo video...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'videos');

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!cloudinaryResponse.ok) {
        throw new Error('Cloudinary no pudo subir el video.');
      }

      const cloudinaryData = await cloudinaryResponse.json();

      await addDoc(collection(db, 'murals'), {
        imageUrl: cloudinaryData.secure_url,
        title: file.name,
        description: '',
        category: 'video',
        mimeType: file.type || 'video/mp4',
        resourceType: 'video',
        createdAt: serverTimestamp(),
      });

      toast.success('Video subido con éxito.', { id: toastId });

      if (videoFileInputRef.current) {
        videoFileInputRef.current.value = '';
      }

      await fetchProjectFiles();
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error(`Error al subir el video: ${(error as Error).message}`, {
        id: toastId,
      });
    }
  };

  const handleDeleteVideo = (videoId: string) => {
    setVideoToDelete(videoId);
    setShowVideoDeleteConfirm(true);
  };

  const confirmDeleteVideo = async () => {
    if (!videoToDelete) return;

    const toastId = toast.loading('Eliminando video...');

    try {
      await deleteDoc(doc(db, 'murals', videoToDelete));

      toast.success('Video eliminado con éxito.', { id: toastId });

      await fetchProjectFiles();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error(`Error al eliminar el video: ${(error as Error).message}`, {
        id: toastId,
      });
    } finally {
      setShowVideoDeleteConfirm(false);
      setVideoToDelete(null);
    }
  };

  const cancelDeleteVideo = () => {
    setShowVideoDeleteConfirm(false);
    setVideoToDelete(null);
  };

  return (
    <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <h4 className="text-xl font-bold mb-4 flex items-center">
        <Play className="w-6 h-6 mr-2 text-yellow-400" />
        Gestión de Videos
      </h4>

      <div className="space-y-4">
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">📹 Videos Totales</span>
            <span className="text-lg bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded font-bold">
              {backendVideos.length}
            </span>
          </div>
        </div>

        {backendVideos.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {backendVideos.map((video) => (
              <div
                key={video.id}
                className="flex items-center justify-between bg-white/10 rounded p-2"
              >
                <span className="text-xs text-gray-300 truncate flex-1">
                  {video.title}
                </span>
                <button
                  onClick={() => handleDeleteVideo(video.id)}
                  className="bg-red-500 hover:bg-red-600 p-1 rounded ml-2"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => videoFileInputRef.current?.click()}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
        >
          <Upload className="w-5 h-5" />
          <span>Subir Video</span>
        </button>

        <input
          type="file"
          ref={videoFileInputRef}
          onChange={handleVideoUpload}
          className="hidden"
          accept="video/*"
        />
      </div>

      {showVideoManager && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full border border-white/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">
                Gestionar Videos de Demostración
              </h3>
              <button
                onClick={() => setShowVideoManager(false)}
                className="hover:bg-white/20 p-2 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showVideoDeleteConfirm && videoToDelete !== null && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[400] flex items-center justify-center p-4">
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/30">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🗑️</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Eliminar Video
              </h3>
              <p className="text-gray-300">
                ¿Estás seguro que quieres eliminar este video de demostración?
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={confirmDeleteVideo}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-all"
              >
                Sí, Eliminar
              </button>

              <button
                onClick={cancelDeleteVideo}
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

export default VideoManager;