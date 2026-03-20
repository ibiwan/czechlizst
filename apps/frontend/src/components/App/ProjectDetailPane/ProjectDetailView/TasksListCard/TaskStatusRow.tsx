import { type WorkStatus } from '@app/contracts';
import { type TaskView } from '@app-types/view';

export function TaskStatusRow({
  task,
  onUpdateTaskStatus,
  updateTaskStatusLoading,
}: {
  task: TaskView;
  onUpdateTaskStatus: (taskId: number, currentStatus: WorkStatus, nextStatus: WorkStatus) => void;
  updateTaskStatusLoading: boolean;
}) {
  return (
    <div className="status-row">
      <div className="status-row-left">
        {task && task.status === 'started' && (
          <button
            className="activate-btn activate-btn-activate"
            type="button"
            onClick={() => onUpdateTaskStatus(task.id, task.status, 'active')}
            disabled={updateTaskStatusLoading}
            data-testid="task-activate"
          >
            Activate
          </button>
        )}
        {task && task.status === 'active' && (
          <button
            className="activate-btn activate-btn-suspend"
            type="button"
            onClick={() => onUpdateTaskStatus(task.id, task.status, 'started')}
            disabled={updateTaskStatusLoading}
            data-testid="task-suspend"
          >
            Suspend
          </button>
        )}
      </div>
    </div>
  );
}
