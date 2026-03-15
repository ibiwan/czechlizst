import { type WorkStatus } from '@app/contracts';
import { StatusOptionSelect } from '../StatusOptionSelect';
import { type ProjectView } from '../../types/view';

type ProjectStatusRowProps = {
  activeProject: ProjectView | null;
  effectiveProjectStatus: WorkStatus;
  onUpdateProjectStatus: (currentStatus: WorkStatus, nextStatus: WorkStatus) => void;
  updateProjectStatusLoading: boolean;
};

export function ProjectStatusRow({
  activeProject,
  effectiveProjectStatus,
  onUpdateProjectStatus,
  updateProjectStatusLoading
}: ProjectStatusRowProps) {
  return (
    <div className="status-row">
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
  );
}
