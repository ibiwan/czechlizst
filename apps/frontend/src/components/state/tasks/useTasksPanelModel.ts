import { useEffect, useMemo, useState } from 'react';
import {
  computeEffectiveTaskStatus,
  isStoredWorkStatus,
  placeholderTaskTitle,
  type StoredWorkStatus,
  type TaskBlocker
} from '@app/contracts';
import {
  useCreateTaskBlockerMutation,
  useCreateTaskMutation,
  useCreateTaskNoteMutation,
  useDeleteTaskBlockerMutation,
  useDeleteTaskNoteMutation,
  useDemoteActiveTasksExceptTaskMutation,
  useDemoteActiveTasksOutsideProjectMutation,
  useDeleteTaskMutation,
  useListAllTaskBlockersQuery,
  useListAllTasksQuery,
  useListTaskBlockersQuery,
  useListTaskNotesQuery,
  useListTasksQuery,
  useUpdateTaskMutation,
  useUpdateTaskNoteMutation,
  useUpdateTaskStatusMutation
} from '@api';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setSelectedTaskId } from '@store/mainPageSlice';
import { useActiveProjectSelection } from '@store/useActiveProjectSelection';

export function useTasksPanelModel() {
  const dispatch = useAppDispatch();
  const selectedTaskId = useAppSelector((state) => state.mainPage.selectedTaskId);

  const { activeProjectId, projectsQuery } = useActiveProjectSelection();

  const [taskInputOpen, setTaskInputOpen] = useState(false);
  const [taskNoteInputOpen, setTaskNoteInputOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNoteBody, setNewTaskNoteBody] = useState('');
  const [newTaskNoteReferenceUrl, setNewTaskNoteReferenceUrl] = useState('');

  const tasksQuery = useListTasksQuery(activeProjectId ?? 0, {
    skip: activeProjectId === null
  });
  const tasks = useMemo(() => tasksQuery.data?.tasks ?? [], [tasksQuery.data?.tasks]);
  const allTasksQuery = useListAllTasksQuery();
  const allTasks = useMemo(() => allTasksQuery.data?.tasks ?? [], [allTasksQuery.data?.tasks]);
  const allTaskBlockersQuery = useListAllTaskBlockersQuery();
  const allTaskBlockers = useMemo(
    () => allTaskBlockersQuery.data?.taskBlockers ?? [],
    [allTaskBlockersQuery.data?.taskBlockers]
  );

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
  const taskBlockersQuery = useListTaskBlockersQuery(selectedTaskId ?? 0, {
    skip: selectedTaskId === null
  });
  const taskBlockers = taskBlockersQuery.data?.taskBlockers ?? [];

  const [createTaskBlocker, createTaskBlockerState] = useCreateTaskBlockerMutation();
  const [createTask, createTaskState] = useCreateTaskMutation();
  const [createTaskNote, createTaskNoteState] = useCreateTaskNoteMutation();
  const [deleteTaskBlocker, deleteTaskBlockerState] = useDeleteTaskBlockerMutation();
  const [deleteTaskNote, deleteTaskNoteState] = useDeleteTaskNoteMutation();
  const [updateTask, updateTaskState] = useUpdateTaskMutation();
  const [updateTaskStatus, updateTaskStatusState] = useUpdateTaskStatusMutation();
  const [demoteActiveTasksOutsideProject] = useDemoteActiveTasksOutsideProjectMutation();
  const [demoteActiveTasksExceptTask] = useDemoteActiveTasksExceptTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [updateTaskNote, updateTaskNoteState] = useUpdateTaskNoteMutation();

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks]
  );
  const effectiveTaskStatusById = useMemo(
    () =>
      new Map(
        tasks.map((task) => [
          task.id,
          computeEffectiveTaskStatus(task, allTaskBlockers, allTasks)
        ])
      ),
    [allTaskBlockers, allTasks, tasks]
  );
  const activeTaskEffectiveStatus =
    activeTask === null
      ? null
      : effectiveTaskStatusById.get(activeTask.id) ?? activeTask.status;
  const effectiveTasks = useMemo(
    () =>
      tasks.map((task) => ({
        ...task,
        status: effectiveTaskStatusById.get(task.id) ?? task.status
      })),
    [effectiveTaskStatusById, tasks]
  );
  const effectiveAllTasks = useMemo(
    () =>
      allTasks.map((task) => ({
        ...task,
        status: computeEffectiveTaskStatus(task, allTaskBlockers, allTasks)
      })),
    [allTaskBlockers, allTasks]
  );
  const blockersByTaskId = useMemo(() => {
    const grouped = new Map<number, TaskBlocker[]>();
    for (const blocker of allTaskBlockers) {
      const existing = grouped.get(blocker.taskId);
      if (existing) {
        existing.push(blocker);
      } else {
        grouped.set(blocker.taskId, [blocker]);
      }
    }
    return grouped;
  }, [allTaskBlockers]);

  function findUntouchedPlaceholderTask(projectId: number, excludeTaskId?: number) {
    return (
      tasks.find(
        (task) =>
          task.projectId === projectId &&
          task.isPlaceholder &&
          task.title === placeholderTaskTitle &&
          task.status === 'todo' &&
          task.id !== excludeTaskId &&
          (blockersByTaskId.get(task.id)?.length ?? 0) === 0
      ) ?? null
    );
  }

  async function onCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTaskTitle.trim();
    if (!title || activeProjectId === null) {
      return;
    }
    const createdTask = await createTask({ projectId: activeProjectId, title }).unwrap();
    const untouchedPlaceholder = findUntouchedPlaceholderTask(activeProjectId, createdTask.task.id);
    if (untouchedPlaceholder) {
      await deleteTask({ taskId: untouchedPlaceholder.id, projectId: activeProjectId }).unwrap();
    }
    setNewTaskTitle('');
    setTaskInputOpen(false);
  }

  async function onCreateTaskNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createTaskNoteWithValues(newTaskNoteBody, newTaskNoteReferenceUrl);
    setNewTaskNoteBody('');
    setNewTaskNoteReferenceUrl('');
    setTaskNoteInputOpen(false);
  }

  async function createTaskNoteWithValues(bodyInput: string, referenceUrlInput: string | null) {
    const body = bodyInput.trim();
    if (!body || selectedTaskId === null) {
      return;
    }
    const referenceUrl = referenceUrlInput?.trim() ?? '';
    if (activeTask?.isPlaceholder) {
      await updateTask({
        taskId: activeTask.id,
        projectId: activeTask.projectId,
        isPlaceholder: false
      }).unwrap();
    }
    await createTaskNote({
      taskId: selectedTaskId,
      body,
      referenceUrl: referenceUrl ? referenceUrl : null
    }).unwrap();
  }

  async function ensureProjectActive(projectId: number) {
    await demoteActiveTasksOutsideProject({ projectId }).unwrap();
    projectsQuery.refetch();
  }

  async function onUpdateTaskStatus(
    taskId: number,
    currentStatus: StoredWorkStatus,
    nextStatus: StoredWorkStatus
  ) {
    if (activeProjectId === null) {
      return;
    }
    await updateTaskStatusForProject(taskId, activeProjectId, currentStatus, nextStatus);
  }

  async function updateTaskStatusForProject(
    taskId: number,
    projectId: number,
    currentStatus: StoredWorkStatus,
    nextStatus: StoredWorkStatus
  ) {
    if (nextStatus === currentStatus) {
      return;
    }

    if (!isStoredWorkStatus(currentStatus) || !isStoredWorkStatus(nextStatus)) {
      return;
    }

    const task = allTasks.find((entry) => entry.id === taskId) ?? null;

    if (nextStatus === 'active') {
      await ensureProjectActive(projectId);
      await demoteActiveTasksExceptTask({ taskId }).unwrap();
    }

    await updateTaskStatus({
      taskId,
      projectId,
      status: nextStatus,
      isPlaceholder: task?.isPlaceholder && nextStatus !== currentStatus ? false : undefined
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
    const task = tasks.find((entry) => entry.id === taskId) ?? null;
    await updateTask({
      taskId,
      projectId: activeProjectId,
      title: trimmed,
      isPlaceholder: task?.isPlaceholder && trimmed !== task.title ? false : undefined
    }).unwrap();
  }

  async function onUpdateTaskNote(noteId: number, body: string, referenceUrl: string | null) {
    if (selectedTaskId === null) {
      return;
    }
    const trimmed = body.trim();
    if (!trimmed) {
      return;
    }
    if (activeTask?.isPlaceholder) {
      await updateTask({
        taskId: activeTask.id,
        projectId: activeTask.projectId,
        isPlaceholder: false
      }).unwrap();
    }
    await updateTaskNote({
      noteId,
      taskId: selectedTaskId,
      body: trimmed,
      referenceUrl
    }).unwrap();
  }

  async function onDeleteTaskNote(noteId: number) {
    if (selectedTaskId === null) {
      return;
    }
    const note = taskNotes.find((entry) => entry.id === noteId) ?? null;
    if (!note) {
      return;
    }
    const preview = note.body.length > 80 ? `${note.body.slice(0, 77)}...` : note.body;
    const confirmed = window.confirm(`Delete note "${preview}"?`);
    if (!confirmed) {
      return;
    }
    await deleteTaskNote({ noteId, taskId: selectedTaskId }).unwrap();
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

  async function onCreateTaskBlocker(blockingTaskId: number) {
    if (selectedTaskId === null || activeTask === null) {
      return;
    }
    if (activeTask.isPlaceholder) {
      await updateTask({
        taskId: activeTask.id,
        projectId: activeTask.projectId,
        isPlaceholder: false
      }).unwrap();
    }
    await createTaskBlocker({
      taskId: selectedTaskId,
      blockingTaskId
    }).unwrap();
  }

  async function onDeleteTaskBlocker(taskBlockerId: number) {
    if (selectedTaskId === null) {
      return;
    }
    await deleteTaskBlocker({
      taskBlockerId,
      taskId: selectedTaskId
    }).unwrap();
  }

  function selectTask(taskId: number | null) {
    dispatch(setSelectedTaskId(taskId));
  }

  return {
    activeProjectId,
    activeTask,
    activeTaskEffectiveStatus,
    allTasks,
    allTaskBlockers,
    allTaskBlockersQuery,
    blockersByTaskId,
    createTaskBlockerState,
    createTaskNoteState,
    createTaskState,
    deleteTaskBlockerState,
    deleteTaskNoteState,
    effectiveAllTasks,
    effectiveTasks,
    effectiveTaskStatusById,
    newTaskNoteBody,
    newTaskNoteReferenceUrl,
    newTaskTitle,
    onCreateTaskBlocker,
    onCreateTask,
    onCreateTaskNote,
    createTaskNoteWithValues,
    onDeleteTaskBlocker,
    onDeleteTaskNote,
    onDeleteTask,
    onUpdateTaskStatus,
    onUpdateTaskTitle,
    onUpdateTaskNote,
    updateTaskStatusForProject,
    selectTask,
    selectedTaskId,
    setNewTaskNoteBody,
    setNewTaskNoteReferenceUrl,
    setNewTaskTitle,
    setTaskInputOpen,
    setTaskNoteInputOpen,
    taskInputOpen,
    taskBlockers,
    taskBlockersQuery,
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
