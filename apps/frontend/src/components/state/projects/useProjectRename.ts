import { useUpdateProjectMutation } from '@api';
import { useActiveProjectSelection } from '@store/useActiveProjectSelection';

export function useProjectRename(activeProjectId: number | null) {
  const { projects } = useActiveProjectSelection();
  const [updateProject, updateProjectState] = useUpdateProjectMutation();
  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;

  async function onUpdateProjectName(name: string) {
    if (activeProjectId === null || activeProject === null) {
      return false;
    }
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName === activeProject.name) {
      return false;
    }
    await updateProject({ projectId: activeProjectId, name: trimmedName }).unwrap();
    return true;
  }

  return {
    onUpdateProjectName,
    updateProjectState
  };
}
