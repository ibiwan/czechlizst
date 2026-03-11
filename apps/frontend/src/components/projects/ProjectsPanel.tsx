import { AddEntityRow } from '../AddEntityRow';
import { AddSpinnerButton } from '../AddSpinnerButton';
import { ProjectNotesDetail } from './ProjectNotesDetail';
import { ProjectRow } from './ProjectRow';
import { useProjectsPanelModel } from './useProjectsPanelModel';

export type ProjectsPanelModel = ReturnType<typeof useProjectsPanelModel>;

export function ProjectsListPane({ model }: { model: ProjectsPanelModel }) {
  const statusPriority: Record<string, number> = {
    active: 0,
    started: 1,
    todo: 2,
    blocked: 3,
    done: 4,
    dropped: 5
  };

  const sortedProjects = [...model.projects].sort((left, right) => {
    const leftPriority = statusPriority[left.status] ?? 99;
    const rightPriority = statusPriority[right.status] ?? 99;
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }
    return right.createdAt.localeCompare(left.createdAt);
  });

  return (
    <>
      <div className="panel-header panel-header-with-add" data-testid="projects-header">
        <h2 className="panel-title" data-testid="projects-title">
          Projects
        </h2>
        <AddSpinnerButton
          label="New Project"
          loadingLabel="Loading"
          loading={model.createProjectState.isLoading}
          onClick={() => model.setProjectInputOpen(true)}
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

      <div className="table-wrap" data-testid="projects-table-wrap">
        <div className="project-list-scroll" data-testid="projects-list-scroll">
          <table className="data-table project-table" data-testid="projects-table">
            <tbody>
              {model.projectInputOpen && (
                <AddEntityRow
                  addLabel="+ New project"
                  inputPlaceholder="Project name"
                  isSaving={model.createProjectState.isLoading}
                  onChangeValue={model.setNewProjectName}
                  onSubmit={model.onCreateProject}
                  onToggleOpen={model.setProjectInputOpen}
                  open={model.projectInputOpen}
                  resetValue={() => model.setNewProjectName('')}
                  value={model.newProjectName}
                  testIdPrefix="projects-add"
                  colSpan={1}
                />
              )}
              {sortedProjects.map((project) => (
                <ProjectRow
                  key={project.id}
                  activeProjectId={model.activeProjectId}
                  effectiveProjectStatus={model.effectiveProjectStatus}
                  onSelectProject={model.selectProject}
                  project={project}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function ProjectDetailPane({ model }: { model: ProjectsPanelModel }) {
  if (model.activeProjectId === null) {
    return (
      <p className="state-copy" data-testid="project-detail-empty">
        Select a project first.
      </p>
    );
  }

  return (
    <ProjectNotesDetail
      activeProject={model.activeProject}
      createProjectNoteLoading={model.createProjectNoteState.isLoading}
      effectiveProjectStatus={model.effectiveProjectStatus}
      newProjectNoteBody={model.newProjectNoteBody}
      onChangeProjectNoteBody={model.setNewProjectNoteBody}
      onCreateProjectNote={model.onCreateProjectNote}
      onOpenProjectNoteInput={model.setProjectNoteInputOpen}
      onUpdateProjectStatus={model.onUpdateProjectStatus}
      onUpdateProjectName={model.onUpdateProjectName}
      onUpdateProjectNote={model.onUpdateProjectNote}
      projectNoteInputOpen={model.projectNoteInputOpen}
      projectNotes={model.projectNotes}
      projectNotesError={Boolean(model.projectNotesQuery.error)}
      projectNotesLoading={model.projectNotesQuery.isLoading}
      projectRenameOpen={model.projectRenameOpen}
      projectRenameValue={model.projectRenameValue}
      onToggleProjectRename={model.setProjectRenameOpen}
      onChangeProjectRename={model.setProjectRenameValue}
      onSetProjectStatus={model.setProjectStatus}
      onDeleteProject={model.onDeleteProject}
      updateProjectLoading={model.updateProjectState.isLoading}
      updateProjectNoteLoading={model.updateProjectNoteState.isLoading}
      updateProjectStatusLoading={model.updateProjectStatusState.isLoading}
    />
  );
}

export function ProjectsPanel() {
  const model = useProjectsPanelModel();

  return (
    <section className="panel">
      <ProjectsListPane model={model} />

      <ProjectDetailPane model={model} />
    </section>
  );
}
