import type { Task, TaskRelation, WorkStatus } from './types';

const statusOrder: Record<WorkStatus | 'blocked', number> = {
  active: 0,
  started: 1,
  todo: 2,
  blocked: 3,
  done: 4,
  dropped: 5
};

export function isAnchor(task: Task): boolean {
  return task.isAnchor === true;
}

export function findTaskById(tasks: Task[], taskId: number | null): Task | null {
  if (taskId == null) {
    return null;
  }

  return tasks.find((task) => task.id === taskId) ?? null;
}

export function findChildren(tasks: Task[], parentTaskId: number | null): Task[] {
  return tasks.filter((task) => task.parentTaskId === parentTaskId);
}

export function countDirectChildren(tasks: Task[], parentTaskId: number | null): number {
  return findChildren(tasks, parentTaskId).length;
}

export function countDescendants(tasks: Task[], taskId: number): number {
  const visited = new Set<number>();
  const stack = findChildren(tasks, taskId).map((task) => task.id);
  let count = 0;

  while (stack.length > 0) {
    const currentId = stack.pop();

    if (currentId == null || visited.has(currentId)) {
      continue;
    }

    visited.add(currentId);
    count += 1;

    for (const child of findChildren(tasks, currentId)) {
      stack.push(child.id);
    }
  }

  return count;
}

export function countRelationsInSubtree(
  tasks: Task[],
  relations: TaskRelation[],
  taskId: number
): number {
  const subtreeTaskIds = new Set<number>([taskId]);
  const stack = findChildren(tasks, taskId).map((task) => task.id);

  while (stack.length > 0) {
    const currentId = stack.pop();

    if (currentId == null || subtreeTaskIds.has(currentId)) {
      continue;
    }

    subtreeTaskIds.add(currentId);

    for (const child of findChildren(tasks, currentId)) {
      stack.push(child.id);
    }
  }

  return relations.filter((relation) => subtreeTaskIds.has(relation.taskId)).length;
}

export function findParentChain(tasks: Task[], taskId: number | null): Task[] {
  const chain: Task[] = [];
  const visited = new Set<number>();
  let current = findTaskById(tasks, taskId);

  while (current && !visited.has(current.id)) {
    chain.push(current);
    visited.add(current.id);
    current = findTaskById(tasks, current.parentTaskId);
  }

  return chain.reverse();
}

export function findAnchorForTask(tasks: Task[], taskId: number | null): Task | null {
  const chain = findParentChain(tasks, taskId);
  const anchorInChain = chain.find(isAnchor);

  if (anchorInChain) {
    return anchorInChain;
  }

  const directTask = findTaskById(tasks, taskId);
  return directTask && isAnchor(directTask) ? directTask : null;
}

export function findSiblings(tasks: Task[], taskId: number): Task[] {
  const task = findTaskById(tasks, taskId);

  if (!task || task.parentTaskId == null) {
    return [];
  }

  return findChildren(tasks, task.parentTaskId).filter((candidate) => candidate.id !== taskId);
}

export function findAuntsAndUncles(tasks: Task[], taskId: number): Task[] {
  const task = findTaskById(tasks, taskId);
  const parent = task ? findTaskById(tasks, task.parentTaskId) : null;

  if (!parent || parent.parentTaskId == null) {
    return [];
  }

  return findChildren(tasks, parent.parentTaskId).filter(
    (candidate) => candidate.id !== parent.id
  );
}

export function findCousins(tasks: Task[], taskId: number): Task[] {
  const cousins = new Map<number, Task>();

  for (const relative of findAuntsAndUncles(tasks, taskId)) {
    for (const child of findChildren(tasks, relative.id)) {
      if (child.id !== taskId) {
        cousins.set(child.id, child);
      }
    }
  }

  return [...cousins.values()];
}

export function isLeafTask(tasks: Task[], taskId: number): boolean {
  return !tasks.some((task) => task.parentTaskId === taskId);
}

export function listLeafTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => isLeafTask(tasks, task.id));
}

export function sortTasksForDisplay(tasks: Task[], relations: TaskRelation[], allTasks: Task[]) {
  return [...tasks].sort((left, right) => {
    const statusDiff =
      statusOrder[getEffectiveTaskStatus(left, relations, allTasks)] -
      statusOrder[getEffectiveTaskStatus(right, relations, allTasks)];

    if (statusDiff !== 0) {
      return statusDiff;
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

export function getEffectiveTaskStatus(
  task: Task,
  relations: TaskRelation[],
  tasks: Task[]
): WorkStatus | 'blocked' {
  const blockedByIds = relations
    .filter(
      (relation) => relation.taskId === task.id && relation.relationType === 'blocked_by'
    )
    .map((relation) => relation.relatedTaskId);

  const unresolvedBlocker = blockedByIds
    .map((id) => findTaskById(tasks, id))
    .some((candidate) => candidate && !['done', 'dropped'].includes(candidate.status));

  return unresolvedBlocker ? 'blocked' : task.status;
}

export function formatRelativeDay(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}
