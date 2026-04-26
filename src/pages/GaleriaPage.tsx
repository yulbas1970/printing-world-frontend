
import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
const API_URL = ' ';

type Mural = {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  mimeType?: string;
};

const GaleriaPage = () => {
  const [activeGalleryCategory, setActiveGalleryCategory] = useState('salones');
  const [selectedMuralIndex, setSelectedMuralIndex] = useState<number | null>(null);
  const [showMuralLightbox, setShowMuralLightbox] = useState(false);

  const [language] = useState(localStorage.getItem('printingworld-language') || 'es');

  const translations = {
    en: { galleryTitle: "Our Work Gallery", gallerySubtitle: "Explore a selection of our best projects.", livingRoom: "Living Room", kitchen: "Kitchen", kids: "Kids Room", bathroom: "Bathroom", hallway: "Hallway", video: "Video", general: "General", others: "Others" },
    es: { galleryTitle: "Galería de Trabajos", gallerySubtitle: "Explora una selección de nuestros mejores proyectos.", livingRoom: "Salón", kitchen: "Cocina", kids: "Infantil", bathroom: "Baño", hallway: "Pasillo", video: "Video", general: "General", others: "Otros" }
  };

  const t = (key: string) =>
    translations[language as keyof typeof translations][key as keyof typeof translations.en] || key;

  const galleryMurals: { [key: string]: Mural[] } = {
    salones: [
      { id: 1, imageUrl: '/images/mural-naturaleza-1.jpg', title: 'Mural salón naturaleza', description: 'Mural decorativo para salón.' },
      { id: 2, imageUrl: '/images/mural-abstracto-1.jpg', title: 'Mural salón abstracto', description: 'Mural decorativo abstracto.' }
    ],
    cocinas: [
      { id: 3, imageUrl: '/images/mural-minimalista-1.jpg', title: 'Mural cocina', description: 'Mural decorativo para cocina.' }
    ],
    infantiles: [
      { id: 4, imageUrl: '/images/mural-artistico-1.jpg', title: 'Mural infantil', description: 'Mural decorativo infantil.' }
    ],
    baños: [
      { id: 5, imageUrl: '/images/mural-geometrico-1.webp', title: 'Mural baño', description: 'Mural decorativo para baño.' }
    ],
    pasillos: [
      { id: 6, imageUrl: '/images/mural-urbano-1.jpg', title: 'Mural pasillo', description: 'Mural decorativo para pasillo.' }
    ],
    video: [],
    general: [
      { id: 7, imageUrl: '/images/hero-mural.jpg', title: 'Mural general', description: 'Mural decorativo general.' }
    ],
    otros: []
  };

  const galleryCategories = [
    { id: 'salones', name: t('livingRoom'), icon: '🛋️' },
    { id: 'cocinas', name: t('kitchen'), icon: '🍳' },
    { id: 'infantiles', name: t('kids'), icon: '🧸' },
    { id: 'baños', name: t('bathroom'), icon: '🛁' },
    { id: 'pasillos', name: t('hallway'), icon: '🚪' },
    { id: 'video', name: t('video'), icon: '🎥' },
    { id: 'general', name: t('general'), icon: '🖼️' },
    { id: 'otros', name: t('others'), icon: '❓' }
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

    const currentCategoryMurals = galleryMurals[activeGalleryCategory] || [];
    if (currentCategoryMurals.length === 0) return;

    if (direction === 'prev') {
      setSelectedMuralIndex(selectedMuralIndex > 0 ? selectedMuralIndex - 1 : currentCategoryMurals.length - 1);
    } else {
      setSelectedMuralIndex(selectedMuralIndex < currentCategoryMurals.length - 1 ? selectedMuralIndex + 1 : 0);
    }
  };

  const getCurrentMural = () => {
    if (selectedMuralIndex === null) return null;
    return galleryMurals[activeGalleryCategory]?.[selectedMuralIndex] || null;
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

  const currentMurals = galleryMurals[activeGalleryCategory] || [];

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

          {currentMurals.length === 0 && (
            <p className="text-center text-white">No hay murales en esta categoría.</p>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentMurals.map((mural, index) => (
              <div
                key={mural.id}
                className="group relative overflow-hidden rounded-2xl bg-white/15 backdrop-blur-lg hover:scale-105 transition-all duration-300 border border-white/20 cursor-pointer"
                onClick={() => openMuralLightbox(index)}
              >
                {mural.mimeType?.startsWith('video/') ? (
                  <video src={mural.imageUrl} controls className="w-full h-64 object-cover">
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={mural.imageUrl}
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
            {getCurrentMural()?.mimeType?.startsWith('video/') ? (
              <video src={getCurrentMural()?.imageUrl} controls className="max-w-full max-h-full object-contain rounded-lg shadow-2xl">
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={getCurrentMural()?.imageUrl}
                alt={getCurrentMural()?.title || 'Mural'}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            )}
          </div>

          <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2 text-white">{getCurrentMural()?.title}</h3>
              <p className="text-gray-300 mb-3">{getCurrentMural()?.description}</p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                <span>
                  {galleryCategories.find(c => c.id === activeGalleryCategory)?.icon}{' '}
                  {galleryCategories.find(c => c.id === activeGalleryCategory)?.name}
                </span>
                <span>|</span>
                <span>{(selectedMuralIndex || 0) + 1} de {currentMurals.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaleriaPage;