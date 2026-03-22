import {
  createTaskRelationBodySchema,
  parsePostgrestCreateTaskRelationResponse,
  createTaskBodySchema,
  parsePostgrestListTaskRelationsResponse,
  parsePostgrestCreateTaskResponse,
  parsePostgrestListTasksResponse,
  updateTaskBodySchema,
  updateTaskRelationBodySchema,
  updateTaskStatusBodySchema,
  routes,
  type CreateTaskRelationResponse,
  type CreateTaskBody,
  type CreateTaskResponse,
  type ListTaskRelationsResponse,
  type TaskRelationType,
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
  ListRelationsResult: ListTaskRelationsResponse;
  ListRelationsArg: number;
  ListAllRelationsArg: void;
  CreateResult: CreateTaskResponse;
  CreateArg: { projectId: number } & CreateTaskBody;
  CreateRelationResult: CreateTaskRelationResponse;
  CreateRelationArg: {
    taskId: number;
    relatedTaskId: number;
    relationType: TaskRelationType;
    commentary?: string | null;
  };
  UpdateRelationArg: {
    taskRelationId: number;
    taskId: number;
    relationType?: TaskRelationType;
    commentary?: string | null;
  };
  DeleteRelationArg: { taskRelationId: number; taskId: number };
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
    listAllTaskRelations: builder.query<
      TaskTypes['ListRelationsResult'],
      TaskTypes['ListAllRelationsArg']
    >({
      query: () => `${routes.taskRelations}?select=*`,
      transformResponse: (response) => parsePostgrestListTaskRelationsResponse(response),
      providesTags: ['TaskRelations']
    }),
    listTasks: builder.query<TaskTypes['ListResult'], TaskTypes['ListArg']>({
      query: (projectId) => routes.tasksByProject(projectId),
      transformResponse: (response) => parsePostgrestListTasksResponse(response),
      providesTags: (_result, _error, projectId) => [{ type: 'Tasks', id: projectId }]
    }),
    listTaskRelations: builder.query<
      TaskTypes['ListRelationsResult'],
      TaskTypes['ListRelationsArg']
    >({
      query: (taskId) => routes.taskRelationsByTask(taskId),
      transformResponse: (response) => parsePostgrestListTaskRelationsResponse(response),
      providesTags: (_result, _error, taskId) => [{ type: 'TaskRelations', id: taskId }]
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
    createTaskRelation: builder.mutation<
      TaskTypes['CreateRelationResult'],
      TaskTypes['CreateRelationArg']
    >({
      query: ({ taskId, relatedTaskId, relationType, commentary }) =>
        buildPostReturn(
          routes.taskRelations,
          createTaskRelationBodySchema.parse({
            task_id: taskId,
            related_task_id: relatedTaskId,
            relation_type: relationType,
            commentary
          })
        ),
      transformResponse: (response) => parsePostgrestCreateTaskRelationResponse(response),
      invalidatesTags: (_result, _error, arg) => [
        'TaskRelations',
        { type: 'TaskRelations', id: arg.taskId },
        'Tasks',
        'Projects'
      ]
    }),
    updateTaskRelation: builder.mutation<
      TaskTypes['CreateRelationResult'],
      TaskTypes['UpdateRelationArg']
    >({
      query: ({ taskRelationId, relationType, commentary }) =>
        buildPatchSingle(
          `${routes.taskRelations}?id=eq.${taskRelationId}`,
          updateTaskRelationBodySchema.parse({
            relation_type: relationType,
            commentary
          })
        ),
      transformResponse: parseSingleObjectResponse(parsePostgrestCreateTaskRelationResponse),
      transformErrorResponse: mapNotFound('Task relation not found'),
      invalidatesTags: (_result, _error, arg) => [
        'TaskRelations',
        { type: 'TaskRelations', id: arg.taskId },
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
        'TaskRelations',
        { type: 'TaskRelations', id: arg.taskId },
        { type: 'TaskNotes', id: arg.taskId }
      ]
    }),
    deleteTaskRelation: builder.mutation<
      TaskTypes['CreateRelationResult'],
      TaskTypes['DeleteRelationArg']
    >({
      query: ({ taskRelationId }) =>
        buildDeleteSingle(`${routes.taskRelations}?id=eq.${taskRelationId}`),
      transformResponse: parseSingleObjectResponse(parsePostgrestCreateTaskRelationResponse),
      transformErrorResponse: mapNotFound('Task relation not found'),
      invalidatesTags: (_result, _error, arg) => [
        'TaskRelations',
        { type: 'TaskRelations', id: arg.taskId },
        'Tasks',
        'Projects'
      ]
    })
  }),
  overrideExisting: false
});

export type TasksApi = typeof tasksApi;
export const {
  useCreateTaskRelationMutation,
  useCreateTaskMutation,
  useDeleteTaskRelationMutation,
  useDeleteTaskMutation,
  useDemoteActiveTasksExceptTaskMutation,
  useDemoteActiveTasksInProjectMutation,
  useDemoteActiveTasksOutsideProjectMutation,
  useListAllTaskRelationsQuery,
  useListAllTasksQuery,
  useListTaskRelationsQuery,
  useListTasksQuery,
  useUpdateTaskRelationMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation
} = tasksApi;
