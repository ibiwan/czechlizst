import { type WorkStatus } from '@app/contracts';
import { NotesDetailSection } from '../NotesDetailSection';
import { StatusOptionSelect } from '../StatusOptionSelect';
import { type NoteView, type ProjectView } from '../../types/view';

type ProjectNotesDetailProps = {
  activeProject: ProjectView | null;
  createProjectNoteLoading: boolean;
  effectiveProjectStatus: WorkStatus;
  newProjectNoteBody: string;
  onChangeProjectNoteBody: (body: string) => void;
  onCreateProjectNote: (event: React.FormEvent<HTMLFormElement>) => void;
  onOpenProjectNoteInput: (open: boolean) => void;
  onUpdateProjectStatus: (currentStatus: WorkStatus, nextStatus: WorkStatus) => void;
  projectNoteInputOpen: boolean;
  projectNotes: NoteView[];
  projectNotesError: boolean;
  projectNotesLoading: boolean;
  projectStatusDiffers: boolean;
  tasksCount: number;
  updateProjectStatusLoading: boolean;
};

export function ProjectNotesDetail({
  activeProject,
  createProjectNoteLoading,
  effectiveProjectStatus,
  newProjectNoteBody,
  onChangeProjectNoteBody,
  onCreateProjectNote,
  onOpenProjectNoteInput,
  onUpdateProjectStatus,
  projectNoteInputOpen,
  projectNotes,
  projectNotesError,
  projectNotesLoading,
  projectStatusDiffers,
  tasksCount,
  updateProjectStatusLoading
}: ProjectNotesDetailProps) {
  const beforeList = (
    <>
      <div className="status-row">
        <span className="status-label">Status:</span>
        <span className={`status-pill status-${effectiveProjectStatus}`}>
          {effectiveProjectStatus}
        </span>
        {projectStatusDiffers && activeProject && (
          <span className="status-detail">manual: {activeProject.status}</span>
        )}
      </div>

      {tasksCount === 0 && activeProject && (
        <label className="status-control">
          <span className="status-label">Change status</span>
          <StatusOptionSelect
            className={`status-select status-select-${activeProject.status}`}
            currentStatus={activeProject.status}
            disabled={updateProjectStatusLoading}
            onChange={(nextStatus) => onUpdateProjectStatus(activeProject.status, nextStatus)}
          />
        </label>
      )}

      {tasksCount > 0 && (
        <p className="status-detail">
          Project status is derived from task statuses while tasks exist.
        </p>
      )}
    </>
  );

  return (
    <NotesDetailSection
      addNoteLabel="+ New project note"
      beforeList={beforeList}
      createNoteLoading={createProjectNoteLoading}
      inputPlaceholder="Add a project note"
      newNoteBody={newProjectNoteBody}
      notes={projectNotes}
      notesError={projectNotesError}
      notesLoading={projectNotesLoading}
      onChangeNoteBody={onChangeProjectNoteBody}
      onCreateNote={onCreateProjectNote}
      onToggleOpen={onOpenProjectNoteInput}
      open={projectNoteInputOpen}
      resetNoteBody={() => onChangeProjectNoteBody('')}
      title={activeProject ? `${activeProject.name} Notes` : 'Project Notes'}
    />
  );
}
