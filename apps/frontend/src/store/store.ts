import { configureStore } from '@reduxjs/toolkit';
import { api } from '../api';
import { mainPageReducer } from './mainPageSlice';

export const store = configureStore({
  reducer: {
    mainPage: mainPageReducer,
    [api.reducerPath]: api.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
