import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, ImageIcon, Download, Sparkles } from 'lucide-react';
import { Stage, Layer, Image as KonvaImage, Circle } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const getMuralBoundingBox = (points: { x: number; y: number }[]) => {
  const minX = Math.min(...points.map((p) => p.x));
  const maxX = Math.max(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxY = Math.max(...points.map((p) => p.y));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const GeneradorPage = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedMural, setSelectedMural] = useState<string | null>(null);
  const [isCustomMural, setIsCustomMural] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [opacity, setOpacity] = useState(0.85);

  const [isDownloading, setIsDownloading] = useState(false);

  const [galleryMurals, setGalleryMurals] = useState<
    Array<{ id: string; imageUrl: string; title?: string }>
  >([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const muralFileInputRef = useRef<HTMLInputElement>(null);

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [points, setPoints] = useState([
    { x: 100, y: 100 },
    { x: 300, y: 100 },
    { x: 300, y: 300 },
    { x: 100, y: 300 },
  ]);

  const [stageDimensions, setStageDimensions] = useState({
    width: 1,
    height: 1,
  });

  const [language] = useState(
    localStorage.getItem('printingworld-language') || 'es'
  );

  const translations = {
    en: {
      toolTitle: 'Mural Visualizer',
      toolSubtitle:
        'Upload a photo of your space and see how our murals would look.',
      disclaimer:
        'This is a digital simulation. The final colors and scale may vary slightly.',
      uploadSpace: '1. Upload Your Space',
      uploadOrDrag: 'Click to upload or drag and drop',
      selectMural: '2. Select a Mural',
      uploadYourMural: 'Upload Your Own Design',
      or: 'or',
      previewArea: 'Preview Area',
      opacity: 'Opacity',
      downloadMural: 'Download Preview',
      downloading: 'Downloading...',
      manualAdjustments: 'Drag the corners to fit the mural on the wall',
    },

    es: {
      toolTitle: 'Visualizador de Murales',
      toolSubtitle:
        'Sube una foto de tu espacio y mira cómo quedarían nuestros murales.',
      disclaimer:
        'Esta es una simulación digital. Los colores y la escala final pueden variar ligeramente.',
      uploadSpace: '1. Sube una foto de tu Espacio',
      uploadOrDrag: 'Haz clic para subir o arrastra una imagen',
      selectMural: '2. Selecciona un Mural',
      uploadYourMural: 'Sube tu propio diseño',
      or: 'o',
      previewArea: 'Área de Visualización',
      opacity: 'Opacidad',
      downloadMural: 'Descargar Vista Previa',
      downloading: 'Descargando...',
      manualAdjustments:
        'Arrastra las esquinas para ajustar el mural a la pared',
    },
  };

  const t = (key: string) =>
    translations[language as keyof typeof translations][
      key as keyof typeof translations.es
    ] || key;

  useEffect(() => {
    const fetchMurals = async () => {
      try {
        const q = query(
          collection(db, 'previewMurals'),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);

        const muralsFromFirebase = snapshot.docs
          .map((document) => {
            const item = document.data();

            return {
              id: document.id,
              imageUrl: item.imageUrl || item.url || '',
              title: item.title || 'Mural para vista previa',
            };
          })
          .filter((mural) => mural.imageUrl);

        setGalleryMurals(muralsFromFirebase);
      } catch (error) {
        console.error('Error cargando murales para el generador:', error);
      }
    };

    fetchMurals();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setShowPreview(false);
      setSelectedMural(null);
      setIsCustomMural(false);
    };

    reader.readAsDataURL(file);
  };

  const handleCustomMuralUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      setSelectedMural(e.target?.result as string);
      setIsCustomMural(true);
      setShowPreview(true);
    };

    reader.readAsDataURL(file);
  };

  const handleMuralSelect = (muralImage: string) => {
    setSelectedMural(muralImage);
    setIsCustomMural(false);
    setShowPreview(true);
  };

  const [spaceImage] = useImage(uploadedImage || '');
  const [muralImage] = useImage(selectedMural || '');

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const updateSize = () => {
      setStageDimensions({
        width: container.offsetWidth || 1,
        height: container.offsetHeight || 1,
      });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [uploadedImage]);

  useEffect(() => {
    if (!spaceImage || !containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;

    setPoints([
      { x: containerWidth * 0.2, y: containerHeight * 0.2 },
      { x: containerWidth * 0.8, y: containerHeight * 0.2 },
      { x: containerWidth * 0.8, y: containerHeight * 0.8 },
      { x: containerWidth * 0.2, y: containerHeight * 0.8 },
    ]);
  }, [spaceImage, stageDimensions]);

  const handlePointDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, index: number) => {
      const newPoints = [...points];
      newPoints[index] = { x: e.target.x(), y: e.target.y() };
      setPoints(newPoints);
    },
    [points]
  );

  const handleDownload = () => {
    const stage = stageRef.current;

    if (!stage) return;

    setIsDownloading(true);

    const controlPoints = stage.find('.control-point');

    controlPoints.forEach((point) => point.visible(false));

    stage.batchDraw();

    const dataURL = stage.toDataURL({
      mimeType: 'image/png',
      quality: 1,
      pixelRatio: 2,
    });

    controlPoints.forEach((point) => point.visible(true));

    stage.batchDraw();

    const link = document.createElement('a');

    link.download = 'mural-visualizer-preview.png';
    link.href = dataURL;
    link.click();

    setIsDownloading(false);
  };

  const box = getMuralBoundingBox(points);

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <section className="py-12 md:py-20 pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
              {t('toolTitle')}
            </h1>

            <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              {t('toolSubtitle')}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              {t('disclaimer')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            <div className="space-y-8">
              <div className="bg-gray-900 rounded-2xl p-6">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <Upload className="h-6 w-6 mr-2 text-yellow-400" />
                  {t('uploadSpace')}
                </h3>

                <div
                  className="border-2 border-dashed border-white/30 rounded-xl p-6 text-center hover:border-yellow-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadedImage ? (
                    <img
                      src={uploadedImage}
                      alt="Uploaded space"
                      className="max-w-full h-32 object-cover mx-auto rounded-lg"
                    />
                  ) : (
                    <div>
                      <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                      <p>{t('uploadOrDrag')}</p>

                      <p className="text-xs text-gray-400">
                        PNG, JPG, WEBP
                      </p>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="bg-gray-900 rounded-2xl p-6">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <ImageIcon className="h-6 w-6 mr-2 text-yellow-400" />
                  {t('selectMural')}
                </h3>

                <div className="grid grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-2">
                  {galleryMurals.length === 0 ? (
                    <p className="col-span-2 text-gray-400 text-sm">
                      Todavía no hay murales disponibles para vista previa.
                    </p>
                  ) : (
                    galleryMurals.map((mural) => (
                      <div
                        key={mural.id}
                        onClick={() => handleMuralSelect(mural.imageUrl)}
                        className={`rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          !isCustomMural &&
                          selectedMural === mural.imageUrl
                            ? 'border-yellow-400'
                            : 'border-transparent hover:border-white/50'
                        }`}
                      >
                        <img
                          src={mural.imageUrl}
                          alt={mural.title || 'Mural'}
                          className="w-full h-24 object-cover"
                        />

                        <p className="text-xs text-center bg-black/30 p-1">
                          {mural.title || 'Mural'}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="relative flex py-5 items-center">
                  <div className="flex-grow border-t border-gray-600" />

                  <span className="flex-shrink mx-4 text-gray-400 text-sm">
                    {t('or')}
                  </span>

                  <div className="flex-grow border-t border-gray-600" />
                </div>

                <button
                  onClick={() => muralFileInputRef.current?.click()}
                  className={`w-full p-3 rounded-lg font-semibold border-2 transition-colors ${
                    isCustomMural
                      ? 'bg-yellow-400 text-black border-yellow-400'
                      : 'bg-transparent border-dashed border-white/30 hover:border-yellow-400'
                  }`}
                >
                  {t('uploadYourMural')}
                </button>

                <input
                  type="file"
                  ref={muralFileInputRef}
                  onChange={handleCustomMuralUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-4 flex items-center justify-center">
                <Sparkles className="h-6 w-6 mr-2 text-yellow-400" />
                {t('previewArea')}
              </h3>

              {uploadedImage ? (
                <>
                  <div
                    ref={containerRef}
                    className="relative w-full aspect-[4/3] bg-black overflow-hidden rounded-lg shadow-lg touch-none"
                  >
                    <Stage
                      width={stageDimensions.width}
                      height={stageDimensions.height}
                      ref={stageRef}
                    >
                      <Layer>
                        {spaceImage && (
                          <KonvaImage
                            image={spaceImage}
                            width={stageDimensions.width}
                            height={stageDimensions.height}
                          />
                        )}

                        {showPreview &&
                          selectedMural &&
                          muralImage && (
                            <KonvaImage
                              image={muralImage}
                              x={box.x}
                              y={box.y}
                              width={box.width}
                              height={box.height}
                              opacity={opacity}
                            />
                          )}

                        {showPreview &&
                          points.map((point, index) => (
                            <Circle
                              key={index}
                              name="control-point"
                              x={point.x}
                              y={point.y}
                              radius={8}
                              fill="#facc15"
                              stroke="black"
                              strokeWidth={2}
                              draggable
                              onDragMove={(e) =>
                                handlePointDragMove(e, index)
                              }
                            />
                          ))}
                      </Layer>
                    </Stage>
                  </div>

                  {showPreview && (
                    <div className="mt-6 space-y-4">
                      <p className="text-sm text-gray-400 text-center">
                        {t('manualAdjustments')}
                      </p>

                      <div>
                        <label className="block mb-2">
                          {t('opacity')}
                        </label>

                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={opacity}
                          onChange={(e) =>
                            setOpacity(Number(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>

                      <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                      >
                        <Download className="h-5 w-5" />

                        {isDownloading
                          ? t('downloading')
                          : t('downloadMural')}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-white/20 rounded-2xl min-h-[500px]">
                  <div className="text-center text-gray-500">
                    <ImageIcon className="h-20 w-20 mx-auto mb-4 opacity-50" />

                    <p className="text-lg">
                      {t('uploadSpace')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GeneradorPage;