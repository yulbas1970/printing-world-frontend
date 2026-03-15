import React, { useState, useRef } from 'react';
import { Play, Upload, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface VideoManagerProps {
  backendVideos: Array<{id: number, src: string, title: string, description: string}>;
  fetchProjectFiles: () => Promise<void>;
}

const VideoManager: React.FC<VideoManagerProps> = ({ backendVideos, fetchProjectFiles }) => {
  const [showVideoManager, setShowVideoManager] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<number | null>(null);
  const [showVideoDeleteConfirm, setShowVideoDeleteConfirm] = useState(false);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected for video upload.');
      return;
    }

    console.log(`Uploading video: ${file.name}`);

    const formData = new FormData();
    formData.append('image', file); // The backend expects the file under the 'image' key
    formData.append('category', 'video');
    formData.append('title', file.name); // Use filename as a default title
    formData.append('description', '');

    try {
      const projectId = 1; // Hardcoding to general project ID
      const response = await fetch(`http://localhost:5000/projects/${projectId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir el video.');
      }

      const result = await response.json();
      console.log('Video upload successful:', result);
      toast.success('Video subido con éxito!');

      if (videoFileInputRef.current) {
        videoFileInputRef.current.value = '';
      }
      
      await fetchProjectFiles(); // Refresh file list

    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error(`Error al subir el video: ${(error as Error).message}`);
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    console.log('Delete video triggered for ID:', videoId);
    setVideoToDelete(videoId);
    setShowVideoDeleteConfirm(true);
  };

  const confirmDeleteVideo = async () => {
    if (videoToDelete === null) return;

    try {
      const response = await fetch(`http://localhost:5000/images/${videoToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar el video.');
      }

      toast.success('Video eliminado con éxito.');
      await fetchProjectFiles(); // Refresh the list

    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error(`Error al eliminar el video: ${(error as Error).message}`);
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
              <div key={video.id} className="flex items-center justify-between bg-white/10 rounded p-2">
                <span className="text-xs text-gray-300 truncate flex-1">{video.title}</span>
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
        <input type="file" ref={videoFileInputRef} onChange={handleVideoUpload} className="hidden" accept="video/*" />
      </div>

      {/* Video Manager Modal */}
      {showVideoManager && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full border border-white/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Gestionar Videos de Demostración</h3>
              <button onClick={() => setShowVideoManager(false)} className="hover:bg-white/20 p-2 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <div className="mb-8 p-6 bg-white/10 rounded-lg">
              <h4 className="text-lg font-semibold mb-4 flex items-center"><Upload className="w-5 h-5 mr-2" />Agregar Nuevo Video</h4>
              <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" id="video-upload" />
              <label htmlFor="video-upload" className="block w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold cursor-pointer text-center transition-all">Seleccionar Video</label>
              <p className="text-sm text-gray-400 mt-2 text-center">Formatos: MP4, MOV, AVI • Tamaño máximo: 50MB</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center"><Play className="w-5 h-5 mr-2" />Videos Actuales ({backendVideos.length})</h4>
              {backendVideos.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {backendVideos.map((video) => (
                    <div key={video.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                      <div className="flex-1">
                        <h5 className="font-semibold text-white">{video.title}</h5>
                        <p className="text-sm text-gray-400">{video.description}</p>
                      </div>
                      <button onClick={() => handleDeleteVideo(video.id)} className="bg-red-500 hover:bg-red-600 p-2 rounded-full ml-4 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400"><Play className="w-12 h-12 mx-auto mb-2 opacity-50" /><p>No hay videos agregados</p></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Delete Confirmation Modal */}
      {showVideoDeleteConfirm && videoToDelete !== null && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[400] flex items-center justify-center p-4">
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/30">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🗑️</div>
              <h3 className="text-2xl font-bold text-white mb-2">Eliminar Video</h3>
              <p className="text-gray-300">¿Estás seguro que quieres eliminar este video de demostración?</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={confirmDeleteVideo} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-all">Sí, Eliminar</button>
              <button onClick={cancelDeleteVideo} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-semibold transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoManager;
