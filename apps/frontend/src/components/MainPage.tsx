import { ProjectDetailPane, ProjectsListPane } from './projects/ProjectsPanel';
import { useProjectsPanelModel } from './projects/useProjectsPanelModel';
import { TaskNotesPane, TasksListPane } from './tasks/TasksPanel';
import { useTasksPanelModel } from './tasks/useTasksPanelModel';

export function MainPage() {
  const projectsModel = useProjectsPanelModel();
  const tasksModel = useTasksPanelModel();

  return (
    <main className="app-shell main-layout" data-testid="main-page">
      <section className="panel pane-left projects-pane" data-testid="projects-panel">
        <ProjectsListPane model={projectsModel} />
      </section>

      <div className="pane-right">
        <section className="panel pane-top" data-testid="project-detail-panel">
          <div className="pane-stack">
            <ProjectDetailPane model={projectsModel} />
            <TasksListPane model={tasksModel} />
          </div>
        </section>

        <section className="panel pane-bottom" data-testid="task-notes-panel">
          <TaskNotesPane model={tasksModel} />
        </section>
      </div>
    </main>
  );
}
