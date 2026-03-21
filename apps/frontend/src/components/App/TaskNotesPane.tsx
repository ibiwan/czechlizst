import { useEffect, useMemo, useState } from 'react';
import { useListAllTasksQuery } from '@api';
import { useProjectsPanel } from '@state/projects/useProjectsPanel';
import { useProjectStatus } from '@state/projects/useProjectStatus';
import { NotesDetailSection } from '@utilities/NotesDetailSection';
import { type TasksPanelModel } from '@state/tasks/TasksPanelModel';
import { buildBirdsEyeItems } from './ProjectDetailPane/birdsEyeItems';

import { TaskCard } from './ProjectDetailPane/ProjectDetailView/TasksListCard/TaskCard';

export function TaskNotesPane({ model }: { model: TasksPanelModel }) {
  const [isRandomPickLoading, setIsRandomPickLoading] = useState(false);
  const [pendingTaskSelection, setPendingTaskSelection] = useState<{
    projectId: number;
    taskId: number;
  } | null>(null);
  const { projects, selectProject } = useProjectsPanel();
  const { setProjectStatus } = useProjectStatus(null);
  const allTasksQuery = useListAllTasksQuery();
  const allTasks = useMemo(() => allTasksQuery.data?.tasks ?? [], [allTasksQuery.data?.tasks]);
  const { selectableItems } = useMemo(
    () => buildBirdsEyeItems(projects, allTasks),
    [allTasks, projects]
  );

  useEffect(() => {
    if (!pendingTaskSelection) {
      return;
    }

    const matchingTask = model.tasks.find((task) => task.id === pendingTaskSelection.taskId);
    if (!matchingTask || matchingTask.projectId !== pendingTaskSelection.projectId) {
      return;
    }

    model.selectTask(pendingTaskSelection.taskId);
    setPendingTaskSelection(null);
  }, [model, pendingTaskSelection]);

  async function handlePickRandomTask() {
    if (selectableItems.length === 0 || isRandomPickLoading) {
      return;
    }

    const randomItem = selectableItems[Math.floor(Math.random() * selectableItems.length)];

    setIsRandomPickLoading(true);
    try {
      if (randomItem.type === 'project') {
        setPendingTaskSelection(null);
        selectProject(randomItem.data.id);
        await setProjectStatus(randomItem.data.id, 'active');
        return;
      }

      setPendingTaskSelection({
        projectId: randomItem.data.projectId,
        taskId: randomItem.data.id
      });
      selectProject(randomItem.data.projectId);
      await model.updateTaskStatusForProject(
        randomItem.data.id,
        randomItem.data.projectId,
        randomItem.data.status,
        'active'
      );
    } finally {
      setIsRandomPickLoading(false);
    }
  }

  if (model.activeProjectId === null) {
    return (
      <div className="task-notes-random-pick">
        <button
          type="button"
          className="activate-btn activate-btn-random-pick"
          onClick={handlePickRandomTask}
          disabled={isRandomPickLoading || allTasksQuery.isLoading || selectableItems.length === 0}
          data-testid="task-notes-random-pick"
        >
          PICK A RANDOM TASK
        </button>
      </div>
    );
  }

  if (model.selectedTaskId === null) {
    return (
      <p className="state-copy" data-testid="task-notes-empty-task">
        Select a task first.
      </p>
    );
  }

  async function handleCreateNote(body: string, referenceUrl: string | null) {
    if (!body || model.selectedTaskId === null) return;
    // The existing onCreateTaskNote reads from local state, so we need to call the mutation directly
    // First set the state, then call the handler
    model.setNewTaskNoteBody(body);
    model.setNewTaskNoteReferenceUrl(referenceUrl || '');
    // Now call onCreateTaskNote which expects a form event
    await model.onCreateTaskNote({ preventDefault: () => { } } as React.FormEvent<HTMLFormElement>);
  }

  return (
    <>
      {model.activeTask && (
        <TaskCard
          effectiveStatus={model.activeTaskEffectiveStatus ?? model.activeTask.status}
          onUpdateTaskStatus={model.onUpdateTaskStatus}
          onUpdateTaskTitle={model.onUpdateTaskTitle}
          isSelected
          multiline
          task={model.activeTask}
          updateTaskLoading={model.updateTaskState.isLoading}
          updateTaskStatusLoading={model.updateTaskStatusState.isLoading}
        />
      )}
      <NotesDetailSection
        addNoteLabel="New note"
        createNoteLoading={model.createTaskNoteState.isLoading}
        inputPlaceholder="Add a task note"
        notes={model.taskNotes}
        notesError={Boolean(model.taskNotesQuery.error)}
        notesLoading={model.taskNotesQuery.isLoading}
        onCreateNote={handleCreateNote}
        onUpdateNote={model.onUpdateTaskNote}
        testIdPrefix="task-notes"
        title="Task Notes"
        updateNoteLoading={model.updateTaskNoteState.isLoading}
      />
    </>
  );
}
