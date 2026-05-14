import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { API_URL } from '../config/api'; // Importar API_URL

interface Mural {
  id: number;
  projectId: number;
  imageUrl: string;
  category: string;
  title?: string;
  description?: string;
}

interface CategorizedMurals {
  [key: string]: Mural[];
}

const GaleriaPage = () => {
  const [activeGalleryCategory, setActiveGalleryCategory] = useState('salones');
  const [selectedMuralIndex, setSelectedMuralIndex] = useState<number | null>(null);
  const [showMuralLightbox, setShowMuralLightbox] = useState(false);
  const [galleryMurals, setGalleryMurals] = useState<CategorizedMurals>({}); // Estado para los murales de la galería
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Estado de error

  const [language] = useState(localStorage.getItem('printingworld-language') || 'es');

  const translations = {
    en: {
      galleryTitle: 'Our Work Gallery',
      gallerySubtitle: 'Explore a selection of our best projects.',
      livingRoom: 'Living Room',
      kitchen: 'Kitchen',
      bedroom: 'Bedroom',
      kids: 'Kids Room',
      noMurals: 'No murals in this category.',
      loadingMurals: 'Loading murals...',
      errorLoadingMurals: 'Error loading murals.',
    },
    es: {
      galleryTitle: 'Galería de Trabajos',
      gallerySubtitle: 'Explora una selección de nuestros mejores proyectos.',
      livingRoom: 'Salones',
      kitchen: 'Cocinas',
      bedroom: 'Dormitorios',
      kids: 'Infantiles',
      noMurals: 'No hay murales en esta categoría.',
      loadingMurals: 'Cargando murales...',
      errorLoadingMurals: 'Error al cargar los murales.',
    },
  };

  const t = (key: string) =>
    translations[language as keyof typeof translations][
      key as keyof typeof translations.es
    ] || key;

  const [galleryCategories, setGalleryCategories] = useState<{ id: string; name: string; icon: string }[]>([]);

  // Función para obtener los murales de la API
  const fetchGalleryMurals = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_URL}/api/projects/1/images`; // Asegurarse de que la URL comience con /api
      console.log('fetchGalleryMurals URL:', url); // Log temporal
      const response = await fetch(url); // Cambiado a /projects/1/images

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch gallery murals: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        throw new Error(`Expected JSON response, but received ${contentType || 'no content type'}: ${errorText}`);
      }

      const data: Mural[] = await response.json();

      const categorizedMurals = data.reduce(
        (acc: CategorizedMurals, item: Mural) => {
          // Asegurarse de que solo se incluyan imágenes (no videos)
          if (item.category !== 'video') {
            const category = item.category || 'uncategorized';

            if (!acc[category]) {
              acc[category] = [];
            }

            acc[category].push(item);
          }

          return acc;
        },
        {}
      );
      setGalleryMurals(categorizedMurals);

      // Generar categorías dinámicamente (simplificado)
      const uniqueCategories = Array.from(new Set(data.filter(item => item.category !== 'video').map(item => item.category || 'uncategorized')));
      const dynamicCategories = uniqueCategories.map(cat => {
        let name = cat;
        let icon = '🖼️'; // Icono por defecto
        switch (cat) {
          case 'salones': name = t('livingRoom'); icon = '🛋️'; break;
          case 'cocinas': name = t('kitchen'); icon = '🍳'; break;
          case 'dormitorios': name = t('bedroom'); icon = '🛏️'; break;
          case 'infantiles': name = t('kids'); icon = '🧸'; break;
          case 'uncategorized': name = 'Sin Categoría'; break; // O traducir
        }
        return { id: cat, name, icon };
      });
      setGalleryCategories(dynamicCategories);

      // Establecer la categoría activa por defecto si hay alguna
      if (dynamicCategories.length > 0 && !dynamicCategories.some(cat => cat.id === activeGalleryCategory)) {
        setActiveGalleryCategory(dynamicCategories[0].id);
      }

    } catch (err: any) { // Usar 'any' para el tipo de error
      console.error('Error fetching gallery murals:', err);
      setError(err.message || 'Error al cargar los murales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryMurals();
  }, []); // Cargar murales al montar el componente

  const currentMurals = galleryMurals[activeGalleryCategory] || [];

  const openMuralLightbox = (index: number) => {
    setSelectedMuralIndex(index);
    setShowMuralLightbox(true);
  };

  const closeMuralLightbox = () => {
    setShowMuralLightbox(false);
    setSelectedMuralIndex(null);
  };

  const navigateMural = (direction: 'prev' | 'next') => {
    if (selectedMuralIndex === null || currentMurals.length === 0) return;

    if (direction === 'prev') {
      setSelectedMuralIndex(
        selectedMuralIndex > 0 ? selectedMuralIndex - 1 : currentMurals.length - 1
      );
    } else {
      setSelectedMuralIndex(
        selectedMuralIndex < currentMurals.length - 1 ? selectedMuralIndex + 1 : 0
      );
    }
  };

  const getCurrentMural = () => {
    if (selectedMuralIndex === null) return null;
    return currentMurals[selectedMuralIndex] || null;
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!showMuralLightbox) return;

      if (e.key === 'Escape') closeMuralLightbox();
      if (e.key === 'ArrowLeft') navigateMural('prev');
      if (e.key === 'ArrowRight') navigateMural('next');
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showMuralLightbox, selectedMuralIndex, activeGalleryCategory]);

  return (
    <div>
      <section id="galeria" className="py-20 pt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t('galleryTitle')}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('gallerySubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {galleryCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveGalleryCategory(category.id);
                  setSelectedMuralIndex(null);
                }}
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

          {loading && <p className="text-center text-white">{t('loadingMurals')}</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && currentMurals.length === 0 && (
            <p className="text-center text-white">
              {t('noMurals')}
            </p>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!loading && !error && currentMurals.map((mural, index) => (
              <div
                key={mural.id}
                className="group relative overflow-hidden rounded-2xl bg-white/15 backdrop-blur-lg hover:scale-105 transition-all duration-300 border border-white/20 cursor-pointer"
                onClick={() => openMuralLightbox(index)}
              >
                {console.log('MURAL IMAGE URL ORIGINAL:', mural.imageUrl)}
                <img
                  src={
                    mural.imageUrl.startsWith('http')
                      ? mural.imageUrl
                      : mural.imageUrl.startsWith('/uploads') || mural.imageUrl.startsWith('/images')
                      ? mural.imageUrl
                      : `${API_URL}${mural.imageUrl}` // Si es relativa, usar API_URL
                  }
                  alt={mural.title}
                  className="w-full h-64 object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <ZoomIn className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold mb-1">{mural.title}</h3>
                    <p className="text-yellow-400 text-sm">{mural.description}</p>
                    <p className="text-white/70 text-xs mt-2">
                      Clic para ver en pantalla completa
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showMuralLightbox && getCurrentMural() && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <button
            onClick={closeMuralLightbox}
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={() => navigateMural('prev')}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-10"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={() => navigateMural('next')}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-10"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          <div className="max-w-5xl max-h-[80vh] w-full h-full flex items-center justify-center">
            <img
              src={getCurrentMural()?.imageUrl}
              alt={getCurrentMural()?.title || 'Mural'}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2 text-white">
                {getCurrentMural()?.title}
              </h3>
              <p className="text-gray-300 mb-3">
                {getCurrentMural()?.description}
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                <span>
                  {galleryCategories.find((c) => c.id === activeGalleryCategory)?.icon}{' '}
                  {galleryCategories.find((c) => c.id === activeGalleryCategory)?.name}
                </span>
                <span>|</span>
                <span>
                  {(selectedMuralIndex || 0) + 1} de {currentMurals.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaleriaPage;
