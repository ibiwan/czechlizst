import { api as baseApi } from './base';
import { healthApi, type HealthApi } from './health';
import { notesApi, type NotesApi } from './notes';
import { projectsApi, type ProjectsApi } from './projects';
import { tasksApi, type TasksApi } from './tasks';

type CombinedApi = HealthApi & NotesApi & ProjectsApi & TasksApi;

export const api = baseApi as CombinedApi;
export { useHealthQuery } from './health';
export {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useListProjectsQuery,
  useUpdateProjectMutation,
  useUpdateProjectStatusMutation
} from './projects';
export {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useDemoteActiveTasksExceptTaskMutation,
  useDemoteActiveTasksInProjectMutation,
  useDemoteActiveTasksOutsideProjectMutation,
  useListAllTasksQuery,
  useListTasksQuery,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation
} from './tasks';
export {
  useCreateProjectNoteMutation,
  useCreateTaskNoteMutation,
  useDeleteProjectNoteMutation,
  useDeleteTaskNoteMutation,
  useListProjectNotesQuery,
  useListTaskNotesQuery,
  useUpdateProjectNoteMutation,
  useUpdateTaskNoteMutation
} from './notes';

void healthApi;
void notesApi;
void projectsApi;
void tasksApi;
