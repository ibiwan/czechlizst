import { type WorkStatus } from '@app/contracts';
import { formatTimestamp } from '../../lib/format';
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
      <td>{project.name}</td>
      <td>
        <span className={`status-pill status-${shownStatus}`}>{shownStatus}</span>
      </td>
      <td>{formatTimestamp(project.createdAt)}</td>
    </tr>
  );
}
