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
  seedRandomGraph,
  updateTask
} from './api';
import { AnchorPane } from './components/AnchorPane';
import { NavPane } from './components/NavPane';
import { TaskDetailPane } from './components/TaskDetailPane';
import {
  findAnchorForTask,
  findAuntsAndUncles,
  findChildren,
  findCousins,
  findParentChain,
  findSiblings,
  findTaskById,
  isAnchor,
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
  const [newNoteBody, setNewNoteBody] = useState('');
  const [newNoteReference, setNewNoteReference] = useState('');
  const [newBlockerTitle, setNewBlockerTitle] = useState('');
  const [relationTargetId, setRelationTargetId] = useState<number | null>(null);
  const [relationQuery, setRelationQuery] = useState('');
  const [relationCommentary, setRelationCommentary] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [mutating, setMutating] = useState(false);

  // --- Derived data ---

  const anchorTasks = useMemo(
    () => sortTasksForDisplay(tasks.filter(isAnchor), relations, tasks),
    [relations, tasks]
  );

  const focusedTask = findTaskById(tasks, state.focusedTaskId);
  const selectedTask = findTaskById(tasks, state.selectedTaskId);
  const selectedAnchor = findTaskById(tasks, state.selectedAnchorId);
  const branchTask = focusedTask ?? selectedAnchor;
  const breadcrumbs = findParentChain(tasks, branchTask?.id ?? null);
  const anchorChildren = branchTask
    ? sortTasksForDisplay(findChildren(tasks, branchTask.id), relations, tasks)
    : [];

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

  const filteredRelatedCandidateGroups = useMemo(() => {
    if (!selectedTask) return [];

    const excludedIds = new Set<number>([
      selectedTask.id,
      ...selectedRelated.map((r) => r.relatedTaskId)
    ]);

    const needle = deferredRelationQuery.trim().toLowerCase();

    const groups = [
      { label: 'Siblings', tasks: findSiblings(tasks, selectedTask.id) },
      { label: 'Aunts / Uncles', tasks: findAuntsAndUncles(tasks, selectedTask.id) },
      { label: 'Cousins', tasks: findCousins(tasks, selectedTask.id) }
    ]
      .map((group) => ({
        label: group.label,
        tasks: sortTasksForDisplay(
          group.tasks.filter(
            (task) => !excludedIds.has(task.id) && (!needle || task.title.toLowerCase().includes(needle))
          ),
          relations,
          tasks
        )
      }))
      .filter((group) => group.tasks.length > 0);

    return groups;
  }, [deferredRelationQuery, relations, selectedRelated, selectedTask, tasks]);

  // --- Data loading ---

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

        if (cancelled) return;

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
            ? applyFocusSelection(current, { type: 'select_anchor', anchorId: firstAnchor.id })
            : current
        );
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : String(caught));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void bootstrap();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (selectedTask) {
      setRenameValue(selectedTask.title);
    }
  }, [selectedTask]);

  // --- Navigation handlers ---

  function handleSelectAnchor(anchorId: number) {
    setState((current) => applyFocusSelection(current, { type: 'select_anchor', anchorId }));
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

  function handleCloseAnchor() {
    setState((current) => applyFocusSelection(current, { type: 'select_anchor', anchorId: null }));
  }

  // --- Mutation handlers ---

  async function handleCreateAnchor(title: string) {
    try {
      setMutating(true);
      setError(null);
      const created = await createTask({ title, isAnchor: true, parentTaskId: null });
      await refreshData();
      handleSelectAnchor(created.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setMutating(false);
    }
  }

  async function handleCreateChild(title: string) {
    if (!branchTask) return;
    try {
      setMutating(true);
      setError(null);
      const created = await createTask({ title, isAnchor: false, parentTaskId: branchTask.id });
      await refreshData();
      handleSelectTask(created.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setMutating(false);
    }
  }

  async function handleRenameTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTask) return;
    const title = renameValue.trim();
    if (!title) return;
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
    if (!selectedTask) return;
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
    if (!selectedTask) return;
    const body = newNoteBody.trim();
    if (!body) return;
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

  async function handleCreateRelation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTask || relationTargetId == null) return;
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
    if (!selectedTask) return;
    const title = newBlockerTitle.trim();
    if (!title) return;
    try {
      setMutating(true);
      setError(null);
      const blocker = await createTask({ title, isAnchor: false, parentTaskId: selectedTask.id });
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

  async function handleDeleteSelectedTask() {
    if (!selectedTask) return;
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
          applyFocusSelection(current, { type: 'select_anchor', anchorId: fallbackAnchor.id })
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
          applyFocusSelection(current, { type: 'select_anchor', anchorId: firstAnchor.id })
        );
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setMutating(false);
    }
  }

  async function handleSeedRandomGraph() {
    try {
      setMutating(true);
      setError(null);
      const snapshot = await seedRandomGraph();
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
          applyFocusSelection(current, { type: 'select_anchor', anchorId: firstAnchor.id })
        );
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setMutating(false);
    }
  }

  // --- Render ---

  if (loading) {
    return (
      <div className="app-shell">
        <div className="empty-block">
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {error ? (
        <div className="error-banner">
          <strong>API error</strong>
          <pre>{error}</pre>
        </div>
      ) : null}

      <main className="pane-grid">
        <AnchorPane
          anchorTasks={anchorTasks}
          isEmptyDatabase={isEmptyDatabase}
          mutating={mutating}
          onCreateAnchor={handleCreateAnchor}
          onSelectAnchor={handleSelectAnchor}
          onSeedDemo={handleSeedDemoGraph}
          onSeedRandom={handleSeedRandomGraph}
          relations={relations}
          selectedAnchorId={state.selectedAnchorId}
          tasks={tasks}
        />

        <NavPane
          anchorChildren={anchorChildren}
          anchorTasks={anchorTasks}
          blockerRelations={selectedBlockers}
          breadcrumbs={breadcrumbs}
          branchTask={branchTask}
          focusedTask={focusedTask}
          mutating={mutating}
          onCloseAnchor={handleCloseAnchor}
          onCreateChild={handleCreateChild}
          onFocusTask={handleFocusTask}
          onSelectAnchor={handleSelectAnchor}
          onSelectTask={handleSelectTask}
          relatedRelations={selectedRelated}
          relations={relations}
          selectedAnchorId={state.selectedAnchorId}
          selectedTask={selectedTask}
          tasks={tasks}
        />

        <TaskDetailPane
          blockerRelations={selectedBlockers}
          filteredRelatedCandidateGroups={filteredRelatedCandidateGroups}
          mutating={mutating}
          newBlockerTitle={newBlockerTitle}
          newNoteBody={newNoteBody}
          newNoteReference={newNoteReference}
          onCreateBlocker={handleCreateBlocker}
          onCreateNote={handleCreateNote}
          onCreateRelation={handleCreateRelation}
          onDeleteNote={handleDeleteNote}
          onDeleteRelation={handleDeleteRelation}
          onDeleteTask={handleDeleteSelectedTask}
          onFocusTask={handleFocusTask}
          onNavigateTask={handleSelectTask}
          onRename={handleRenameTask}
          onStatusChange={handleStatusChange}
          relationCommentary={relationCommentary}
          relationQuery={relationQuery}
          relationTargetId={relationTargetId}
          relatedRelations={selectedRelated}
          renameValue={renameValue}
          selectedNotes={selectedNotes}
          selectedTask={selectedTask}
          setNewBlockerTitle={setNewBlockerTitle}
          setNewNoteBody={setNewNoteBody}
          setNewNoteReference={setNewNoteReference}
          setRelationCommentary={setRelationCommentary}
          setRelationQuery={setRelationQuery}
          setRelationTargetId={setRelationTargetId}
          setRenameValue={setRenameValue}
          tasks={tasks}
        />
      </main>
    </div>
  );
}

export default App;
