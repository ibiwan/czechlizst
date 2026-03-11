import { type FormEvent, useEffect, useState } from 'react';
import { type WorkStatus } from '@app/contracts';
import { StatusOptionSelect } from '../StatusOptionSelect';
import { formatProjectTimestamp } from '../../lib/format';
import { type TaskView } from '../../types/view';

type TaskRowProps = {
  onDeleteTask: (taskId: number) => void;
  onUpdateTaskStatus: (taskId: number, currentStatus: WorkStatus, nextStatus: WorkStatus) => void;
  onUpdateTaskTitle: (taskId: number, title: string) => void;
  selectedTaskId: number | null;
  setSelectedTaskIdForRow: (taskId: number) => void;
  task: TaskView;
  updateTaskLoading: boolean;
  updateTaskStatusLoading: boolean;
};

export function TaskRow({
  onDeleteTask,
  onUpdateTaskStatus,
  onUpdateTaskTitle,
  selectedTaskId,
  setSelectedTaskIdForRow,
  task,
  updateTaskLoading,
  updateTaskStatusLoading
}: TaskRowProps) {
  const isSelected = task.id === selectedTaskId;
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);

  useEffect(() => {
    if (!isSelected) {
      setEditing(false);
      setDraftTitle(task.title);
    }
  }, [isSelected, task.title]);

  async function onSubmitTitle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onUpdateTaskTitle(task.id, draftTitle);
    setEditing(false);
  }

  return (
    <tr
      className={isSelected ? 'is-selected' : ''}
      onClick={() => setSelectedTaskIdForRow(task.id)}
      data-testid={`task-row-${task.id}`}
    >
      <td>
        <div className="task-card">
          {editing ? (
            <form
              className="inline-form in-row"
              onSubmit={onSubmitTitle}
              onClick={(event) => event.stopPropagation()}
              data-testid={`task-edit-form-${task.id}`}
            >
              <input
                className="text-input"
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                autoFocus
                data-testid={`task-edit-input-${task.id}`}
              />
              <button
                className="mini-btn"
                type="submit"
                disabled={updateTaskLoading}
                data-testid={`task-edit-save-${task.id}`}
              >
                Save
              </button>
              <button
                className="mini-btn"
                type="button"
                onClick={() => {
                  setEditing(false);
                  setDraftTitle(task.title);
                }}
                data-testid={`task-edit-cancel-${task.id}`}
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="task-card-title-row">
              <span className="task-card-title" data-testid={`task-title-${task.id}`}>
                {task.title}
              </span>
              <div className="task-card-actions">
                <button
                  className="icon-btn"
                  type="button"
                  aria-label={`Delete ${task.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteTask(task.id);
                  }}
                  data-testid={`task-delete-${task.id}`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
                  </svg>
                </button>
                {isSelected && (
                  <button
                    className="mini-btn"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setEditing(true);
                    }}
                    data-testid={`task-edit-${task.id}`}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="task-card-meta">
            {isSelected ? (
              <StatusOptionSelect
                className={`status-select status-select-${task.status}`}
                currentStatus={task.status}
                disabled={updateTaskStatusLoading}
                onClick={(event) => event.stopPropagation()}
                onChange={(nextStatus) => onUpdateTaskStatus(task.id, task.status, nextStatus)}
                testId={`task-status-select-${task.id}`}
              />
            ) : (
              <span
                className={`status-pill status-${task.status}`}
                data-testid={`task-status-pill-${task.id}`}
              >
                {task.status}
              </span>
            )}
            <span className="task-created" data-testid={`task-created-${task.id}`}>
              {formatProjectTimestamp(task.createdAt)}
            </span>
          </div>
        </div>
      </td>
    </tr>
  );
}
