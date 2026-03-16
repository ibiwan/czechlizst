
import { useProjectsPanel } from '@state/projects/useProjectsPanel';
import { type TasksPanelModel } from '@state/tasks/TasksPanelModel';
import { ProjectNotesDetail } from './ProjectDetailView/ProjectNotesDetail';
import { TaskListCard } from './ProjectDetailView/TaskListCard';

export function ProjectDetailView({ tasksModel }: { tasksModel: TasksPanelModel }) {
  const model = useProjectsPanel();
  const isDetailOpen = model.activeProjectId !== null;

  return (
    <div
      className={`
        project-detail-layer 
        project-detail-view
      `}
      aria-hidden={!isDetailOpen}
      data-testid="project-detail-view"
    >
      <div className="panel project-detail-surface">
        <div className="project-detail-scroll">
          <div className="pane-stack">
            <ProjectNotesDetail />
            <TaskListCard model={tasksModel} />
          </div>
        </div>
      </div>
    </div>
  );
}
