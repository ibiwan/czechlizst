import { IconButton, DeleteIcon } from '@utilities/IconButton';
import { OverflowReveal } from '@utilities/OverflowReveal';
import { type TaskView } from '@app-types/view';
import { TaskTimestamp } from './TaskTimestamp';
import { useTaskCardCallbacks } from './useTaskCardCallbacks';

type TaskCardReadOnlyProps = {
  task: TaskView;
};

export function TaskCardReadOnly({ task }: TaskCardReadOnlyProps) {
  const { onDeleteTask } = useTaskCardCallbacks(task.id);

  return (
    <div className="task-card-one-line">
      <div className="task-card-left">
        <span className="task-card-status-slot">
          <span className={`status-pill status-${task.status}`} data-testid={`task-status-pill-${task.id}`}>
            {task.status}
          </span>
        </span>
        <span className="task-card-gap" aria-hidden="true" />
        <OverflowReveal
          as="span"
          className="task-card-title"
          testId={`task-title-${task.id}`}
        >
          {task.title}
        </OverflowReveal>
      </div>
      <div className="task-card-right">
        <TaskTimestamp taskId={task.id} timestamp={task.updatedAt} />
        <IconButton aria-label={`Delete ${task.title}`} onClick={onDeleteTask} testId={`task-delete-${task.id}`}>
          <DeleteIcon />
        </IconButton>
      </div>
    </div>
  );
}
