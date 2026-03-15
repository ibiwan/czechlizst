import {
  createProjectNoteBodySchema,
  createTaskNoteBodySchema,
  parsePostgrestCreateProjectNoteResponse,
  parsePostgrestCreateTaskNoteResponse,
  parsePostgrestListProjectNotesResponse,
  parsePostgrestListTaskNotesResponse,
  updateProjectNoteBodySchema,
  updateTaskNoteBodySchema,
  routes
} from '@app/contracts';
import {
  api,
  buildDeleteSingle,
  buildPatchSingle,
  buildPostReturn,
  mapNotFound,
  parseSingleObjectResponse
} from './base';

type NoteTypes = {
  ListProjectResult: ReturnType<typeof parsePostgrestListProjectNotesResponse>;
  ListProjectArg: number;
  ListTaskResult: ReturnType<typeof parsePostgrestListTaskNotesResponse>;
  ListTaskArg: number;
  CreateProjectResult: ReturnType<typeof parsePostgrestCreateProjectNoteResponse>;
  CreateProjectArg: { projectId: number; body: string };
  UpdateProjectArg: { noteId: number; projectId: number; body: string };
  DeleteProjectArg: { noteId: number; projectId: number };
  CreateTaskResult: ReturnType<typeof parsePostgrestCreateTaskNoteResponse>;
  CreateTaskArg: { taskId: number; body: string };
  UpdateTaskArg: { noteId: number; taskId: number; body: string };
  DeleteTaskArg: { noteId: number; taskId: number };
};

export const notesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listProjectNotes: builder.query<NoteTypes['ListProjectResult'], NoteTypes['ListProjectArg']>({
      query: (projectId) => routes.projectNotesByProject(projectId),
      transformResponse: (response) => parsePostgrestListProjectNotesResponse(response),
      providesTags: (_result, _error, projectId) => [{ type: 'ProjectNotes', id: projectId }]
    }),
    listTaskNotes: builder.query<NoteTypes['ListTaskResult'], NoteTypes['ListTaskArg']>({
      query: (taskId) => routes.taskNotesByTask(taskId),
      transformResponse: (response) => parsePostgrestListTaskNotesResponse(response),
      providesTags: (_result, _error, taskId) => [{ type: 'TaskNotes', id: taskId }]
    }),
    createProjectNote: builder.mutation<
      NoteTypes['CreateProjectResult'],
      NoteTypes['CreateProjectArg']
    >({
      query: ({ projectId, body }) =>
        buildPostReturn(routes.projectNotes, {
          project_id: projectId,
          ...createProjectNoteBodySchema.parse({ body })
        }),
      transformResponse: (response) => parsePostgrestCreateProjectNoteResponse(response),
      invalidatesTags: (_result, _error, arg) => [{ type: 'ProjectNotes', id: arg.projectId }]
    }),
    updateProjectNote: builder.mutation<
      NoteTypes['CreateProjectResult'],
      NoteTypes['UpdateProjectArg']
    >({
      query: ({ noteId, body }) =>
        buildPatchSingle(
          `${routes.projectNotes}?id=eq.${noteId}`,
          updateProjectNoteBodySchema.parse({ body })
        ),
      transformResponse: parseSingleObjectResponse(parsePostgrestCreateProjectNoteResponse),
      transformErrorResponse: mapNotFound('Project note not found'),
      invalidatesTags: (_result, _error, arg) => [{ type: 'ProjectNotes', id: arg.projectId }]
    }),
    deleteProjectNote: builder.mutation<
      NoteTypes['CreateProjectResult'],
      NoteTypes['DeleteProjectArg']
    >({
      query: ({ noteId }) => buildDeleteSingle(`${routes.projectNotes}?id=eq.${noteId}`),
      transformResponse: parseSingleObjectResponse(parsePostgrestCreateProjectNoteResponse),
      transformErrorResponse: mapNotFound('Project note not found'),
      invalidatesTags: (_result, _error, arg) => [{ type: 'ProjectNotes', id: arg.projectId }]
    }),
    createTaskNote: builder.mutation<NoteTypes['CreateTaskResult'], NoteTypes['CreateTaskArg']>({
      query: ({ taskId, body }) =>
        buildPostReturn(routes.taskNotes, {
          task_id: taskId,
          ...createTaskNoteBodySchema.parse({ body })
        }),
      transformResponse: (response) => parsePostgrestCreateTaskNoteResponse(response),
      invalidatesTags: (_result, _error, arg) => [{ type: 'TaskNotes', id: arg.taskId }]
    }),
    updateTaskNote: builder.mutation<NoteTypes['CreateTaskResult'], NoteTypes['UpdateTaskArg']>({
      query: ({ noteId, body }) =>
        buildPatchSingle(
          `${routes.taskNotes}?id=eq.${noteId}`,
          updateTaskNoteBodySchema.parse({ body })
        ),
      transformResponse: parseSingleObjectResponse(parsePostgrestCreateTaskNoteResponse),
      transformErrorResponse: mapNotFound('Task note not found'),
      invalidatesTags: (_result, _error, arg) => [{ type: 'TaskNotes', id: arg.taskId }]
    }),
    deleteTaskNote: builder.mutation<NoteTypes['CreateTaskResult'], NoteTypes['DeleteTaskArg']>({
      query: ({ noteId }) => buildDeleteSingle(`${routes.taskNotes}?id=eq.${noteId}`),
      transformResponse: parseSingleObjectResponse(parsePostgrestCreateTaskNoteResponse),
      transformErrorResponse: mapNotFound('Task note not found'),
      invalidatesTags: (_result, _error, arg) => [{ type: 'TaskNotes', id: arg.taskId }]
    })
  }),
  overrideExisting: false
});

export type NotesApi = typeof notesApi;
export const {
  useCreateProjectNoteMutation,
  useCreateTaskNoteMutation,
  useDeleteProjectNoteMutation,
  useDeleteTaskNoteMutation,
  useListProjectNotesQuery,
  useListTaskNotesQuery,
  useUpdateProjectNoteMutation,
  useUpdateTaskNoteMutation
} = notesApi;
