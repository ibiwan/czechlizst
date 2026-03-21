import { type FormEvent, useEffect, useState } from 'react';
import { type WorkStatus } from '@app/contracts';
import { StatusOptionSelect } from '@utilities/StatusOptionSelect';
import { type TaskView } from '@app-types/view';

import './TaskCard.css';
import { TaskCardReadOnly } from './TaskCardReadOnly';
import { TaskCardEditing } from './TaskCardEditing';
import { TaskCardDefault } from './TaskCardDefault';
import { TaskTimestamp } from './TaskTimestamp';
import { TaskStatusRow } from './TaskStatusRow';

type TaskCardProps = {
  effectiveStatus?: WorkStatus;
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
  effectiveStatus,
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
  const shownStatus = effectiveStatus ?? task.status;
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
        <TaskCardReadOnly task={task} />
      ) : editing ? (
        <TaskCardEditing
          multiline={multiline}
          onCancel={() => {
            setEditing(false);
            setDraftTitle(task.title);
          }}
          onSubmit={onSubmitTitle}
          task={task}
          title={draftTitle}
          onTitleChange={setDraftTitle}
          updateTaskLoading={updateTaskLoading}
        />
      ) : (
        <TaskCardDefault
          isSelected={isSelected}
          onStartEditing={() => setEditing(true)}
          task={task}
        />
      )}
      {!readOnly && (
        <div className="task-card-meta">
          {isSelected ? (
            <>
              <TaskStatusRow
                effectiveStatus={shownStatus}
                task={task}
                onUpdateTaskStatus={onUpdateTaskStatus}
                updateTaskStatusLoading={updateTaskStatusLoading}
              />
              <StatusOptionSelect
                className={`status-select status-select-${task.status}`}
                currentStatus={task.status}
                disabled={updateTaskStatusLoading}
                onClick={(event) => event.stopPropagation()}
                onChange={(nextStatus) => onUpdateTaskStatus(task.id, task.status, nextStatus)}
                testId={`task-status-select-${task.id}`}
              />
            </>
          ) : (
            <span className={`status-pill status-${shownStatus}`} data-testid={`task-status-pill-${task.id}`}>
              {shownStatus}
            </span>
          )}
          <TaskTimestamp taskId={task.id} timestamp={task.createdAt} />
        </div>
      )}
    </div>
  );
}
