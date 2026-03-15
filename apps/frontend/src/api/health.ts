import { healthResponseSchema, postgrestProjectRowsSchema, routes } from '@app/contracts';
import { api } from './base';

type HealthTypes = {
  Result: ReturnType<typeof healthResponseSchema.parse>;
  Arg: void;
};

export const healthApi = api.injectEndpoints({
  endpoints: (builder) => ({
    health: builder.query<HealthTypes['Result'], HealthTypes['Arg']>({
      query: () => routes.healthProbe,
      transformResponse: (response) => {
        postgrestProjectRowsSchema.parse(response);
        return healthResponseSchema.parse({ ok: true });
      }
    })
  }),
  overrideExisting: false
});

export type HealthApi = typeof healthApi;
export const { useHealthQuery } = healthApi;
