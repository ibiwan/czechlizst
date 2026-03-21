import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type MainPageState = {
  selectedProjectId: number | null;
  selectedTaskId: number | null;
  projectInputOpen: boolean;
  projectRenameOpen: boolean;
  projectNoteInputOpen: boolean;
  newProjectName: string;
  projectRenameValue: string;
  newProjectNoteBody: string;
  newProjectNoteReferenceUrl: string;
};

const baseInitialState: MainPageState = {
  selectedProjectId: null,
  selectedTaskId: null,
  projectInputOpen: false,
  projectRenameOpen: false,
  projectNoteInputOpen: false,
  newProjectName: '',
  projectRenameValue: '',
  newProjectNoteBody: '',
  newProjectNoteReferenceUrl: ''
};
const initialState: MainPageState = baseInitialState;

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
    },
    setProjectInputOpen(state, action: PayloadAction<boolean>) {
      state.projectInputOpen = action.payload;
    },
    setProjectRenameOpen(state, action: PayloadAction<boolean>) {
      state.projectRenameOpen = action.payload;
    },
    setProjectNoteInputOpen(state, action: PayloadAction<boolean>) {
      state.projectNoteInputOpen = action.payload;
    },
    setNewProjectName(state, action: PayloadAction<string>) {
      state.newProjectName = action.payload;
    },
    setProjectRenameValue(state, action: PayloadAction<string>) {
      state.projectRenameValue = action.payload;
    },
    setNewProjectNoteBody(state, action: PayloadAction<string>) {
      state.newProjectNoteBody = action.payload;
    },
    setNewProjectNoteReferenceUrl(state, action: PayloadAction<string>) {
      state.newProjectNoteReferenceUrl = action.payload;
    }
  }
});

export const {
  setSelectedProjectId,
  setSelectedTaskId,
  setProjectInputOpen,
  setProjectRenameOpen,
  setProjectNoteInputOpen,
  setNewProjectName,
  setProjectRenameValue,
  setNewProjectNoteBody,
  setNewProjectNoteReferenceUrl
} = mainPageSlice.actions;
export const mainPageReducer = mainPageSlice.reducer;
