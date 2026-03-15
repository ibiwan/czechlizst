import { type WorkStatus } from '@app/contracts';
import { Flipped } from 'react-flip-toolkit';
import { formatProjectTimestamp } from '../../lib/format';
import { type ProjectView } from '../../types/view';

type ProjectRowProps = {
  activeProjectId: number | null;
  effectiveProjectStatus: WorkStatus;
  onSelectProject: (projectId: number) => void;
  project: ProjectView;
};

export function ProjectRow({
  activeProjectId,
  effectiveProjectStatus,
  onSelectProject,
  project
}: ProjectRowProps) {
  const shownStatus = project.id === activeProjectId ? effectiveProjectStatus : project.status;

  return (
    <tr
      className={project.id === activeProjectId ? 'is-selected' : ''}
      onClick={() => onSelectProject(project.id)}
      data-testid={`project-row-${project.id}`}
    >
      <td>
        <Flipped flipId={`project-${project.id}`}>
          <div className="project-card">
            <div className="project-card-title" data-testid={`project-name-${project.id}`}>
              {project.name}
            </div>
            <div className="project-card-meta">
              <span
                className={`status-pill status-${shownStatus}`}
                data-testid={`project-status-${project.id}`}
              >
                {shownStatus}
              </span>
              <span className="project-created" data-testid={`project-created-${project.id}`}>
                {formatProjectTimestamp(project.createdAt)}
              </span>
            </div>
          </div>
        </Flipped>
      </td>
    </tr>
  );
}
