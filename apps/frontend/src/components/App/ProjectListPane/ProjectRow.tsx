import { Flipped } from 'react-flip-toolkit';
import { formatProjectTimestamp } from '@lib/format';
import { OverflowReveal } from '@utilities/OverflowReveal';

import './ProjectRow.css';
import { type ProjectView } from '@app-types/view';
import { useProjectsPanel } from '@state/projects/useProjectsPanel';

type ProjectRowProps = {
  project: ProjectView;
};

export function ProjectRow({ project }: ProjectRowProps) {
  const { activeProjectId, effectiveProjectStatusById, selectProject } = useProjectsPanel();
  const shownStatus = effectiveProjectStatusById.get(project.id) ?? project.status;

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    // Command/Ctrl + Click to deselect
    if (event.metaKey || event.ctrlKey) {
      if (activeProjectId === project.id) {
        selectProject(null);
      } else {
        selectProject(project.id);
      }
    } else {
      selectProject(project.id);
    }
  };

  return (
    <Flipped flipId={`project-${project.id}`}>
      <div
        className={`project-list-item${project.id === activeProjectId ? ' is-selected' : ''}`}
        onClick={handleClick}
        data-testid={`project-row-${project.id}`}
      >
        <div className="project-card">
          <OverflowReveal
            as="div"
            className="project-card-title"
            testId={`project-name-${project.id}`}
          >
            {project.name}
          </OverflowReveal>
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
      </div>
    </Flipped>
  );
}
