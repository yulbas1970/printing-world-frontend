import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Image } from 'lucide-react'; // Added Image icon
import toast from 'react-hot-toast';
import ProjectForm from '../components/admin/ProjectForm';
import ProjectImageManager from '../components/admin/ProjectImageManager'; // Import ProjectImageManager
// import ProjectImageManager from '../components/admin/ProjectImageManager'; // Will be imported later

export interface Project {
  id: number;
  clientId: number;
  projectName: string;
  description?: string;
  muralType?: string;
  status: string;
  creationDate: string;
  dueDate: string;
}

const ProjectListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [showImageManager, setShowImageManager] = useState(false); // State for image manager modal
  const [projectToManageImages, setProjectToManageImages] = useState<Project | null>(null); // State for project whose images are managed

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar proyectos');
      }

      const data: Project[] = await response.json();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError((err as Error).message);
      toast.error(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async (projectId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar proyecto');
      }

      toast.success('Proyecto eliminado con éxito.');
      fetchProjects(); // Refresh the list
    } catch (err) {
      console.error('Error deleting project:', err);
      toast.error(`Error: ${(err as Error).message}`);
    }
  };

  const handleAddProjectClick = () => {
    setProjectToEdit(null);
    setShowProjectForm(true);
  };

  const handleEditProjectClick = (project: Project) => {
    setProjectToEdit(project);
    setShowProjectForm(true);
  };

  const handleManageImagesClick = (project: Project) => {
    setProjectToManageImages(project);
    setShowImageManager(true);
  };

  if (loading) {
    return <div className="text-center text-white py-8">Cargando proyectos...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold mb-8">Gestión de Proyectos</h2>
        
        <div className="flex justify-between items-center mb-6">
          <Link to="/admin" className="text-yellow-400 hover:text-yellow-600">← Volver al Panel de Admin</Link>
          <button onClick={handleAddProjectClick} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
            <PlusCircle className="w-5 h-5 mr-2" /> Añadir Proyecto
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-lg">No hay proyectos registrados.</p>
          </div>
        ) : (
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cliente ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nombre del Proyecto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo de Mural</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha Creación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha Vencimiento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{project.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{project.clientId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        <Link to={`/admin/projects/${project.id}`} className="text-blue-400 hover:text-blue-600">
                          {project.projectName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{project.muralType || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{project.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{project.creationDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{project.dueDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleEditProjectClick(project)} className="text-blue-400 hover:text-blue-600 mr-3">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleManageImagesClick(project)} className="text-yellow-400 hover:text-yellow-600 mr-3">
                          <Image className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDeleteProject(project.id)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Project Form Modal */}
      {showProjectForm && (
        <ProjectForm
          projectToEdit={projectToEdit}
          onSave={() => {
            setShowProjectForm(false);
            setProjectToEdit(null);
            fetchProjects(); // Refresh list
          }}
          onCancel={() => {
            setShowProjectForm(false);
            setProjectToEdit(null);
          }}
        />
      )}

      {/* Project Image Manager Modal */}
      {showImageManager && projectToManageImages && (
        <ProjectImageManager
          projectId={projectToManageImages.id}
          onClose={() => {
            setShowImageManager(false);
            setProjectToManageImages(null);
            fetchProjects(); // Refresh projects in case images are tied to project status or something
          }}
        />
      )}
    </div>
  );
};

export default ProjectListPage;
