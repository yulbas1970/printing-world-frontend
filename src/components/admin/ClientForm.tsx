import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Save } from 'lucide-react';

interface ClientFormProps {
  clientToEdit?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  } | null;
  onSave: () => void; // Callback to refresh client list
  onCancel: () => void; // Callback to close the form/modal
}

const ClientForm: React.FC<ClientFormProps> = ({ clientToEdit, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name || '');
      setEmail(clientToEdit.email || '');
      setPhone(clientToEdit.phone || '');
      setAddress(clientToEdit.address || '');
    } else {
      // Reset form for new client
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
    }
    setErrors({}); // Clear errors on edit/new switch
  }, [clientToEdit]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'El nombre del cliente es obligatorio.';
    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El email no es válido.';
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

    const clientData = { name, email, phone: phone || undefined, address: address || undefined };
    const token = localStorage.getItem('accessToken');

    try {
      const url = clientToEdit ? `http://localhost:5000/clients/${clientToEdit.id}` : 'http://localhost:5000/clients';
      const method = clientToEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle validation errors from backend (express-validator)
        if (response.status === 400 && errorData.errors) {
          const backendErrors: { [key: string]: string } = {};
          errorData.errors.forEach((err: any) => {
            backendErrors[err.path] = err.msg;
          });
          setErrors(backendErrors);
          toast.error('Error de validación en el servidor.');
        } else {
          throw new Error(errorData.message || 'Error al guardar el cliente.');
        }
      } else {
        toast.success(`Cliente ${clientToEdit ? 'actualizado' : 'añadido'} con éxito.`);
        onSave(); // Refresh list and close form
      }
    } catch (err) {
      console.error('Error saving client:', err);
      toast.error(`Error: ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 max-w-md w-full border border-white/30">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">{clientToEdit ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}</h3>
          <button onClick={onCancel} className="hover:bg-white/20 p-2 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Nombre del Cliente"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none ${errors.name ? 'border-red-500' : 'border-white/30 focus:border-yellow-400'}`}
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none ${errors.email ? 'border-red-500' : 'border-white/30 focus:border-yellow-400'}`}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <input
              type="tel"
              placeholder="Teléfono (opcional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none ${errors.phone ? 'border-red-500' : 'border-white/30 focus:border-yellow-400'}`}
              disabled={isSubmitting}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Dirección (opcional)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none ${errors.address ? 'border-red-500' : 'border-white/30 focus:border-yellow-400'}`}
              disabled={isSubmitting}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{isSubmitting ? 'Guardando...' : (clientToEdit ? 'Guardar Cambios' : 'Añadir Cliente')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
