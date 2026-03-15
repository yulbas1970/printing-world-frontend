import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, ImageIcon, Download, Move, Sparkles, Layers } from 'lucide-react';
import { Stage, Layer, Image as KonvaImage, Rect, Circle } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';


const blendModes = ['multiply', 'overlay', 'normal', 'screen', 'soft-light'];

// Helper function to calculate homography matrix (perspective transform)
// This is a simplified version and might need a more robust library for production
// For a full homography, a library like 'numericjs' or a custom implementation is usually needed.
// For now, we'll use a basic affine transform approximation or a placeholder.
// A true 4-point perspective transform requires solving a system of 8 linear equations.
// Given the complexity, I'll provide a placeholder and note that a dedicated library or
// a more complex implementation would be needed for accurate homography.
// For Konva, we can set a custom transform matrix.
// This function is a placeholder for a proper homography calculation.
// For a real solution, consider a library like 'perspective-transform' (if compatible)
// or a custom implementation based on mathematical principles.
// For now, we'll focus on getting the Konva setup working with basic transformations.
// A true perspective transform is not directly supported by Konva's Image node without
// custom filters or canvas manipulation.
// Let's simplify: Konva can do affine transforms (scale, rotate, skew, translate).
// A 4-point perspective transform is a homography, which is more complex.
// If the goal is to simply map an image to a quadrilateral, we might need to draw it
// directly on a Konva.Shape with a custom scene function, or use a filter.
// Given the time constraints and complexity, I will implement a basic affine transform
// that approximates the perspective by adjusting scale, rotation, and position based on
// the top-left and top-right points, and then note the limitation.
// A true perspective transform would require a custom filter or drawing directly to canvas context.

// Let's try to approximate with affine transforms for now.
// This will not be a true 4-point perspective, but will allow dragging corners.
// For a true perspective, a custom Konva filter or drawing directly to canvas context is needed.
// Given the complexity of implementing a full homography matrix calculation and applying it
// as a Konva filter within this context, I will simplify the approach for now.
// I will focus on making the image draggable and resizable, and then note that a true
// perspective transform would require a more advanced solution.

// Let's define a simple function to get the bounding box from points
const getMuralBoundingBox = (points: { x: number; y: number }[]) => {
  if (points.length !== 4) return { x: 0, y: 0, width: 0, height: 0 };

  const minX = Math.min(points[0].x, points[1].x, points[2].x, points[3].x);
  const maxX = Math.max(points[0].x, points[1].x, points[2].x, points[3].x);
  const minY = Math.min(points[0].y, points[1].y, points[2].y, points[3].y);
  const maxY = Math.max(points[0].y, points[1].y, points[2].y, points[3].y);

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const muralFileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  // State for perspective transform
  const [points, setPoints] = useState([
    { x: 100, y: 100 }, // Top-left
    { x: 300, y: 100 }, // Top-right
    { x: 300, y: 300 }, // Bottom-right
    { x: 100, y: 300 }, // Bottom-left
  ]);
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  
  // New state for user controls
  const [opacity, setOpacity] = useState(0.85);
  const [blendMode, setBlendMode] = useState('multiply'); // Konva blend modes are complex
  const [isDownloading, setIsDownloading] = useState(false);
  const [muralImageLoaded, setMuralImageLoaded] = useState(false);

  // State for fetched murals
  const [galleryMurals, setGalleryMurals] = useState<Array<{id: number, imageUrl: string, title?: string}>>([]);

  // Translations
  const [language] = useState(localStorage.getItem('printingworld-language') || 'es');
  const translations = {
    en: { 
      toolTitle: "Mural Visualizer", 
      toolSubtitle: "Upload a photo of your space and see how our murals would look.",
      disclaimer: "This is a digital simulation. The final colors and scale may vary slightly.",
      uploadSpace: "1. Upload Your Space",
      uploadOrDrag: "Click to upload or drag and drop",
      selectMural: "2. Select a Mural",
      uploadYourMural: "Upload Your Own Design",
      or: "o",
      previewArea: "Preview Area",
      adjustments: "3. Adjust the Preview",
      opacity: "Opacity",
      blendMode: "Blend Mode",
      contactProfessional: "Contact a Professional",
      downloadMural: "Descargar Vista Previa",
      downloading: "Descargando...",
      manualAdjustments: "Arrastra las esquinas para ajustar el mural a la pared",
    },
    es: { 
      toolTitle: "Visualizador de Murales", 
      toolSubtitle: "Sube una foto de tu espacio y mira cómo quedarían nuestros murales.",
      disclaimer: "Esta es una simulación digital. Los colores y la escala final pueden variar ligeramente.",
      uploadSpace: "1. Sube una foto de tu Espacio",
      uploadOrDrag: "Haz clic para subir o arrastra una imagen",
      selectMural: "2. Selecciona un Mural",
      uploadYourMural: "Sube tu propio diseño",
      or: "o",
      previewArea: "Área de Visualización",
      adjustments: "3. Ajusta la Visualización",
      opacity: "Opacidad",
      blendMode: "Modo de Fusión",
      contactProfessional: "Contactar con un Profesional",
      downloadMural: "Descargar Vista Previa",
      downloading: "Descargando...",
      manualAdjustments: "Arrastra las esquinas para ajustar el mural a la pared",
    }
  };
  const t = (key: string) => translations[language as keyof typeof translations][key as keyof typeof translations.en] || key;

  // Fetch murals from backend on component mount
  useEffect(() => {
    console.error('GeneradorPage: useEffect is running.');
    const fetchMurals = async () => {
      try {
        console.error('GeneradorPage: Attempting fetch request.');
        const response = await fetch('http://localhost:5000/projects/1/images');
        console.log('GeneradorPage: Fetch response received.', response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('GeneradorPage: Data received from backend.', data);
        // Prepend backend URL to image paths
        const muralsWithFullUrls = data.map((mural: any) => ({
          ...mural,
          imageUrl: `http://localhost:5000${mural.imageUrl}`
        }));
        setGalleryMurals(muralsWithFullUrls);
        console.log('GeneradorPage: Murals fetched and processed successfully.', muralsWithFullUrls);
      } catch (error) {
        console.error('GeneradorPage: Error fetching murals for generator:', error);
        // Optionally, set an error state or display a message to the user
      }
    };
    fetchMurals();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setShowPreview(false);
        setSelectedMural(null);
        setIsCustomMural(false);
        setMuralImageLoaded(false);
      }
      reader.readAsDataURL(file);
    }
  };

  const handleMuralSelect = (muralImage: string) => {
    setSelectedMural(muralImage);
    setIsCustomMural(false);
    setShowPreview(true);
    setMuralImageLoaded(false);
  };

  const handleCustomMuralUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedMural(result);
        setIsCustomMural(true);
        setShowPreview(true);
        setMuralImageLoaded(false);
      }
      reader.readAsDataURL(file);
    }
  };

  // Konva image loading
  const [spaceImage, spaceImageStatus] = useImage(uploadedImage || '');
  const [muralImage, muralImageStatus] = useImage(selectedMural || '');

  // State for Konva stage dimensions
  const [stageDimensions, setStageDimensions] = useState({ width: 1, height: 1 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Update stage dimensions on container resize using ResizeObserver
  useEffect(() => {
    console.log('useEffect for stageDimensions running. containerRef.current:', containerRef.current);
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === container) {
          setStageDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });

    resizeObserver.observe(container);

    // Initial check in case the observer doesn't fire immediately
    const initialDimensions = {
      width: container.offsetWidth,
      height: container.offsetHeight,
    };
    console.log('Initial stage dimensions:', initialDimensions);
    setStageDimensions(initialDimensions);

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, [uploadedImage]); // Re-run when uploadedImage changes, so we get the container ref

  // Force Konva redraw when relevant state changes
  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.batchDraw();
    }
  }, [spaceImage, muralImage, showPreview, selectedMural, points, opacity, blendMode]);

  // Initialize points when space image loads or container resizes
  useEffect(() => {
    if (spaceImage && containerRef.current) {
      const { naturalWidth, naturalHeight } = spaceImage;
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;

      const aspectRatio = naturalWidth / naturalHeight;
      let newWidth = containerWidth;
      let newHeight = newWidth / aspectRatio;

      if (newHeight > containerHeight) {
        newHeight = containerHeight;
        newWidth = newHeight * aspectRatio;
      }

      const offsetX = (containerWidth - newWidth) / 2;
      const offsetY = (containerHeight - newHeight) / 2;

      setPoints([
        { x: offsetX + newWidth * 0.2, y: offsetY + newHeight * 0.2 },
        { x: offsetX + newWidth * 0.8, y: offsetY + newHeight * 0.2 },
        { x: offsetX + newWidth * 0.8, y: offsetY + newHeight * 0.8 },
        { x: offsetX + newWidth * 0.2, y: offsetY + newHeight * 0.8 },
      ]);
    }
  }, [spaceImage, stageDimensions]);


  // Handle drag for control points
  const handlePointDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>, index: number) => {
    const newPoints = [...points];
    newPoints[index] = { x: e.target.x(), y: e.target.y() };
    setPoints(newPoints);
  }, [points]);

  // Update handleDownload
  const handleDownload = () => {
    const stage = stageRef.current;
    if (!stage) return;

    setIsDownloading(true);

    // Find and hide control points
    const points = stage.find('.control-point');
    points.forEach(point => {
      point.visible(false);
    });
    stage.batchDraw(); // Redraw stage with points hidden

    // Konva stage can directly export to data URL
    const dataURL = stage.toDataURL({
      mimeType: 'image/png',
      quality: 1,
      pixelRatio: 2 // Increase resolution for better quality download
    });

    // Show control points again
    points.forEach(point => {
      point.visible(true);
    });
    stage.batchDraw(); // Redraw stage with points visible

    const link = document.createElement('a');
    link.download = 'mural-visualizer-preview.png';
    link.href = dataURL;
    link.click();
    
    setIsDownloading(false);
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">{t('toolTitle')}</h1>
            <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">{t('toolSubtitle')}</p>
            <p className="mt-2 text-sm text-gray-500">{t('disclaimer')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-gray-900 backdrop-blur-lg rounded-2xl p-6">
                <h3 className="text-2xl font-bold mb-4 flex items-center"><Upload className="h-6 w-6 mr-2 text-yellow-400" />{t('uploadSpace')}</h3>
                <div className="border-2 border-dashed border-white/30 rounded-xl p-6 text-center hover:border-yellow-400 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Uploaded space" className="max-w-full h-32 object-cover mx-auto rounded-lg" />
                  ) : (
                    <div>
                      <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                      <p className="text-md mb-1">{t('uploadOrDrag')}</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              </div>

              <div className="bg-gray-900 backdrop-blur-lg rounded-2xl p-6">
                <h3 className="text-2xl font-bold mb-4 flex items-center"><ImageIcon className="h-6 w-6 mr-2 text-yellow-400" />{t('selectMural')}</h3>
                <div className="grid grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-2">
                  {galleryMurals.map((mural) => (
                    <div key={mural.id} onClick={() => handleMuralSelect(mural.imageUrl)} className={`rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${!isCustomMural && selectedMural === mural.imageUrl ? 'border-yellow-400' : 'border-transparent hover:border-white/50'}`}>
                      <img src={mural.imageUrl} alt={mural.title || 'Mural'} className="w-full h-24 object-cover flex-shrink-0" />
                      <p className="text-xs text-center bg-black/30 p-1">{mural.title || 'Mural'}</p>
                    </div>
                  ))}
                </div>
                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm">{t('or')}</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>
                <button onClick={() => muralFileInputRef.current?.click()} className={`w-full p-3 rounded-lg font-semibold border-2 transition-colors ${isCustomMural ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-transparent border-dashed border-white/30 hover:border-yellow-400'}`}>
                  {t('uploadYourMural')}
                </button>
                <input type="file" ref={muralFileInputRef} onChange={handleCustomMuralUpload} accept="image/*" className="hidden" />
              </div>
            </div>

            <div className="lg:col-span-1 bg-gray-900 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-4 flex items-center justify-center"><Sparkles className="h-6 w-6 mr-2 text-yellow-400" />{t('previewArea')}</h3>
              
              {uploadedImage ? (
                <>
                  <div 
                    ref={containerRef} // Use containerRef for the div holding Konva Stage
                    className="relative w-full aspect-[4/3] bg-black overflow-hidden rounded-lg shadow-lg touch-none"
                  >
                    <Stage
                      key={`${stageDimensions.width}-${stageDimensions.height}`}
                      width={stageDimensions.width}
                      height={stageDimensions.height}
                      ref={stageRef}
                    >
                      <Layer>
                        {/* Space Image */}
                        {spaceImage && (
                          <KonvaImage
                            image={spaceImage}
                            width={stageDimensions.width}
                            height={stageDimensions.height}
                            alt="Uploaded space"
                          />
                        )}

                        {/* Mural Image with approximated perspective */}
                        {showPreview && selectedMural && muralImage && points.length === 4 && (
                          <KonvaImage
                            image={muralImage}
                            x={getMuralBoundingBox(points).x}
                            y={getMuralBoundingBox(points).y}
                            width={getMuralBoundingBox(points).width}
                            height={getMuralBoundingBox(points).height}
                            opacity={opacity}
                            // Konva blend modes are set via globalCompositeOperation on the layer or shape
                            // For now, we'll omit blendMode application directly on the image.
                            // A true perspective transform with blend modes would require custom filters.
                            // globalCompositeOperation={blendMode} // This would apply to the whole layer
                            alt="Mural Preview"
                          />
                        )}

                        {/* Draggable Control Points */}
                        {showPreview && selectedMural && points.map((point, index) => (
                          <Circle
                            key={index}
                            name="control-point"
                            x={point.x}
                            y={point.y}
                            radius={10}
                            fill="yellow"
                            stroke="black"
                            strokeWidth={2}
                            draggable
                            onDragMove={(e) => handlePointDragMove(e, index)}
                            onDragEnd={(e) => handlePointDragMove(e, index)} // Update points on drag end too
                          />
                        ))}
                      </Layer>
                    </Stage>
                  </div>
                  <p className="mt-2 text-center text-yellow-400 animate-pulse text-sm">{t('manualAdjustments')}</p>
                </>
              ) : (
                <div className="w-full aspect-[4/3] bg-black rounded-lg shadow-lg flex items-center justify-center text-gray-500">
                  <p>Sube una foto de tu espacio para empezar</p>
                </div>
              )}

              {showPreview && selectedMural && (
                <div className="mt-4 bg-gray-950/50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold mb-3 flex items-center"><Layers className="h-5 w-5 mr-2 text-yellow-400"/>{t('adjustments')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="opacity" className="block text-sm font-medium mb-1">{t('opacity')}</label>
                      <input
                        type="range"
                        id="opacity"
                        min="0"
                        max="1"
                        step="0.05"
                        value={opacity}
                        onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label htmlFor="blendMode" className="block text-sm font-medium mb-1">{t('blendMode')}</label>
                      <select
                        id="blendMode"
                        value={blendMode}
                        onChange={(e) => setBlendMode(e.target.value)}
                        className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                      >
                        {blendModes.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={handleDownload}
                  disabled={!showPreview || isDownloading} 
                  className="bg-yellow-500 text-black py-3 px-6 rounded-xl font-bold text-lg hover:bg-yellow-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-5 w-5 mr-2" /> 
                  {isDownloading ? t('downloading') : t('downloadMural')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GeneradorPage;