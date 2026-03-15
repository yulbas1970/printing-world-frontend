import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Palette } from 'lucide-react';

// This is the new reusable Header component.
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('printingworld-language') || 'es');
  const [companyName, setCompanyName] = useState('Printing World');

  useEffect(() => {
    const fetchCompanyName = async () => {
          try {
            const response = await fetch('/api/company');
            
            // --- ADDED LOGGING ---
            console.log('DEBUG FRONTEND: Response status for /api/company:', response.status);
            const responseText = await response.text();
            console.log('DEBUG FRONTEND: Raw response text for /api/company:', responseText);
            // --- END ADDED LOGGING ---

            const data = JSON.parse(responseText); // Parse the text as JSON
            
            if (data && data.companyName) {
              setCompanyName(data.companyName);
            }
          } catch (error) {
            console.error('Error fetching company name:', error);
          }
        };

    fetchCompanyName();
  }, []);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('printingworld-language', newLanguage);
    // You might want to use a more robust i18n library in the future,
    // which would handle re-rendering automatically.
    window.location.reload();
  };

  const translations = {
    en: {
      home: "Home",
      services: "Services",
      videos: "Videos",
      previewTool: "Preview Tool",
      gallery: "Gallery",
      contact: "Contact",
      admin: "Admin",
      languageSelector: "Language",
      livingRoom: "Living Room",
      kitchen: "Kitchen",
      kids: "Kids Room",
      bathroom: "Bathroom",
      hallway: "Hallway",
    },
    es: {
      home: "Inicio",
      services: "Servicios",
      videos: "Videos",
      previewTool: "Vista Previa",
      gallery: "Galería",
      contact: "Contacto",
      admin: "Admin",
      languageSelector: "Idioma",
      livingRoom: "Salón",
      kitchen: "Cocina",
      kids: "Infantil",
      bathroom: "Baño",
      hallway: "Pasillo",
    }
  };

  const t = (key: string) => {
    return translations[language as keyof typeof translations][key as keyof typeof translations.en] || key;
  };

  return (
    <header className="fixed top-0 w-full bg-white/15 backdrop-blur-lg border-b border-white/30 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/images/eye-logo.jpg" alt="Printing World Logo" className="h-10 w-10 rounded-full object-cover ring-2 ring-yellow-400/50" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent" style={{fontFamily: 'Arial, sans-serif'}} data-no-translate="true">{companyName}</h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-white hover:text-yellow-400 transition-colors">{t('home')}</Link>
            <Link to="/servicios" className="text-white hover:text-yellow-400 transition-colors">{t('services')}</Link>
            <Link to="/videos" className="text-white hover:text-yellow-400 transition-colors">{t('videos')}</Link>
            <Link to="/generador" className="text-white hover:text-yellow-400 transition-colors">{t('previewTool')}</Link>
            <Link to="/galeria" className="text-white hover:text-yellow-400 transition-colors">{t('gallery')}</Link>
            <Link to="/contacto" className="text-white hover:text-yellow-400 transition-colors">{t('contact')}</Link>
            <Link to="/admin" className="text-white hover:text-yellow-400 transition-colors">{t('admin')}</Link>
            <div className="relative">
              <select value={language} onChange={(e) => handleLanguageChange(e.target.value)} className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur border border-yellow-400/50 rounded-lg px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 hover:from-yellow-400/30 hover:to-orange-400/30 transition-all cursor-pointer min-w-[100px] shadow-lg" title={t('languageSelector')}>
                <option value="en" className="bg-gray-800 text-white font-semibold">🇺🇸 English</option>
                <option value="es" className="bg-gray-800 text-white font-semibold">🇪🇸 Español</option>
              </select>
            </div>
          </nav>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-white hover:text-yellow-400 transition-colors" onClick={() => setIsMenuOpen(false)}>{t('home')}</Link>
              <Link to="/servicios" className="text-white hover:text-yellow-400 transition-colors" onClick={() => setIsMenuOpen(false)}>{t('services')}</Link>
              <Link to="/videos" className="text-white hover:text-yellow-400 transition-colors" onClick={() => setIsMenuOpen(false)}>{t('videos')}</Link>
              <Link to="/generador" className="text-white hover:text-yellow-400 transition-colors" onClick={() => setIsMenuOpen(false)}>{t('previewTool')}</Link>
              <Link to="/galeria" className="text-white hover:text-yellow-400 transition-colors" onClick={() => setIsMenuOpen(false)}>{t('gallery')}</Link>
              <Link to="/contacto" className="text-white hover:text-yellow-400 transition-colors" onClick={() => setIsMenuOpen(false)}>{t('contact')}</Link>
              <Link to="/admin" className="text-white hover:text-yellow-400 transition-colors" onClick={() => setIsMenuOpen(false)}>{t('admin')}</Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
