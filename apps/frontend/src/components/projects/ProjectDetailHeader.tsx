import { type WorkStatus } from '@app/contracts';
import { type ProjectView } from '../../types/view';

type ProjectDetailHeaderProps = {
  activeProject: ProjectView;
  onDeleteProject: (projectId: number) => void;
  onSetProjectStatus: (projectId: number, nextStatus: WorkStatus) => void;
  onToggleProjectRename: (open: boolean) => void;
  onUpdateProjectName: (event: React.FormEvent<HTMLFormElement>) => void;
  onChangeProjectRename: (name: string) => void;
  projectRenameOpen: boolean;
  projectRenameValue: string;
  updateProjectLoading: boolean;
};

export function ProjectDetailHeader({
  activeProject,
  onDeleteProject,
  onSetProjectStatus,
  onToggleProjectRename,
  onUpdateProjectName,
  onChangeProjectRename,
  projectRenameOpen,
  projectRenameValue,
  updateProjectLoading
}: ProjectDetailHeaderProps) {
  return (
    <div className="detail-title-bar">
      <div className="detail-title-left">
        {projectRenameOpen ? (
          <form
            className="inline-form in-row detail-title-edit"
            onSubmit={onUpdateProjectName}
            data-testid="project-rename-form"
          >
            <input
              className="text-input detail-title-input"
              value={projectRenameValue}
              onChange={(event) => onChangeProjectRename(event.target.value)}
              placeholder="Project name"
              autoFocus
              data-testid="project-rename-input"
            />
            <button
              className="icon-btn detail-rename-action"
              type="submit"
              aria-label="Save project name"
              disabled={updateProjectLoading}
              data-testid="project-rename-save"
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
              data-testid="project-rename-cancel"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" />
              </svg>
            </button>
          </form>
        ) : (
          <div className="detail-title-row">
            <h3
              className="panel-title detail-title detail-title-text"
              data-testid="project-detail-title"
            >
              {activeProject.name}
            </h3>
            <button
              className="icon-btn detail-rename"
              type="button"
              aria-label={`Rename ${activeProject.name}`}
              onClick={() => onToggleProjectRename(true)}
              data-testid="project-rename-toggle"
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
            data-testid="project-activate"
          >
            Activate
          </button>
        )}
        {!projectRenameOpen && activeProject.status === 'active' && (
          <button
            className="activate-btn activate-btn-hwb"
            type="button"
            onClick={() => onSetProjectStatus(activeProject.id, 'started')}
            data-testid="project-suspend"
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
          data-testid="project-delete"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
