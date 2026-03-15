import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import ClientForm from '../components/admin/ClientForm'; // Import ClientForm



interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

const ClientListPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showClientForm, setShowClientForm] = useState(false); // State to control form visibility
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null); // State to pass client data for editing

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar clientes');
      }

      const data: Client[] = await response.json();
      setClients(data);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError((err as Error).message);
      toast.error(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDeleteClient = async (clientId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar cliente');
      }

      toast.success('Cliente eliminado con éxito.');
      fetchClients(); // Refresh the list
    } catch (err) {
      console.error('Error deleting client:', err);
      toast.error(`Error: ${(err as Error).message}`);
    }
  };

  const handleAddClientClick = () => {
    setClientToEdit(null); // Clear any client for editing
    setShowClientForm(true); // Show the form for adding
  };

  const handleEditClientClick = (client: Client) => {
    setClientToEdit(client); // Set client for editing
    setShowClientForm(true); // Show the form for editing
  };

  if (loading) {
    return <div className="text-center text-white py-8">Cargando clientes...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold mb-8">Gestión de Clientes</h2>
        
        <div className="flex justify-between items-center mb-6">
          <Link to="/admin" className="text-yellow-400 hover:text-yellow-600">← Volver al Panel de Admin</Link>
          <button onClick={handleAddClientClick} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
            <PlusCircle className="w-5 h-5 mr-2" /> Añadir Cliente
          </button>
        </div>

        {clients.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-lg">No hay clientes registrados.</p>
            <button onClick={handleAddClientClick} className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto">
              <PlusCircle className="w-5 h-5 mr-2" /> Añadir Cliente
            </button>
          </div>
        ) : (
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Teléfono</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{client.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{client.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{client.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{client.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleEditClientClick(client)} className="text-blue-400 hover:text-blue-600 mr-3">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDeleteClient(client.id)} className="text-red-400 hover:text-red-600">
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

      {/* Client Form Modal */}
      {showClientForm && (
        <ClientForm
          clientToEdit={clientToEdit}
          onSave={() => {
            setShowClientForm(false);
            setClientToEdit(null);
            fetchClients(); // Refresh list
          }}
          onCancel={() => {
            setShowClientForm(false);
            setClientToEdit(null);
          }}
        />
      )}
    </div>
  );
};

export default ClientListPage;
