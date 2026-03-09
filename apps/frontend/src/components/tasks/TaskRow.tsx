import { type WorkStatus } from '@app/contracts';
import { StatusOptionSelect } from '../StatusOptionSelect';
import { formatTimestamp } from '../../lib/format';
import { type TaskView } from '../../types/view';

type TaskRowProps = {
  onUpdateTaskStatus: (taskId: number, currentStatus: WorkStatus, nextStatus: WorkStatus) => void;
  selectedTaskId: number | null;
  setSelectedTaskIdForRow: (taskId: number) => void;
  task: TaskView;
  updateTaskStatusLoading: boolean;
};

export function TaskRow({
  onUpdateTaskStatus,
  selectedTaskId,
  setSelectedTaskIdForRow,
  task,
  updateTaskStatusLoading
}: TaskRowProps) {
  return (
    <tr
      className={task.id === selectedTaskId ? 'is-selected' : ''}
      onClick={() => setSelectedTaskIdForRow(task.id)}
    >
      <td>{task.title}</td>
      <td>
        {task.id === selectedTaskId ? (
          <StatusOptionSelect
            className={`status-select status-select-${task.status}`}
            currentStatus={task.status}
            disabled={updateTaskStatusLoading}
            onClick={(event) => event.stopPropagation()}
            onChange={(nextStatus) => onUpdateTaskStatus(task.id, task.status, nextStatus)}
          />
        ) : (
          <span className={`status-pill status-${task.status}`}>{task.status}</span>
        )}
      </td>
      <td>{formatTimestamp(task.createdAt)}</td>
    </tr>
  );
}
