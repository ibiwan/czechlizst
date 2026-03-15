import { AddEntityCard } from '../AddEntityCard';
import { AddSpinnerButton } from '../AddSpinnerButton';
import { TaskNotesDetail } from './TaskNotesDetail';
import { TaskCard } from './TaskCard';
import { TaskListItem } from './TaskListItem';
import { useTasksPanelModel } from './useTasksPanelModel';
import { Flipper } from 'react-flip-toolkit';

export type TasksPanelModel = ReturnType<typeof useTasksPanelModel>;

export function TasksListPane({ model }: { model: TasksPanelModel }) {
  const loading = model.createTaskState.isLoading;
  const statusPriority: Record<string, number> = {
    active: 0,
    started: 1,
    todo: 2,
    blocked: 3,
    done: 4,
    dropped: 5
  };
  const sortedTasks = [...model.tasks].sort((left, right) => {
    const leftPriority = statusPriority[left.status] ?? 99;
    const rightPriority = statusPriority[right.status] ?? 99;
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }
    return right.createdAt.localeCompare(left.createdAt);
  });
  const taskFlipKey = `${model.tasksQuery.dataUpdatedAt ?? 0}|${sortedTasks
    .map((task) => `${task.id}-${task.status}`)
    .join('|')}`;

  return (
    <>
      <div className="panel-header panel-header-with-add" data-testid="tasks-header">
        <h2 className="panel-title" data-testid="tasks-title">
          Tasks
        </h2>
        <AddSpinnerButton
          label="New Task"
          loadingLabel="Loading"
          loading={loading}
          onClick={() => model.setTaskInputOpen(true)}
          testId="tasks-add-button"
        />
      </div>

      {model.activeProjectId === null ? (
        <p className="state-copy" data-testid="tasks-empty-project">
          Select a project first.
        </p>
      ) : (
        <>
          {model.tasksQuery.isLoading && (
            <p className="state-copy" data-testid="tasks-loading">
              Loading tasks...
            </p>
          )}
          {model.tasksQuery.error && (
            <p className="state-copy" data-testid="tasks-error">
              Could not load tasks.
            </p>
          )}

          <div className="task-list-wrap" data-testid="tasks-table-wrap">
            <Flipper flipKey={taskFlipKey}>
              <div className="task-list" data-testid="tasks-table">
                {model.taskInputOpen && (
                  <AddEntityCard
                    addLabel="+ New task"
                    inputPlaceholder="Task title"
                    isSaving={model.createTaskState.isLoading}
                    onChangeValue={model.setNewTaskTitle}
                    onSubmit={model.onCreateTask}
                    onToggleOpen={model.setTaskInputOpen}
                    open={model.taskInputOpen}
                    resetValue={() => model.setNewTaskTitle('')}
                    value={model.newTaskTitle}
                    testIdPrefix="tasks-add"
                  />
                )}
                {sortedTasks.map((task) => (
                  <TaskListItem
                    key={task.id}
                    onDeleteTask={model.onDeleteTask}
                    onUpdateTaskTitle={model.onUpdateTaskTitle}
                    task={task}
                    selectedTaskId={model.selectedTaskId}
                    setSelectedTaskIdForRow={model.selectTask}
                    onUpdateTaskStatus={model.onUpdateTaskStatus}
                    updateTaskLoading={model.updateTaskState.isLoading}
                    updateTaskStatusLoading={model.updateTaskStatusState.isLoading}
                  />
                ))}
              </div>
            </Flipper>
          </div>
        </>
      )}
    </>
  );
}

export function TaskNotesPane({ model }: { model: TasksPanelModel }) {
  if (model.activeProjectId === null) {
    return (
      <p className="state-copy" data-testid="task-notes-empty-project">
        Select a project first.
      </p>
    );
  }

  if (model.selectedTaskId === null) {
    return (
      <p className="state-copy" data-testid="task-notes-empty-task">
        Select a task first.
      </p>
    );
  }

  return (
    <>
      {model.activeTask && (
        <TaskCard
          onDeleteTask={model.onDeleteTask}
          onUpdateTaskStatus={model.onUpdateTaskStatus}
          onUpdateTaskTitle={model.onUpdateTaskTitle}
          isSelected
          multiline
          task={model.activeTask}
          updateTaskLoading={model.updateTaskState.isLoading}
          updateTaskStatusLoading={model.updateTaskStatusState.isLoading}
        />
      )}
      <TaskNotesDetail
        activeTask={model.activeTask}
        createTaskNoteLoading={model.createTaskNoteState.isLoading}
        newTaskNoteBody={model.newTaskNoteBody}
        newTaskNoteReferenceUrl={model.newTaskNoteReferenceUrl}
        onChangeTaskNoteBody={model.setNewTaskNoteBody}
        onChangeTaskNoteReferenceUrl={model.setNewTaskNoteReferenceUrl}
        onCreateTaskNote={model.onCreateTaskNote}
        onUpdateTaskNote={model.onUpdateTaskNote}
        onToggleOpen={model.setTaskNoteInputOpen}
        open={model.taskNoteInputOpen}
        resetTaskNoteBody={() => model.setNewTaskNoteBody('')}
        resetTaskNoteReferenceUrl={() => model.setNewTaskNoteReferenceUrl('')}
        taskNotes={model.taskNotes}
        taskNotesError={Boolean(model.taskNotesQuery.error)}
        taskNotesLoading={model.taskNotesQuery.isLoading}
        updateTaskNoteLoading={model.updateTaskNoteState.isLoading}
      />
    </>
  );
}

export function TasksPanel() {
  const model = useTasksPanelModel();

  return (
    <section className="panel">
      <TasksListPane model={model} />
      <TaskNotesPane model={model} />
    </section>
  );
}
