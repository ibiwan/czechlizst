import * as Ariakit from '@ariakit/react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';

import { applyFocusSelection, rebootInitialState } from '../src-sketch/state';
import {
  createTask,
  createTaskNote,
  createTaskRelation,
  deleteTask,
  deleteTaskNote,
  deleteTaskRelation,
  loadSnapshot,
  seedDemoGraph,
  updateTask
} from './api';
import {
  countDescendants,
  countDirectChildren,
  countRelationsInSubtree,
  findAnchorForTask,
  findAuntsAndUncles,
  findChildren,
  findCousins,
  findParentChain,
  findSiblings,
  findTaskById,
  formatRelativeDay,
  getEffectiveTaskStatus,
  isAnchor,
  isLeafTask,
  listLeafTasks,
  sortTasksForDisplay
} from './lib';
import type { Task, TaskNote, TaskRelation, WorkStatus } from './types';
import './styles.css';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<TaskNote[]>([]);
  const [relations, setRelations] = useState<TaskRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState(rebootInitialState);
  const [newAnchorTitle, setNewAnchorTitle] = useState('');
  const [newChildTitle, setNewChildTitle] = useState('');
  const [newNoteBody, setNewNoteBody] = useState('');
  const [newNoteReference, setNewNoteReference] = useState('');
  const [newBlockerTitle, setNewBlockerTitle] = useState('');
  const [relationTargetId, setRelationTargetId] = useState<number | null>(null);
  const [relationQuery, setRelationQuery] = useState('');
  const [relationCommentary, setRelationCommentary] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [anchorChecked, setAnchorChecked] = useState(false);
  const [parentSelection, setParentSelection] = useState('');
  const [mutating, setMutating] = useState(false);

  const anchorTasks = useMemo(
    () => sortTasksForDisplay(tasks.filter(isAnchor), relations, tasks),
    [relations, tasks]
  );

  const focusedTask = findTaskById(tasks, state.focusedTaskId);
  const selectedTask = findTaskById(tasks, state.selectedTaskId);
  const children = sortTasksForDisplay(
    findChildren(tasks, state.focusedTaskId),
    relations,
    tasks
  );
  const breadcrumbs = findParentChain(tasks, state.selectedTaskId);
  const selectedNotes = notes.filter((note) => note.taskId === state.selectedTaskId);
  const selectedRelations = relations.filter(
    (relation) => relation.taskId === state.selectedTaskId
  );
  const selectedBlockers = selectedRelations.filter(
    (relation) => relation.relationType === 'blocked_by'
  );
  const selectedRelated = selectedRelations.filter(
    (relation) => relation.relationType === 'related_to'
  );
  const isEmptyDatabase = tasks.length === 0 && notes.length === 0 && relations.length === 0;
  const deferredRelationQuery = useDeferredValue(relationQuery);

  const relatedCandidateGroups = useMemo(() => {
    if (!selectedTask) {
      return [];
    }

    const excludedIds = new Set<number>([
      selectedTask.id,
      ...selectedRelated.map((relation) => relation.relatedTaskId)
    ]);

    const groups = [
      { label: 'Siblings', tasks: findSiblings(tasks, selectedTask.id) },
      { label: 'Aunts / Uncles', tasks: findAuntsAndUncles(tasks, selectedTask.id) },
      { label: 'Cousins', tasks: findCousins(tasks, selectedTask.id) }
    ];

    return groups
      .map((group) => ({
        label: group.label,
        tasks: sortTasksForDisplay(
          group.tasks.filter((task) => !excludedIds.has(task.id)),
          relations,
          tasks
        )
      }))
      .filter((group) => group.tasks.length > 0);
  }, [relations, selectedRelated, selectedTask, tasks]);

  const filteredRelatedCandidateGroups = useMemo(() => {
    const needle = deferredRelationQuery.trim().toLowerCase();

    if (!needle) {
      return relatedCandidateGroups;
    }

    return relatedCandidateGroups
      .map((group) => ({
        label: group.label,
        tasks: group.tasks.filter((task) => task.title.toLowerCase().includes(needle))
      }))
      .filter((group) => group.tasks.length > 0);
  }, [deferredRelationQuery, relatedCandidateGroups]);

  async function refreshData() {
    const snapshot = await loadSnapshot();
    setTasks(snapshot.tasks);
    setNotes(snapshot.notes);
    setRelations(snapshot.relations);
    return snapshot;
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        setLoading(true);
        setError(null);
        const snapshot = await loadSnapshot();

        if (cancelled) {
          return;
        }

        setTasks(snapshot.tasks);
        setNotes(snapshot.notes);
        setRelations(snapshot.relations);

        const firstAnchor = sortTasksForDisplay(
          snapshot.tasks.filter(isAnchor),
          snapshot.relations,
          snapshot.tasks
        )[0];

        setState((current) =>
          current.selectedTaskId == null && firstAnchor
            ? applyFocusSelection(current, {
                type: 'select_anchor',
                anchorId: firstAnchor.id
              })
            : current
        );
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : String(caught));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedTask) {
      setRenameValue(selectedTask.title);
      setAnchorChecked(selectedTask.isAnchor === true);
      setParentSelection(selectedTask.parentTaskId == null ? '' : String(selectedTask.parentTaskId));
    }
  }, [selectedTask]);

  function handleSelectAnchor(anchorId: number) {
    setState((current) =>
      applyFocusSelection(current, { type: 'select_anchor', anchorId })
    );
  }

  function handleSelectTask(taskId: number) {
    const nextTask = findTaskById(tasks, taskId);
    const anchor = findAnchorForTask(tasks, taskId);

    setState((current) =>
      applyFocusSelection(current, {
        type: 'select_task',
        taskId,
        anchorId: anchor?.id ?? current.selectedAnchorId,
        focusTaskId: current.focusedTaskId ?? nextTask?.parentTaskId ?? taskId
      })
    );
  }

  function handleFocusTask(taskId: number) {
    const anchor = findAnchorForTask(tasks, taskId);

    setState((current) =>
      applyFocusSelection(current, {
        type: 'select_task',
        taskId,
        anchorId: anchor?.id ?? current.selectedAnchorId,
        focusTaskId: taskId
      })
    );
  }

  function handleRandomLeafPick() {
    const leaves = listLeafTasks(tasks);
    const pick = leaves[Math.floor(Math.random() * leaves.length)];

    if (!pick) {
      return;
    }

    const anchor = findAnchorForTask(tasks, pick.id);

    setState((current) =>
      applyFocusSelection(current, {
        type: 'select_task',
        taskId: pick.id,
        anchorId: anchor?.id ?? current.selectedAnchorId,
        focusTaskId: pick.id
      })
    );
  }

  async function handleCreateAnchor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = newAnchorTitle.trim();

    if (!title) {
      return;
    }

    try {
      setMutating(true);
      setError(null);
      const created = await createTask({ title, isAnchor: true, parentTaskId: null });
      await refreshData();
      setNewAnchorTitle('');
      handleSelectAnchor(created.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setMutating(false);
    }
  }

  async function handleCreateChild(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!focusedTask) {
      return;
    }

    const title = newChildTitle.trim();

    if (!title) {
      return;
    }

    try {
      setMutating(true);
      setError(null);
      const created = await createTask({
        title,
        isAnchor: false,
        parentTaskId: focusedTask.id
      });
      await refreshData();
      setNewChildTitle('');
      handleSelectTask(created.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setMutating(false);
    }
  }

  async function handleRenameTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTask) {
      return;
    }

    const title = renameValue.trim();

    if (!title) {
      return;
    }

    try {
      setMutating(true);
      setError(null);
      await updateTask(selectedTask.id, { title });
      await refreshData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setMutating(false);
    }
  }

  async function handleStatusChange(nextStatus: WorkStatus) {
    if (!selectedTask) {
      return;
    }

    try {
      setMutating(true);
      setError(null);
      await updateTask(selectedTask.id, { status: nextStatus });
      await refreshData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setMutating(false);
    }
  }

  async function handleCreateNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTask) {
      return;
    }

    const body = newNoteBody.trim();

    if (!body) {
      return;
    }

    try {
      setMutating(true);
      setError(null);
      await createTaskNote({
        taskId: selectedTask.id,
        body,
        referenceUrl: newNoteReference.trim() || null
      });
      await refreshData();
      setNewNoteBody('');
      setNewNoteReference('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setMutating(false);
    }
  }

  async function handleCreateRelation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTask || relationTargetId == null) {
      return;
    }

    try {
      setMutating(true);
      setError(null);
      await createTaskRelation({
        taskId: selectedTask.id,
        relatedTaskId: relationTargetId,
        relationType: 'related_to',
        commentary: relationCommentary.trim() || null
      });
      await refreshData();
      setRelationTargetId(null);
      setRelationQuery('');
      setRelationCommentary('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setMutating(false);
    }
  }

  async function handleCreateBlocker(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTask) {
      return;
    }

    const title = newBlockerTitle.trim();

    if (!title) {
      return;
    }

    try {
      setMutating(true);
      setError(null);
      const blocker = await createTask({
        title,
        isAnchor: false,
        parentTaskId: selectedTask.id
      });
      await createTaskRelation({
        taskId: selectedTask.id,
        relatedTaskId: blocker.id,
        relationType: 'blocked_by',
        commentary: null
      });
      await refreshData();
      setNewBlockerTitle('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setMutating(false);
    }
  }

  async function handleDeleteNote(noteId: number) {
    try {
      setMutating(true);
      setError(null);
      await deleteTaskNote(noteId);
      await refreshData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setMutating(false);
    }
  }

  async function handleDeleteRelation(relationId: number) {
    try {
      setMutating(true);
      setError(null);
      await deleteTaskRelation(relationId);
      await refreshData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setMutating(false);
    }
  }

  async function handleSaveHierarchy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTask) {
      return;
    }

    const nextParentTaskId = parentSelection === '' ? null : Number(parentSelection);

    if (!anchorChecked && nextParentTaskId == null) {
      setError('A non-anchor task needs a parent, or it disappears from the UI.');
      return;
    }

    try {
      setMutating(true);
      setError(null);
      await updateTask(selectedTask.id, {
        isAnchor: anchorChecked,
        parentTaskId: nextParentTaskId
      });
      await refreshData();

      if (anchorChecked && nextParentTaskId == null) {
        handleSelectAnchor(selectedTask.id);
      } else {
        handleSelectTask(selectedTask.id);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setMutating(false);
    }
  }

  async function handleDeleteSelectedTask() {
    if (!selectedTask) {
      return;
    }

    try {
      setMutating(true);
      setError(null);

      async function deleteTaskWithHierarchy(taskId: number, reparentTargetId: number | null) {
        const directChildren = tasks.filter((task) => task.parentTaskId === taskId);

        for (const child of directChildren) {
          if (reparentTargetId != null || child.isAnchor === true) {
            await updateTask(child.id, { parentTaskId: reparentTargetId });
            continue;
          }

          await deleteTaskWithHierarchy(child.id, null);
        }

        await deleteTask(taskId);
      }

      const reparentTargetId = selectedTask.parentTaskId;

      await deleteTaskWithHierarchy(selectedTask.id, reparentTargetId);

      const snapshot = await refreshData();
      const survivingParent = reparentTargetId
        ? findTaskById(snapshot.tasks, reparentTargetId)
        : null;
      const fallbackAnchor = survivingParent
        ? findAnchorForTask(snapshot.tasks, survivingParent.id)
        : sortTasksForDisplay(
            snapshot.tasks.filter(isAnchor),
            snapshot.relations,
            snapshot.tasks
          )[0] ?? null;

      if (survivingParent) {
        setState((current) =>
          applyFocusSelection(current, {
            type: 'select_task',
            taskId: survivingParent.id,
            anchorId:
              findAnchorForTask(snapshot.tasks, survivingParent.id)?.id ??
              current.selectedAnchorId,
            focusTaskId: survivingParent.id
          })
        );
      } else if (fallbackAnchor) {
        setState((current) =>
          applyFocusSelection(current, {
            type: 'select_anchor',
            anchorId: fallbackAnchor.id
          })
        );
      } else {
        setState(rebootInitialState);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setMutating(false);
    }
  }

  async function handleSeedDemoGraph() {
    try {
      setMutating(true);
      setError(null);
      const snapshot = await seedDemoGraph();
      setTasks(snapshot.tasks);
      setNotes(snapshot.notes);
      setRelations(snapshot.relations);

      const firstAnchor = sortTasksForDisplay(
        snapshot.tasks.filter(isAnchor),
        snapshot.relations,
        snapshot.tasks
      )[0];

      if (firstAnchor) {
        setState((current) =>
          applyFocusSelection(current, {
            type: 'select_anchor',
            anchorId: firstAnchor.id
          })
        );
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setMutating(false);
    }
  }

  if (loading) {
    return (
      <div className="app-shell">
        <div className="empty-block">
          <p>Loading reboot data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Anchor Task Reboot</p>
          <h1>Runnable sketch of the task-only model</h1>
          <p className="empty-copy">Backed by reboot PostgREST on port 3003.</p>
        </div>
        <button
          className="random-button"
          disabled={mutating || tasks.length === 0}
          onClick={handleRandomLeafPick}
          type="button"
        >
          Pick Random Leaf
        </button>
      </header>

      {error ? (
        <div className="error-banner">
          <strong>API error</strong>
          <pre>{error}</pre>
        </div>
      ) : null}

      <main className="pane-grid">
        <section className="pane">
          <div className="pane-header sticky-pane-header" data-testid="pane-anchors-header">
            <p className="eyebrow">Pane 1</p>
            <h2>Anchors</h2>
          </div>
          {isEmptyDatabase ? (
            <div className="empty-block callout-block">
              <p>Reboot database is empty.</p>
              <p className="empty-copy">
                Create an anchor manually, or load the demo graph into the real reboot DB.
              </p>
              <button
                className="callout-button"
                disabled={mutating}
                onClick={handleSeedDemoGraph}
                type="button"
              >
                Load demo graph
              </button>
            </div>
          ) : null}
          <form className="inline-form" onSubmit={handleCreateAnchor}>
            <input
              onChange={(event) => setNewAnchorTitle(event.target.value)}
              placeholder="Create anchor task"
              value={newAnchorTitle}
            />
            <button disabled={mutating} type="submit">
              Add
            </button>
          </form>
          <div className="list">
            {anchorTasks.map((task) => (
              <AnchorRow
                key={task.id}
                directChildren={countDirectChildren(tasks, task.id)}
                totalTasks={countDescendants(tasks, task.id) + 1}
                onSelect={handleSelectAnchor}
                relationCount={countRelationsInSubtree(tasks, relations, task.id)}
                relations={relations}
                selected={task.id === state.selectedAnchorId}
                task={task}
                tasks={tasks}
              />
            ))}
          </div>
        </section>

        <section className="pane" data-testid="pane-children">
          <div className="pane-header sticky-pane-header">
            <p className="eyebrow">Pane 2</p>
            <h2 data-testid="pane-children-title">
              {focusedTask ? `${focusedTask.title} children` : 'Children'}
            </h2>
            {focusedTask ? (
              <p className="pane-context">
                {countDirectChildren(tasks, focusedTask.id)} direct children
              </p>
            ) : null}
            <div className="breadcrumb-row">
              {breadcrumbs.length > 0 ? (
                breadcrumbs.map((task, index) => (
                  <span className="breadcrumb" key={task.id}>
                    {index > 0 ? <span className="breadcrumb-sep">/</span> : null}
                    <button onClick={() => handleFocusTask(task.id)} type="button">
                      {task.title}
                    </button>
                  </span>
                ))
              ) : (
                <span className="empty-copy">Select an anchor to begin.</span>
              )}
            </div>
          </div>
          {focusedTask ? (
            <form className="inline-form" onSubmit={handleCreateChild}>
              <input
                onChange={(event) => setNewChildTitle(event.target.value)}
                placeholder={`Add child under ${focusedTask.title}`}
                value={newChildTitle}
              />
              <button disabled={mutating} type="submit">
                Add
              </button>
            </form>
          ) : null}
          <div className="list" data-testid="pane-children-list">
            {children.length > 0 ? (
              children.map((task) => (
                <TaskRow
                  key={task.id}
                  childCount={countDirectChildren(tasks, task.id)}
                  isFocused={task.id === state.focusedTaskId}
                  onFocus={handleFocusTask}
                  onSelect={handleSelectTask}
                  relations={relations}
                  selected={task.id === state.selectedTaskId}
                  task={task}
                  tasks={tasks}
                />
              ))
            ) : (
              <div className="empty-block">
                <p>No direct children here yet.</p>
                {focusedTask ? (
                  <p className="empty-copy">
                    This is what an anchor or leaf looks like in the reboot model.
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </section>

        <section className="pane detail-pane" data-testid="pane-detail">
          <div className="pane-header sticky-pane-header">
            <p className="eyebrow">Pane 3</p>
            <h2>Task detail</h2>
            {selectedTask && focusedTask && selectedTask.id !== focusedTask.id ? (
              <button
                className="text-button pane-context-action"
                disabled={mutating}
                onClick={() => handleFocusTask(selectedTask.id)}
                type="button"
              >
                Open this task in pane 2
              </button>
            ) : null}
          </div>
          {selectedTask ? (
            <TaskDetail
              anchorChecked={anchorChecked}
              blockerCount={selectedBlockers.length}
              childrenCount={findChildren(tasks, selectedTask.id).length}
              descendantCount={countDescendants(tasks, selectedTask.id)}
              hierarchyOptions={tasks.filter((task) => task.id !== selectedTask.id)}
              newBlockerTitle={newBlockerTitle}
              onFocus={handleFocusTask}
              onCreateBlocker={handleCreateBlocker}
              onNavigate={handleSelectTask}
              onDeleteRelation={handleDeleteRelation}
              onDeleteTask={handleDeleteSelectedTask}
              onRename={handleRenameTask}
              onSaveHierarchy={handleSaveHierarchy}
              onStatusChange={handleStatusChange}
              parentSelection={parentSelection}
              relationTasks={tasks}
              relatedRelations={selectedRelated}
              renameValue={renameValue}
              setNewBlockerTitle={setNewBlockerTitle}
              setAnchorChecked={setAnchorChecked}
              setParentSelection={setParentSelection}
              setRenameValue={setRenameValue}
              blockerRelations={selectedBlockers}
              task={selectedTask}
            >
              <div className="detail-section">
                <h3>Notes</h3>
                {selectedNotes.length > 0 ? (
                  selectedNotes.map((note) => (
                    <article className="note-card" key={note.id}>
                      <div className="note-meta note-meta-row">
                        <span>{formatRelativeDay(note.updatedAt)}</span>
                        <button
                          className="text-button danger-text"
                          disabled={mutating}
                          onClick={() => void handleDeleteNote(note.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                      <p>{note.body}</p>
                      {note.referenceUrl ? (
                        <pre className="note-reference">{note.referenceUrl}</pre>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <p className="empty-copy">No notes for this task yet.</p>
                )}
                <form className="stack-form" onSubmit={handleCreateNote}>
                  <textarea
                    onChange={(event) => setNewNoteBody(event.target.value)}
                    placeholder="Add a note"
                    rows={3}
                    value={newNoteBody}
                  />
                  <textarea
                    onChange={(event) => setNewNoteReference(event.target.value)}
                    placeholder="Optional reference or long pasted context"
                    rows={4}
                    value={newNoteReference}
                  />
                  <button disabled={mutating} type="submit">
                    Save note
                  </button>
                </form>
              </div>
              <form className="stack-form" onSubmit={handleCreateRelation}>
                <h3>Add related link</h3>
                <RelatedTaskCombobox
                  groups={filteredRelatedCandidateGroups}
                  onSelectTask={(task) => {
                    setRelationTargetId(task.id);
                    setRelationQuery(task.title);
                  }}
                  query={relationQuery}
                  selectedTask={findTaskById(tasks, relationTargetId)}
                  setQuery={setRelationQuery}
                />
                <textarea
                  onChange={(event) => setRelationCommentary(event.target.value)}
                  placeholder="Optional commentary"
                  rows={3}
                  value={relationCommentary}
                />
                <button disabled={mutating} type="submit">
                  Create relation
                </button>
              </form>
            </TaskDetail>
          ) : (
            <div className="empty-block">
              <p>No task selected.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function RelatedTaskCombobox({
  groups,
  onSelectTask,
  query,
  selectedTask,
  setQuery
}: {
  groups: Array<{ label: string; tasks: Task[] }>;
  onSelectTask: (task: Task) => void;
  query: string;
  selectedTask: Task | null;
  setQuery: (value: string) => void;
}) {
  return (
    <Ariakit.ComboboxProvider resetValueOnHide={false} setValue={setQuery} value={query}>
      <div className="stack-form relation-combobox">
        <Ariakit.Combobox
          className="relation-combobox-input"
          placeholder="Type to filter siblings, aunts, and cousins"
        />
        <Ariakit.ComboboxPopover className="relation-combobox-popover" gutter={8}>
          {groups.length > 0 ? (
            groups.map((group) => (
              <div className="relation-combobox-group" key={group.label}>
                <div className="relation-combobox-label">{group.label}</div>
                <div className="relation-combobox-list">
                  {group.tasks.map((task) => (
                    <Ariakit.ComboboxItem
                      className="relation-combobox-item"
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      value={task.title}
                    >
                      {task.title}
                    </Ariakit.ComboboxItem>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="relation-combobox-empty">No nearby tasks match.</div>
          )}
        </Ariakit.ComboboxPopover>
        {selectedTask ? (
          <p className="empty-copy">Linking to: {selectedTask.title}</p>
        ) : (
          <p className="empty-copy">No related task selected yet.</p>
        )}
      </div>
    </Ariakit.ComboboxProvider>
  );
}

function AnchorRow({
  directChildren,
  onSelect,
  relationCount,
  relations,
  selected,
  task,
  totalTasks,
  tasks
}: {
  directChildren: number;
  onSelect: (taskId: number) => void;
  relationCount: number;
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
        <span>{directChildren} direct children</span>
        <span>{totalTasks} total tasks</span>
        <span>{relationCount} lateral links</span>
      </div>
      <div className="task-row-meta task-row-meta-secondary">
        <span>updated {formatRelativeDay(task.updatedAt)}</span>
      </div>
    </button>
  );
}

function TaskRow({
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

  return (
    <article
      className={`task-row ${selected ? 'selected' : ''} ${isFocused ? 'focused' : ''}`}
      data-testid={`task-row-${task.id}`}
    >
      <div className="task-row-top">
        <button
          className="task-title-button"
          data-testid={`task-select-${task.id}`}
          onClick={() => onSelect(task.id)}
          type="button"
        >
          <strong>{task.title}</strong>
        </button>
        <div className="task-row-actions">
          {isFocused ? <span className="focus-badge">Open</span> : null}
          <button
            className="task-open-button"
            data-testid={`task-open-${task.id}`}
            onClick={() => onFocus(task.id)}
            type="button"
          >
            {isFocused ? 'Viewing children' : 'Open'}
          </button>
          <StatusPill status={effectiveStatus} />
        </div>
      </div>
      <div className="task-row-meta">
        <span>{isLeafTask(tasks, task.id) ? 'leaf' : `${childCount} direct children`}</span>
        <span>updated {formatRelativeDay(task.updatedAt)}</span>
      </div>
    </article>
  );
}

function TaskDetail({
  children,
  anchorChecked,
  blockerCount,
  blockerRelations,
  childrenCount,
  descendantCount,
  hierarchyOptions,
  newBlockerTitle,
  onFocus,
  onCreateBlocker,
  onNavigate,
  onDeleteRelation,
  onDeleteTask,
  onRename,
  onSaveHierarchy,
  onStatusChange,
  parentSelection,
  relationTasks,
  relatedRelations,
  renameValue,
  setNewBlockerTitle,
  setAnchorChecked,
  setParentSelection,
  setRenameValue,
  task
}: React.PropsWithChildren<{
  anchorChecked: boolean;
  blockerCount: number;
  blockerRelations: TaskRelation[];
  childrenCount: number;
  descendantCount: number;
  hierarchyOptions: Task[];
  newBlockerTitle: string;
  onFocus: (taskId: number) => void;
  onCreateBlocker: (event: React.FormEvent<HTMLFormElement>) => void;
  onNavigate: (taskId: number) => void;
  onDeleteRelation: (relationId: number) => void;
  onDeleteTask: () => void;
  onRename: (event: React.FormEvent<HTMLFormElement>) => void;
  onSaveHierarchy: (event: React.FormEvent<HTMLFormElement>) => void;
  onStatusChange: (nextStatus: WorkStatus) => void;
  parentSelection: string;
  relationTasks: Task[];
  relatedRelations: TaskRelation[];
  renameValue: string;
  setNewBlockerTitle: (value: string) => void;
  setAnchorChecked: (value: boolean) => void;
  setParentSelection: (value: string) => void;
  setRenameValue: (value: string) => void;
  task: Task;
}>) {
  const effectiveStatus = getEffectiveTaskStatus(
    task,
    [...blockerRelations, ...relatedRelations],
    relationTasks
  );

  return (
    <div className="detail-stack">
      <section className="detail-card" data-testid="task-detail-card">
        <div className="detail-card-top">
          <div>
            <p className="eyebrow">{task.isAnchor ? 'Anchor task' : 'Task'}</p>
            <form className="inline-form detail-inline-form" onSubmit={onRename}>
              <input
                data-testid="task-detail-title-input"
                onChange={(event) => setRenameValue(event.target.value)}
                value={renameValue}
              />
              <button type="submit">Rename</button>
            </form>
          </div>
          <StatusPill status={effectiveStatus} />
        </div>
        <div className="detail-grid">
          <div>
            <span className="detail-label">Updated</span>
            <p>{formatRelativeDay(task.updatedAt)}</p>
          </div>
          <div>
            <span className="detail-label">Children</span>
            <p>{childrenCount}</p>
          </div>
          <div>
            <span className="detail-label">Blockers</span>
            <p>{blockerCount}</p>
          </div>
          <div>
            <span className="detail-label">Total tasks</span>
            <p>{descendantCount + 1}</p>
          </div>
          <div>
            <span className="detail-label">Status</span>
            <select
              className="status-select"
              onChange={(event) => onStatusChange(event.target.value as WorkStatus)}
              value={task.status}
            >
              <option value="todo">todo</option>
              <option value="started">started</option>
              <option value="active">active</option>
              <option value="done">done</option>
              <option value="dropped">dropped</option>
            </select>
          </div>
        </div>
        <form className="stack-form" onSubmit={onSaveHierarchy}>
          <h3 className="subheading">Hierarchy</h3>
          <label className="checkbox-row">
            <input
              checked={anchorChecked}
              onChange={(event) => setAnchorChecked(event.target.checked)}
              type="checkbox"
            />
            <span>Show in left pane as anchor</span>
          </label>
          <select
            onChange={(event) => setParentSelection(event.target.value)}
            value={parentSelection}
          >
            <option value="">No parent</option>
            {hierarchyOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
          <div className="action-row">
            <button type="submit">Save hierarchy</button>
            <button
              className="danger-button"
              onClick={onDeleteTask}
              type="button"
            >
              Delete task
            </button>
          </div>
        </form>
      </section>

      {children}

      <div className="detail-section" data-testid="task-detail-blockers">
        <h3>Blockers</h3>
        {blockerRelations.length > 0 ? (
          blockerRelations.map((relation) => {
            const relatedTask = findTaskById(relationTasks, relation.relatedTaskId);

            if (!relatedTask) {
              return null;
            }

            return (
              <article className="relation-card" key={relation.id}>
                <div className="relation-top">
                  <span className="relation-type">{relation.relationType}</span>
                  <div className="relation-actions">
                    <button onClick={() => onNavigate(relatedTask.id)} type="button">
                      {relatedTask.title}
                    </button>
                    <button className="text-button" onClick={() => onFocus(relatedTask.id)} type="button">
                      Open
                    </button>
                    <button
                      className="text-button danger-text"
                      onClick={() => onDeleteRelation(relation.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {relation.commentary ? (
                  <p className="relation-commentary">{relation.commentary}</p>
                ) : null}
              </article>
            );
          })
        ) : (
          <p className="empty-copy">No blockers for this task right now.</p>
        )}
        <form className="stack-form" onSubmit={onCreateBlocker}>
          <input
            onChange={(event) => setNewBlockerTitle(event.target.value)}
            placeholder={`Create blocker under ${task.title}`}
            value={newBlockerTitle}
          />
          <button type="submit">Create blocker</button>
        </form>
      </div>

      <div className="detail-section" data-testid="task-detail-related">
        <h3>Related</h3>
        {relatedRelations.length > 0 ? (
          relatedRelations.map((relation) => {
            const relatedTask = findTaskById(relationTasks, relation.relatedTaskId);

            if (!relatedTask) {
              return null;
            }

            return (
              <article className="relation-card" key={relation.id}>
                <div className="relation-top">
                  <span className="relation-type">{relation.relationType}</span>
                  <div className="relation-actions">
                    <button onClick={() => onNavigate(relatedTask.id)} type="button">
                      {relatedTask.title}
                    </button>
                    <button className="text-button" onClick={() => onFocus(relatedTask.id)} type="button">
                      Open
                    </button>
                    <button
                      className="text-button danger-text"
                      onClick={() => onDeleteRelation(relation.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {relation.commentary ? (
                  <p className="relation-commentary">{relation.commentary}</p>
                ) : null}
              </article>
            );
          })
        ) : (
          <p className="empty-copy">No lateral relations for this task yet.</p>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: ReturnType<typeof getEffectiveTaskStatus> }) {
  return <span className={`status-pill status-${status}`}>{status}</span>;
}

export default App;
