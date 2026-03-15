import { ProjectNotesDetail } from './ProjectDetailPane/ProjectNotesDetail';
import { useProjectsPanel } from '@state/projects/useProjectsPanel';

export function ProjectDetailPane() {
  const model = useProjectsPanel();
  if (model.activeProjectId === null) {
    return (
      <p className="state-copy" data-testid="project-detail-empty">
        Select a project first.
      </p>
    );
  }

  return <ProjectNotesDetail />;
}
