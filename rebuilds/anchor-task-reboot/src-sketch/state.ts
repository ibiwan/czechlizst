export type AnchorTaskId = number;
export type TaskId = number;

export type RebootMainState = {
  selectedAnchorId: AnchorTaskId | null;
  focusedTaskId: TaskId | null;
  selectedTaskId: TaskId | null;

  anchorInputOpen: boolean;
  taskInputOpen: boolean;
  taskRenameOpen: boolean;
  taskNoteInputOpen: boolean;

  newAnchorTitle: string;
  newTaskTitle: string;
  taskRenameValue: string;
  newTaskNoteBody: string;
  newTaskNoteReferenceUrl: string;
};

export const rebootInitialState: RebootMainState = {
  selectedAnchorId: null,
  focusedTaskId: null,
  selectedTaskId: null,

  anchorInputOpen: false,
  taskInputOpen: false,
  taskRenameOpen: false,
  taskNoteInputOpen: false,

  newAnchorTitle: '',
  newTaskTitle: '',
  taskRenameValue: '',
  newTaskNoteBody: '',
  newTaskNoteReferenceUrl: ''
};

export type FocusSelectionAction =
  | {
      type: 'select_anchor';
      anchorId: TaskId | null;
    }
  | {
      type: 'select_task';
      taskId: TaskId | null;
      anchorId?: TaskId | null;
      focusTaskId?: TaskId | null;
    };

export function applyFocusSelection(
  state: RebootMainState,
  action: FocusSelectionAction
): RebootMainState {
  switch (action.type) {
    case 'select_anchor':
      return {
        ...state,
        selectedAnchorId: action.anchorId,
        focusedTaskId: action.anchorId,
        selectedTaskId: action.anchorId
      };
    case 'select_task':
      return {
        ...state,
        selectedAnchorId:
          action.anchorId === undefined ? state.selectedAnchorId : action.anchorId,
        focusedTaskId:
          action.focusTaskId === undefined ? action.taskId : action.focusTaskId,
        selectedTaskId: action.taskId
      };
    default:
      return state;
  }
}
