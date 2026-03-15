import { useListProjectNotesQuery, useListTasksQuery } from '@api';
import { useActiveProjectSelection } from '@store/useActiveProjectSelection';

export function useProjectsPanelModel() {
  const { activeProjectId, projects, projectsQuery, selectProject } = useActiveProjectSelection();

  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null;

  const tasksQuery = useListTasksQuery(activeProjectId ?? 0, {
    skip: activeProjectId === null
  });
  const tasks = tasksQuery.data?.tasks ?? [];

  const projectNotesQuery = useListProjectNotesQuery(activeProjectId ?? 0, {
    skip: activeProjectId === null
  });
  const projectNotes = projectNotesQuery.data?.notes ?? [];

  const effectiveProjectStatus = activeProject?.status ?? 'todo';

  return {
    activeProject,
    activeProjectId,
    effectiveProjectStatus,
    projectNotes,
    projectNotesQuery,
    projects,
    projectsQuery,
    selectProject,
    tasks
  };
}
