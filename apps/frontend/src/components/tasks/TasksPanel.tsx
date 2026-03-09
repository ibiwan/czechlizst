import { AddEntityRow } from '../AddEntityRow';
import { TaskNotesDetail } from './TaskNotesDetail';
import { TaskRow } from './TaskRow';
import { useTasksPanelModel } from './useTasksPanelModel';

export function TasksPanel() {
  const model = useTasksPanelModel();

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Tasks</h2>
      </div>

      {model.activeProjectId === null ? (
        <p className="state-copy">Select a project first.</p>
      ) : (
        <>
          {model.tasksQuery.isLoading && <p className="state-copy">Loading tasks...</p>}
          {model.tasksQuery.error && <p className="state-copy">Could not load tasks.</p>}

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {model.tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    selectedTaskId={model.selectedTaskId}
                    setSelectedTaskIdForRow={model.selectTask}
                    onUpdateTaskStatus={model.onUpdateTaskStatus}
                    updateTaskStatusLoading={model.updateTaskStatusState.isLoading}
                  />
                ))}

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
                />
              </tbody>
            </table>
          </div>

          {model.selectedTaskId !== null && (
            <TaskNotesDetail
              createTaskNoteLoading={model.createTaskNoteState.isLoading}
              newTaskNoteBody={model.newTaskNoteBody}
              onChangeTaskNoteBody={model.setNewTaskNoteBody}
              onCreateTaskNote={model.onCreateTaskNote}
              onToggleOpen={model.setTaskNoteInputOpen}
              open={model.taskNoteInputOpen}
              resetTaskNoteBody={() => model.setNewTaskNoteBody('')}
              taskNotes={model.taskNotes}
              taskNotesError={Boolean(model.taskNotesQuery.error)}
              taskNotesLoading={model.taskNotesQuery.isLoading}
            />
          )}
        </>
      )}
    </section>
  );
}
