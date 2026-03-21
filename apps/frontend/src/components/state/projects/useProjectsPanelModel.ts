import {
  useListAllTaskBlockersQuery,
  useListAllTasksQuery,
  useListProjectNotesQuery,
  useListTasksQuery
} from '@api';
import {
  computeEffectiveTaskStatus,
  computeProjectStatusFromTasks,
  type WorkStatus
} from '@app/contracts';
import { useActiveProjectSelection } from '@store/useActiveProjectSelection';
import { useMemo } from 'react';

export function useProjectsPanelModel() {
  const { activeProjectId, projects, projectsQuery, selectProject } = useActiveProjectSelection();

  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null;

  const tasksQuery = useListTasksQuery(activeProjectId ?? 0, {
    skip: activeProjectId === null
  });
  const tasks = tasksQuery.data?.tasks ?? [];
  const allTasksQuery = useListAllTasksQuery();
  const allTasks = useMemo(() => allTasksQuery.data?.tasks ?? [], [allTasksQuery.data?.tasks]);
  const allTaskBlockersQuery = useListAllTaskBlockersQuery();
  const allTaskBlockers = useMemo(
    () => allTaskBlockersQuery.data?.taskBlockers ?? [],
    [allTaskBlockersQuery.data?.taskBlockers]
  );

  const projectNotesQuery = useListProjectNotesQuery(activeProjectId ?? 0, {
    skip: activeProjectId === null
  });
  const projectNotes = projectNotesQuery.data?.notes ?? [];

  const effectiveProjectStatusById = useMemo(() => {
    const effectiveTasksByProjectId = new Map<number, Array<{ status: WorkStatus }>>();

    for (const task of allTasks) {
      const effectiveStatus = computeEffectiveTaskStatus(task, allTaskBlockers, allTasks);
      const existing = effectiveTasksByProjectId.get(task.projectId);
      if (existing) {
        existing.push({ status: effectiveStatus });
      } else {
        effectiveTasksByProjectId.set(task.projectId, [{ status: effectiveStatus }]);
      }
    }

    return new Map(
      projects.map((project) => {
        const derivedStatus =
          computeProjectStatusFromTasks(effectiveTasksByProjectId.get(project.id) ?? []) ?? 'todo';

        return [project.id, derivedStatus];
      })
    );
  }, [allTaskBlockers, allTasks, projects]);

  const effectiveProjectStatus =
    activeProject === null
      ? 'todo'
      : effectiveProjectStatusById.get(activeProject.id) ?? 'todo';

  return {
    activeProject,
    activeProjectId,
    allTasks,
    effectiveProjectStatusById,
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
