import { db } from '../services/firebase'; // Importar db de Firebase
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface Mural {
  id: string; // Firebase ID es string
  imageUrl: string;
  category: string;
  title?: string;
  description?: string;
  mimeType?: string;
  cloudinaryPublicId?: string; // Añadir si es relevante
  createdAt?: number; // Añadir si es relevante
}

interface CategorizedMurals {
  [key: string]: Mural[];
}

interface LoadMuralsResult {
  categorizedMurals: CategorizedMurals;
  videoFiles: Mural[];
}

// Función para normalizar categorías
const normalizeCategory = (category: string | undefined): string => {
  if (!category) return 'uncategorized';
  let normalized = category.toLowerCase();
  normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Quitar tildes

  switch (normalized) {
    case 'salon':
    case 'salones':
      return 'salones';
    case 'cocina':
    case 'cocinas':
      return 'cocinas';
    case 'dormitorio':
    case 'dormitorios':
      return 'dormitorios';
    case 'infantil':
    case 'infantiles':
    case 'ninos':
    case 'niños':
      return 'infantiles';
    case 'bano':
    case 'banos':
    case 'baño':
    case 'baños':
      return 'banos';
    case 'pasillo':
    case 'pasillos':
      return 'pasillos';
    case 'general':
      return 'general';
    default:
      return normalized;
  }
};

export const loadMurals = async (): Promise<LoadMuralsResult> => { // Eliminar isAuthenticated
  try {
    console.log('Loading murals from Firebase...');

    const q = query(collection(db, 'murales'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);

    const data: Mural[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Mural, 'id'>),
    }));

    const categorizedMurals: CategorizedMurals = {};
    const videoFiles: Mural[] = [];

    data.forEach(item => {
      // Excluir videos. Usar mimeType si está disponible y es más preciso.
      // Si el backend no devuelve mimeType, se puede seguir usando item.category
      const isVideo = item.mimeType?.startsWith('video/') || normalizeCategory(item.category) === 'video';

      if (isVideo) {
        videoFiles.push(item);
      } else {
        const category = normalizeCategory(item.category);
        if (!categorizedMurals[category]) {
          categorizedMurals[category] = [];
        }
        categorizedMurals[category].push(item);
      }
    });

    return { categorizedMurals, videoFiles };

  } catch (error) {
    console.error('Error loading murals:', error);
    throw error; // Re-throw para que el componente que llama pueda manejarlo
  }
};
