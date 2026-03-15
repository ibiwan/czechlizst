import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type MainPageState = {
  selectedProjectId: number | null;
  selectedTaskId: number | null;
};

const initialState: MainPageState = {
  selectedProjectId: null,
  selectedTaskId: null
};

const mainPageSlice = createSlice({
  name: 'mainPage',
  initialState,
  reducers: {
    setSelectedProjectId(state, action: PayloadAction<number | null>) {
      state.selectedProjectId = action.payload;
      state.selectedTaskId = null;
    },
    setSelectedTaskId(state, action: PayloadAction<number | null>) {
      state.selectedTaskId = action.payload;
    }
  }
});

export const { setSelectedProjectId, setSelectedTaskId } = mainPageSlice.actions;
export const mainPageReducer = mainPageSlice.reducer;
