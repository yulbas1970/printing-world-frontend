import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Save } from 'lucide-react';

interface ProjectFormProps {
  projectToEdit?: {
    id: number;
    clientId: number;
    projectName: string;
    description?: string;
    muralType?: string;
    status: string;
    creationDate: string;
    dueDate: string;
  } | null;
  onSave: () => void; // Callback to refresh project list
  onCancel: () => void; // Callback to close the form/modal
}

const ProjectForm: React.FC<ProjectFormProps> = ({ projectToEdit, onSave, onCancel }) => {
  const [clientId, setClientId] = useState<number | ''>('');
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [muralType, setMuralType] = useState('');
  const [status, setStatus] = useState('Pending'); // Default status
  const [creationDate, setCreationDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const projectStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

  useEffect(() => {
    if (projectToEdit) {
      setClientId(projectToEdit.clientId);
      setProjectName(projectToEdit.projectName || '');
      setDescription(projectToEdit.description || '');
      setMuralType(projectToEdit.muralType || '');
      setStatus(projectToEdit.status || 'Pending');
      setCreationDate(projectToEdit.creationDate || '');
      setDueDate(projectToEdit.dueDate || '');
    } else {
      // Reset form for new project
      setClientId('');
      setProjectName('');
      setDescription('');
      setMuralType('');
      setStatus('Pending');
      setCreationDate(new Date().toISOString().split('T')[0]); // Default to today
      setDueDate('');
    }
    setErrors({}); // Clear errors on edit/new switch
  }, [projectToEdit]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!clientId) newErrors.clientId = 'El ID del cliente es obligatorio.';
    if (!projectName.trim()) newErrors.projectName = 'El nombre del proyecto es obligatorio.';
    if (!status.trim()) newErrors.status = 'El estado es obligatorio.';
    if (!creationDate.trim()) newErrors.creationDate = 'La fecha de creación es obligatoria.';
    if (!dueDate.trim()) newErrors.dueDate = 'La fecha de vencimiento es obligatoria.';
    
    // Basic date validation
    if (creationDate && dueDate && new Date(creationDate) > new Date(dueDate)) {
      newErrors.dueDate = 'La fecha de vencimiento no puede ser anterior a la fecha de creación.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Por favor, corrige los errores del formulario.');
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    const projectData = {
      clientId: Number(clientId),
      projectName,
      description: description || undefined,
      muralType: muralType || undefined,
      status,
      creationDate,
      dueDate,
    };
    const token = localStorage.getItem('accessToken');

    try {
      let url = '';
      let method = '';

      if (projectToEdit) {
        url = `http://localhost:5000/projects/${projectToEdit.id}`;
        method = 'PUT';
      } else {
        // For new projects, clientId is part of the URL in the backend
        url = `http://localhost:5000/clients/${clientId}/projects`;
        method = 'POST';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.errors) {
          const backendErrors: { [key: string]: string } = {};
          errorData.errors.forEach((err: any) => {
            backendErrors[err.path] = err.msg;
          });
          setErrors(backendErrors);
          toast.error('Error de validación en el servidor.');
        } else {
          throw new Error(errorData.message || 'Error al guardar el proyecto.');
        }
      } else {
        toast.success(`Proyecto ${projectToEdit ? 'actualizado' : 'añadido'} con éxito.`);
        onSave(); // Refresh list and close form
      }
    } catch (err) {
      console.error('Error saving project:', err);
      toast.error(`Error: ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 max-w-md w-full border border-white/30 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">{projectToEdit ? 'Editar Proyecto' : 'Añadir Nuevo Proyecto'}</h3>
          <button onClick={onCancel} className="hover:bg-white/20 p-2 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="number"
              placeholder="ID del Cliente"
              value={clientId}
              onChange={(e) => setClientId(Number(e.target.value))}
              className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none ${errors.clientId ? 'border-red-500' : 'border-white/30 focus:border-yellow-400'}`}
              disabled={isSubmitting || !!projectToEdit} // Disable clientId edit for existing projects
            />
            {errors.clientId && <p className="text-red-500 text-sm mt-1">{errors.clientId}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Nombre del Proyecto"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none ${errors.projectName ? 'border-red-500' : 'border-white/30 focus:border-yellow-400'}`}
              disabled={isSubmitting}
            />
            {errors.projectName && <p className="text-red-500 text-sm mt-1">{errors.projectName}</p>}
          </div>
          <div>
            <textarea
              placeholder="Descripción (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none ${errors.description ? 'border-red-500' : 'border-white/30 focus:border-yellow-400'}`}
              disabled={isSubmitting}
              rows={3}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Tipo de Mural (opcional)"
              value={muralType}
              onChange={(e) => setMuralType(e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none ${errors.muralType ? 'border-red-500' : 'border-white/30 focus:border-yellow-400'}`}
              disabled={isSubmitting}
            />
            {errors.muralType && <p className="text-red-500 text-sm mt-1">{errors.muralType}</p>}
          </div>
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none ${errors.status ? 'border-red-500' : 'border-white/30 focus:border-yellow-400'}`}
              disabled={isSubmitting}
            >
              {projectStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Fecha de Creación</label>
            <input
              type="date"
              value={creationDate}
              onChange={(e) => setCreationDate(e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none ${errors.creationDate ? 'border-red-500' : 'border-white/30 focus:border-yellow-400'}`}
              disabled={isSubmitting}
            />
            {errors.creationDate && <p className="text-red-500 text-sm mt-1">{errors.creationDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Fecha de Vencimiento</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none ${errors.dueDate ? 'border-red-500' : 'border-white/30 focus:border-yellow-400'}`}
              disabled={isSubmitting}
            />
            {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{isSubmitting ? 'Guardando...' : (projectToEdit ? 'Guardar Cambios' : 'Añadir Proyecto')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
