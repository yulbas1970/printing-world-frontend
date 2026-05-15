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

const normalizeImageUrl = (url: string | undefined): string => {
  if (!url) return '';

  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return url;

  return `/${url}`;
};

export const loadMurals = async (): Promise<LoadMuralsResult> => {
  const response = await fetch('https://www.imprimiendoelmundoia.es/api/projects/1/images');

  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error cargando murales: ${response.status} ${text.slice(0, 120)}`);
  }

  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`La API no devolvió JSON: ${text.slice(0, 120)}`);
  }

  const data = await response.json();

  const items: Mural[] = Array.isArray(data)
    ? data
    : Array.isArray(data.files)
      ? data.files
      : Array.isArray(data.images)
        ? data.images
        : Array.isArray(data.data)
          ? data.data
          : [];

  const categorizedMurals: CategorizedMurals = {};
  const videoFiles: Mural[] = [];

  items.forEach((item: any, index: number) => {
    const mural: Mural = {
      id: String(item.id ?? item._id ?? item.filename ?? index),
      imageUrl: normalizeImageUrl(item.imageUrl ?? item.url ?? item.src ?? item.path),
      category: normalizeCategory(item.category),
      title: item.title || 'Mural sin título',
      description: item.description || '',
      mimeType: item.mimeType || item.mimetype || '',
      createdAt: item.createdAt || Date.now(),
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
