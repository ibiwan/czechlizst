type HasId = {
  id: number;
};

export function getActiveProjectId<T extends HasId>(
  projects: T[],
  selectedProjectId: number | null
) {
  if (
    selectedProjectId !== null &&
    projects.some((project) => project.id === selectedProjectId)
  ) {
    return selectedProjectId;
  }

  return projects.length > 0 ? projects[0].id : null;
}
