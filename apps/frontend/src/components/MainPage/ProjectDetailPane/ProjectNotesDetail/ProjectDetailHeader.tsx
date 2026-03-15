import { InlineEditRow } from '@utilities/InlineEditRow';
import { useProjectsPanel } from '@state/projects/useProjectsPanel';

type ProjectDetailHeaderProps = {};

export function ProjectDetailHeader(_props: ProjectDetailHeaderProps) {
  const {
    activeProject,
    onDeleteProject,
    onUpdateProjectName,
    projectRenameOpen,
    projectRenameValue,
    setProjectRenameOpen,
    setProjectRenameValue,
    updateProjectState
  } = useProjectsPanel();

  if (!activeProject) {
    return null;
  }

  return (
    <div className="detail-title-bar">
      <div className="detail-title-left">
        {projectRenameOpen ? (
          <InlineEditRow
            formClassName="inline-form in-row detail-title-edit"
            inputClassName="text-input detail-title-input"
            value={projectRenameValue}
            placeholder="Project name"
            autoFocus
            loading={updateProjectState.isLoading}
            onSubmit={onUpdateProjectName}
            onCancel={() => setProjectRenameOpen(false)}
            onChange={setProjectRenameValue}
            saveLabel="Save project name"
            cancelLabel="Cancel rename"
            formTestId="project-rename-form"
            inputTestId="project-rename-input"
            saveTestId="project-rename-save"
            cancelTestId="project-rename-cancel"
          />
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
              onClick={() => setProjectRenameOpen(true)}
              data-testid="project-rename-toggle"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 17.25V20h2.75l8.1-8.1-2.75-2.75L4 17.25zm15.71-9.04c.39-.39.39-1.02 0-1.41l-1.5-1.5a1 1 0 0 0-1.41 0l-1.13 1.13 2.75 2.75 1.29-1.29z" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <div className="detail-title-center" aria-hidden="true" />
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
