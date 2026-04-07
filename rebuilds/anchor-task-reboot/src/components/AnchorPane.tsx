import { useState } from 'react';

import { countDescendants } from '../lib';
import type { Task, TaskRelation } from '../types';
import { AddEntityInput } from './AddEntityInput';
import { AnchorRow } from './AnchorRow';

export function AnchorPane({
  anchorTasks,
  isEmptyDatabase,
  mutating,
  onCreateAnchor,
  onSelectAnchor,
  onSeedDemo,
  onSeedRandom,
  relations,
  selectedAnchorId,
  tasks
}: {
  anchorTasks: Task[];
  isEmptyDatabase: boolean;
  mutating: boolean;
  onCreateAnchor: (title: string) => void;
  onSelectAnchor: (anchorId: number) => void;
  onSeedDemo: () => void;
  onSeedRandom: () => void;
  relations: TaskRelation[];
  selectedAnchorId: number | null;
  tasks: Task[];
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = value.trim();
    if (!title) return;
    onCreateAnchor(title);
    setValue('');
    setOpen(false);
  }

  return (
    <section className="pane">
      <div className="pane-header sticky-pane-header" data-testid="pane-anchors-header">
        <p className="eyebrow">Pane 1</p>
        <h2>Projects</h2>
      </div>

      {isEmptyDatabase ? (
        <div className="empty-block callout-block">
          <p>No projects yet.</p>
          <p className="empty-copy">Create a project, or load demo data.</p>
          <button
            className="callout-button"
            disabled={mutating}
            onClick={onSeedDemo}
            type="button"
          >
            Load demo graph
          </button>
          <button
            className="callout-button"
            disabled={mutating}
            onClick={onSeedRandom}
            style={{ marginTop: '0.75rem' }}
            type="button"
          >
            Load random stress graph
          </button>
        </div>
      ) : null}

      <div className="pane-scroll">
      <AddEntityInput
        addLabel="+ Create project"
        inputPlaceholder="Project name"
        isSaving={mutating}
        onChangeValue={setValue}
        onSubmit={handleSubmit}
        onToggleOpen={setOpen}
        open={open}
        resetValue={() => setValue('')}
        value={value}
      />

      <div className="list">
        {anchorTasks.map((task) => (
          <AnchorRow
            key={task.id}
            onSelect={onSelectAnchor}
            relations={relations}
            selected={task.id === selectedAnchorId}
            task={task}
            tasks={tasks}
            totalTasks={countDescendants(tasks, task.id) + 1}
          />
        ))}
      </div>
      </div>
    </section>
  );
}
