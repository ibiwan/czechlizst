import { ProjectsPanelProvider } from './state/projects/ProjectsPanelProvider';
import { useTasksPanelModel } from './state/tasks/useTasksPanelModel';
import { ProjectsListPane } from './MainPage/ProjectsListPane';
import { ProjectDetailPane } from './MainPage/ProjectDetailPane';
import { TasksListPane } from './MainPage/TasksListPane';
import { TaskNotesPane } from './MainPage/TaskNotesPane';

export function MainPage() {
  const tasksModel = useTasksPanelModel();

  return (
    <ProjectsPanelProvider>
      <main className="app-shell main-layout" data-testid="main-page">
        <section className="panel pane-left projects-pane" data-testid="projects-panel">
          <ProjectsListPane />
        </section>

        <div className="pane-right">
          <section className="panel pane-top" data-testid="project-detail-panel">
            <div className="pane-stack">
              <ProjectDetailPane />
              <TasksListPane model={tasksModel} />
            </div>
          </section>

          <section className="panel pane-bottom" data-testid="task-notes-panel">
            <TaskNotesPane model={tasksModel} />
          </section>
        </div>
      </main>
    </ProjectsPanelProvider>
  );
}
