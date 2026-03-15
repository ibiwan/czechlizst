import { type FormEvent, useEffect, useState } from 'react';
import { type WorkStatus } from '@app/contracts';
import { StatusOptionSelect } from '@utilities/StatusOptionSelect';
import { formatProjectTimestamp } from '@lib/format';
import { type TaskView } from '@app-types/view';


type TaskCardProps = {
  onDeleteTask: (taskId: number) => void;
  onUpdateTaskStatus: (taskId: number, currentStatus: WorkStatus, nextStatus: WorkStatus) => void;
  onUpdateTaskTitle: (taskId: number, title: string) => void;
  isSelected: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  task: TaskView;
  updateTaskLoading: boolean;
  updateTaskStatusLoading: boolean;
  onInnerClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

export function TaskCard({
  onDeleteTask,
  onUpdateTaskStatus,
  onUpdateTaskTitle,
  isSelected,
  readOnly = false,
  multiline = false,
  task,
  updateTaskLoading,
  updateTaskStatusLoading,
  onInnerClick
}: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);

  useEffect(() => {
    if (!isSelected || readOnly) {
      setEditing(false);
      setDraftTitle(task.title);
    }
  }, [isSelected, readOnly, task.title]);

  async function onSubmitTitle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onUpdateTaskTitle(task.id, draftTitle);
    setEditing(false);
  }

  return (
    <div
      className={`task-card${multiline ? ' task-card-multiline' : ''}${readOnly ? ' task-card-readonly' : ''
        }`}
      onClick={onInnerClick}
    >
      {readOnly ? (
        <div className="task-card-one-line">
          <div className="task-card-left">
            <span className="task-card-status-slot">
              <span
                className={`status-pill status-${task.status}`}
                data-testid={`task-status-pill-${task.id}`}
              >
                {task.status}
              </span>
            </span>
            <span className="task-card-gap" aria-hidden="true" />
            <span className="task-card-title" data-testid={`task-title-${task.id}`}>
              {task.title}
            </span>
          </div>
          <div className="task-card-right">
            <span className="task-created" data-testid={`task-created-${task.id}`}>
              {formatProjectTimestamp(task.createdAt)}
            </span>
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
          </div>
        </div>
      ) : editing ? (
        <form
          className="inline-form in-row"
          onSubmit={onSubmitTitle}
          onClick={(event) => event.stopPropagation()}
          data-testid={`task-edit-form-${task.id}`}
        >
          {multiline ? (
            <textarea
              className="text-input task-card-edit-textarea"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              autoFocus
              data-testid={`task-edit-input-${task.id}`}
            />
          ) : (
            <input
              className="text-input"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              autoFocus
              data-testid={`task-edit-input-${task.id}`}
            />
          )}
          <button
            className="icon-btn"
            type="submit"
            aria-label="Save task title"
            disabled={updateTaskLoading}
            data-testid={`task-edit-save-${task.id}`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 16.17 4.83 12l-1.41 1.41L9 19l12-12-1.41-1.41z" />
            </svg>
          </button>
          <button
            className="icon-btn"
            type="button"
            aria-label="Cancel edit"
            onClick={() => {
              setEditing(false);
              setDraftTitle(task.title);
            }}
            data-testid={`task-edit-cancel-${task.id}`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" />
            </svg>
          </button>
        </form>
      ) : (
        <div className="task-card-title-row">
          <span className="task-card-title" data-testid={`task-title-${task.id}`}>
            {task.title}
          </span>
          <div className="task-card-actions">
            {!readOnly && isSelected && (
              <button
                className="icon-btn"
                type="button"
                aria-label={`Edit ${task.title}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setEditing(true);
                }}
                data-testid={`task-edit-${task.id}`}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 17.25V20h2.75l8.1-8.1-2.75-2.75L4 17.25zm15.71-9.04c.39-.39.39-1.02 0-1.41l-1.5-1.5a1 1 0 0 0-1.41 0l-1.13 1.13 2.75 2.75 1.29-1.29z" />
                </svg>
              </button>
            )}
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
          </div>
        </div>
      )}
      {!readOnly && (
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
            <span className={`status-pill status-${task.status}`} data-testid={`task-status-pill-${task.id}`}>
              {task.status}
            </span>
          )}
          <span className="task-created" data-testid={`task-created-${task.id}`}>
            {formatProjectTimestamp(task.createdAt)}
          </span>
        </div>
      )}
    </div>
  );
}
