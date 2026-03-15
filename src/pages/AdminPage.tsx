import { useState, useEffect } from 'react';
import { 
  Home
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminLoginForm from '../components/admin/AdminLoginForm';
import MuralManager from '../components/admin/MuralManager';
import VideoManager from '../components/admin/VideoManager';
import BackupSection from '../components/admin/BackupSection';
import CompanySettingsSection from '../components/admin/CompanySettingsSection';

// Define types for our data structures
interface Mural {
  id: number;
  projectId: number;
  imageUrl: string;
  category: string;
  title?: string;
  description?: string;
}

interface CategorizedMurals {
  [key: string]: Mural[];
}

interface Video {
  id: number;
  src: string;
  title: string;
  description: string;
}

const AdminPage = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(true);
  
  // State for data management
  const [galleryMurals, setGalleryMurals] = useState<CategorizedMurals>({});
  const [videos, setVideos] = useState<Video[]>([]);
  
  // State for modals
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [muralToDelete, setMuralToDelete] = useState<number | null>(null);
  
  const navigate = useNavigate();

  const fetchProjectFiles = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error("Authentication token not found.");
      }
      
      const response = await fetch('http://localhost:5000/projects/1/images', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project files');
      }
      
      const data: Mural[] = await response.json();

      // Process murals
      const categorizedMurals = data.reduce((acc: CategorizedMurals, item: Mural) => {
        if (item.category !== 'video') {
          const category = item.category || 'uncategorized';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(item);
        }
        return acc;
      }, {});
      setGalleryMurals(categorizedMurals);

      // Process videos
      const videoFiles = data
        .filter((item: Mural) => item.category === 'video')
        .map((video: Mural): Video => ({
            id: video.id,
            src: video.imageUrl, // Map imageUrl to src
            title: video.title || 'Video sin título',
            description: video.description || ''
        }));
      setVideos(videoFiles);

    } catch (error) {
      console.error('Error fetching project files:', error);
      toast.error('No se pudieron cargar los archivos del proyecto.');
      // If token is invalid, force logout
      if (error instanceof Error && error.message.includes("token")) {
        handleLogout();
      }
    }
  };

  const fetchCompanySettings = async () => {
    // This function is passed to CompanySettingsSection.
    // The component itself handles fetching, but we can provide a refresh mechanism if needed.
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

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsAdminMode(false);
    setShowAdminLogin(true);
    navigate('/');
    toast.success('Has cerrado sesión.');
  };

  if (!isAdminMode) {
    return <AdminLoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <Home className="w-5 h-5" />
              <span>Volver a la web</span>
            </Link>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <MuralManager
              galleryMurals={galleryMurals}
              fetchProjectFiles={fetchProjectFiles}
              showDeleteConfirm={showDeleteConfirm}
              setShowDeleteConfirm={setShowDeleteConfirm}
              muralToDelete={muralToDelete}
              setMuralToDelete={setMuralToDelete}
            />
            <VideoManager
              backendVideos={videos}
              fetchProjectFiles={fetchProjectFiles}
            />
            {/* New Client Management Link */}
            <Link to="/admin/clients" className="block bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 hover:border-yellow-400 transition-all duration-200">
              <h4 className="text-xl font-bold mb-2">Gestión de Clientes</h4>
              <p className="text-gray-300">Añade, edita y elimina clientes.</p>
            </Link>
            {/* New Project Management Link */}
            <Link to="/admin/projects" className="block bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 hover:border-yellow-400 transition-all duration-200">
              <h4 className="text-xl font-bold mb-2">Gestión de Proyectos</h4>
              <p className="text-gray-300">Gestiona los proyectos y sus detalles.</p>
            </Link>
          </div>
          <div className="space-y-8">
            <CompanySettingsSection fetchCompanySettings={fetchCompanySettings} />
            <BackupSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;