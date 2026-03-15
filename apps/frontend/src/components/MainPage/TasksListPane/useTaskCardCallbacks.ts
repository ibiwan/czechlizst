import { useTasksPanelModel } from '@state/tasks/useTasksPanelModel';

export function useTaskCardCallbacks(taskId: number) {
  const model = useTasksPanelModel();

  return {
    onDeleteTask: () => model.onDeleteTask(taskId)
  };
}
