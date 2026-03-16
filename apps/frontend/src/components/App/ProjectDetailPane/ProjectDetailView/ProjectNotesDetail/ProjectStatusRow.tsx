import { StatusOptionSelect } from '@utilities/StatusOptionSelect';
import { useProjectsPanel } from '@state/projects/useProjectsPanel';
import { useProjectStatus } from '@state/projects/useProjectStatus';

export function ProjectStatusRow() {
  const { activeProject, effectiveProjectStatus } = useProjectsPanel();
  const { onUpdateProjectStatus, setProjectStatus, updateProjectStatusState } = useProjectStatus(
    activeProject?.id ?? null
  );
  const updateProjectStatusLoading = updateProjectStatusState.isLoading;

  return (
    <div className="status-row">
      <div className="status-row-left">
        {activeProject && activeProject.status === 'started' && (
          <button
            className="activate-btn activate-btn-activate"
            type="button"
            onClick={() => setProjectStatus(activeProject.id, 'active')}
            disabled={updateProjectStatusLoading}
            data-testid="project-activate"
          >
            Activate
          </button>
        )}
        {activeProject && activeProject.status === 'active' && (
          <button
            className="activate-btn activate-btn-suspend"
            type="button"
            onClick={() => setProjectStatus(activeProject.id, 'started')}
            disabled={updateProjectStatusLoading}
            data-testid="project-suspend"
          >
            Suspend
          </button>
        )}
      </div>
      <div className="status-row-right">
        <div className="status-pill-wrap">
          {activeProject ? (
            <span className={`status-select-pill status-${activeProject.status}`}>
                <StatusOptionSelect
                  className={`status-select status-select-${activeProject.status} status-select-pill-input`}
                  currentStatus={activeProject.status}
                  disabled={updateProjectStatusLoading}
                  onChange={(nextStatus) => onUpdateProjectStatus(activeProject.status, nextStatus)}
                  testId="project-status-select"
                />
            </span>
          ) : (
            <span
              className={`status-pill status-${effectiveProjectStatus}`}
              data-testid="project-status-pill"
            >
              {effectiveProjectStatus}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
