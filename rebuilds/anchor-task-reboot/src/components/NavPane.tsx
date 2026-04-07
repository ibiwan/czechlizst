import { useState } from 'react';

import { countDescendants, countDirectChildren, findTaskById, formatRelativeDay, getEffectiveTaskStatus } from '../lib';
import type { Task, TaskRelation } from '../types';
import { AddEntityInput } from './AddEntityInput';
import { StatusPill } from './StatusPill';
import { TaskRow } from './TaskRow';

export function NavPane({
  anchorChildren,
  anchorTasks,
  blockerRelations,
  breadcrumbs,
  branchTask,
  focusedTask,
  mutating,
  onCloseAnchor,
  onCreateChild,
  onFocusTask,
  onSelectAnchor,
  onSelectTask,
  relatedRelations,
  relations,
  selectedAnchorId,
  selectedTask,
  tasks
}: {
  anchorChildren: Task[];
  anchorTasks: Task[];
  blockerRelations: TaskRelation[];
  breadcrumbs: Task[];
  branchTask: Task | null;
  focusedTask: Task | null;
  mutating: boolean;
  onCloseAnchor: () => void;
  onCreateChild: (title: string) => void;
  onFocusTask: (taskId: number) => void;
  onSelectAnchor: (anchorId: number) => void;
  onSelectTask: (taskId: number) => void;
  relatedRelations: TaskRelation[];
  relations: TaskRelation[];
  selectedAnchorId: number | null;
  selectedTask: Task | null;
  tasks: Task[];
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [addValue, setAddValue] = useState('');

  const hasAnchorSelected = selectedAnchorId !== null;

  function handleAddChild(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = addValue.trim();
    if (!title) return;
    onCreateChild(title);
    setAddValue('');
    setAddOpen(false);
  }

  return (
    <section className="pane" data-testid="pane-children">
      <div className="pane-header sticky-pane-header">
        <p className="eyebrow">Pane 2</p>
        <h2 data-testid="pane-children-title">
          {branchTask ? branchTask.title : 'Navigation'}
        </h2>

        {hasAnchorSelected ? (
          <button className="text-button pane-context-action" onClick={onCloseAnchor} type="button">
            Close anchor
          </button>
        ) : (
          <p className="pane-context">Select a project in Pane 1 to navigate.</p>
        )}

        {breadcrumbs.length > 0 ? (
          <div className="breadcrumb-row">
            {breadcrumbs.map((task, index) => (
              <span className="breadcrumb" key={task.id}>
                {index > 0 ? <span className="breadcrumb-sep">{'>'}</span> : null}
                <button onClick={() => onFocusTask(task.id)} type="button">
                  {task.title}
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="pane-scroll">
      <div className="nav-content-enter" key={selectedAnchorId ?? 'empty'}>
      {!hasAnchorSelected ? (
        anchorTasks.length > 0 ? (
          <div className="birds-eye-row">
            {anchorTasks.map((anchor) => (
              <button
                key={anchor.id}
                className={`birds-eye-tile ${anchor.id === selectedAnchorId ? 'selected' : ''}`}
                onClick={() => onSelectAnchor(anchor.id)}
                type="button"
              >
                <strong>{anchor.title}</strong>
                <p>{countDescendants(tasks, anchor.id) + 1} total</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-block">
            <p>No projects yet.</p>
          </div>
        )
      ) : (
        <div className="detail-stack">
          {branchTask ? (
            <AddEntityInput
              addLabel="+ Add task"
              inputPlaceholder={`Task under ${branchTask.title}`}
              isSaving={mutating}
              onChangeValue={setAddValue}
              onSubmit={handleAddChild}
              onToggleOpen={setAddOpen}
              open={addOpen}
              resetValue={() => setAddValue('')}
              value={addValue}
            />
          ) : null}

          <div className="list" data-testid="pane-children-list">
            {anchorChildren.length > 0 ? (
              anchorChildren.map((task) => (
                <TaskRow
                  key={task.id}
                  childCount={countDirectChildren(tasks, task.id)}
                  isFocused={task.id === focusedTask?.id}
                  onFocus={onFocusTask}
                  onSelect={onSelectTask}
                  relations={relations}
                  selected={task.id === selectedTask?.id}
                  task={task}
                  tasks={tasks}
                />
              ))
            ) : (
              <div className="empty-block">
                <p>No children here yet.</p>
              </div>
            )}
          </div>

          {selectedTask && (blockerRelations.length > 0 || relatedRelations.length > 0) ? (
            <div className="detail-section">
              <h3 className="subheading">Related tasks</h3>

              {blockerRelations.map((relation) => {
                const related = findTaskById(tasks, relation.relatedTaskId);
                if (!related) return null;
                return (
                  <NavRelationRow
                    key={relation.id}
                    label="blocker"
                    onFocus={onFocusTask}
                    onSelect={onSelectTask}
                    relation={relation}
                    relations={relations}
                    task={related}
                    tasks={tasks}
                  />
                );
              })}

              {relatedRelations.map((relation) => {
                const related = findTaskById(tasks, relation.relatedTaskId);
                if (!related) return null;
                return (
                  <NavRelationRow
                    key={relation.id}
                    label="related"
                    onFocus={onFocusTask}
                    onSelect={onSelectTask}
                    relation={relation}
                    relations={relations}
                    task={related}
                    tasks={tasks}
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      )}
      </div>
      </div>
    </section>
  );
}

function NavRelationRow({
  label,
  onFocus,
  onSelect,
  relation,
  relations,
  task,
  tasks
}: {
  label: string;
  onFocus: (taskId: number) => void;
  onSelect: (taskId: number) => void;
  relation: TaskRelation;
  relations: TaskRelation[];
  task: Task;
  tasks: Task[];
}) {
  return (
    <article className="relation-card">
      <div className="relation-top">
        <div>
          <span className="relation-type">{label}</span>
          {' '}
          <button
            className="task-title-button"
            onClick={() => onSelect(task.id)}
            type="button"
          >
            <strong>{task.title}</strong>
          </button>
        </div>
        <div className="relation-actions">
          <StatusPill status={getEffectiveTaskStatus(task, relations, tasks)} />
          <button
            className="task-open-button"
            onClick={() => onFocus(task.id)}
            type="button"
          >
            Open
          </button>
        </div>
      </div>
      <div className="task-row-meta">
        <span>updated {formatRelativeDay(task.updatedAt)}</span>
        {relation.commentary ? <span>{relation.commentary}</span> : null}
      </div>
    </article>
  );
}
