import { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminLoginForm from '../components/admin/AdminLoginForm';
import MuralManager from '../components/admin/MuralManager';
import VideoManager from '../components/admin/VideoManager';
import BackupSection from '../components/admin/BackupSection';
import CompanySettingsSection from '../components/admin/CompanySettingsSection';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface Mural {
  id: string;
  imageUrl: string;
  category: string;
  title?: string;
  description?: string;
}

interface CategorizedMurals {
  [key: string]: Mural[];
}

interface Video {
  id: string;
  src: string;
  title: string;
  description: string;
}

const AdminPage = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(true);
  const [galleryMurals, setGalleryMurals] = useState<CategorizedMurals>({});
  const [videos, setVideos] = useState<Video[]>([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsAdminMode(false);
    setShowAdminLogin(true);
    navigate('/');
    toast.success('Has cerrado sesión.');
  };

  const fetchProjectFiles = async () => {
    try {
      const q = query(collection(db, 'murals'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const data: Mural[] = snapshot.docs.map((document) => {
        const item = document.data();

        return {
          id: document.id,
          imageUrl: item.imageUrl || item.url || '',
          category: item.category || 'general',
          title: item.title || 'Mural',
          description: item.description || '',
        };
      });

      const categorizedMurals = data.reduce(
        (acc: CategorizedMurals, item: Mural) => {
          if (item.category !== 'video') {
            const category = item.category || 'general';

            if (!acc[category]) {
              acc[category] = [];
            }

            acc[category].push(item);
          }

          return acc;
        },
        {}
      );

      setGalleryMurals(categorizedMurals);

      const videoFiles = data
        .filter((item: Mural) => item.category === 'video')
        .map(
          (video: Mural): Video => ({
            id: video.id,
            src: video.imageUrl,
            title: video.title || 'Video sin título',
            description: video.description || '',
          })
        );

      setVideos(videoFiles);
    } catch (error) {
      console.error('Error fetching project files from Firebase:', error);
      toast.error('No se pudieron cargar los archivos del proyecto.');
    }
  };

  const fetchCompanySettings = async () => {
    return Promise.resolve();
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      setIsAdminMode(true);
      setShowAdminLogin(false);
      fetchProjectFiles();
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAdminMode(true);
    setShowAdminLogin(false);
    fetchProjectFiles();
  };

  if (!isAdminMode) {
    return (
      <AdminLoginForm
        onLoginSuccess={handleLoginSuccess}
        fetchCompanySettings={fetchCompanySettings}
        fetchProjectFiles={fetchProjectFiles}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Volver a la web</span>
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <MuralManager fetchProjectFiles={fetchProjectFiles} />

            <VideoManager
              backendVideos={videos}
              fetchProjectFiles={fetchProjectFiles}
            />

            <Link
              to="/admin/clients"
              className="block bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 hover:border-yellow-400 transition-all duration-200"
            >
              <h4 className="text-xl font-bold mb-2">Gestión de Clientes</h4>
              <p className="text-gray-300">Añade, edita y elimina clientes.</p>
            </Link>

            <Link
              to="/admin/projects"
              className="block bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 hover:border-yellow-400 transition-all duration-200"
            >
              <h4 className="text-xl font-bold mb-2">Gestión de Proyectos</h4>
              <p className="text-gray-300">
                Gestiona los proyectos y sus detalles.
              </p>
            </Link>
          </div>

          <div className="space-y-8">
            <CompanySettingsSection />
            <BackupSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;