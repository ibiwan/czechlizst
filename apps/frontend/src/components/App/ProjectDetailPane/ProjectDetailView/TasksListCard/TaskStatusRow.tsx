import { type StoredWorkStatus, type WorkStatus } from '@app/contracts';
import { type TaskView } from '@app-types/view';

export function TaskStatusRow({
  currentStatus,
  effectiveStatus,
  task,
  onUpdateTaskStatus,
  updateTaskStatusLoading,
}: {
  currentStatus: StoredWorkStatus | null;
  effectiveStatus: WorkStatus;
  task: TaskView;
  onUpdateTaskStatus: (taskId: number, currentStatus: StoredWorkStatus, nextStatus: StoredWorkStatus) => void;
  updateTaskStatusLoading: boolean;
}) {
  const canActivate =
    currentStatus !== null &&
    effectiveStatus !== 'blocked' &&
    (currentStatus === 'todo' || currentStatus === 'started');
  const canSuspend =
    currentStatus !== null &&
    effectiveStatus !== 'blocked' &&
    currentStatus === 'active';

  return (
    <div className="status-row">
      <div className="status-row-left">
        {task && canActivate && (
          <button
            className="activate-btn activate-btn-activate"
            type="button"
            onClick={() => currentStatus && onUpdateTaskStatus(task.id, currentStatus, 'active')}
            disabled={updateTaskStatusLoading || currentStatus === null}
            data-testid="task-activate"
          >
            Activate
          </button>
        )}
        {task && canSuspend && (
          <button
            className="activate-btn activate-btn-suspend"
            type="button"
            onClick={() => currentStatus && onUpdateTaskStatus(task.id, currentStatus, 'started')}
            disabled={updateTaskStatusLoading || currentStatus === null}
            data-testid="task-suspend"
          >
            Suspend
          </button>
        )}
      </div>
    </div>
  );
}
