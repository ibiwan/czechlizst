import {
  createProjectBodySchema,
  parsePostgrestCreateProjectResponse,
  parsePostgrestListProjectsResponse,
  updateProjectBodySchema,
  updateProjectStatusBodySchema,
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

type ProjectTypes = {
  ListResult: ReturnType<typeof parsePostgrestListProjectsResponse>;
  ListArg: void;
  CreateResult: ReturnType<typeof parsePostgrestCreateProjectResponse>;
  CreateArg: ReturnType<typeof createProjectBodySchema.parse>;
  UpdateStatus: ReturnType<typeof updateProjectBodySchema.parse>['status'];
  UpdateStatusArg: ReturnType<typeof updateProjectStatusBodySchema.parse>['status'];
  UpdateArg: { projectId: number; name?: string; status?: ProjectTypes['UpdateStatus'] };
  DeleteArg: { projectId: number };
  UpdateStatusMutationArg: { projectId: number; status: ProjectTypes['UpdateStatusArg'] };
};

export const projectsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listProjects: builder.query<ProjectTypes['ListResult'], ProjectTypes['ListArg']>({
      query: () => routes.projectsSelect,
      transformResponse: (response) => parsePostgrestListProjectsResponse(response),
      providesTags: ['Projects']
    }),
    createProject: builder.mutation<ProjectTypes['CreateResult'], ProjectTypes['CreateArg']>({
      query: (body) => buildPostReturn(routes.projects, body),
      transformResponse: (response) => parsePostgrestCreateProjectResponse(response),
      invalidatesTags: ['Projects']
    }),
    updateProject: builder.mutation<ProjectTypes['CreateResult'], ProjectTypes['UpdateArg']>({
      query: ({ projectId, name, status }) =>
        buildPatchSingle(
          `${routes.projects}?id=eq.${projectId}`,
          updateProjectBodySchema.parse({ name, status })
        ),
      transformResponse: parseSingleObjectResponse(parsePostgrestCreateProjectResponse),
      transformErrorResponse: mapNotFound('Project not found'),
      invalidatesTags: ['Projects']
    }),
    deleteProject: builder.mutation<ProjectTypes['CreateResult'], ProjectTypes['DeleteArg']>({
      query: ({ projectId }) => buildDeleteSingle(`${routes.projects}?id=eq.${projectId}`),
      transformResponse: parseSingleObjectResponse(parsePostgrestCreateProjectResponse),
      transformErrorResponse: mapNotFound('Project not found'),
      invalidatesTags: ['Projects', 'Tasks', 'ProjectNotes', 'TaskNotes']
    }),
    updateProjectStatus: builder.mutation<
      ProjectTypes['CreateResult'],
      ProjectTypes['UpdateStatusMutationArg']
    >({
      query: ({ projectId, status }) =>
        buildPatchSingle(
          `${routes.projects}?id=eq.${projectId}`,
          updateProjectStatusBodySchema.parse({ status })
        ),
      transformResponse: parseSingleObjectResponse(parsePostgrestCreateProjectResponse),
      transformErrorResponse: mapNotFound('Project not found'),
      invalidatesTags: ['Projects']
    })
  }),
  overrideExisting: false
});

export type ProjectsApi = typeof projectsApi;
export const {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useListProjectsQuery,
  useUpdateProjectMutation,
  useUpdateProjectStatusMutation
} = projectsApi;
