import { useProjectsPanel } from '@state/projects/useProjectsPanel';
import { type TasksPanelModel } from '@state/tasks/TasksPanelModel';
import { TaskCardReadOnly } from './ProjectDetailView/TasksListCard/TaskCardReadOnly';
import { type ProjectView, type TaskView } from '@app-types/view';

function ProjectCard({ project }: { project: ProjectView }) {
  return (
    <div className="task-card task-card-readonly">
      <div className="task-card-left">
        <span className="task-card-status-slot">
          <span className={`status-pill status-${project.status}`}>
            {project.status}
          </span>
        </span>
        <span className="task-card-gap" aria-hidden="true" />
        <span className="task-card-title">
          {project.name}
        </span>
      </div>
    </div>
  );
}

export function BirdsEyeView({ isDetailOpen, tasksModel }: { isDetailOpen: boolean; tasksModel: TasksPanelModel }) {
  const { projects } = useProjectsPanel();
  const { tasks } = tasksModel;

  // Row 1: Active/Started/Blocked work
  const row1Tasks = tasks.filter((t) => ['active', 'started', 'blocked'].includes(t.status));
  const row1Projects = projects.filter((p) => ['active', 'started'].includes(p.status));

  const row1Items = [
    ...row1Tasks.map((t) => ({ type: 'task' as const, data: t })),
    ...row1Projects.map((p) => ({ type: 'project' as const, data: p }))
  ];
  row1Items.sort((a, b) => {
    const dateA = a.data.updatedAt;
    const dateB = b.data.updatedAt;
    return dateB.localeCompare(dateA);
  });

  // Row 2: Remainder (Todo) randomized
  // Note: Since Row 1 takes active/started/blocked, and Row 2 takes active/started/todo excluding Row 1,
  // Row 2 essentially contains only 'todo' items.
  const row1TaskIds = new Set(row1Tasks.map((t) => t.id));
  const row1ProjectIds = new Set(row1Projects.map((p) => p.id));

  const row2Tasks = tasks.filter((t) => ['active', 'started', 'todo'].includes(t.status) && !row1TaskIds.has(t.id));
  const row2Projects = projects.filter((p) => ['active', 'started', 'todo'].includes(p.status) && !row1ProjectIds.has(p.id));

  const row2Items = [
    ...row2Tasks.map((t) => ({ type: 'task' as const, data: t })),
    ...row2Projects.map((p) => ({ type: 'project' as const, data: p }))
  ];
  row2Items.sort(() => Math.random() - 0.5);

  return (
    <div
      className={`
        project-detail-layer 
        birds-eye-view
      `}
      aria-hidden={isDetailOpen}    >
      <div className="panel project-detail-surface">
        <div className="project-detail-scroll">
          <div className="birds-eye-content">
            <h2 className="panel-title" style={{ padding: '1rem' }} data-testid="birds-eye-title">
              Birds-Eye View
            </h2>
            <h3 className="panel-title" style={{ padding: '1rem' }}>In Progress</h3>
            <div className="birds-eye-row">
              {row1Items.map((item) => (item.type === 'task' ? <TaskCardReadOnly key={`task-${item.data.id}`} task={item.data} /> : <ProjectCard key={`proj-${item.data.id}`} project={item.data} />))}
            </div>

            <h3 className="panel-title" style={{ padding: '1rem' }}>Up Next</h3>
            <div className="birds-eye-row">
              {row2Items.map((item) => (item.type === 'task' ? <TaskCardReadOnly key={`task-${item.data.id}`} task={item.data} /> : <ProjectCard key={`proj-${item.data.id}`} project={item.data} />))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
