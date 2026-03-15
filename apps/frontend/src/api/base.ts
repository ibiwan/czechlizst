import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export const RETURN_REPRESENTATION_HEADERS = { Prefer: 'return=representation' } as const;
export const RETURN_SINGLE_HEADERS = {
  Accept: 'application/vnd.pgrst.object+json',
  Prefer: 'return=representation'
} as const;

export const buildPostReturn = (url: string, body: unknown) => ({
  url,
  method: 'POST' as const,
  body,
  headers: RETURN_REPRESENTATION_HEADERS
});

export const buildPatchReturn = (url: string, body: unknown) => ({
  url,
  method: 'PATCH' as const,
  body,
  headers: RETURN_REPRESENTATION_HEADERS
});

export const buildPatchSingle = (url: string, body: unknown) => ({
  url,
  method: 'PATCH' as const,
  body,
  headers: RETURN_SINGLE_HEADERS
});

export const buildDeleteSingle = (url: string) => ({
  url,
  method: 'DELETE' as const,
  headers: RETURN_SINGLE_HEADERS
});

const isPostgrestNotFound = (response: FetchBaseQueryError | undefined) => {
  if (response?.status !== 406) {
    return false;
  }

  const data = response.data;
  return (
    typeof data === 'object' &&
    data !== null &&
    'code' in data &&
    (data as { code?: unknown }).code === 'PGRST116'
  );
};

export const mapNotFound =
  (message: string) => (response: FetchBaseQueryError) =>
    isPostgrestNotFound(response) ? { status: 404, message } : response;

export const parseSingleObjectResponse =
  <T>(parser: (rows: unknown[]) => T) =>
  (response: unknown) =>
    parser([response] as unknown[]);

export const api = createApi({
  reducerPath: 'api',
  tagTypes: ['Projects', 'Tasks', 'ProjectNotes', 'TaskNotes'],
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3002'
  }),
  endpoints: () => ({})
});
