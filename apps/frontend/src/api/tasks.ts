import {
  createTaskBlockerBodySchema,
  parsePostgrestCreateTaskBlockerResponse,
  createTaskBodySchema,
  parsePostgrestListTaskBlockersResponse,
  parsePostgrestCreateTaskResponse,
  parsePostgrestListTasksResponse,
  updateTaskBodySchema,
  updateTaskStatusBodySchema,
  routes,
  type CreateTaskBlockerResponse,
  type CreateTaskBody,
  type CreateTaskResponse,
  type ListTaskBlockersResponse,
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
  ListAllArg: void;
  ListBlockersResult: ListTaskBlockersResponse;
  ListBlockersArg: number;
  ListAllBlockersArg: void;
  CreateResult: CreateTaskResponse;
  CreateArg: { projectId: number } & CreateTaskBody;
  CreateBlockerResult: CreateTaskBlockerResponse;
  CreateBlockerArg: { taskId: number; blockingTaskId: number };
  DeleteBlockerArg: { taskBlockerId: number; taskId: number };
  UpdateStatus: UpdateTaskBody['status'];
  UpdateStatusArg: UpdateTaskStatusBody['status'];
  UpdateArg: {
    taskId: number;
    projectId: number;
    title?: string;
    status?: TaskTypes['UpdateStatus'];
    isPlaceholder?: boolean;
  };
  UpdateStatusMutationArg: {
    taskId: number;
    projectId: number;
    status: TaskTypes['UpdateStatusArg'];
    isPlaceholder?: boolean;
  };
  DemoteOutsideProjectArg: { projectId: number };
  DemoteExceptTaskArg: { taskId: number };
  DemoteInProjectArg: { projectId: number };
  DeleteArg: { taskId: number; projectId: number };
};

export const tasksApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listAllTasks: builder.query<TaskTypes['ListResult'], TaskTypes['ListAllArg']>({
      query: () => `${routes.tasks}?select=*`,
      transformResponse: (response) => parsePostgrestListTasksResponse(response),
      providesTags: ['Tasks']
    }),
    listAllTaskBlockers: builder.query<
      TaskTypes['ListBlockersResult'],
      TaskTypes['ListAllBlockersArg']
    >({
      query: () => `${routes.taskBlockers}?select=*`,
      transformResponse: (response) => parsePostgrestListTaskBlockersResponse(response),
      providesTags: ['TaskBlockers']
    }),
    listTasks: builder.query<TaskTypes['ListResult'], TaskTypes['ListArg']>({
      query: (projectId) => routes.tasksByProject(projectId),
      transformResponse: (response) => parsePostgrestListTasksResponse(response),
      providesTags: (_result, _error, projectId) => [{ type: 'Tasks', id: projectId }]
    }),
    listTaskBlockers: builder.query<
      TaskTypes['ListBlockersResult'],
      TaskTypes['ListBlockersArg']
    >({
      query: (taskId) => routes.taskBlockersByTask(taskId),
      transformResponse: (response) => parsePostgrestListTaskBlockersResponse(response),
      providesTags: (_result, _error, taskId) => [{ type: 'TaskBlockers', id: taskId }]
    }),
    createTask: builder.mutation<TaskTypes['CreateResult'], TaskTypes['CreateArg']>({
      query: ({ projectId, title, is_placeholder }) =>
        buildPostReturn(routes.tasks, {
          project_id: projectId,
          ...createTaskBodySchema.parse({ title, is_placeholder })
        }),
      transformResponse: (response) => parsePostgrestCreateTaskResponse(response),
      invalidatesTags: (_result, _error, arg) => ['Tasks', { type: 'Tasks', id: arg.projectId }]
    }),
    createTaskBlocker: builder.mutation<
      TaskTypes['CreateBlockerResult'],
      TaskTypes['CreateBlockerArg']
    >({
      query: ({ taskId, blockingTaskId }) =>
        buildPostReturn(
          routes.taskBlockers,
          createTaskBlockerBodySchema.parse({
            task_id: taskId,
            blocking_task_id: blockingTaskId
          })
        ),
      transformResponse: (response) => parsePostgrestCreateTaskBlockerResponse(response),
      invalidatesTags: (_result, _error, arg) => [
        'TaskBlockers',
        { type: 'TaskBlockers', id: arg.taskId },
        'Tasks',
        'Projects'
      ]
    }),
    updateTask: builder.mutation<TaskTypes['CreateResult'], TaskTypes['UpdateArg']>({
      query: ({ taskId, title, status, isPlaceholder }) =>
        buildPatchSingle(
          `${routes.tasks}?id=eq.${taskId}`,
          updateTaskBodySchema.parse({ title, status, is_placeholder: isPlaceholder })
        ),
      transformResponse: parseSingleObjectResponse(parsePostgrestCreateTaskResponse),
      transformErrorResponse: mapNotFound('Task not found'),
      invalidatesTags: (_result, _error, arg) => [
        'Tasks',
        { type: 'Tasks', id: arg.projectId },
        'Projects'
      ]
    }),
    updateTaskStatus: builder.mutation<
      TaskTypes['CreateResult'],
      TaskTypes['UpdateStatusMutationArg']
    >({
      query: ({ taskId, status, isPlaceholder }) =>
        buildPatchSingle(
          `${routes.tasks}?id=eq.${taskId}`,
          updateTaskStatusBodySchema.parse({ status, is_placeholder: isPlaceholder })
        ),
      transformResponse: parseSingleObjectResponse(parsePostgrestCreateTaskResponse),
      transformErrorResponse: mapNotFound('Task not found'),
      invalidatesTags: (_result, _error, arg) => [
        'Tasks',
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
    demoteActiveTasksInProject: builder.mutation<
      TaskTypes['ListResult'],
      TaskTypes['DemoteInProjectArg']
    >({
      query: ({ projectId }) =>
        buildPatchReturn(
          `${routes.tasks}?status=eq.active&project_id=eq.${projectId}`,
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
        'Tasks',
        { type: 'Tasks', id: arg.projectId },
        'Projects',
        'TaskBlockers',
        { type: 'TaskBlockers', id: arg.taskId },
        { type: 'TaskNotes', id: arg.taskId }
      ]
    }),
    deleteTaskBlocker: builder.mutation<
      TaskTypes['CreateBlockerResult'],
      TaskTypes['DeleteBlockerArg']
    >({
      query: ({ taskBlockerId }) => buildDeleteSingle(`${routes.taskBlockers}?id=eq.${taskBlockerId}`),
      transformResponse: parseSingleObjectResponse(parsePostgrestCreateTaskBlockerResponse),
      transformErrorResponse: mapNotFound('Task blocker not found'),
      invalidatesTags: (_result, _error, arg) => [
        'TaskBlockers',
        { type: 'TaskBlockers', id: arg.taskId },
        'Tasks',
        'Projects'
      ]
    })
  }),
  overrideExisting: false
});

export type TasksApi = typeof tasksApi;
export const {
  useCreateTaskBlockerMutation,
  useCreateTaskMutation,
  useDeleteTaskBlockerMutation,
  useDeleteTaskMutation,
  useDemoteActiveTasksExceptTaskMutation,
  useDemoteActiveTasksInProjectMutation,
  useDemoteActiveTasksOutsideProjectMutation,
  useListAllTaskBlockersQuery,
  useListAllTasksQuery,
  useListTaskBlockersQuery,
  useListTasksQuery,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation
} = tasksApi;
