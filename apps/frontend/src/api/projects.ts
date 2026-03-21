import {
  parsePostgrestCreateProjectResponse,
  parsePostgrestListProjectsResponse,
  updateProjectBodySchema,
  routes,
  type CreateProjectBody,
  type CreateProjectResponse,
  type ListProjectsResponse
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
  ListResult: ListProjectsResponse;
  ListArg: void;
  CreateResult: CreateProjectResponse;
  CreateArg: CreateProjectBody;
  UpdateArg: { projectId: number; name?: string };
  DeleteArg: { projectId: number };
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
      query: ({ projectId, name }) =>
        buildPatchSingle(
          `${routes.projects}?id=eq.${projectId}`,
          updateProjectBodySchema.parse({ name })
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
    })
  }),
  overrideExisting: false
});

export type ProjectsApi = typeof projectsApi;
export const {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useListProjectsQuery,
  useUpdateProjectMutation
} = projectsApi;
