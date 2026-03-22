import { useEffect, useMemo, useState } from 'react';
import { useListAllTasksQuery } from '@api';
import { type TaskBlocker } from '@app/contracts';
import { type TaskView } from '@app-types/view';
import { useProjectsPanel } from '@state/projects/useProjectsPanel';
import { NotesDetailSection } from '@utilities/NotesDetailSection';
import { type TasksPanelModel } from '@state/tasks/TasksPanelModel';
import { buildBirdsEyeItems } from './ProjectDetailPane/birdsEyeItems';
import { TaskCard } from './ProjectDetailPane/ProjectDetailView/TasksListCard/TaskCard';

export function TaskNotesPane({ model }: { model: TasksPanelModel }) {
  const [isRandomPickLoading, setIsRandomPickLoading] = useState(false);
  const [newBlockingTaskId, setNewBlockingTaskId] = useState('');
  const [pendingTaskSelection, setPendingTaskSelection] = useState<{
    projectId: number;
    taskId: number;
  } | null>(null);
  const { selectProject } = useProjectsPanel();
  const allTasksQuery = useListAllTasksQuery();
  const allTasks = useMemo(() => allTasksQuery.data?.tasks ?? [], [allTasksQuery.data?.tasks]);
  const { selectableItems } = useMemo(() => buildBirdsEyeItems(allTasks), [allTasks]);
  const currentBlockingTasks = useMemo(() => {
    const taskById = new Map(model.tasks.map((task) => [task.id, task]));
    const blockingTasks: Array<{ taskBlocker: TaskBlocker; task: TaskView }> = [];

    for (const taskBlocker of model.taskBlockers) {
      const task = taskById.get(taskBlocker.blockingTaskId);
      if (!task) {
        continue;
      }
      blockingTasks.push({ taskBlocker, task });
    }

    return blockingTasks;
  }, [model.taskBlockers, model.tasks]);
  const availableBlockingTasks = useMemo(() => {
    if (!model.activeTask) {
      return [];
    }
    const currentBlockingTaskIds = new Set(
      model.taskBlockers.map((taskBlocker) => taskBlocker.blockingTaskId)
    );

    return model.tasks.filter(
      (task) => task.id !== model.activeTask?.id && !currentBlockingTaskIds.has(task.id)
    );
  }, [model.activeTask, model.taskBlockers, model.tasks]);

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

  useEffect(() => {
    if (availableBlockingTasks.length === 0) {
      setNewBlockingTaskId('');
      return;
    }

    if (availableBlockingTasks.some((task) => String(task.id) === newBlockingTaskId)) {
      return;
    }

    setNewBlockingTaskId(String(availableBlockingTasks[0].id));
  }, [availableBlockingTasks, newBlockingTaskId]);

  async function handlePickRandomTask() {
    if (selectableItems.length === 0 || isRandomPickLoading) {
      return;
    }

    const randomItem = selectableItems[Math.floor(Math.random() * selectableItems.length)];

    setIsRandomPickLoading(true);
    try {
      setPendingTaskSelection({
        projectId: randomItem.data.projectId,
        taskId: randomItem.data.id
      });
      selectProject(randomItem.data.projectId);
    } finally {
      setIsRandomPickLoading(false);
    }
  }

  async function handleAddTaskBlocker(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const blockingTaskId = Number(newBlockingTaskId);
    if (!blockingTaskId) {
      return;
    }
    await model.onCreateTaskBlocker(blockingTaskId);
    setNewBlockingTaskId('');
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
    await model.createTaskNoteWithValues(body, referenceUrl);
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
      <section className="detail-block" data-testid="task-blockers">
        <div className="panel-header">
          <h3 className="panel-title">Blocked By</h3>
          <span className="meta-copy">
            {currentBlockingTasks.length === 0
              ? 'No blockers'
              : `${currentBlockingTasks.length} blocker${currentBlockingTasks.length === 1 ? '' : 's'}`}
          </span>
        </div>
        {model.taskBlockersQuery.isLoading ? (
          <p className="state-copy">Loading blockers…</p>
        ) : model.taskBlockersQuery.error ? (
          <p className="state-copy">Could not load blockers.</p>
        ) : currentBlockingTasks.length === 0 ? (
          <p className="state-copy">
            This task is free to move unless you attach one or more blockers.
          </p>
        ) : (
          <div className="task-blocker-list">
            {currentBlockingTasks.map(({ taskBlocker, task }) => (
              <div className="task-blocker-row" key={taskBlocker.id}>
                <div className="task-blocker-copy">
                  <span className="task-blocker-title">{task.title}</span>
                  <span
                    className={`status-pill status-${model.effectiveTaskStatusById.get(task.id) ?? task.status}`}
                  >
                    {model.effectiveTaskStatusById.get(task.id) ?? task.status}
                  </span>
                </div>
                <button
                  type="button"
                  className="link-danger"
                  onClick={() => model.onDeleteTaskBlocker(taskBlocker.id)}
                  disabled={model.deleteTaskBlockerState.isLoading}
                  data-testid={`task-blocker-remove-${taskBlocker.id}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <form className="detail-actions" onSubmit={handleAddTaskBlocker}>
          <div className="detail-action-row">
            <select
              className="text-input"
              value={newBlockingTaskId}
              onChange={(event) => setNewBlockingTaskId(event.target.value)}
              disabled={
                availableBlockingTasks.length === 0 || model.createTaskBlockerState.isLoading
              }
              data-testid="task-blocker-select"
            >
              {availableBlockingTasks.length === 0 ? (
                <option value="">No eligible tasks in this project</option>
              ) : (
                availableBlockingTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))
              )}
            </select>
            <button
              type="submit"
              className="mini-btn"
              disabled={!newBlockingTaskId || model.createTaskBlockerState.isLoading}
              data-testid="task-blocker-add"
            >
              Add blocker
            </button>
          </div>
          <p className="meta-copy">
            First pass is same-project only. Cross-project blockers can come later.
          </p>
        </form>
      </section>
      <NotesDetailSection
        addNoteLabel="New note"
        createNoteLoading={model.createTaskNoteState.isLoading}
        deleteNoteLoading={model.deleteTaskNoteState.isLoading}
        inputPlaceholder="Add a task note"
        notes={model.taskNotes}
        notesError={Boolean(model.taskNotesQuery.error)}
        notesLoading={model.taskNotesQuery.isLoading}
        onCreateNote={handleCreateNote}
        onDeleteNote={model.onDeleteTaskNote}
        onUpdateNote={model.onUpdateTaskNote}
        testIdPrefix="task-notes"
        title="Task Notes"
        updateNoteLoading={model.updateTaskNoteState.isLoading}
      />
    </>
  );
}
