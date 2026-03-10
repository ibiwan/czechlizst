import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  createProjectNoteBodySchema,
  createTaskNoteBodySchema,
  createProjectBodySchema,
  createTaskBodySchema,
  healthResponseSchema,
  parsePostgrestCreateProjectNoteResponse,
  parsePostgrestCreateProjectResponse,
  parsePostgrestCreateTaskNoteResponse,
  parsePostgrestCreateTaskResponse,
  parsePostgrestListProjectNotesResponse,
  parsePostgrestListProjectsResponse,
  parsePostgrestListTaskNotesResponse,
  parsePostgrestListTasksResponse,
  postgrestProjectRowsSchema,
  updateProjectBodySchema,
  updateProjectNoteBodySchema,
  updateProjectStatusBodySchema,
  updateTaskBodySchema,
  updateTaskNoteBodySchema,
  updateTaskStatusBodySchema,
  routes
} from '@app/contracts';

export const api = createApi({
  reducerPath: 'api',
  tagTypes: ['Projects', 'Tasks', 'ProjectNotes', 'TaskNotes'],
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3002'
  }),
  endpoints: (builder) => ({
    health: builder.query<ReturnType<typeof healthResponseSchema.parse>, void>({
      query: () => routes.healthProbe,
      transformResponse: (response) => {
        postgrestProjectRowsSchema.parse(response);
        return healthResponseSchema.parse({ ok: true });
      }
    }),
    listProjects: builder.query<ReturnType<typeof parsePostgrestListProjectsResponse>, void>({
      query: () => routes.projectsSelect,
      transformResponse: (response) => parsePostgrestListProjectsResponse(response),
      providesTags: ['Projects']
    }),
    createProject: builder.mutation<
      ReturnType<typeof parsePostgrestCreateProjectResponse>,
      ReturnType<typeof createProjectBodySchema.parse>
    >({
      query: (body) => ({
        url: routes.projects,
        method: 'POST',
        body,
        headers: {
          Prefer: 'return=representation'
        }
      }),
      transformResponse: (response) => parsePostgrestCreateProjectResponse(response),
      invalidatesTags: ['Projects']
    }),
    updateProject: builder.mutation<
      ReturnType<typeof parsePostgrestCreateProjectResponse>,
      { projectId: number; name?: string; status?: ReturnType<typeof updateProjectBodySchema.parse>['status'] }
    >({
      query: ({ projectId, name, status }) => ({
        url: `${routes.projects}?id=eq.${projectId}`,
        method: 'PATCH',
        body: updateProjectBodySchema.parse({ name, status }),
        headers: {
          Accept: 'application/vnd.pgrst.object+json',
          Prefer: 'return=representation'
        }
      }),
      transformResponse: (response) =>
        parsePostgrestCreateProjectResponse([response] as unknown[]),
      transformErrorResponse: (response) => {
        if (
          response.status === 406 &&
          typeof response.data === 'object' &&
          response.data !== null &&
          'code' in response.data &&
          response.data.code === 'PGRST116'
        ) {
          return { status: 404, message: 'Project not found' };
        }
        return response;
      },
      invalidatesTags: ['Projects']
    }),
    deleteProject: builder.mutation<
      ReturnType<typeof parsePostgrestCreateProjectResponse>,
      { projectId: number }
    >({
      query: ({ projectId }) => ({
        url: `${routes.projects}?id=eq.${projectId}`,
        method: 'DELETE',
        headers: {
          Accept: 'application/vnd.pgrst.object+json',
          Prefer: 'return=representation'
        }
      }),
      transformResponse: (response) =>
        parsePostgrestCreateProjectResponse([response] as unknown[]),
      transformErrorResponse: (response) => {
        if (
          response.status === 406 &&
          typeof response.data === 'object' &&
          response.data !== null &&
          'code' in response.data &&
          response.data.code === 'PGRST116'
        ) {
          return { status: 404, message: 'Project not found' };
        }
        return response;
      },
      invalidatesTags: ['Projects', 'Tasks', 'ProjectNotes', 'TaskNotes']
    }),
    updateProjectStatus: builder.mutation<
      ReturnType<typeof parsePostgrestCreateProjectResponse>,
      { projectId: number; status: ReturnType<typeof updateProjectStatusBodySchema.parse>['status'] }
    >({
      query: ({ projectId, status }) => ({
        url: `${routes.projects}?id=eq.${projectId}`,
        method: 'PATCH',
        body: updateProjectStatusBodySchema.parse({ status }),
        headers: {
          Accept: 'application/vnd.pgrst.object+json',
          Prefer: 'return=representation'
        }
      }),
      transformResponse: (response) =>
        parsePostgrestCreateProjectResponse([response] as unknown[]),
      transformErrorResponse: (response) => {
        if (
          response.status === 406 &&
          typeof response.data === 'object' &&
          response.data !== null &&
          'code' in response.data &&
          response.data.code === 'PGRST116'
        ) {
          return { status: 404, message: 'Project not found' };
        }
        return response;
      },
      invalidatesTags: ['Projects']
    }),
    listTasks: builder.query<ReturnType<typeof parsePostgrestListTasksResponse>, number>({
      query: (projectId) => routes.tasksByProject(projectId),
      transformResponse: (response) => parsePostgrestListTasksResponse(response),
      providesTags: (_result, _error, projectId) => [
        { type: 'Tasks', id: projectId }
      ]
    }),
    listProjectNotes: builder.query<
      ReturnType<typeof parsePostgrestListProjectNotesResponse>,
      number
    >({
      query: (projectId) => routes.projectNotesByProject(projectId),
      transformResponse: (response) => parsePostgrestListProjectNotesResponse(response),
      providesTags: (_result, _error, projectId) => [
        { type: 'ProjectNotes', id: projectId }
      ]
    }),
    listTaskNotes: builder.query<ReturnType<typeof parsePostgrestListTaskNotesResponse>, number>({
      query: (taskId) => routes.taskNotesByTask(taskId),
      transformResponse: (response) => parsePostgrestListTaskNotesResponse(response),
      providesTags: (_result, _error, taskId) => [{ type: 'TaskNotes', id: taskId }]
    }),
    createTask: builder.mutation<
      ReturnType<typeof parsePostgrestCreateTaskResponse>,
      { projectId: number; title: string }
    >({
      query: ({ projectId, title }) => ({
        url: routes.tasks,
        method: 'POST',
        body: {
          project_id: projectId,
          ...createTaskBodySchema.parse({ title })
        },
        headers: {
          Prefer: 'return=representation'
        }
      }),
      transformResponse: (response) => parsePostgrestCreateTaskResponse(response),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Tasks', id: arg.projectId }
      ]
    }),
    updateTask: builder.mutation<
      ReturnType<typeof parsePostgrestCreateTaskResponse>,
      { taskId: number; projectId: number; title?: string; status?: ReturnType<typeof updateTaskBodySchema.parse>['status'] }
    >({
      query: ({ taskId, title, status }) => ({
        url: `${routes.tasks}?id=eq.${taskId}`,
        method: 'PATCH',
        body: updateTaskBodySchema.parse({ title, status }),
        headers: {
          Accept: 'application/vnd.pgrst.object+json',
          Prefer: 'return=representation'
        }
      }),
      transformResponse: (response) => parsePostgrestCreateTaskResponse([response] as unknown[]),
      transformErrorResponse: (response) => {
        if (
          response.status === 406 &&
          typeof response.data === 'object' &&
          response.data !== null &&
          'code' in response.data &&
          response.data.code === 'PGRST116'
        ) {
          return { status: 404, message: 'Task not found' };
        }
        return response;
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Tasks', id: arg.projectId },
        'Projects'
      ]
    }),
    updateTaskStatus: builder.mutation<
      ReturnType<typeof parsePostgrestCreateTaskResponse>,
      { taskId: number; projectId: number; status: ReturnType<typeof updateTaskStatusBodySchema.parse>['status'] }
    >({
      query: ({ taskId, status }) => ({
        url: `${routes.tasks}?id=eq.${taskId}`,
        method: 'PATCH',
        body: updateTaskStatusBodySchema.parse({ status }),
        headers: {
          Accept: 'application/vnd.pgrst.object+json',
          Prefer: 'return=representation'
        }
      }),
      transformResponse: (response) => parsePostgrestCreateTaskResponse([response] as unknown[]),
      transformErrorResponse: (response) => {
        if (
          response.status === 406 &&
          typeof response.data === 'object' &&
          response.data !== null &&
          'code' in response.data &&
          response.data.code === 'PGRST116'
        ) {
          return { status: 404, message: 'Task not found' };
        }
        return response;
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Tasks', id: arg.projectId },
        'Projects'
      ]
    }),
    demoteActiveTasksOutsideProject: builder.mutation<
      ReturnType<typeof parsePostgrestListTasksResponse>,
      { projectId: number }
    >({
      query: ({ projectId }) => ({
        url: `${routes.tasks}?status=eq.active&project_id=neq.${projectId}`,
        method: 'PATCH',
        body: updateTaskStatusBodySchema.parse({ status: 'started' }),
        headers: {
          Prefer: 'return=representation'
        }
      }),
      transformResponse: (response) => parsePostgrestListTasksResponse(response),
      invalidatesTags: ['Tasks', 'Projects']
    }),
    demoteActiveTasksExceptTask: builder.mutation<
      ReturnType<typeof parsePostgrestListTasksResponse>,
      { taskId: number }
    >({
      query: ({ taskId }) => ({
        url: `${routes.tasks}?status=eq.active&id=neq.${taskId}`,
        method: 'PATCH',
        body: updateTaskStatusBodySchema.parse({ status: 'started' }),
        headers: {
          Prefer: 'return=representation'
        }
      }),
      transformResponse: (response) => parsePostgrestListTasksResponse(response),
      invalidatesTags: ['Tasks', 'Projects']
    }),
    deleteTask: builder.mutation<
      ReturnType<typeof parsePostgrestCreateTaskResponse>,
      { taskId: number; projectId: number }
    >({
      query: ({ taskId }) => ({
        url: `${routes.tasks}?id=eq.${taskId}`,
        method: 'DELETE',
        headers: {
          Accept: 'application/vnd.pgrst.object+json',
          Prefer: 'return=representation'
        }
      }),
      transformResponse: (response) => parsePostgrestCreateTaskResponse([response] as unknown[]),
      transformErrorResponse: (response) => {
        if (
          response.status === 406 &&
          typeof response.data === 'object' &&
          response.data !== null &&
          'code' in response.data &&
          response.data.code === 'PGRST116'
        ) {
          return { status: 404, message: 'Task not found' };
        }
        return response;
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Tasks', id: arg.projectId },
        'Projects',
        { type: 'TaskNotes', id: arg.taskId }
      ]
    }),
    createProjectNote: builder.mutation<
      ReturnType<typeof parsePostgrestCreateProjectNoteResponse>,
      { projectId: number; body: string }
    >({
      query: ({ projectId, body }) => ({
        url: routes.projectNotes,
        method: 'POST',
        body: {
          project_id: projectId,
          ...createProjectNoteBodySchema.parse({ body })
        },
        headers: {
          Prefer: 'return=representation'
        }
      }),
      transformResponse: (response) => parsePostgrestCreateProjectNoteResponse(response),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'ProjectNotes', id: arg.projectId }
      ]
    }),
    updateProjectNote: builder.mutation<
      ReturnType<typeof parsePostgrestCreateProjectNoteResponse>,
      { noteId: number; projectId: number; body: string }
    >({
      query: ({ noteId, body }) => ({
        url: `${routes.projectNotes}?id=eq.${noteId}`,
        method: 'PATCH',
        body: updateProjectNoteBodySchema.parse({ body }),
        headers: {
          Accept: 'application/vnd.pgrst.object+json',
          Prefer: 'return=representation'
        }
      }),
      transformResponse: (response) =>
        parsePostgrestCreateProjectNoteResponse([response] as unknown[]),
      transformErrorResponse: (response) => {
        if (
          response.status === 406 &&
          typeof response.data === 'object' &&
          response.data !== null &&
          'code' in response.data &&
          response.data.code === 'PGRST116'
        ) {
          return { status: 404, message: 'Project note not found' };
        }
        return response;
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: 'ProjectNotes', id: arg.projectId }
      ]
    }),
    deleteProjectNote: builder.mutation<
      ReturnType<typeof parsePostgrestCreateProjectNoteResponse>,
      { noteId: number; projectId: number }
    >({
      query: ({ noteId }) => ({
        url: `${routes.projectNotes}?id=eq.${noteId}`,
        method: 'DELETE',
        headers: {
          Accept: 'application/vnd.pgrst.object+json',
          Prefer: 'return=representation'
        }
      }),
      transformResponse: (response) =>
        parsePostgrestCreateProjectNoteResponse([response] as unknown[]),
      transformErrorResponse: (response) => {
        if (
          response.status === 406 &&
          typeof response.data === 'object' &&
          response.data !== null &&
          'code' in response.data &&
          response.data.code === 'PGRST116'
        ) {
          return { status: 404, message: 'Project note not found' };
        }
        return response;
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: 'ProjectNotes', id: arg.projectId }
      ]
    }),
    createTaskNote: builder.mutation<
      ReturnType<typeof parsePostgrestCreateTaskNoteResponse>,
      { taskId: number; body: string }
    >({
      query: ({ taskId, body }) => ({
        url: routes.taskNotes,
        method: 'POST',
        body: {
          task_id: taskId,
          ...createTaskNoteBodySchema.parse({ body })
        },
        headers: {
          Prefer: 'return=representation'
        }
      }),
      transformResponse: (response) => parsePostgrestCreateTaskNoteResponse(response),
      invalidatesTags: (_result, _error, arg) => [{ type: 'TaskNotes', id: arg.taskId }]
    }),
    updateTaskNote: builder.mutation<
      ReturnType<typeof parsePostgrestCreateTaskNoteResponse>,
      { noteId: number; taskId: number; body: string }
    >({
      query: ({ noteId, body }) => ({
        url: `${routes.taskNotes}?id=eq.${noteId}`,
        method: 'PATCH',
        body: updateTaskNoteBodySchema.parse({ body }),
        headers: {
          Accept: 'application/vnd.pgrst.object+json',
          Prefer: 'return=representation'
        }
      }),
      transformResponse: (response) =>
        parsePostgrestCreateTaskNoteResponse([response] as unknown[]),
      transformErrorResponse: (response) => {
        if (
          response.status === 406 &&
          typeof response.data === 'object' &&
          response.data !== null &&
          'code' in response.data &&
          response.data.code === 'PGRST116'
        ) {
          return { status: 404, message: 'Task note not found' };
        }
        return response;
      },
      invalidatesTags: (_result, _error, arg) => [{ type: 'TaskNotes', id: arg.taskId }]
    }),
    deleteTaskNote: builder.mutation<
      ReturnType<typeof parsePostgrestCreateTaskNoteResponse>,
      { noteId: number; taskId: number }
    >({
      query: ({ noteId }) => ({
        url: `${routes.taskNotes}?id=eq.${noteId}`,
        method: 'DELETE',
        headers: {
          Accept: 'application/vnd.pgrst.object+json',
          Prefer: 'return=representation'
        }
      }),
      transformResponse: (response) =>
        parsePostgrestCreateTaskNoteResponse([response] as unknown[]),
      transformErrorResponse: (response) => {
        if (
          response.status === 406 &&
          typeof response.data === 'object' &&
          response.data !== null &&
          'code' in response.data &&
          response.data.code === 'PGRST116'
        ) {
          return { status: 404, message: 'Task note not found' };
        }
        return response;
      },
      invalidatesTags: (_result, _error, arg) => [{ type: 'TaskNotes', id: arg.taskId }]
    })
  })
});

export const {
  useCreateProjectMutation,
  useCreateTaskMutation,
  useDeleteProjectMutation,
  useDeleteProjectNoteMutation,
  useDeleteTaskMutation,
  useDeleteTaskNoteMutation,
  useUpdateProjectStatusMutation,
  useUpdateProjectMutation,
  useUpdateTaskStatusMutation,
  useUpdateTaskMutation,
  useCreateProjectNoteMutation,
  useCreateTaskNoteMutation,
  useDemoteActiveTasksExceptTaskMutation,
  useDemoteActiveTasksOutsideProjectMutation,
  useUpdateProjectNoteMutation,
  useUpdateTaskNoteMutation,
  useHealthQuery,
  useListProjectNotesQuery,
  useListProjectsQuery,
  useListTaskNotesQuery,
  useListTasksQuery
} = api;
