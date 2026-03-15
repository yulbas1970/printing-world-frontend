import { useState } from 'react';
import { Wand2, ArrowRight } from 'lucide-react';

// This is the main public-facing homepage, now only showing the hero section.
const HomePage = () => {
  // Translations - can be moved to a shared context later
  const [language] = useState(localStorage.getItem('printingworld-language') || 'es');
  const translations = {
    en: { 
      heroTitle: "Transform Your Space with Professional Wall Murals", 
      heroSubtitle: "Create stunning custom murals with our advanced preview technology and professional printing services",
      getStarted: "Get Started",
      watchDemo: "Watch Demo",
    },
    es: { 
      heroTitle: "¡CREE Y CREARÁS!", 
      heroSubtitle: "NOSOTROS CREIMOS Y AHORA CREAMOS TUS SUEÑOS Y LOS PLASMAMOS EN TU PARED.",
      getStarted: "Prueba el Simulador",
      watchDemo: "Ver Demo",
    }
  };
  const t = (key: string) => translations[language as keyof typeof translations][key as keyof typeof translations.en] || key;

  return (
    <div>
      <section id="inicio" className="min-h-screen flex items-center justify-center pt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <img 
                  src="/images/eye-logo.jpg" 
                  alt="Printing World - Visión Artística" 
                  className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover shadow-2xl ring-4 ring-yellow-400/50 animate-pulse"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-400/20"></div>
              </div>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
              {t('heroTitle')}
            </h2>
            <p className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="/generador"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105 flex items-center space-x-2"
              >
                <Wand2 className="h-5 w-5" />
                <span>{t('getStarted')}</span>
                <ArrowRight className="h-5 w-5" />
              </a>
              <a 
                href="/videos"
                className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all"
              >
                {t('watchDemo')}
              </a>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-yellow-400/10 to-transparent rounded-full"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-400/10 to-transparent rounded-full"></div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
