import { useEffect, useMemo, useState } from 'react';
import { type WorkStatus } from '@app/contracts';
import {
  useCreateTaskMutation,
  useCreateTaskNoteMutation,
  useDemoteActiveTasksExceptTaskMutation,
  useDemoteActiveTasksOutsideProjectMutation,
  useDeleteTaskMutation,
  useListTaskNotesQuery,
  useListTasksQuery,
  useUpdateTaskMutation,
  useUpdateTaskNoteMutation,
  useUpdateTaskStatusMutation,
  useUpdateProjectStatusMutation
} from '../../api';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setSelectedTaskId } from '../../mainPageSlice';
import { useActiveProjectSelection } from '../../useActiveProjectSelection';

export function useTasksPanelModel() {
  const dispatch = useAppDispatch();
  const selectedTaskId = useAppSelector((state) => state.mainPage.selectedTaskId);

  const { activeProjectId, projects, projectsQuery } = useActiveProjectSelection();

  const [taskInputOpen, setTaskInputOpen] = useState(false);
  const [taskNoteInputOpen, setTaskNoteInputOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNoteBody, setNewTaskNoteBody] = useState('');
  const [newTaskNoteReferenceUrl, setNewTaskNoteReferenceUrl] = useState('');

  const tasksQuery = useListTasksQuery(activeProjectId ?? 0, {
    skip: activeProjectId === null
  });
  const tasks = useMemo(() => tasksQuery.data?.tasks ?? [], [tasksQuery.data?.tasks]);

  useEffect(() => {
    if (selectedTaskId === null) {
      return;
    }
    if (!tasks.some((task) => task.id === selectedTaskId)) {
      dispatch(setSelectedTaskId(null));
      setTaskNoteInputOpen(false);
      setNewTaskNoteBody('');
      setNewTaskNoteReferenceUrl('');
    }
  }, [dispatch, selectedTaskId, tasks]);

  const taskNotesQuery = useListTaskNotesQuery(selectedTaskId ?? 0, {
    skip: selectedTaskId === null
  });
  const taskNotes = taskNotesQuery.data?.notes ?? [];

  const [createTask, createTaskState] = useCreateTaskMutation();
  const [createTaskNote, createTaskNoteState] = useCreateTaskNoteMutation();
  const [updateTask, updateTaskState] = useUpdateTaskMutation();
  const [updateTaskStatus, updateTaskStatusState] = useUpdateTaskStatusMutation();
  const [updateProjectStatus] = useUpdateProjectStatusMutation();
  const [demoteActiveTasksOutsideProject] = useDemoteActiveTasksOutsideProjectMutation();
  const [demoteActiveTasksExceptTask] = useDemoteActiveTasksExceptTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [updateTaskNote, updateTaskNoteState] = useUpdateTaskNoteMutation();

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks]
  );

  async function onCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTaskTitle.trim();
    if (!title || activeProjectId === null) {
      return;
    }
    await createTask({ projectId: activeProjectId, title }).unwrap();
    setNewTaskTitle('');
    setTaskInputOpen(false);
  }

  async function onCreateTaskNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = newTaskNoteBody.trim();
    if (!body || selectedTaskId === null) {
      return;
    }
    const referenceUrl = newTaskNoteReferenceUrl.trim();
    await createTaskNote({
      taskId: selectedTaskId,
      body,
      referenceUrl: referenceUrl ? referenceUrl : null
    }).unwrap();
    setNewTaskNoteBody('');
    setNewTaskNoteReferenceUrl('');
    setTaskNoteInputOpen(false);
  }

  async function demoteOtherActiveProjects(nextActiveProjectId: number) {
    const activeProjects = projects.filter(
      (project) => project.status === 'active' && project.id !== nextActiveProjectId
    );
    for (const project of activeProjects) {
      await updateProjectStatus({ projectId: project.id, status: 'started' }).unwrap();
    }
  }

  async function ensureProjectActive(projectId: number) {
    await demoteOtherActiveProjects(projectId);
    await demoteActiveTasksOutsideProject({ projectId }).unwrap();
    await updateProjectStatus({ projectId, status: 'active' }).unwrap();
    projectsQuery.refetch();
  }

  async function onUpdateTaskStatus(taskId: number, currentStatus: WorkStatus, nextStatus: WorkStatus) {
    if (nextStatus === currentStatus || activeProjectId === null) {
      return;
    }

    if (nextStatus === 'active') {
      await ensureProjectActive(activeProjectId);
      await demoteActiveTasksExceptTask({ taskId }).unwrap();
    }

    await updateTaskStatus({
      taskId,
      projectId: activeProjectId,
      status: nextStatus
    }).unwrap();
    tasksQuery.refetch();
    projectsQuery.refetch();
  }

  async function onUpdateTaskTitle(taskId: number, title: string) {
    if (activeProjectId === null) {
      return;
    }
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    await updateTask({ taskId, projectId: activeProjectId, title: trimmed }).unwrap();
  }

  async function onUpdateTaskNote(noteId: number, body: string, referenceUrl: string | null) {
    if (selectedTaskId === null) {
      return;
    }
    const trimmed = body.trim();
    if (!trimmed) {
      return;
    }
    await updateTaskNote({
      noteId,
      taskId: selectedTaskId,
      body: trimmed,
      referenceUrl
    }).unwrap();
  }

  async function onDeleteTask(taskId: number) {
    if (activeProjectId === null) {
      return;
    }
    const task = tasks.find((entry) => entry.id === taskId) ?? null;
    if (!task) {
      return;
    }
    const confirmed = window.confirm(`Delete task "${task.title}"? This removes its notes.`);
    if (!confirmed) {
      return;
    }
    await deleteTask({ taskId, projectId: activeProjectId }).unwrap();
    if (selectedTaskId === taskId) {
      dispatch(setSelectedTaskId(null));
    }
  }

  function selectTask(taskId: number | null) {
    dispatch(setSelectedTaskId(taskId));
  }

  return {
    activeProjectId,
    activeTask,
    createTaskNoteState,
    createTaskState,
    newTaskNoteBody,
    newTaskNoteReferenceUrl,
    newTaskTitle,
    onCreateTask,
    onCreateTaskNote,
    onDeleteTask,
    onUpdateTaskStatus,
    onUpdateTaskTitle,
    onUpdateTaskNote,
    selectTask,
    selectedTaskId,
    setNewTaskNoteBody,
    setNewTaskNoteReferenceUrl,
    setNewTaskTitle,
    setTaskInputOpen,
    setTaskNoteInputOpen,
    taskInputOpen,
    taskNoteInputOpen,
    taskNotes,
    taskNotesQuery,
    tasks,
    tasksQuery,
    updateTaskState,
    updateTaskNoteState,
    updateTaskStatusState
  };
}
