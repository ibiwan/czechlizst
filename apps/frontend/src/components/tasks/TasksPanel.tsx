import { AddEntityRow } from '../AddEntityRow';
import { AddSpinnerButton } from '../AddSpinnerButton';
import { TaskNotesDetail } from './TaskNotesDetail';
import { TaskRow } from './TaskRow';
import { useTasksPanelModel } from './useTasksPanelModel';

export type TasksPanelModel = ReturnType<typeof useTasksPanelModel>;

export function TasksListPane({ model }: { model: TasksPanelModel }) {
  const loading = model.createTaskState.isLoading;

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

          <div className="table-wrap" data-testid="tasks-table-wrap">
            <table className="data-table task-table" data-testid="tasks-table">
              <tbody>
                {model.taskInputOpen && (
                  <AddEntityRow
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
                    colSpan={1}
                  />
                )}
                {model.tasks.map((task) => (
                  <TaskRow
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
              </tbody>
            </table>
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
