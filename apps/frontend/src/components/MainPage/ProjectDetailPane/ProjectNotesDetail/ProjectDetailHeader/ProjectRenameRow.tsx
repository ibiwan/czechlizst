import { useProjectsPanel } from '@state/projects/useProjectsPanel';

export function ProjectRenameRow() {
  const {
    activeProject,
    onUpdateProjectName,
    projectRenameValue,
    setProjectRenameOpen,
    setProjectRenameValue,
    updateProjectState
  } = useProjectsPanel();

  if (!activeProject) {
    return null;
  }

  return (
    <form
      className="inline-form in-row detail-title-edit"
      onSubmit={onUpdateProjectName}
      data-testid="project-rename-form"
    >
      <input
        className="text-input detail-title-input"
        value={projectRenameValue}
        onChange={(event) => setProjectRenameValue(event.target.value)}
        placeholder="Project name"
        autoFocus
        data-testid="project-rename-input"
      />
      <button
        className="icon-btn detail-rename-action"
        type="submit"
        aria-label="Save project name"
        disabled={updateProjectState.isLoading}
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
        onClick={() => setProjectRenameOpen(false)}
        data-testid="project-rename-cancel"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" />
        </svg>
      </button>
    </form>
  );
}
