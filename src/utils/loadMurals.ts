import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';

export interface Mural {
  id: string;
  imageUrl: string;
  category: string;
  title?: string;
  description?: string;
  mimeType?: string;
  cloudinaryPublicId?: string;
  createdAt?: number;
}

export interface CategorizedMurals {
  [key: string]: Mural[];
}

interface LoadMuralsResult {
  categorizedMurals: CategorizedMurals;
  videoFiles: Mural[];
}

const normalizeCategory = (category: string | undefined): string => {
  if (!category) return 'general';

  const normalized = category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

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
    case 'video':
    case 'videos':
      return 'video';
    default:
      return 'general';
  }
};

export const loadMurals = async (): Promise<LoadMuralsResult> => {
  const categorizedMurals: CategorizedMurals = {};
  const videoFiles: Mural[] = [];

  const muralsRef = collection(db, 'murals');
  const q = query(muralsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  snapshot.forEach((docItem) => {
    const data = docItem.data();

    const mural: Mural = {
      id: docItem.id,
      imageUrl: data.imageUrl || '',
      category: normalizeCategory(data.category),
      title: data.title || 'Mural sin título',
      description: data.description || '',
      mimeType: data.mimeType || '',
      cloudinaryPublicId: data.cloudinaryPublicId || '',
      createdAt: data.createdAt || 0,
    };

    if (!mural.imageUrl) return;

    const isVideo =
      mural.mimeType?.startsWith('video/') ||
      mural.imageUrl.match(/\.(mp4|webm|mov|avi)$/i);

    if (isVideo) {
      videoFiles.push(mural);
      return;
    }

    const category = normalizeCategory(mural.category);

    if (!categorizedMurals[category]) {
      categorizedMurals[category] = [];
    }

    categorizedMurals[category].push(mural);
  });

  return { categorizedMurals, videoFiles };
};