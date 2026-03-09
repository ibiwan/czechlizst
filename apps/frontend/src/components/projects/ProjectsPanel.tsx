import { AddEntityRow } from '../AddEntityRow';
import { ProjectNotesDetail } from './ProjectNotesDetail';
import { ProjectRow } from './ProjectRow';
import { useProjectsPanelModel } from './useProjectsPanelModel';

export function ProjectsPanel() {
  const model = useProjectsPanelModel();

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Projects</h2>
      </div>

      {model.projectsQuery.isLoading && <p className="state-copy">Loading projects...</p>}
      {model.projectsQuery.error && <p className="state-copy">Could not load projects.</p>}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {model.projects.map((project) => (
              <ProjectRow
                key={project.id}
                activeProjectId={model.activeProjectId}
                effectiveProjectStatus={model.effectiveProjectStatus}
                onSelectProject={model.selectProject}
                project={project}
              />
            ))}

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
            />
          </tbody>
        </table>
      </div>

      {model.activeProjectId !== null && (
        <ProjectNotesDetail
          activeProject={model.activeProject}
          createProjectNoteLoading={model.createProjectNoteState.isLoading}
          effectiveProjectStatus={model.effectiveProjectStatus}
          newProjectNoteBody={model.newProjectNoteBody}
          onChangeProjectNoteBody={model.setNewProjectNoteBody}
          onCreateProjectNote={model.onCreateProjectNote}
          onOpenProjectNoteInput={model.setProjectNoteInputOpen}
          onUpdateProjectStatus={model.onUpdateProjectStatus}
          projectNoteInputOpen={model.projectNoteInputOpen}
          projectNotes={model.projectNotes}
          projectNotesError={Boolean(model.projectNotesQuery.error)}
          projectNotesLoading={model.projectNotesQuery.isLoading}
          projectStatusDiffers={model.projectStatusDiffers}
          tasksCount={model.tasks.length}
          updateProjectStatusLoading={model.updateProjectStatusState.isLoading}
        />
      )}
    </section>
  );
}
