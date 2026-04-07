import { useEffect, useState } from 'react';

import { findChildren, findTaskById, formatRelativeDay, getEffectiveTaskStatus } from '../lib';
import type { Task, TaskNote, TaskRelation, WorkStatus } from '../types';
import { RelatedTaskCombobox } from './RelatedTaskCombobox';
import { StatusPill } from './StatusPill';
import { StatusSelect } from './StatusSelect';

export function TaskDetailPane({
  filteredRelatedCandidateGroups,
  mutating,
  newBlockerTitle,
  newNoteBody,
  newNoteReference,
  onCreateBlocker,
  onCreateNote,
  onCreateRelation,
  onDeleteNote,
  onDeleteRelation,
  onDeleteTask,
  onFocusTask,
  onNavigateTask,
  onRename,
  onStatusChange,
  relationCommentary,
  relationQuery,
  relationTargetId,
  relatedRelations,
  blockerRelations,
  renameValue,
  selectedNotes,
  selectedTask,
  setNewBlockerTitle,
  setNewNoteBody,
  setNewNoteReference,
  setRelationCommentary,
  setRelationQuery,
  setRelationTargetId,
  setRenameValue,
  tasks
}: {
  filteredRelatedCandidateGroups: Array<{ label: string; tasks: Task[] }>;
  mutating: boolean;
  newBlockerTitle: string;
  newNoteBody: string;
  newNoteReference: string;
  onCreateBlocker: (event: React.FormEvent<HTMLFormElement>) => void;
  onCreateNote: (event: React.FormEvent<HTMLFormElement>) => void;
  onCreateRelation: (event: React.FormEvent<HTMLFormElement>) => void;
  onDeleteNote: (nodeId: number) => void;
  onDeleteRelation: (relationId: number) => void;
  onDeleteTask: () => void;
  onFocusTask: (taskId: number) => void;
  onNavigateTask: (taskId: number) => void;
  onRename: (event: React.FormEvent<HTMLFormElement>) => void;
  onStatusChange: (status: WorkStatus) => void;
  relationCommentary: string;
  relationQuery: string;
  relationTargetId: number | null;
  relatedRelations: TaskRelation[];
  blockerRelations: TaskRelation[];
  renameValue: string;
  selectedNotes: TaskNote[];
  selectedTask: Task | null;
  setNewBlockerTitle: (value: string) => void;
  setNewNoteBody: (value: string) => void;
  setNewNoteReference: (value: string) => void;
  setRelationCommentary: (value: string) => void;
  setRelationQuery: (value: string) => void;
  setRelationTargetId: (value: number | null) => void;
  setRenameValue: (value: string) => void;
  tasks: Task[];
}) {
  return (
    <section className="pane detail-pane pane--animated" data-testid="pane-detail">
      <div className="pane-enter-left pane-inner" key={selectedTask?.id ?? 'empty'}>
      <div className="pane-header sticky-pane-header">
        <p className="eyebrow">Pane 3</p>
      </div>

      <div className="pane-scroll">
      {selectedTask ? (
        <TaskDetail
          blockerRelations={blockerRelations}
          filteredRelatedCandidateGroups={filteredRelatedCandidateGroups}
          mutating={mutating}
          newBlockerTitle={newBlockerTitle}
          newNoteBody={newNoteBody}
          newNoteReference={newNoteReference}
          onCreateBlocker={onCreateBlocker}
          onCreateNote={onCreateNote}
          onCreateRelation={onCreateRelation}
          onDeleteNote={onDeleteNote}
          onDeleteRelation={onDeleteRelation}
          onDeleteTask={onDeleteTask}
          onFocus={onFocusTask}
          onNavigate={onNavigateTask}
          onRename={onRename}
          onStatusChange={onStatusChange}
          relationCommentary={relationCommentary}
          relationQuery={relationQuery}
          relationTargetId={relationTargetId}
          relatedRelations={relatedRelations}
          renameValue={renameValue}
          selectedNotes={selectedNotes}
          setNewBlockerTitle={setNewBlockerTitle}
          setNewNoteBody={setNewNoteBody}
          setNewNoteReference={setNewNoteReference}
          setRelationCommentary={setRelationCommentary}
          setRelationQuery={setRelationQuery}
          setRelationTargetId={setRelationTargetId}
          setRenameValue={setRenameValue}
          task={selectedTask}
          tasks={tasks}
        />
      ) : (
        <div className="empty-block">
          <p>No task selected.</p>
        </div>
      )}
      </div>
      </div>
    </section>
  );
}

function TaskDetail({
  blockerRelations,
  filteredRelatedCandidateGroups,
  mutating,
  newBlockerTitle,
  newNoteBody,
  newNoteReference,
  onCreateBlocker,
  onCreateNote,
  onCreateRelation,
  onDeleteNote,
  onDeleteRelation,
  onDeleteTask,
  onFocus,
  onNavigate,
  onRename,
  onStatusChange,
  relationCommentary,
  relationQuery,
  relationTargetId,
  relatedRelations,
  renameValue,
  selectedNotes,
  setNewBlockerTitle,
  setNewNoteBody,
  setNewNoteReference,
  setRelationCommentary,
  setRelationQuery,
  setRelationTargetId,
  setRenameValue,
  task,
  tasks
}: {
  blockerRelations: TaskRelation[];
  filteredRelatedCandidateGroups: Array<{ label: string; tasks: Task[] }>;
  mutating: boolean;
  newBlockerTitle: string;
  newNoteBody: string;
  newNoteReference: string;
  onCreateBlocker: (event: React.FormEvent<HTMLFormElement>) => void;
  onCreateNote: (event: React.FormEvent<HTMLFormElement>) => void;
  onCreateRelation: (event: React.FormEvent<HTMLFormElement>) => void;
  onDeleteNote: (noteId: number) => void;
  onDeleteRelation: (relationId: number) => void;
  onDeleteTask: () => void;
  onFocus: (taskId: number) => void;
  onNavigate: (taskId: number) => void;
  onRename: (event: React.FormEvent<HTMLFormElement>) => void;
  onStatusChange: (status: WorkStatus) => void;
  relationCommentary: string;
  relationQuery: string;
  relationTargetId: number | null;
  relatedRelations: TaskRelation[];
  renameValue: string;
  selectedNotes: TaskNote[];
  setNewBlockerTitle: (value: string) => void;
  setNewNoteBody: (value: string) => void;
  setNewNoteReference: (value: string) => void;
  setRelationCommentary: (value: string) => void;
  setRelationQuery: (value: string) => void;
  setRelationTargetId: (value: number | null) => void;
  setRenameValue: (value: string) => void;
  task: Task;
  tasks: Task[];
}) {
  const [editingTitle, setEditingTitle] = useState(false);

  useEffect(() => {
    setEditingTitle(false);
  }, [task.id]);

  const effectiveStatus = getEffectiveTaskStatus(
    task,
    [...blockerRelations, ...relatedRelations],
    tasks
  );
  const childrenCount = findChildren(tasks, task.id).length;
  const blockerCount = blockerRelations.length;

  return (
    <div className="detail-stack">
      {/* Task card */}
      <section className="detail-card" data-testid="task-detail-card">
        <div className="detail-card-top">
          <div className="task-detail-title-wrap">
            {editingTitle ? (
              <form
                className="task-detail-title-form"
                onKeyDown={(e) => { if (e.key === 'Escape') { setEditingTitle(false); setRenameValue(task.title); } }}
                onSubmit={(e) => { onRename(e); setEditingTitle(false); }}
              >
                <input
                  autoFocus
                  className="add-entity-input"
                  data-testid="task-detail-title-input"
                  onChange={(event) => setRenameValue(event.target.value)}
                  value={renameValue}
                />
                <button aria-label="Save" className="add-entity-icon-btn" disabled={mutating} type="submit">
                  <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M9 16.17 4.83 12l-1.41 1.41L9 19l12-12-1.41-1.41z" /></svg>
                </button>
                <button aria-label="Cancel" className="add-entity-icon-btn" onClick={() => { setEditingTitle(false); setRenameValue(task.title); }} type="button">
                  <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" /></svg>
                </button>
              </form>
            ) : (
              <div className="task-detail-title-row">
                <h3 className="task-detail-title">{task.title}</h3>
                <button aria-label="Edit title" className="add-entity-icon-btn" onClick={() => setEditingTitle(true)} type="button">
                  <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 17.25V20h2.75l8.1-8.1-2.75-2.75L4 17.25zm15.71-9.04c.39-.39.39-1.02 0-1.41l-1.5-1.5a1 1 0 0 0-1.41 0l-1.13 1.13 2.75 2.75 1.29-1.29z" /></svg>
                </button>
              </div>
            )}
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
            <span className="detail-label">Status</span>
            <StatusSelect
              disabled={mutating}
              onChange={onStatusChange}
              value={task.status}
            />
          </div>
        </div>

        <div className="action-row">
          <button className="danger-button" onClick={onDeleteTask} type="button">
            Delete task
          </button>
        </div>
      </section>

      {/* Notes */}
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
                  onClick={() => onDeleteNote(note.id)}
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
        <form className="stack-form" onSubmit={onCreateNote}>
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

      {/* Blockers */}
      <div className="detail-section" data-testid="task-detail-blockers">
        <h3>Blockers</h3>
        {blockerRelations.length > 0 ? (
          blockerRelations.map((relation) => {
            const relatedTask = findTaskById(tasks, relation.relatedTaskId);
            if (!relatedTask) return null;
            return (
              <article className="relation-card" key={relation.id}>
                <div className="relation-top">
                  <span className="relation-type">{relation.relationType}</span>
                  <div className="relation-actions">
                    <button onClick={() => onNavigate(relatedTask.id)} type="button">
                      {relatedTask.title}
                    </button>
                    <button
                      className="text-button"
                      onClick={() => onFocus(relatedTask.id)}
                      type="button"
                    >
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
          <button disabled={mutating} type="submit">
            Create blocker
          </button>
        </form>
      </div>

      {/* Related */}
      <div className="detail-section" data-testid="task-detail-related">
        <h3>Related</h3>
        {relatedRelations.length > 0 ? (
          relatedRelations.map((relation) => {
            const relatedTask = findTaskById(tasks, relation.relatedTaskId);
            if (!relatedTask) return null;
            return (
              <article className="relation-card" key={relation.id}>
                <div className="relation-top">
                  <span className="relation-type">{relation.relationType}</span>
                  <div className="relation-actions">
                    <button onClick={() => onNavigate(relatedTask.id)} type="button">
                      {relatedTask.title}
                    </button>
                    <button
                      className="text-button"
                      onClick={() => onFocus(relatedTask.id)}
                      type="button"
                    >
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
        <form className="stack-form" onSubmit={onCreateRelation}>
          <h3>Add related link</h3>
          <RelatedTaskCombobox
            groups={filteredRelatedCandidateGroups}
            onSelectTask={(t) => {
              setRelationTargetId(t.id);
              setRelationQuery(t.title);
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
      </div>
    </div>
  );
}
