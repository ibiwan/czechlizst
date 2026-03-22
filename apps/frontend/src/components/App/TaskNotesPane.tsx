import { useEffect, useMemo, useState } from 'react';
import { useListAllTasksQuery } from '@api';
import {
  taskRelationTypes,
  type TaskRelation,
  type TaskRelationType
} from '@app/contracts';
import { type TaskView } from '@app-types/view';
import { useProjectsPanel } from '@state/projects/useProjectsPanel';
import { NotesDetailSection } from '@utilities/NotesDetailSection';
import { type TasksPanelModel } from '@state/tasks/TasksPanelModel';
import { buildBirdsEyeItems } from './ProjectDetailPane/birdsEyeItems';
import { TaskCard } from './ProjectDetailPane/ProjectDetailView/TasksListCard/TaskCard';

const RELATION_TYPE_LABELS: Record<TaskRelationType, string> = {
  blocked_by: 'Blocked By',
  has_subtask: 'Has Subtask',
  related_to: 'Related To'
};

const RELATION_TYPE_VERBS: Record<TaskRelationType, string> = {
  blocked_by: 'blockers',
  has_subtask: 'subtasks',
  related_to: 'related tasks'
};

export function TaskNotesPane({ model }: { model: TasksPanelModel }) {
  const [isRandomPickLoading, setIsRandomPickLoading] = useState(false);
  const [newRelationType, setNewRelationType] = useState<TaskRelationType>('blocked_by');
  const [newRelatedTaskId, setNewRelatedTaskId] = useState('');
  const [newRelationCommentary, setNewRelationCommentary] = useState('');
  const [editingRelationId, setEditingRelationId] = useState<number | null>(null);
  const [editingRelationType, setEditingRelationType] = useState<TaskRelationType>('blocked_by');
  const [editingRelationCommentary, setEditingRelationCommentary] = useState('');
  const [pendingTaskSelection, setPendingTaskSelection] = useState<{
    projectId: number;
    taskId: number;
  } | null>(null);
  const { selectProject } = useProjectsPanel();
  const allTasksQuery = useListAllTasksQuery();
  const allTasks = useMemo(() => allTasksQuery.data?.tasks ?? [], [allTasksQuery.data?.tasks]);
  const allTaskById = useMemo(() => new Map(allTasks.map((task) => [task.id, task])), [allTasks]);
  const { selectableItems } = useMemo(() => buildBirdsEyeItems(allTasks), [allTasks]);
  const currentRelations = useMemo(() => {
    const relations: Array<{ taskRelation: TaskRelation; task: TaskView }> = [];

    for (const taskRelation of model.taskRelations) {
      const task = allTaskById.get(taskRelation.relatedTaskId);
      if (!task) {
        continue;
      }
      relations.push({ taskRelation, task });
    }

    return relations;
  }, [allTaskById, model.taskRelations]);
  const relationsByType = useMemo(() => {
    return new Map(
      taskRelationTypes.map((relationType) => [
        relationType,
        currentRelations.filter((relation) => relation.taskRelation.relationType === relationType)
      ])
    );
  }, [currentRelations]);
  const availableRelatedTasks = useMemo(() => {
    if (!model.activeTask) {
      return [];
    }
    const currentRelatedTaskIds = new Set(
      model.taskRelations
        .filter((taskRelation) => taskRelation.relationType === newRelationType)
        .map((taskRelation) => taskRelation.relatedTaskId)
    );

    return model.tasks.filter(
      (task) => task.id !== model.activeTask?.id && !currentRelatedTaskIds.has(task.id)
    );
  }, [model.activeTask, model.taskRelations, model.tasks, newRelationType]);

  useEffect(() => {
    if (!pendingTaskSelection) {
      return;
    }

    const matchingTask = model.tasks.find((task) => task.id === pendingTaskSelection.taskId);
    if (!matchingTask || matchingTask.projectId !== pendingTaskSelection.projectId) {
      return;
    }

    model.selectTask(pendingTaskSelection.taskId);
    setPendingTaskSelection(null);
  }, [model, pendingTaskSelection]);

  useEffect(() => {
    if (availableRelatedTasks.length === 0) {
      setNewRelatedTaskId('');
      return;
    }

    if (availableRelatedTasks.some((task) => String(task.id) === newRelatedTaskId)) {
      return;
    }

    setNewRelatedTaskId(String(availableRelatedTasks[0].id));
  }, [availableRelatedTasks, newRelatedTaskId]);

  async function handlePickRandomTask() {
    if (selectableItems.length === 0 || isRandomPickLoading) {
      return;
    }

    const randomItem = selectableItems[Math.floor(Math.random() * selectableItems.length)];

    setIsRandomPickLoading(true);
    try {
      setPendingTaskSelection({
        projectId: randomItem.data.projectId,
        taskId: randomItem.data.id
      });
      selectProject(randomItem.data.projectId);
    } finally {
      setIsRandomPickLoading(false);
    }
  }

  async function handleAddTaskRelation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const relatedTaskId = Number(newRelatedTaskId);
    if (!relatedTaskId) {
      return;
    }
    await model.onCreateTaskRelation(
      relatedTaskId,
      newRelationType,
      newRelationCommentary.trim() || null
    );
    setNewRelatedTaskId('');
    setNewRelationCommentary('');
  }

  function jumpToTask(taskId: number) {
    const relatedTask = allTaskById.get(taskId);
    if (!relatedTask) {
      return;
    }

    if (model.activeProjectId === relatedTask.projectId) {
      model.selectTask(relatedTask.id);
      return;
    }

    setPendingTaskSelection({
      projectId: relatedTask.projectId,
      taskId: relatedTask.id
    });
    selectProject(relatedTask.projectId);
  }

  function beginEditingRelation(taskRelation: TaskRelation) {
    setEditingRelationId(taskRelation.id);
    setEditingRelationType(taskRelation.relationType);
    setEditingRelationCommentary(taskRelation.commentary ?? '');
  }

  function cancelEditingRelation() {
    setEditingRelationId(null);
    setEditingRelationType('blocked_by');
    setEditingRelationCommentary('');
  }

  async function handleUpdateTaskRelation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editingRelationId === null) {
      return;
    }
    await model.onUpdateTaskRelation(
      editingRelationId,
      editingRelationType,
      editingRelationCommentary.trim() || null
    );
    cancelEditingRelation();
  }

  if (model.activeProjectId === null) {
    return (
      <div className="task-notes-random-pick">
        <button
          type="button"
          className="activate-btn activate-btn-random-pick"
          onClick={handlePickRandomTask}
          disabled={isRandomPickLoading || allTasksQuery.isLoading || selectableItems.length === 0}
          data-testid="task-notes-random-pick"
        >
          PICK A RANDOM TASK
        </button>
      </div>
    );
  }

  if (model.selectedTaskId === null) {
    return (
      <p className="state-copy" data-testid="task-notes-empty-task">
        Select a task first.
      </p>
    );
  }

  async function handleCreateNote(body: string, referenceUrl: string | null) {
    if (!body || model.selectedTaskId === null) return;
    await model.createTaskNoteWithValues(body, referenceUrl);
  }

  return (
    <>
      {model.activeTask && (
        <TaskCard
          effectiveStatus={model.activeTaskEffectiveStatus ?? model.activeTask.status}
          onUpdateTaskStatus={model.onUpdateTaskStatus}
          onUpdateTaskTitle={model.onUpdateTaskTitle}
          isSelected
          multiline
          task={model.activeTask}
          updateTaskLoading={model.updateTaskState.isLoading}
          updateTaskStatusLoading={model.updateTaskStatusState.isLoading}
        />
      )}
      <section className="detail-block" data-testid="task-relations">
        <div className="panel-header">
          <h3 className="panel-title">Relationships</h3>
          <span className="meta-copy">
            {currentRelations.length === 0
              ? 'No relationships'
              : `${currentRelations.length} link${currentRelations.length === 1 ? '' : 's'}`}
          </span>
        </div>
        {model.taskRelationsQuery.isLoading ? (
          <p className="state-copy">Loading relationships…</p>
        ) : model.taskRelationsQuery.error ? (
          <p className="state-copy">Could not load relationships.</p>
        ) : currentRelations.length === 0 ? (
          <p className="state-copy">
            This task has no explicit links yet.
          </p>
        ) : (
          <div className="task-relation-groups">
            {taskRelationTypes.map((relationType) => {
              const relations = relationsByType.get(relationType) ?? [];
              if (relations.length === 0) {
                return null;
              }
              return (
                <div className="task-relation-group" key={relationType}>
                  <div className="panel-header">
                    <h4 className="panel-subtitle">{RELATION_TYPE_LABELS[relationType]}</h4>
                    <span className="meta-copy">
                      {relations.length} {RELATION_TYPE_VERBS[relationType]}
                    </span>
                  </div>
                  <div className="task-blocker-list">
                    {relations.map(({ taskRelation, task }) => (
                      <div className="task-blocker-row" key={taskRelation.id}>
                        {editingRelationId === taskRelation.id ? (
                          <form className="task-relation-editor" onSubmit={handleUpdateTaskRelation}>
                            <div className="task-blocker-copy">
                              <button
                                type="button"
                                className="link-inline task-relation-link"
                                onClick={() => jumpToTask(task.id)}
                                data-testid={`task-relation-jump-${taskRelation.id}`}
                              >
                                {task.title}
                              </button>
                              <span
                                className={`status-pill status-${model.effectiveTaskStatusById.get(task.id) ?? task.status}`}
                              >
                                {model.effectiveTaskStatusById.get(task.id) ?? task.status}
                              </span>
                            </div>
                            <div className="detail-action-row">
                              <select
                                className="text-input"
                                value={editingRelationType}
                                onChange={(event) =>
                                  setEditingRelationType(event.target.value as TaskRelationType)
                                }
                                disabled={model.updateTaskRelationState.isLoading}
                                data-testid={`task-relation-edit-type-${taskRelation.id}`}
                              >
                                {taskRelationTypes.map((candidateType) => (
                                  <option key={candidateType} value={candidateType}>
                                    {RELATION_TYPE_LABELS[candidateType]}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <textarea
                              className="text-input"
                              rows={3}
                              value={editingRelationCommentary}
                              onChange={(event) => setEditingRelationCommentary(event.target.value)}
                              disabled={model.updateTaskRelationState.isLoading}
                              placeholder="Optional commentary"
                              data-testid={`task-relation-edit-commentary-${taskRelation.id}`}
                            />
                            <div className="detail-action-row">
                              <button
                                type="submit"
                                className="mini-btn"
                                disabled={model.updateTaskRelationState.isLoading}
                                data-testid={`task-relation-save-${taskRelation.id}`}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="mini-btn mini-btn-subtle"
                                onClick={cancelEditingRelation}
                                disabled={model.updateTaskRelationState.isLoading}
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="task-blocker-copy">
                              <button
                                type="button"
                                className="link-inline task-relation-link"
                                onClick={() => jumpToTask(task.id)}
                                data-testid={`task-relation-jump-${taskRelation.id}`}
                              >
                                {task.title}
                              </button>
                              <span
                                className={`status-pill status-${model.effectiveTaskStatusById.get(task.id) ?? task.status}`}
                              >
                                {model.effectiveTaskStatusById.get(task.id) ?? task.status}
                              </span>
                              {taskRelation.commentary ? (
                                <span className="task-relation-commentary">
                                  {taskRelation.commentary}
                                </span>
                              ) : null}
                            </div>
                            <div className="detail-header-actions">
                              <button
                                type="button"
                                className="link-inline"
                                onClick={() => beginEditingRelation(taskRelation)}
                                disabled={
                                  model.updateTaskRelationState.isLoading ||
                                  model.deleteTaskRelationState.isLoading
                                }
                                data-testid={`task-relation-edit-${taskRelation.id}`}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="link-danger"
                                onClick={() => model.onDeleteTaskRelation(taskRelation.id)}
                                disabled={model.deleteTaskRelationState.isLoading}
                                data-testid={`task-relation-remove-${taskRelation.id}`}
                              >
                                Remove
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <form className="detail-actions" onSubmit={handleAddTaskRelation}>
          <div className="detail-action-row">
            <select
              className="text-input"
              value={newRelationType}
              onChange={(event) => setNewRelationType(event.target.value as TaskRelationType)}
              disabled={model.createTaskRelationState.isLoading}
              data-testid="task-relation-type-select"
            >
              {taskRelationTypes.map((relationType) => (
                <option key={relationType} value={relationType}>
                  {RELATION_TYPE_LABELS[relationType]}
                </option>
              ))}
            </select>
            <select
              className="text-input"
              value={newRelatedTaskId}
              onChange={(event) => setNewRelatedTaskId(event.target.value)}
              disabled={
                availableRelatedTasks.length === 0 || model.createTaskRelationState.isLoading
              }
              data-testid="task-relation-select"
            >
              {availableRelatedTasks.length === 0 ? (
                <option value="">No eligible tasks in this project</option>
              ) : (
                availableRelatedTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))
              )}
            </select>
            <button
              type="submit"
              className="mini-btn"
              disabled={!newRelatedTaskId || model.createTaskRelationState.isLoading}
              data-testid="task-relation-add"
            >
              Add link
            </button>
          </div>
          <textarea
            className="text-input"
            rows={3}
            value={newRelationCommentary}
            onChange={(event) => setNewRelationCommentary(event.target.value)}
            disabled={model.createTaskRelationState.isLoading}
            placeholder="Optional commentary"
            data-testid="task-relation-commentary"
          />
          <p className="meta-copy">
            First pass is same-project only. Cross-project links can come later.
          </p>
        </form>
      </section>
      <NotesDetailSection
        addNoteLabel="New note"
        createNoteLoading={model.createTaskNoteState.isLoading}
        deleteNoteLoading={model.deleteTaskNoteState.isLoading}
        inputPlaceholder="Add a task note"
        notes={model.taskNotes}
        notesError={Boolean(model.taskNotesQuery.error)}
        notesLoading={model.taskNotesQuery.isLoading}
        onCreateNote={handleCreateNote}
        onDeleteNote={model.onDeleteTaskNote}
        onUpdateNote={model.onUpdateTaskNote}
        testIdPrefix="task-notes"
        title="Task Notes"
        updateNoteLoading={model.updateTaskNoteState.isLoading}
      />
    </>
  );
}
