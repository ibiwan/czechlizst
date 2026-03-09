import { useEffect, useMemo, useState } from 'react';
import { type WorkStatus } from '@app/contracts';
import {
  useCreateTaskMutation,
  useCreateTaskNoteMutation,
  useListTaskNotesQuery,
  useListTasksQuery,
  useUpdateTaskStatusMutation
} from '../../api';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setSelectedTaskId } from '../../mainPageSlice';
import { useActiveProjectSelection } from '../../useActiveProjectSelection';

export function useTasksPanelModel() {
  const dispatch = useAppDispatch();
  const selectedTaskId = useAppSelector((state) => state.mainPage.selectedTaskId);

  const { activeProjectId, projectsQuery } = useActiveProjectSelection();

  const [taskInputOpen, setTaskInputOpen] = useState(false);
  const [taskNoteInputOpen, setTaskNoteInputOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNoteBody, setNewTaskNoteBody] = useState('');

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
    }
  }, [dispatch, selectedTaskId, tasks]);

  const taskNotesQuery = useListTaskNotesQuery(selectedTaskId ?? 0, {
    skip: selectedTaskId === null
  });
  const taskNotes = taskNotesQuery.data?.notes ?? [];

  const [createTask, createTaskState] = useCreateTaskMutation();
  const [createTaskNote, createTaskNoteState] = useCreateTaskNoteMutation();
  const [updateTaskStatus, updateTaskStatusState] = useUpdateTaskStatusMutation();

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
    await createTaskNote({ taskId: selectedTaskId, body }).unwrap();
    setNewTaskNoteBody('');
    setTaskNoteInputOpen(false);
  }

  async function onUpdateTaskStatus(taskId: number, currentStatus: WorkStatus, nextStatus: WorkStatus) {
    if (nextStatus === currentStatus || activeProjectId === null) {
      return;
    }
    await updateTaskStatus({
      taskId,
      projectId: activeProjectId,
      status: nextStatus
    }).unwrap();
    tasksQuery.refetch();
    projectsQuery.refetch();
  }

  function selectTask(taskId: number | null) {
    dispatch(setSelectedTaskId(taskId));
  }

  return {
    activeProjectId,
    createTaskNoteState,
    createTaskState,
    newTaskNoteBody,
    newTaskTitle,
    onCreateTask,
    onCreateTaskNote,
    onUpdateTaskStatus,
    selectTask,
    selectedTaskId,
    setNewTaskNoteBody,
    setNewTaskTitle,
    setTaskInputOpen,
    setTaskNoteInputOpen,
    taskInputOpen,
    taskNoteInputOpen,
    taskNotes,
    taskNotesQuery,
    tasks,
    tasksQuery,
    updateTaskStatusState
  };
}
