import { type WorkStatus } from '@app/contracts';
import { Flipped } from 'react-flip-toolkit';
import { TaskCard } from './TaskCard';
import { type TaskView } from '@app-types/view';

type TaskListItemProps = {
  onDeleteTask: (taskId: number) => void;
  onUpdateTaskStatus: (taskId: number, currentStatus: WorkStatus, nextStatus: WorkStatus) => void;
  onUpdateTaskTitle: (taskId: number, title: string) => void;
  selectedTaskId: number | null;
  setSelectedTaskIdForRow: (taskId: number) => void;
  task: TaskView;
  updateTaskLoading: boolean;
  updateTaskStatusLoading: boolean;
};

export function TaskListItem({
  onDeleteTask,
  onUpdateTaskStatus,
  onUpdateTaskTitle,
  selectedTaskId,
  setSelectedTaskIdForRow,
  task,
  updateTaskLoading,
  updateTaskStatusLoading
}: TaskListItemProps) {
  const isSelected = task.id === selectedTaskId;

  return (
    <Flipped flipId={`task-${task.id}`}>
      <div
        className={`task-list-item${isSelected ? ' is-selected' : ''}`}
        onClick={() => setSelectedTaskIdForRow(task.id)}
        data-testid={`task-row-${task.id}`}
      >
        <TaskCard
          onDeleteTask={onDeleteTask}
          onUpdateTaskStatus={onUpdateTaskStatus}
          onUpdateTaskTitle={onUpdateTaskTitle}
          isSelected={isSelected}
          readOnly
          task={task}
          updateTaskLoading={updateTaskLoading}
          updateTaskStatusLoading={updateTaskStatusLoading}
        />
      </div>
    </Flipped>
  );
}
