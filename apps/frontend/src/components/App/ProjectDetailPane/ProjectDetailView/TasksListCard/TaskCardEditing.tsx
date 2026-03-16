import { type FormEvent } from 'react';
import { IconButton, SaveIcon, CancelIcon } from '@utilities/IconButton';
import { type TaskView } from '@app-types/view';

type TaskCardEditingProps = {
  multiline: boolean;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  task: TaskView;
  title: string;
  onTitleChange: (value: string) => void;
  updateTaskLoading: boolean;
};

export function TaskCardEditing({
  multiline,
  onCancel,
  onSubmit,
  task,
  title,
  onTitleChange,
  updateTaskLoading
}: TaskCardEditingProps) {
  return (
    <form
      className="inline-form in-row"
      onSubmit={onSubmit}
      onClick={(event) => event.stopPropagation()}
      data-testid={`task-edit-form-${task.id}`}
    >
      {multiline ? (
        <textarea
          className="text-input task-card-edit-textarea"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          autoFocus
          data-testid={`task-edit-input-${task.id}`}
        />
      ) : (
        <input
          className="text-input"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          autoFocus
          data-testid={`task-edit-input-${task.id}`}
        />
      )}
      <IconButton
        aria-label="Save task title"
        onClick={() => { }}
        disabled={updateTaskLoading}
        testId={`task-edit-save-${task.id}`}
      >
        <SaveIcon />
      </IconButton>
      <IconButton aria-label="Cancel edit" onClick={onCancel} testId={`task-edit-cancel-${task.id}`}>
        <CancelIcon />
      </IconButton>
    </form>
  );
}
