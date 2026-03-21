import { useProjectsPanel } from '@state/projects/useProjectsPanel';

export function ProjectStatusRow() {
  const { activeProject, effectiveProjectStatus } = useProjectsPanel();

  return (
    <div className="status-row">
      <div className="status-row-left" />
      <div className="status-row-right">
        <div className="status-pill-wrap">
          <span
            className={`status-pill status-${activeProject ? effectiveProjectStatus : 'todo'}`}
            data-testid="project-status-pill"
          >
            {activeProject ? effectiveProjectStatus : 'todo'}
          </span>
        </div>
      </div>
    </div>
  );
}
