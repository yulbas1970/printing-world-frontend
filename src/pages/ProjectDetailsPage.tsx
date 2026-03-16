import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Image as ImageIcon, Tag, DollarSign, FileText, Edit, X, Save, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { Project } from './ProjectListPage';
import { Client } from './ClientListPage';
import { ProjectImage } from '../components/admin/ProjectImageManager';

// ... (interfaces remain the same)

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);

  const [project, setProject] = useState<Project | null>(null);
  const [editedProject, setEditedProject] = useState<Project | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchDetails = useCallback(async () => {
    // ... (fetchDetails logic remains the same)
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchDetails();
    } else {
      setError('ID de proyecto no proporcionado.');
      setLoading(false);
    }
  }, [projectId, fetchDetails]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (editedProject) {
      setEditedProject({ ...editedProject, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    // ... (handleSave logic remains the same)
  };

  const handleCancel = () => {
    setEditedProject(project);
    setIsEditing(false);
  };

  const handleGeneratePdf = async () => {
    const toastId = toast.loading('Generando informe PDF...');
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`http://localhost:5000/reports/project/${projectId}/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al generar el PDF.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `informe-proyecto-${project?.projectName.replace(/\s/g, '_') || projectId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Informe PDF generado.', { id: toastId });

    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error(`Error: ${(err as Error).message}`, { id: toastId });
    }
  };

  if (loading) {
    return <div className="text-center text-white py-8">Cargando detalles del proyecto...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">Error: {error}</div>;
  }

  if (!project) {
    return <div className="text-center text-gray-400 py-8">Proyecto no encontrado.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold">Detalles del Proyecto: {project.projectName}</h2>
          <Link to="/admin/projects" className="text-yellow-400 hover:text-yellow-600 flex items-center">
            <ArrowLeft className="w-5 h-5 mr-2" /> Volver a Proyectos
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Info */}
          <div className="lg:col-span-2 bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold">Información del Proyecto</h3>
              <div className="flex items-center space-x-2 flex-shrink-0">
                {isEditing ? (
                  <>
                    <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"><Save className="w-4 h-4 mr-2" /> Guardar</button>
                    <button onClick={handleCancel} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"><X className="w-4 h-4 mr-2" /> Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={handleGeneratePdf} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"><FileDown className="w-4 h-4 mr-2" /> PDF</button>
                    <button onClick={() => setIsEditing(true)} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg flex items-center"><Edit className="w-4 h-4 mr-2" /> Editar</button>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              {/* ... (editable fields section remains the same) */}
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 space-y-4">
            {/* ... (client info section remains the same) */}
          </div>
        </div>

        {/* Project Images */}
        <div className="mt-8 bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
          {/* ... (images section remains the same) */}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
