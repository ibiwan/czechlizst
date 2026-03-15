import { useDeleteProjectMutation } from '@api';
import { useActiveProjectSelection } from '@store/useActiveProjectSelection';

export function useProjectDelete() {
  const { activeProjectId, projects, selectProject } = useActiveProjectSelection();
  const [deleteProject] = useDeleteProjectMutation();

  async function onDeleteProject(projectId: number) {
    const project = projects.find((entry) => entry.id === projectId) ?? null;
    if (!project) {
      return;
    }
    const confirmed = window.confirm(
      `Delete project "${project.name}"? This removes its tasks and notes.`
    );
    if (!confirmed) {
      return;
    }
    await deleteProject({ projectId }).unwrap();
    if (activeProjectId === projectId) {
      selectProject(null);
    }
  }

  return {
    onDeleteProject
  };
}
