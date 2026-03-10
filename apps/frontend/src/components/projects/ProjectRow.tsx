import { type WorkStatus } from '@app/contracts';
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
    >
      <td>
        <div className="project-card">
          <div className="project-card-title">{project.name}</div>
          <div className="project-card-meta">
            <span className={`status-pill status-${shownStatus}`}>{shownStatus}</span>
            <span className="project-created">
              {formatProjectTimestamp(project.createdAt)}
            </span>
          </div>
        </div>
      </td>
    </tr>
  );
}
