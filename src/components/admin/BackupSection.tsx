import React, { useState } from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

const BackupSection: React.FC = () => {
  const [backupStatus, setBackupStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [backupDownloadUrl, setBackupDownloadUrl] = useState<string | null>(null);

  const handleBackup = async () => {
    console.log('Backup initiated');
    setBackupStatus('generating');
    try {
      const response = await fetch('http://localhost:5000/backup/full', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.downloadUrl) {
        // Initiate download
        window.open(`http://localhost:5000${data.downloadUrl}`, '_blank');
        setBackupDownloadUrl(`http://localhost:5000${data.downloadUrl}`); // Store for display if needed
        setBackupStatus('success');
        console.log('Backup generated successfully. Download initiated.');
      } else {
        throw new Error('No download URL received from backend.');
      }
    } catch (error) {
      console.error('Error generating backup:', error);
      setBackupStatus('error');
      toast.error(`Error al generar la copia de seguridad: ${(error as Error).message}`);
    }
  };

  return (
    <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <h4 className="text-xl font-bold mb-4 flex items-center">
        <Download className="w-6 h-6 mr-2 text-yellow-400" />
        Copia de Seguridad
      </h4>
      <div className="space-y-4">
        <button
          onClick={handleBackup}
          disabled={backupStatus === 'generating'}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
        >
          {backupStatus === 'generating' ? (
            <>
              <span className="animate-spin">⚙️</span>
              <span>Generando copia...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Generar Copia de Seguridad Completa</span>
            </>
          )}
        </button>
        {backupStatus === 'success' && backupDownloadUrl && (
          <p className="text-green-400 text-center">
            Copia de seguridad creada. <a href={backupDownloadUrl} target="_blank" rel="noopener noreferrer" className="underline">Descargar</a>
          </p>
        )}
        {backupStatus === 'error' && (
          <p className="text-red-400 text-center">Error al generar la copia de seguridad. Revisa la consola.</p>
        )}
      </div>
    </div>
  );
};

export default BackupSection;