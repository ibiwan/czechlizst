import { Flipped } from 'react-flip-toolkit';
import { formatProjectTimestamp } from '@lib/format';
import { type ProjectView } from '@app-types/view';
import { useProjectsPanel } from '@state/projects/useProjectsPanel';

type ProjectRowProps = {
  project: ProjectView;
};

export function ProjectRow({ project }: ProjectRowProps) {
  const { activeProjectId, effectiveProjectStatus, selectProject } = useProjectsPanel();
  const shownStatus = project.id === activeProjectId ? effectiveProjectStatus : project.status;

  return (
    <tr
      className={project.id === activeProjectId ? 'is-selected' : ''}
      onClick={() => selectProject(project.id)}
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
