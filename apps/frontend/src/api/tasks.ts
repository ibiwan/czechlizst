import {
  createTaskBodySchema,
  parsePostgrestCreateTaskResponse,
  parsePostgrestListTasksResponse,
  updateTaskBodySchema,
  updateTaskStatusBodySchema,
  routes,
  type CreateTaskBody,
  type CreateTaskResponse,
  type ListTasksResponse,
  type UpdateTaskBody,
  type UpdateTaskStatusBody
} from '@app/contracts';
import {
  api,
  buildDeleteSingle,
  buildPatchReturn,
  buildPatchSingle,
  buildPostReturn,
  mapNotFound,
  parseSingleObjectResponse
} from './base';

type TaskTypes = {
  ListResult: ListTasksResponse;
  ListArg: number;
  CreateResult: CreateTaskResponse;
  CreateArg: { projectId: number } & CreateTaskBody;
  UpdateStatus: UpdateTaskBody['status'];
  UpdateStatusArg: UpdateTaskStatusBody['status'];
  UpdateArg: {
    taskId: number;
    projectId: number;
    title?: string;
    status?: TaskTypes['UpdateStatus'];
  };
  UpdateStatusMutationArg: { taskId: number; projectId: number; status: TaskTypes['UpdateStatusArg'] };
  DemoteOutsideProjectArg: { projectId: number };
  DemoteExceptTaskArg: { taskId: number };
  DeleteArg: { taskId: number; projectId: number };
};

export const tasksApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listTasks: builder.query<TaskTypes['ListResult'], TaskTypes['ListArg']>({
      query: (projectId) => routes.tasksByProject(projectId),
      transformResponse: (response) => parsePostgrestListTasksResponse(response),
      providesTags: (_result, _error, projectId) => [{ type: 'Tasks', id: projectId }]
    }),
    createTask: builder.mutation<TaskTypes['CreateResult'], TaskTypes['CreateArg']>({
      query: ({ projectId, title }) =>
        buildPostReturn(routes.tasks, {
          project_id: projectId,
          ...createTaskBodySchema.parse({ title })
        }),
      transformResponse: (response) => parsePostgrestCreateTaskResponse(response),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Tasks', id: arg.projectId }]
    }),
    updateTask: builder.mutation<TaskTypes['CreateResult'], TaskTypes['UpdateArg']>({
      query: ({ taskId, title, status }) =>
        buildPatchSingle(
          `${routes.tasks}?id=eq.${taskId}`,
          updateTaskBodySchema.parse({ title, status })
        ),
      transformResponse: parseSingleObjectResponse(parsePostgrestCreateTaskResponse),
      transformErrorResponse: mapNotFound('Task not found'),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Tasks', id: arg.projectId },
        'Projects'
      ]
    }),
    updateTaskStatus: builder.mutation<
      TaskTypes['CreateResult'],
      TaskTypes['UpdateStatusMutationArg']
    >({
      query: ({ taskId, status }) =>
        buildPatchSingle(
          `${routes.tasks}?id=eq.${taskId}`,
          updateTaskStatusBodySchema.parse({ status })
        ),
      transformResponse: parseSingleObjectResponse(parsePostgrestCreateTaskResponse),
      transformErrorResponse: mapNotFound('Task not found'),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Tasks', id: arg.projectId },
        'Projects'
      ]
    }),
    demoteActiveTasksOutsideProject: builder.mutation<
      TaskTypes['ListResult'],
      TaskTypes['DemoteOutsideProjectArg']
    >({
      query: ({ projectId }) =>
        buildPatchReturn(
          `${routes.tasks}?status=eq.active&project_id=neq.${projectId}`,
          updateTaskStatusBodySchema.parse({ status: 'started' })
        ),
      transformResponse: (response) => parsePostgrestListTasksResponse(response),
      invalidatesTags: ['Tasks', 'Projects']
    }),
    demoteActiveTasksExceptTask: builder.mutation<
      TaskTypes['ListResult'],
      TaskTypes['DemoteExceptTaskArg']
    >({
      query: ({ taskId }) =>
        buildPatchReturn(
          `${routes.tasks}?status=eq.active&id=neq.${taskId}`,
          updateTaskStatusBodySchema.parse({ status: 'started' })
        ),
      transformResponse: (response) => parsePostgrestListTasksResponse(response),
      invalidatesTags: ['Tasks', 'Projects']
    }),
    deleteTask: builder.mutation<TaskTypes['CreateResult'], TaskTypes['DeleteArg']>({
      query: ({ taskId }) => buildDeleteSingle(`${routes.tasks}?id=eq.${taskId}`),
      transformResponse: parseSingleObjectResponse(parsePostgrestCreateTaskResponse),
      transformErrorResponse: mapNotFound('Task not found'),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Tasks', id: arg.projectId },
        'Projects',
        { type: 'TaskNotes', id: arg.taskId }
      ]
    })
  }),
  overrideExisting: false
});

export type TasksApi = typeof tasksApi;
export const {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useDemoteActiveTasksExceptTaskMutation,
  useDemoteActiveTasksOutsideProjectMutation,
  useListTasksQuery,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation
} = tasksApi;
