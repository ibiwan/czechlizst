import { formatProjectTimestamp } from '@lib/format';

type TaskTimestampProps = {
  taskId: number;
  timestamp: string;
};

export function TaskTimestamp({ taskId, timestamp }: TaskTimestampProps) {
  return (
    <span className="task-created" data-testid={`task-created-${taskId}`}>
      {formatProjectTimestamp(timestamp)}
    </span>
  );
}
