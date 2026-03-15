import { useState } from 'react';
import { Home, Briefcase, Users, CheckCircle } from 'lucide-react';

// This component displays the services offered.
const ServiciosPage = () => {
  // Translations - can be moved to a shared context later
  const [language] = useState(localStorage.getItem('printingworld-language') || 'es');
  const translations = {
    en: { title: "Services that Transform Your Spaces", subtitle: "From AI design to professional installation, we make your ideas a reality on any wall." },
    es: { title: "Nuestros Servicios", subtitle: "Desde el diseño con IA hasta la instalación profesional, hacemos realidad tus ideas en cualquier pared." }
  };
  const t = (key: string) => translations[language as keyof typeof translations][key as keyof typeof translations.en] || key;

  return (
    <div>
      <section id="servicios" className="py-20 bg-black/20 pt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">{t('subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all">
              <Home className="h-12 w-12 text-yellow-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Murales Personalizados</h3>
              <p className="text-gray-300 mb-6">Diseños únicos creados específicamente para tu espacio, usando IA para generar arte personalizado.</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm"><CheckCircle className="h-4 w-4 text-green-400 mr-2" />Diseño con inteligencia artificial</li>
                <li className="flex items-center text-sm"><CheckCircle className="h-4 w-4 text-green-400 mr-2" />Calidad fotográfica</li>
                <li className="flex items-center text-sm"><CheckCircle className="h-4 w-4 text-green-400 mr-2" />Instalación profesional</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all">
              <Briefcase className="h-12 w-12 text-yellow-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Impresión Vertical</h3>
              <p className="text-gray-300 mb-6">Tecnología avanzada de impresión directa en pared para resultados duraderos y vibrantes.</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm"><CheckCircle className="h-4 w-4 text-green-400 mr-2" />Impresión directa en pared</li>
                <li className="flex items-center text-sm"><CheckCircle className="h-4 w-4 text-green-400 mr-2" />Tintas ecológicas</li>
                <li className="flex items-center text-sm"><CheckCircle className="h-4 w-4 text-green-400 mr-2" />Resistente al agua</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all">
              <Users className="h-12 w-12 text-yellow-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Consultoría Artística</h3>
              <p className="text-gray-300 mb-6">Asesoramiento profesional para elegir el diseño perfecto que complemente tu espacio.</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm"><CheckCircle className="h-4 w-4 text-green-400 mr-2" />Análisis del espacio</li>
                <li className="flex items-center text-sm"><CheckCircle className="h-4 w-4 text-green-400 mr-2" />Propuestas personalizadas</li>
                <li className="flex items-center text-sm"><CheckCircle className="h-4 w-4 text-green-400 mr-2" />Visualización 3D</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiciosPage;
