import { AddEntityRow } from '../AddEntityRow';
import { TaskNotesDetail } from './TaskNotesDetail';
import { TaskRow } from './TaskRow';
import { useTasksPanelModel } from './useTasksPanelModel';

export type TasksPanelModel = ReturnType<typeof useTasksPanelModel>;

export function TasksListPane({ model }: { model: TasksPanelModel }) {
  return (
    <>
      <div className="panel-header panel-header-with-add">
        <h2 className="panel-title">Tasks</h2>
        <button
          type="button"
          className="list-add-header"
          onClick={() => model.setTaskInputOpen(true)}
          aria-label="New task"
        >
          <span className="list-add-header-icon" aria-hidden="true">
            +
          </span>
          <span className="list-add-header-label">New task</span>
        </button>
      </div>

      {model.activeProjectId === null ? (
        <p className="state-copy">Select a project first.</p>
      ) : (
        <>
          {model.tasksQuery.isLoading && <p className="state-copy">Loading tasks...</p>}
          {model.tasksQuery.error && <p className="state-copy">Could not load tasks.</p>}

          <div className="table-wrap">
            <table className="data-table task-table">
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
    return <p className="state-copy">Select a project first.</p>;
  }

  if (model.selectedTaskId === null) {
    return <p className="state-copy">Select a task first.</p>;
  }

  return (
    <TaskNotesDetail
      activeTask={model.activeTask}
      createTaskNoteLoading={model.createTaskNoteState.isLoading}
      newTaskNoteBody={model.newTaskNoteBody}
      onChangeTaskNoteBody={model.setNewTaskNoteBody}
      onCreateTaskNote={model.onCreateTaskNote}
      onUpdateTaskNote={model.onUpdateTaskNote}
      onToggleOpen={model.setTaskNoteInputOpen}
      open={model.taskNoteInputOpen}
      resetTaskNoteBody={() => model.setNewTaskNoteBody('')}
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
