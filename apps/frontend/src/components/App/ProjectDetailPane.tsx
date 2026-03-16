import { BirdsEyeView } from './ProjectDetailPane/BirdsEyeView';
import { useProjectsPanel } from '@state/projects/useProjectsPanel';
import { type TasksPanelModel } from '@state/tasks/TasksPanelModel';
import { ProjectDetailView } from './ProjectDetailPane/ProjectDetailView';

export function ProjectDetailPane({ tasksModel }: { tasksModel: TasksPanelModel }) {
  const model = useProjectsPanel();
  const isDetailOpen = model.activeProjectId !== null;

  return (
    <div
      className={`
        project-detail-pane 
        ${isDetailOpen ?
          'project-detail-mode' :
          'birds-eye-mode'}
      `}
    >
      <BirdsEyeView isDetailOpen={isDetailOpen} />
      <ProjectDetailView tasksModel={tasksModel} />
    </div>
  );
}