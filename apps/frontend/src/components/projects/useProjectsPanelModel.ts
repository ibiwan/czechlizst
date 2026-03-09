import { useMemo, useState } from 'react';
import { type WorkStatus, computeProjectStatusFromTasks } from '@app/contracts';
import {
  useCreateProjectMutation,
  useCreateProjectNoteMutation,
  useListProjectNotesQuery,
  useListTasksQuery,
  useUpdateProjectStatusMutation
} from '../../api';
import { useActiveProjectSelection } from '../../useActiveProjectSelection';

export function useProjectsPanelModel() {
  const { activeProjectId, projects, projectsQuery, selectProject } = useActiveProjectSelection();

  const [projectInputOpen, setProjectInputOpen] = useState(false);
  const [projectNoteInputOpen, setProjectNoteInputOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectNoteBody, setNewProjectNoteBody] = useState('');

  const [createProject, createProjectState] = useCreateProjectMutation();
  const [createProjectNote, createProjectNoteState] = useCreateProjectNoteMutation();
  const [updateProjectStatus, updateProjectStatusState] = useUpdateProjectStatusMutation();

  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null;

  const tasksQuery = useListTasksQuery(activeProjectId ?? 0, {
    skip: activeProjectId === null
  });
  const tasks = useMemo(() => tasksQuery.data?.tasks ?? [], [tasksQuery.data?.tasks]);

  const projectNotesQuery = useListProjectNotesQuery(activeProjectId ?? 0, {
    skip: activeProjectId === null
  });
  const projectNotes = projectNotesQuery.data?.notes ?? [];

  const computedProjectStatus = useMemo(() => computeProjectStatusFromTasks(tasks), [tasks]);
  const effectiveProjectStatus = computedProjectStatus ?? activeProject?.status ?? 'todo';
  const projectStatusDiffers =
    activeProject !== null &&
    computedProjectStatus !== null &&
    computedProjectStatus !== activeProject.status;

  async function onCreateProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newProjectName.trim();
    if (!name) {
      return;
    }

    const result = await createProject({ name }).unwrap();
    selectProject(result.project.id);
    setNewProjectName('');
    setProjectInputOpen(false);
  }

  async function onCreateProjectNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = newProjectNoteBody.trim();
    if (!body || activeProjectId === null) {
      return;
    }

    await createProjectNote({ projectId: activeProjectId, body }).unwrap();
    setNewProjectNoteBody('');
    setProjectNoteInputOpen(false);
  }

  async function onUpdateProjectStatus(currentStatus: WorkStatus, nextStatus: WorkStatus) {
    if (activeProjectId === null || nextStatus === currentStatus || tasks.length > 0) {
      return;
    }

    await updateProjectStatus({ projectId: activeProjectId, status: nextStatus }).unwrap();
    projectsQuery.refetch();
  }

  return {
    activeProject,
    activeProjectId,
    createProjectNoteState,
    createProjectState,
    effectiveProjectStatus,
    newProjectName,
    newProjectNoteBody,
    onCreateProject,
    onCreateProjectNote,
    onUpdateProjectStatus,
    projectInputOpen,
    projectNoteInputOpen,
    projectNotes,
    projectNotesQuery,
    projectStatusDiffers,
    projects,
    projectsQuery,
    selectProject,
    setNewProjectName,
    setNewProjectNoteBody,
    setProjectInputOpen,
    setProjectNoteInputOpen,
    tasks,
    updateProjectStatusState
  };
}
