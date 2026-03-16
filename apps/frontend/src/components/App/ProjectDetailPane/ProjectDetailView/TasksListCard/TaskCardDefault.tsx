import { IconButton, DeleteIcon, EditIcon } from '@utilities/IconButton';
import { type TaskView } from '@app-types/view';
import { useTaskCardCallbacks } from './useTaskCardCallbacks';

type TaskCardDefaultProps = {
  isSelected: boolean;
  onStartEditing: () => void;
  task: TaskView;
};

export function TaskCardDefault({ isSelected, onStartEditing, task }: TaskCardDefaultProps) {
  const { onDeleteTask } = useTaskCardCallbacks(task.id);

  return (
    <div className="task-card-title-row">
      <span className="task-card-title" data-testid={`task-title-${task.id}`}>
        {task.title}
      </span>
      <div className="task-card-actions">
        {isSelected && (
          <IconButton aria-label={`Edit ${task.title}`} onClick={onStartEditing} testId={`task-edit-${task.id}`}>
            <EditIcon />
          </IconButton>
        )}
        <IconButton aria-label={`Delete ${task.title}`} onClick={onDeleteTask} testId={`task-delete-${task.id}`}>
          <DeleteIcon />
        </IconButton>
      </div>
    </div>
  );
}
