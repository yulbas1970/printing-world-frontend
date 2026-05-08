import { useState, useEffect } from 'react';
import { API_URL } from '../config/api';

interface DemoVideo {
  src: string;
  title: string;
  description: string;
}

interface ServerFile {
  imageUrl: string;
  title?: string;
  description?: string;
  mimeType?: string;
  category?: string;
}

const VideosPage = () => {
  const [demoVideos, setDemoVideos] = useState<DemoVideo[]>([]);
  const [language] = useState(localStorage.getItem('printingworld-language') || 'es');

  const translations = {
    en: {
      title: 'Demonstration Videos',
      subtitle: 'See our work process in action and the quality of our murals',
    },
    es: {
      title: 'Videos de Demostración',
      subtitle: 'Mira nuestro proceso de trabajo en acción y la calidad de nuestros murales',
    },
  };

  const t = (key: string) =>
    translations[language as keyof typeof translations][key as keyof typeof translations.en] || key;

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(`${API_URL}/api/projects/1/images`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const allFiles: ServerFile[] = await response.json();

        const videoFiles = allFiles.filter((file) => {
          const isVideoMime = file.mimeType?.startsWith('video/');
          const isVideoCategory = file.category === 'video';
          return isVideoMime || isVideoCategory;
        });

        const formattedVideos: DemoVideo[] = videoFiles.map((video) => ({
          src: video.imageUrl,
          title: video.title || 'Vídeo de Demostración',
          description: video.description || 'Un vídeo mostrando nuestro trabajo.',
        }));

        setDemoVideos(formattedVideos);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div>
      <section id="videos" className="py-20 bg-black/10 pt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">{t('subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {demoVideos.map((video, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white/15 backdrop-blur-lg hover:scale-105 transition-all duration-300 border border-white/20"
              >
                <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
                  <video
                    src={`${API_URL}${video.src}`}
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{video.title}</h3>
                  <p className="text-gray-300 text-sm">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default VideosPage;
