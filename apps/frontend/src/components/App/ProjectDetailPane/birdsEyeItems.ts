import { type WorkStatus } from '@app/contracts';

type BirdsEyeTask = {
  id: number;
  projectId: number;
  title: string;
  status: WorkStatus;
  createdAt: string;
  updatedAt: string;
};

export type BirdsEyeItem = { type: 'task'; data: BirdsEyeTask };

export function getItemRecency(item: BirdsEyeItem) {
  return item.data.updatedAt;
}

export function shuffleItems<T>(items: T[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function buildBirdsEyeItems(allTasks: BirdsEyeTask[]) {
  const row1Tasks = allTasks.filter((task) => ['active', 'started', 'blocked'].includes(task.status));

  const row1Items = row1Tasks
    .map((task) => ({ type: 'task' as const, data: task }))
    .sort((a, b) => getItemRecency(b).localeCompare(getItemRecency(a)));

  const row1TaskIds = new Set(row1Tasks.map((task) => task.id));

  const row2Tasks = allTasks.filter(
    (task) => ['active', 'started', 'todo'].includes(task.status) && !row1TaskIds.has(task.id)
  );

  const row2Items = row2Tasks.map((task) => ({ type: 'task' as const, data: task }));

  return {
    row1Items,
    row2Items,
    selectableItems: [...row1Items, ...row2Items].filter((item) => item.data.status !== 'blocked')
  };
}
