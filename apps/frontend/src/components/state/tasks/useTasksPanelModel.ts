import { useEffect, useMemo, useState } from 'react';
import {
  blockingTaskRelationType,
  computeEffectiveTaskStatus,
  isStoredWorkStatus,
  placeholderTaskTitle,
  type StoredWorkStatus,
  type TaskRelationType,
  type TaskRelation
} from '@app/contracts';
import {
  useCreateTaskRelationMutation,
  useCreateTaskMutation,
  useCreateTaskNoteMutation,
  useDeleteTaskRelationMutation,
  useDeleteTaskNoteMutation,
  useDemoteActiveTasksExceptTaskMutation,
  useDemoteActiveTasksOutsideProjectMutation,
  useDeleteTaskMutation,
  useListAllTaskRelationsQuery,
  useListAllTasksQuery,
  useListTaskRelationsQuery,
  useListTaskNotesQuery,
  useListTasksQuery,
  useUpdateTaskRelationMutation,
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
  const allTaskRelationsQuery = useListAllTaskRelationsQuery();
  const allTaskRelations = useMemo(
    () => allTaskRelationsQuery.data?.taskRelations ?? [],
    [allTaskRelationsQuery.data?.taskRelations]
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
  const taskRelationsQuery = useListTaskRelationsQuery(selectedTaskId ?? 0, {
    skip: selectedTaskId === null
  });
  const taskRelations = useMemo(
    () => taskRelationsQuery.data?.taskRelations ?? [],
    [taskRelationsQuery.data?.taskRelations]
  );
  const blockingTaskRelations = useMemo(
    () =>
      taskRelations.filter((relation) => relation.relationType === blockingTaskRelationType),
    [taskRelations]
  );

  const [createTaskRelation, createTaskRelationState] = useCreateTaskRelationMutation();
  const [createTask, createTaskState] = useCreateTaskMutation();
  const [createTaskNote, createTaskNoteState] = useCreateTaskNoteMutation();
  const [deleteTaskRelation, deleteTaskRelationState] = useDeleteTaskRelationMutation();
  const [deleteTaskNote, deleteTaskNoteState] = useDeleteTaskNoteMutation();
  const [updateTaskRelation, updateTaskRelationState] = useUpdateTaskRelationMutation();
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
          computeEffectiveTaskStatus(task, allTaskRelations, allTasks)
        ])
      ),
    [allTaskRelations, allTasks, tasks]
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
        status: computeEffectiveTaskStatus(task, allTaskRelations, allTasks)
      })),
    [allTaskRelations, allTasks]
  );
  const blockingRelationsByTaskId = useMemo(() => {
    const grouped = new Map<number, TaskRelation[]>();
    for (const relation of allTaskRelations) {
      if (relation.relationType !== blockingTaskRelationType) {
        continue;
      }
      const existing = grouped.get(relation.taskId);
      if (existing) {
        existing.push(relation);
      } else {
        grouped.set(relation.taskId, [relation]);
      }
    }
    return grouped;
  }, [allTaskRelations]);

  function findUntouchedPlaceholderTask(projectId: number, excludeTaskId?: number) {
    return (
      tasks.find(
        (task) =>
          task.projectId === projectId &&
          task.isPlaceholder &&
          task.title === placeholderTaskTitle &&
          task.status === 'todo' &&
          task.id !== excludeTaskId &&
          (blockingRelationsByTaskId.get(task.id)?.length ?? 0) === 0
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

  async function onCreateTaskRelation(
    relatedTaskId: number,
    relationType: TaskRelationType,
    commentary: string | null = null
  ) {
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
    await createTaskRelation({
      taskId: selectedTaskId,
      relatedTaskId,
      relationType,
      commentary
    }).unwrap();
  }

  async function onDeleteTaskRelation(taskRelationId: number) {
    if (selectedTaskId === null) {
      return;
    }
    await deleteTaskRelation({
      taskRelationId,
      taskId: selectedTaskId
    }).unwrap();
  }

  async function onUpdateTaskRelation(
    taskRelationId: number,
    relationType: TaskRelationType | undefined,
    commentary: string | null
  ) {
    if (selectedTaskId === null) {
      return;
    }
    await updateTaskRelation({
      taskRelationId,
      taskId: selectedTaskId,
      relationType,
      commentary
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
    allTaskRelations,
    allTaskRelationsQuery,
    blockingRelationsByTaskId,
    blockingTaskRelations,
    createTaskRelationState,
    createTaskNoteState,
    createTaskState,
    deleteTaskRelationState,
    deleteTaskNoteState,
    effectiveAllTasks,
    effectiveTasks,
    effectiveTaskStatusById,
    newTaskNoteBody,
    newTaskNoteReferenceUrl,
    newTaskTitle,
    onCreateTaskRelation,
    onCreateTask,
    onCreateTaskNote,
    createTaskNoteWithValues,
    onDeleteTaskRelation,
    onDeleteTaskNote,
    onDeleteTask,
    onUpdateTaskStatus,
    onUpdateTaskRelation,
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
    taskRelations,
    taskRelationsQuery,
    taskNoteInputOpen,
    taskNotes,
    taskNotesQuery,
    tasks,
    tasksQuery,
    updateTaskRelationState,
    updateTaskState,
    updateTaskNoteState,
    updateTaskStatusState
  };
}
