import { type WorkStatus } from '@app/contracts';

type BirdsEyeProject = {
  id: number;
  name: string;
  status: WorkStatus;
  createdAt: string;
  updatedAt?: string;
};

type BirdsEyeTask = {
  id: number;
  projectId: number;
  title: string;
  status: WorkStatus;
  createdAt: string;
  updatedAt?: string;
};

export type BirdsEyeItem =
  | { type: 'project'; data: BirdsEyeProject }
  | { type: 'task'; data: BirdsEyeTask };

export function getItemRecency(item: BirdsEyeItem) {
  return item.data.updatedAt ?? item.data.createdAt;
}

export function shuffleItems<T>(items: T[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function buildBirdsEyeItems(projects: BirdsEyeProject[], allTasks: BirdsEyeTask[]) {
  const projectIdsWithTasks = new Set(allTasks.map((task) => task.projectId));

  const row1Tasks = allTasks.filter((task) => ['active', 'started', 'blocked'].includes(task.status));
  const row1Projects = projects.filter(
    (project) => ['active', 'started'].includes(project.status) && !projectIdsWithTasks.has(project.id)
  );

  const row1Items = [
    ...row1Tasks.map((task) => ({ type: 'task' as const, data: task })),
    ...row1Projects.map((project) => ({ type: 'project' as const, data: project }))
  ].sort((a, b) => getItemRecency(b).localeCompare(getItemRecency(a)));

  const row1TaskIds = new Set(row1Tasks.map((task) => task.id));
  const row1ProjectIds = new Set(row1Projects.map((project) => project.id));

  const row2Tasks = allTasks.filter(
    (task) => ['active', 'started', 'todo'].includes(task.status) && !row1TaskIds.has(task.id)
  );
  const row2Projects = projects.filter(
    (project) =>
      ['active', 'started', 'todo'].includes(project.status) &&
      !row1ProjectIds.has(project.id) &&
      !projectIdsWithTasks.has(project.id)
  );

  const row2Items = [
    ...row2Tasks.map((task) => ({ type: 'task' as const, data: task })),
    ...row2Projects.map((project) => ({ type: 'project' as const, data: project }))
  ];

  return {
    row1Items,
    row2Items,
    selectableItems: [...row1Items, ...row2Items]
  };
}
