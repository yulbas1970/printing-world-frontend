import React, { useState, useEffect, useRef } from 'react';
import { Building, Download, Edit, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const CompanySettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  
  // State for text fields
  const [editedSettings, setEditedSettings] = useState<any>({});

  // State for logo
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/company', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
      setEditedSettings(data);
      if (data.logoUrl) {
        // Add a timestamp to bypass browser cache
        setLogoPreview(`http://localhost:5000${data.logoUrl}?t=${new Date().getTime()}`);
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
      toast.error('No se pudo cargar la configuración de la empresa.');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedSettings({ ...editedSettings, [e.target.name]: e.target.value });
  };

  const handleSaveSettings = async () => {
    const toastId = toast.loading('Guardando configuración...');
    try {
      const response = await fetch('http://localhost:5000/api/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(editedSettings),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      
      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      setEditedSettings(updatedSettings);
      setIsEditing(false);
      toast.success('Configuración guardada.', { id: toastId });
    } catch (error) {
      console.error('Error saving company settings:', error);
      toast.error('Error al guardar la configuración.', { id: toastId });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    const toastId = toast.loading('Subiendo logo...');
    const formData = new FormData();
    formData.append('logo', logoFile);

    try {
      const response = await fetch('http://localhost:5000/api/company/logo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload logo');
      }
      
      const result = await response.json();
      toast.success('Logo actualizado.', { id: toastId });
      
      // Reset file input and update preview with the new URL from the server
      setLogoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (result.logoUrl) {
        setLogoPreview(`http://localhost:5000${result.logoUrl}?t=${new Date().getTime()}`);
      }

    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(`Error al subir el logo: ${(error as Error).message}`, { id: toastId });
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedSettings(settings);
  }

  return (
    <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <h4 className="text-xl font-bold mb-4 flex items-center">
        <Building className="w-6 h-6 mr-2 text-yellow-400" />
        Configuración de la Empresa
      </h4>
      
      {/* --- LOGO SECTION --- */}
      <div className="mb-6">
        <h5 className="text-lg font-semibold mb-2">Logo de la Empresa</h5>
        <div className="flex items-center gap-4">
          {logoPreview ? (
            <img src={logoPreview} alt="Logo Preview" className="w-24 h-24 object-contain rounded-lg bg-black/20 p-1" />
          ) : (
            <div className="w-24 h-24 flex items-center justify-center rounded-lg bg-black/20 text-gray-400 text-sm">
              Sin logo
            </div>
          )}
          <div className="flex-grow">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-600"
            />
            {logoFile && (
              <button
                onClick={handleLogoUpload}
                className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Subir Logo Seleccionado</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- TEXT SETTINGS SECTION --- */}
      <div className="space-y-4">
        <h5 className="text-lg font-semibold mb-2 border-t border-white/20 pt-4">Datos de la Empresa</h5>
        {Object.keys(editedSettings).filter(key => key !== 'id' && key !== 'logoUrl').map((key) => (
          <input
            key={key}
            type="text"
            name={key}
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            value={editedSettings[key] || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
            disabled={!isEditing}
          />
        ))}
        
        {isEditing ? (
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSaveSettings}
              className="w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-5 h-5" />
              <span>Guardar Cambios</span>
            </button>
            <button
              onClick={handleCancelEdit}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
            >
              <X className="w-5 h-5" />
              <span>Cancelar</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full py-3 mt-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Edit className="w-5 h-5" />
            <span>Editar Datos</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CompanySettingsSection;
