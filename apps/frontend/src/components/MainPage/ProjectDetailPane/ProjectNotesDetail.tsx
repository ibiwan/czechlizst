import { useProjectsPanel } from '@state/projects/useProjectsPanel';
import { ProjectDetailHeader } from './ProjectNotesDetail/ProjectDetailHeader';
import { ProjectNotesSection } from './ProjectNotesDetail/ProjectNotesSection/ProjectNotesSection';
import { ProjectStatusRow } from './ProjectNotesDetail/ProjectStatusRow';

export function ProjectNotesDetail() {
  const { activeProject } = useProjectsPanel();
  const titleNode = activeProject ? (
    <ProjectDetailHeader />
  ) : undefined;

  const beforeList = <ProjectStatusRow />;

  return (
    <ProjectNotesSection
      beforeList={beforeList}
      headerAction={null}
      titleNode={titleNode}
    />
  );
}
