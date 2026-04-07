import { formatRelativeDay, getEffectiveTaskStatus } from '../lib';
import type { Task, TaskRelation } from '../types';
import { StatusPill } from './StatusPill';

export function AnchorRow({
  onSelect,
  relations,
  selected,
  task,
  totalTasks,
  tasks
}: {
  onSelect: (taskId: number) => void;
  relations: TaskRelation[];
  selected: boolean;
  task: Task;
  totalTasks: number;
  tasks: Task[];
}) {
  return (
    <button
      className={`task-row ${selected ? 'selected' : ''}`}
      data-testid={`anchor-row-${task.id}`}
      onClick={() => onSelect(task.id)}
      type="button"
    >
      <div className="task-row-top">
        <strong>{task.title}</strong>
        <StatusPill status={getEffectiveTaskStatus(task, relations, tasks)} />
      </div>
      <div className="task-row-meta">
        <span>{totalTasks} tasks</span>
        <span className="task-row-meta-right">{formatRelativeDay(task.updatedAt)}</span>
      </div>
    </button>
  );
}
