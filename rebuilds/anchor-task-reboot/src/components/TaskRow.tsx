import { formatRelativeDay, getEffectiveTaskStatus, isLeafTask } from '../lib';
import type { Task, TaskRelation } from '../types';
import { StatusPill } from './StatusPill';

export function TaskRow({
  childCount,
  isFocused,
  onFocus,
  onSelect,
  relations,
  selected,
  task,
  tasks
}: {
  childCount: number;
  isFocused: boolean;
  onFocus: (taskId: number) => void;
  onSelect: (taskId: number) => void;
  relations: TaskRelation[];
  selected: boolean;
  task: Task;
  tasks: Task[];
}) {
  const effectiveStatus = getEffectiveTaskStatus(task, relations, tasks);
  const isLeaf = isLeafTask(tasks, task.id);

  function handleClick() {
    if (selected && !isLeaf) {
      onFocus(task.id);
    } else {
      onSelect(task.id);
    }
  }

  return (
    <article
      className={`task-row ${selected ? 'selected' : ''} ${isFocused ? 'focused' : ''}`}
      data-testid={`task-row-${task.id}`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="task-row-top">
        <strong>{task.title}</strong>
        <StatusPill status={effectiveStatus} />
      </div>
      <div className="task-row-meta">
        <span>{isLeaf ? 'leaf' : `${childCount} tasks`}</span>
        <span className="task-row-meta-right">{formatRelativeDay(task.updatedAt)}</span>
      </div>
    </article>
  );
}
