import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import ClientListPage from './pages/ClientListPage' // Added import
import ProjectListPage from './pages/ProjectListPage' // New import
import ProjectDetailsPage from './pages/ProjectDetailsPage' // New import
import GaleriaPage from './pages/GaleriaPage'
import VideosPage from './pages/VideosPage'
import ServiciosPage from './pages/ServiciosPage'
import GeneradorPage from './pages/GeneradorPage'
import ContactoPage from './pages/ContactoPage'
import Header from './components/layout/Header'
import { Toaster } from 'react-hot-toast'

// Simple Footer component
const Footer = () => {
  const [language] = useState(localStorage.getItem('printingworld-language') || 'es');
  const translations = {
    en: { footerText: "© 2024 Printing World. All rights reserved." },
    es: { footerText: "© 2024 Printing World. Todos los derechos reservados." }
  };
  const t = (key: string) => translations[language as keyof typeof translations][key as keyof typeof translations.en] || key;

  return (
    <footer className="bg-black/40 py-12">
      <div className="container mx-auto px-4">
        <div className="border-t border-white/20 pt-8 text-center text-gray-400 text-sm">
          <p>{t('footerText')}</p>
        </div>
      </div>
    </footer>
  );
};

function App() {
  const location = useLocation();

  useEffect(() => {
    const verifyUserToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/verify-token', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          // If token is invalid/expired, the server responds with an error status (401, 403)
          if (!response.ok) {
            console.log('Session token is invalid, clearing session...');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userRole'); // Also clear role if stored
            window.location.reload(); // Reload the page to force a redirect to login
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          // Also clear token on network error, as we can't verify it
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userRole');
          window.location.reload();
        }
      }
    };
    verifyUserToken();
  }, []); // The empty dependency array ensures this runs only once on app load

  return (
    <div className="App">
      <Header />
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/servicios" element={<ServiciosPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/generador" element={<GeneradorPage />} />
        <Route path="/galeria" element={<GaleriaPage />} />
        <Route path="/contacto" element={<ContactoPage key={location.pathname} />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/clients" element={<ClientListPage />} />
        <Route path="/admin/projects" element={<ProjectListPage />} />
        <Route path="/admin/projects/:id" element={<ProjectDetailsPage />} /> {/* New route for ProjectDetailsPage */}
      </Routes>
      <Footer />
    </div>
  )
}

export default App