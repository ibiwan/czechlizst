import { type WorkStatus } from '@app/contracts';
import {
  useDemoteActiveTasksInProjectMutation,
  useDemoteActiveTasksOutsideProjectMutation,
  useUpdateProjectStatusMutation
} from '@api';
import { useActiveProjectSelection } from '@store/useActiveProjectSelection';

export function useProjectStatus(activeProjectId: number | null) {
  const { projects, projectsQuery } = useActiveProjectSelection();
  const [updateProjectStatus, updateProjectStatusState] = useUpdateProjectStatusMutation();
  const [demoteActiveTasksOutsideProject] = useDemoteActiveTasksOutsideProjectMutation();
  const [demoteActiveTasksInProject] = useDemoteActiveTasksInProjectMutation();

  async function demoteOtherActiveProjects(nextActiveProjectId: number) {
    const activeProjects = projects.filter(
      (project) => project.status === 'active' && project.id !== nextActiveProjectId
    );
    for (const project of activeProjects) {
      await updateProjectStatus({ projectId: project.id, status: 'started' }).unwrap();
    }
  }

  async function setProjectStatus(projectId: number, nextStatus: WorkStatus) {
    if (nextStatus === 'active') {
      await demoteOtherActiveProjects(projectId);
      await demoteActiveTasksOutsideProject({ projectId }).unwrap();
    } else {
      await demoteActiveTasksInProject({ projectId }).unwrap();
    }
    await updateProjectStatus({ projectId, status: nextStatus }).unwrap();
    projectsQuery.refetch();
  }

  async function onUpdateProjectStatus(currentStatus: WorkStatus, nextStatus: WorkStatus) {
    if (activeProjectId === null || nextStatus === currentStatus) {
      return;
    }
    await setProjectStatus(activeProjectId, nextStatus);
  }

  return {
    setProjectStatus,
    onUpdateProjectStatus,
    updateProjectStatusState
  };
}
