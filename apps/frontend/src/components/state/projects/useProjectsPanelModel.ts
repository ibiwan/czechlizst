import {
  useListAllTaskBlockersQuery,
  useListAllTasksQuery,
  useListProjectNotesQuery,
  useListTasksQuery
} from '@api';
import { computeEffectiveTaskStatus, computeProjectStatusFromTasks } from '@app/contracts';
import { useActiveProjectSelection } from '@store/useActiveProjectSelection';

export function useProjectsPanelModel() {
  const { activeProjectId, projects, projectsQuery, selectProject } = useActiveProjectSelection();

  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null;

  const tasksQuery = useListTasksQuery(activeProjectId ?? 0, {
    skip: activeProjectId === null
  });
  const tasks = tasksQuery.data?.tasks ?? [];
  const allTasksQuery = useListAllTasksQuery();
  const allTasks = allTasksQuery.data?.tasks ?? [];
  const allTaskBlockersQuery = useListAllTaskBlockersQuery();
  const allTaskBlockers = allTaskBlockersQuery.data?.taskBlockers ?? [];

  const projectNotesQuery = useListProjectNotesQuery(activeProjectId ?? 0, {
    skip: activeProjectId === null
  });
  const projectNotes = projectNotesQuery.data?.notes ?? [];

  const effectiveProjectStatus =
    activeProject === null
      ? 'todo'
      : tasks.length === 0
        ? activeProject.status
        : computeProjectStatusFromTasks(
            tasks.map((task) => ({
              status: computeEffectiveTaskStatus(task, allTaskBlockers, allTasks)
            }))
          ) ?? activeProject.status;

  return {
    activeProject,
    activeProjectId,
    allTasks,
    effectiveProjectStatus,
    projectNotes,
    projectNotesQuery,
    projects,
    projectsQuery,
    selectProject,
    allTaskBlockers,
    allTaskBlockersQuery,
    tasks
  };
}
