import { useCreateProjectMutation } from '@api';
import { useActiveProjectSelection } from '@store/useActiveProjectSelection';

export function useCreateProject() {
  const [createProject, createProjectState] = useCreateProjectMutation();
  const { selectProject } = useActiveProjectSelection();

  async function handleCreateProject(name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, project: null };
    }

    const result = await createProject({ name: trimmedName }).unwrap();
    selectProject(result.project.id);
    return { success: true, project: result.project };
  }

  return {
    createProject: handleCreateProject,
    ...createProjectState
  };
}
