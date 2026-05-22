import React, { useState } from 'react';
import { Building, Edit, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const CompanySettingsSection: React.FC = () => {
  const defaultSettings = {
    companyName: 'IMPRIMIENDO EL MUNDO-IA',
    phone: '+34 123 456 789',
    email: 'imprimiendoelmundoia@gmail.com',
    address: 'Madrid',
    schedule: 'Lunes - Viernes: 9:00 - 18:00',
  };

  const savedSettings = localStorage.getItem('companySettings');
  const initialSettings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;

  const [settings, setSettings] = useState(initialSettings);
  const [editedSettings, setEditedSettings] = useState(initialSettings);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedSettings({
      ...editedSettings,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveSettings = () => {
    localStorage.setItem('companySettings', JSON.stringify(editedSettings));
    setSettings(editedSettings);
    setIsEditing(false);
    toast.success('Configuración guardada.');
  };

  const handleCancelEdit = () => {
    setEditedSettings(settings);
    setIsEditing(false);
  };

  return (
    <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <h4 className="text-xl font-bold mb-4 flex items-center">
        <Building className="w-6 h-6 mr-2 text-yellow-400" />
        Configuración de la Empresa
      </h4>

      <div className="space-y-4">
        {Object.keys(editedSettings).map((key) => (
          <input
            key={key}
            type="text"
            name={key}
            value={editedSettings[key] || ''}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
          />
        ))}

        {isEditing ? (
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSaveSettings}
              className="w-full py-3 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Guardar Cambios</span>
            </button>

            <button
              onClick={handleCancelEdit}
              className="w-full py-3 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white flex items-center justify-center space-x-2"
            >
              <X className="w-5 h-5" />
              <span>Cancelar</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full py-3 mt-4 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2"
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