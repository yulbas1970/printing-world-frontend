import React, { useState } from 'react';
import { Home, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminLoginFormProps {
  onLoginSuccess: () => void;
  fetchCompanySettings: () => Promise<void>;
  fetchProjectFiles: () => Promise<void>;
}

const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onLoginSuccess, fetchCompanySettings, fetchProjectFiles }) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminLogin = async () => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'admin', password: adminPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error de inicio de sesión');
      }

      const data = await response.json();
      console.log('DEBUG FRONTEND: Login response data:', data);
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken); // Store the token
        console.log('DEBUG FRONTEND: accessToken stored:', data.accessToken);
      } else {
        console.log('DEBUG FRONTEND: No accessToken received in login response.');
      }
      if (data.role) {
        localStorage.setItem('userRole', data.role); // Store the user role
        console.log('DEBUG FRONTEND: userRole stored:', data.role);
      } else {
        console.log('DEBUG FRONTEND: No userRole received in login response.');
      }

      setAdminPassword(''); // Clear password from state
      toast.success('Admin login successful!');
      onLoginSuccess(); // Notify parent component
      fetchCompanySettings();
      fetchProjectFiles();
    } catch (error) {
      console.error('Error during admin login:', error);
      toast.error(`Error de inicio de sesión: ${(error as Error).message}`);
      setAdminPassword('');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-8 border border-white/30">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Acceso de Administrador</h3>
          <p className="text-gray-300 text-sm">Introduce la contraseña para gestionar el contenido</p>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña de administrador"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 pr-10"
                autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <button
              onClick={handleAdminLogin}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
              Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginForm;
