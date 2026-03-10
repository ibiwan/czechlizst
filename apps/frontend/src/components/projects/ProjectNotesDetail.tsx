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
  onUpdateProjectName: (event: React.FormEvent<HTMLFormElement>) => void;
  onUpdateProjectNote: (noteId: number, body: string) => void;
  onUpdateProjectStatus: (currentStatus: WorkStatus, nextStatus: WorkStatus) => void;
  onSetProjectStatus: (projectId: number, nextStatus: WorkStatus) => void;
  onDeleteProject: (projectId: number) => void;
  onToggleProjectRename: (open: boolean) => void;
  onChangeProjectRename: (name: string) => void;
  projectNoteInputOpen: boolean;
  projectNotes: NoteView[];
  projectNotesError: boolean;
  projectNotesLoading: boolean;
  projectRenameOpen: boolean;
  projectRenameValue: string;
  updateProjectLoading: boolean;
  updateProjectNoteLoading: boolean;
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
  onUpdateProjectName,
  onUpdateProjectNote,
  onUpdateProjectStatus,
  onSetProjectStatus,
  onDeleteProject,
  onToggleProjectRename,
  onChangeProjectRename,
  projectNoteInputOpen,
  projectNotes,
  projectNotesError,
  projectNotesLoading,
  projectRenameOpen,
  projectRenameValue,
  updateProjectLoading,
  updateProjectNoteLoading,
  updateProjectStatusLoading
}: ProjectNotesDetailProps) {
  const titleNode = activeProject ? (
    <div className="detail-title-bar">
      <div className="detail-title-left">
        {projectRenameOpen ? (
          <form className="inline-form in-row detail-title-edit" onSubmit={onUpdateProjectName}>
            <input
              className="text-input detail-title-input"
              value={projectRenameValue}
              onChange={(event) => onChangeProjectRename(event.target.value)}
              placeholder="Project name"
              autoFocus
            />
            <button
              className="icon-btn detail-rename-action"
              type="submit"
              aria-label="Save project name"
              disabled={updateProjectLoading}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 16.17 4.83 12l-1.41 1.41L9 19l12-12-1.41-1.41z" />
              </svg>
            </button>
            <button
              className="icon-btn detail-rename-action"
              type="button"
              aria-label="Cancel rename"
              onClick={() => onToggleProjectRename(false)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" />
              </svg>
            </button>
          </form>
        ) : (
          <div className="detail-title-row">
            <h3 className="panel-title detail-title detail-title-text">
              {activeProject.name}
            </h3>
            <button
              className="icon-btn detail-rename"
              type="button"
              aria-label={`Rename ${activeProject.name}`}
              onClick={() => onToggleProjectRename(true)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 17.25V20h2.75l8.1-8.1-2.75-2.75L4 17.25zm15.71-9.04c.39-.39.39-1.02 0-1.41l-1.5-1.5a1 1 0 0 0-1.41 0l-1.13 1.13 2.75 2.75 1.29-1.29z" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <div className="detail-title-center">
        {!projectRenameOpen && activeProject.status === 'started' && (
          <button
            className="activate-btn activate-btn-active"
            type="button"
            onClick={() => onSetProjectStatus(activeProject.id, 'active')}
          >
            Activate
          </button>
        )}
        {!projectRenameOpen && activeProject.status === 'active' && (
          <button
            className="activate-btn activate-btn-hwb"
            type="button"
            onClick={() => onSetProjectStatus(activeProject.id, 'started')}
          >
            Suspend
          </button>
        )}
      </div>
      <div className="detail-title-right">
        <button
          className="icon-btn detail-delete"
          type="button"
          aria-label={`Delete ${activeProject.name}`}
          onClick={() => onDeleteProject(activeProject.id)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
          </svg>
        </button>
      </div>
    </div>
  ) : undefined;

  const beforeList = (
    <>
      <div className="status-row">
        <div className="status-pill-wrap">
          {activeProject ? (
            <span className={`status-select-pill status-${activeProject.status}`}>
              <StatusOptionSelect
                className={`status-select status-select-${activeProject.status} status-select-pill-input`}
                currentStatus={activeProject.status}
                disabled={updateProjectStatusLoading}
                onChange={(nextStatus) => onUpdateProjectStatus(activeProject.status, nextStatus)}
              />
            </span>
          ) : (
            <span className={`status-pill status-${effectiveProjectStatus}`}>
              {effectiveProjectStatus}
            </span>
          )}
        </div>
      </div>

    </>
  );

  return (
    <NotesDetailSection
      addNoteLabel="New note"
      beforeList={beforeList}
      createNoteLoading={createProjectNoteLoading}
      titleNode={titleNode}
      headerAction={null}
      inputPlaceholder="Add a project note"
      newNoteBody={newProjectNoteBody}
      notes={projectNotes}
      notesError={projectNotesError}
      notesLoading={projectNotesLoading}
      onUpdateNote={onUpdateProjectNote}
      onChangeNoteBody={onChangeProjectNoteBody}
      onCreateNote={onCreateProjectNote}
      onToggleOpen={onOpenProjectNoteInput}
      open={projectNoteInputOpen}
      resetNoteBody={() => onChangeProjectNoteBody('')}
      title={activeProject ? activeProject.name : 'Project Notes'}
      updateNoteLoading={updateProjectNoteLoading}
    />
  );
}
