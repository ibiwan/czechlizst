import { AddEntityRow } from '@utilities/AddEntityRow';
import { AddSpinnerButton } from '@utilities/AddSpinnerButton';
import { ProjectRow } from './ProjectListPane/ProjectRow';
import { useProjectsPanel } from '@state/projects/useProjectsPanel';
import { Flipper } from 'react-flip-toolkit';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setNewProjectName, setProjectInputOpen, setSelectedProjectId } from '@store/mainPageSlice';
import { useCreateProject } from '@state/projects/useCreateProject';

export function ProjectListPane() {
  const model = useProjectsPanel();
  const { createProject, isLoading: isCreating } = useCreateProject();
  const dispatch = useAppDispatch();
  const projectInputOpen = useAppSelector((state) => state.mainPage.projectInputOpen);
  const newProjectName = useAppSelector((state) => state.mainPage.newProjectName);
  const statusPriority: Record<string, number> = {
    active: 0,
    started: 1,
    todo: 2,
    blocked: 3,
    done: 4,
    dropped: 5
  };

  const sortedProjects = [...model.projects].sort((left, right) => {
    const leftStatus = model.effectiveProjectStatusById.get(left.id) ?? left.status;
    const rightStatus = model.effectiveProjectStatusById.get(right.id) ?? right.status;
    const leftPriority = statusPriority[leftStatus] ?? 99;
    const rightPriority = statusPriority[rightStatus] ?? 99;
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }
    return right.createdAt.localeCompare(left.createdAt);
  });

  const projectFlipKey = sortedProjects
    .map((project) => `${project.id}-${model.effectiveProjectStatusById.get(project.id) ?? project.status}`)
    .join('|');

  return (
    <>
      <div className="panel-header panel-header-with-add" data-testid="projects-header">
        <h2 className="panel-title" data-testid="projects-title">
          Projects
        </h2>
        <AddSpinnerButton
          label="New Project"
          loadingLabel="Loading"
          loading={isCreating}
          onClick={() => dispatch(setProjectInputOpen(true))}
          testId="projects-add-button"
        />
      </div>

      {model.projectsQuery.isLoading && (
        <p className="state-copy" data-testid="projects-loading">
          Loading projects...
        </p>
      )}
      {model.projectsQuery.error && (
        <p className="state-copy" data-testid="projects-error">
          Could not load projects.
        </p>
      )}

      <div className="project-list-wrap" data-testid="projects-list-wrap">
        <div className="project-list-scroll" data-testid="projects-list-scroll">
          <Flipper flipKey={projectFlipKey}>
            <div
              className="project-list"
              data-testid="projects-list"
              onClick={() => dispatch(setSelectedProjectId(null))}
            >
              {projectInputOpen && (
                <AddEntityRow
                  addLabel="+ New project"
                  inputPlaceholder="Project name"
                  isSaving={isCreating}
                  onChangeValue={(value) => dispatch(setNewProjectName(value))}
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const { success } = await createProject(newProjectName);
                    if (!success) {
                      return;
                    }
                    dispatch(setNewProjectName(''));
                    dispatch(setProjectInputOpen(false));
                  }}
                  onToggleOpen={(open) => dispatch(setProjectInputOpen(open))}
                  open={projectInputOpen}
                  resetValue={() => dispatch(setNewProjectName(''))}
                  value={newProjectName}
                  testIdPrefix="projects-add"
                  colSpan={1}
                />
              )}
              {sortedProjects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
            </div>
          </Flipper>
        </div>
      </div>
    </>
  );
}
