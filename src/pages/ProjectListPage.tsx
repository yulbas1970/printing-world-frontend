import { useEffect, useState } from 'react';

interface Project {
  id: string;
  name?: string;
  title?: string;
  category?: string;
}

const ProjectListPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Temporalmente vacío para eliminar llamadas API antiguas
    setProjects([]);
  }, []);

  return (
    <div className="min-h-screen pt-24 px-6 text-white">
      <h1 className="text-4xl font-bold mb-8">
        Lista de Proyectos
      </h1>

      {projects.length === 0 ? (
        <p className="text-gray-400">
          No hay proyectos cargados.
        </p>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white/10 p-4 rounded-xl"
            >
              <h2 className="text-xl font-bold">
                {project.title || project.name}
              </h2>

              <p className="text-gray-300">
                {project.category}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectListPage;