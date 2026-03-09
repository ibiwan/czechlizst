import { ProjectsPanel } from './projects/ProjectsPanel';
import { TasksPanel } from './tasks/TasksPanel';

export function MainPage() {
  return (
    <main className="app-shell">
      <ProjectsPanel />
      <TasksPanel />
    </main>
  );
}
