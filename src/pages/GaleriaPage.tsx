import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; // Usar variable de entorno o valor por defecto

// This component displays the public gallery of murals.
const GaleriaPage = () => {
  const [galleryMurals, setGalleryMurals] = useState<{[key: string]: Array<{id: number, projectId: number, imageUrl: string, category: string, title?: string, description?: string, mimeType?: string}>}>({});
  const [activeGalleryCategory, setActiveGalleryCategory] = useState('salones');
  const [selectedMuralIndex, setSelectedMuralIndex] = useState<number | null>(null);
  const [showMuralLightbox, setShowMuralLightbox] = useState(false);

  // TODO: This is duplicated from Header.tsx. Consider moving to a shared context.
  const [language] = useState(localStorage.getItem('printingworld-language') || 'es');
  const translations = {
    en: { galleryTitle: "Our Work Gallery", gallerySubtitle: "Explore a selection of our best projects.", livingRoom: "Living Room", kitchen: "Kitchen", kids: "Kids Room", bathroom: "Bathroom", hallway: "Hallway", video: "Video", general: "General", others: "Others" },
    es: { galleryTitle: "Galería de Trabajos", gallerySubtitle: "Explora una selección de nuestros mejores proyectos.", livingRoom: "Salón", kitchen: "Cocina", kids: "Infantil", bathroom: "Baño", hallway: "Pasillo", video: "Video", general: "General", others: "Otros" }
  };
  const t = (key: string) => translations[language as keyof typeof translations][key as keyof typeof translations.en] || key;

  const fetchMurals = async () => {
    try {
      const projectId = 1; // Placeholder
      const response = await fetch(`${API_URL}/api/projects/${projectId}/images`); // Usar la URL completa
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log('DEBUG FRONTEND (GaleriaPage): Raw data from API:', data);
      
      const organizedMurals: {[key: string]: any[]} = {}; // Initialize as empty object

      data.forEach((mural: any) => {
        const category = mural.category || 'otros'; // Default to 'otros' if category is missing
        if (!organizedMurals[category]) {
          organizedMurals[category] = []; // Create category array if it doesn't exist
        }
        organizedMurals[category].push(mural);
      });
      
      console.log('DEBUG FRONTEND (GaleriaPage): Organized murals:', organizedMurals);
      setGalleryMurals(organizedMurals);

      // Set active category to the first available category if 'salones' is empty
      if (!organizedMurals[activeGalleryCategory] && Object.keys(organizedMurals).length > 0) {
        setActiveGalleryCategory(Object.keys(organizedMurals)[0]);
      }

    } catch (error) {
      console.error('DEBUG FRONTEND (GaleriaPage): Error fetching murals:', error);
    }
  };

  useEffect(() => {
    fetchMurals();
  }, []);

  const galleryCategories = [
    { id: 'salones', name: t('livingRoom'), icon: '🛋️' },
    { id: 'cocinas', name: t('kitchen'), icon: '🍳' },
    { id: 'infantiles', name: t('kids'), icon: '🧸' },
    { id: 'baños', name: t('bathroom'), icon: '🛁' },
    { id: 'pasillos', name: t('hallway'), icon: '🚪' },
    { id: 'video', name: t('video'), icon: '🎥' }, // ADDED
    { id: 'general', name: t('general'), icon: '🖼️' }, // ADDED
    { id: 'otros', name: t('others'), icon: '❓' } // ADDED for fallback
  ];

  const openMuralLightbox = (index: number) => {
    setSelectedMuralIndex(index);
    setShowMuralLightbox(true);
  };

  const closeMuralLightbox = () => {
    setShowMuralLightbox(false);
    setSelectedMuralIndex(null);
  };

  const navigateMural = (direction: 'prev' | 'next') => {
    if (selectedMuralIndex === null) return;
    const currentCategoryMurals = galleryMurals[activeGalleryCategory];
    const currentIndex = selectedMuralIndex;
    if (direction === 'prev') {
      setSelectedMuralIndex(currentIndex > 0 ? currentIndex - 1 : currentCategoryMurals.length - 1);
    } else {
      setSelectedMuralIndex(currentIndex < currentCategoryMurals.length - 1 ? currentIndex + 1 : 0);
    }
  };

  const getCurrentMural = () => {
    if (selectedMuralIndex === null || !galleryMurals[activeGalleryCategory]) return null;
    return galleryMurals[activeGalleryCategory][selectedMuralIndex];
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showMuralLightbox) {
        if (e.key === 'Escape') closeMuralLightbox();
        if (e.key === 'ArrowLeft') navigateMural('prev');
        if (e.key === 'ArrowRight') navigateMural('next');
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showMuralLightbox, selectedMuralIndex, activeGalleryCategory]);

  return (
    <div>
      <section id="galeria" className="py-20 pt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('galleryTitle')}</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">{t('gallerySubtitle')}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {galleryCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveGalleryCategory(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center space-x-2 ${
                  activeGalleryCategory === category.id
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* DEBUG MESSAGES */}
          {Object.keys(galleryMurals).length === 0 && <p className="text-center text-white">No se encontraron murales para mostrar.</p>}
          {galleryMurals[activeGalleryCategory]?.length === 0 && <p className="text-center text-white">No hay murales en esta categoría.</p>}
          {/* END DEBUG MESSAGES */}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryMurals[activeGalleryCategory]?.map((mural, index) => (
              <div 
                key={mural.id} 
                className={`group relative overflow-hidden rounded-2xl bg-white/15 backdrop-blur-lg hover:scale-105 transition-all duration-300 border border-white/20 cursor-pointer`}
                onClick={() => openMuralLightbox(index)}
              >
                {mural.mimeType && mural.mimeType.startsWith('video/') ? (
                  <video
                    src={`${API_URL}${mural.imageUrl}`} // Usar la URL completa
                    controls
                    className="w-full h-64 object-cover"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img 
                    src={`${API_URL}${mural.imageUrl}`} // Usar la URL completa
                    alt={mural.title || 'Mural'}
                    className="w-full h-64 object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-4 right-4 flex space-x-2">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                        <ZoomIn className="w-5 h-5 text-white" />
                      </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold mb-1">{mural.title}</h3>
                    <p className="text-yellow-400 text-sm">{mural.description}</p>
                    <p className="text-white/70 text-xs mt-2">Clic para ver en pantalla completa</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showMuralLightbox && getCurrentMural() && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <button onClick={closeMuralLightbox} className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-10">
            <X className="w-6 h-6 text-white" />
          </button>
          <button onClick={() => navigateMural('prev')} className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-10">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button onClick={() => navigateMural('next')} className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-10">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
          <div className="max-w-5xl max-h-[80vh] w-full h-full flex items-center justify-center">
            {getCurrentMural()?.mimeType && getCurrentMural()?.mimeType.startsWith('video/') ? (
              <video
                src={`${API_URL}${getCurrentMural()?.imageUrl}`} // Usar la URL completa
                controls
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img src={`${API_URL}${getCurrentMural()?.imageUrl}`} alt={getCurrentMural()?.title} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
            )}
          </div>
          <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2 text-white">{getCurrentMural()?.title}</h3>
              <p className="text-gray-300 mb-3">{getCurrentMural()?.description}</p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                <span>{galleryCategories.find(c => c.id === activeGalleryCategory)?.icon} {galleryCategories.find(c => c.id === activeGalleryCategory)?.name}</span>
                <span>|</span>
                <span>{(selectedMuralIndex || 0) + 1} de {galleryMurals[activeGalleryCategory]?.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaleriaPage;
