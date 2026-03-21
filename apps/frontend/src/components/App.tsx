import { useEffect } from 'react';

import { ProjectsPanelProvider } from '@state/projects/ProjectsPanelProvider';
import { useTasksPanelModel } from '@state/tasks/useTasksPanelModel';
import { useProjectsPanel } from '@state/projects/useProjectsPanel';

import { ProjectListPane } from './App/ProjectListPane';
import { ProjectDetailPane } from './App/ProjectDetailPane';
import { TaskNotesPane } from './App/TaskNotesPane';

function App() {
  const tasksModel = useTasksPanelModel();

  return (
    <ProjectsPanelProvider>
      <MainPageContent tasksModel={tasksModel} />
    </ProjectsPanelProvider>
  );
}

function MainPageContent({ tasksModel }: { tasksModel: ReturnType<typeof useTasksPanelModel> }) {
  const projectsModel = useProjectsPanel();
  const { selectProject } = projectsModel;

  // Handle escape key to deselect project
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle escape if not in a text field
      if (event.key === 'Escape') {
        const activeElement = document.activeElement;
        const isTextField = activeElement?.tagName === 'INPUT' ||
          activeElement?.tagName === 'TEXTAREA' ||
          activeElement?.tagName === 'SELECT' ||
          activeElement?.hasAttribute('contenteditable');

        if (!isTextField) {
          selectProject(null);
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectProject]);

  return (
    <main
      className={`app-shell main-layout`}
      data-testid="main-page"
    >
      <section className="panel pane-left project-list-pane" data-testid="project-list-pane">
        <ProjectListPane />
      </section>

      <div className="pane-right">
        <section className="pane-top" data-testid="project-detail-pane">
          <ProjectDetailPane tasksModel={tasksModel} />
        </section>

        <section className="panel pane-bottom" data-testid="task-notes-pane">
          <TaskNotesPane model={tasksModel} />
        </section>
      </div>
    </main>
  );
}

export default App;
