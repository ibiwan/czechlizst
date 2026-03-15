import { useEffect, useMemo, useState } from 'react';
import { type WorkStatus } from '@app/contracts';
import {
  useCreateProjectMutation,
  useCreateProjectNoteMutation,
  useDemoteActiveTasksOutsideProjectMutation,
  useDeleteProjectMutation,
  useListProjectNotesQuery,
  useListTasksQuery,
  useUpdateProjectMutation,
  useUpdateProjectNoteMutation,
  useUpdateProjectStatusMutation
} from '../../api';
import { useActiveProjectSelection } from '../../useActiveProjectSelection';

export function useProjectsPanelModel() {
  const { activeProjectId, projects, projectsQuery, selectProject } = useActiveProjectSelection();

  const [projectInputOpen, setProjectInputOpen] = useState(false);
  const [projectRenameOpen, setProjectRenameOpen] = useState(false);
  const [projectNoteInputOpen, setProjectNoteInputOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [projectRenameValue, setProjectRenameValue] = useState('');
  const [newProjectNoteBody, setNewProjectNoteBody] = useState('');
  const [newProjectNoteReferenceUrl, setNewProjectNoteReferenceUrl] = useState('');

  const [createProject, createProjectState] = useCreateProjectMutation();
  const [createProjectNote, createProjectNoteState] = useCreateProjectNoteMutation();
  const [updateProject, updateProjectState] = useUpdateProjectMutation();
  const [updateProjectStatus, updateProjectStatusState] = useUpdateProjectStatusMutation();
  const [demoteActiveTasksOutsideProject] = useDemoteActiveTasksOutsideProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [updateProjectNote, updateProjectNoteState] = useUpdateProjectNoteMutation();

  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null;

  const tasksQuery = useListTasksQuery(activeProjectId ?? 0, {
    skip: activeProjectId === null
  });
  const tasks = useMemo(() => tasksQuery.data?.tasks ?? [], [tasksQuery.data?.tasks]);

  const projectNotesQuery = useListProjectNotesQuery(activeProjectId ?? 0, {
    skip: activeProjectId === null
  });
  const projectNotes = projectNotesQuery.data?.notes ?? [];

  const effectiveProjectStatus = activeProject?.status ?? 'todo';

  useEffect(() => {
    if (activeProject) {
      setProjectRenameValue(activeProject.name);
    } else {
      setProjectRenameValue('');
    }
    setProjectRenameOpen(false);
  }, [activeProject, activeProjectId, activeProject?.name]);

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
    const referenceUrl = newProjectNoteReferenceUrl.trim();
    await createProjectNote({
      projectId: activeProjectId,
      body,
      referenceUrl: referenceUrl ? referenceUrl : null
    }).unwrap();
    setNewProjectNoteBody('');
    setNewProjectNoteReferenceUrl('');
    setProjectNoteInputOpen(false);
  }

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

  async function onUpdateProjectName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeProjectId === null || activeProject === null) {
      return;
    }
    const name = projectRenameValue.trim();
    if (!name || name === activeProject.name) {
      setProjectRenameOpen(false);
      return;
    }
    await updateProject({ projectId: activeProjectId, name }).unwrap();
    setProjectRenameOpen(false);
  }

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

  async function onUpdateProjectNote(noteId: number, body: string, referenceUrl: string | null) {
    if (activeProjectId === null) {
      return;
    }
    const trimmed = body.trim();
    if (!trimmed) {
      return;
    }
    await updateProjectNote({
      noteId,
      projectId: activeProjectId,
      body: trimmed,
      referenceUrl
    }).unwrap();
  }

  return {
    activeProject,
    activeProjectId,
    createProjectNoteState,
    createProjectState,
    effectiveProjectStatus,
    newProjectName,
    newProjectNoteBody,
    newProjectNoteReferenceUrl,
    onCreateProject,
    onCreateProjectNote,
    onDeleteProject,
    onUpdateProjectStatus,
    onUpdateProjectName,
    onUpdateProjectNote,
    projectRenameOpen,
    projectRenameValue,
    projectInputOpen,
    projectNoteInputOpen,
    projectNotes,
    projectNotesQuery,
    projects,
    projectsQuery,
    selectProject,
    setNewProjectName,
    setNewProjectNoteBody,
    setNewProjectNoteReferenceUrl,
    setProjectRenameOpen,
    setProjectRenameValue,
    setProjectInputOpen,
    setProjectNoteInputOpen,
    tasks,
    setProjectStatus,
    updateProjectState,
    updateProjectNoteState,
    updateProjectStatusState
  };
}
