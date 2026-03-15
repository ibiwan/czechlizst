import { NotesDetailSection } from '../NotesDetailSection';
import { ProjectDetailHeader } from './ProjectDetailHeader';
import { ProjectStatusRow } from './ProjectStatusRow';
import { useProjectsPanel } from './ProjectsPanelContext';

export function ProjectNotesDetail() {
  const {
    activeProject,
    createProjectNoteState,
    effectiveProjectStatus,
    newProjectNoteBody,
    onCreateProjectNote,
    onDeleteProject,
    onUpdateProjectName,
    onUpdateProjectNote,
    onUpdateProjectStatus,
    projectNoteInputOpen,
    projectNotes,
    projectNotesQuery,
    projectRenameOpen,
    projectRenameValue,
    setNewProjectNoteBody,
    setProjectNoteInputOpen,
    setProjectRenameOpen,
    setProjectRenameValue,
    setProjectStatus,
    updateProjectNoteState,
    updateProjectState,
    updateProjectStatusState
  } = useProjectsPanel();
  const titleNode = activeProject ? (
    <ProjectDetailHeader
      activeProject={activeProject}
      onDeleteProject={onDeleteProject}
      onSetProjectStatus={setProjectStatus}
      onToggleProjectRename={setProjectRenameOpen}
      onUpdateProjectName={onUpdateProjectName}
      onChangeProjectRename={setProjectRenameValue}
      projectRenameOpen={projectRenameOpen}
      projectRenameValue={projectRenameValue}
      updateProjectLoading={updateProjectState.isLoading}
    />
  ) : undefined;

  const beforeList = (
    <ProjectStatusRow
      activeProject={activeProject}
      effectiveProjectStatus={effectiveProjectStatus}
      onUpdateProjectStatus={onUpdateProjectStatus}
      updateProjectStatusLoading={updateProjectStatusState.isLoading}
    />
  );

  return (
    <NotesDetailSection
      addNoteLabel="New note"
      beforeList={beforeList}
      createNoteLoading={createProjectNoteState.isLoading}
      titleNode={titleNode}
      headerAction={null}
      inputPlaceholder="Add a project note"
      newNoteBody={newProjectNoteBody}
      notes={projectNotes}
      notesError={Boolean(projectNotesQuery.error)}
      notesLoading={projectNotesQuery.isLoading}
      onUpdateNote={onUpdateProjectNote}
      onChangeNoteBody={setNewProjectNoteBody}
      onCreateNote={onCreateProjectNote}
      onToggleOpen={setProjectNoteInputOpen}
      open={projectNoteInputOpen}
      resetNoteBody={() => setNewProjectNoteBody('')}
      testIdPrefix="project-notes"
      title={activeProject ? activeProject.name : 'Project Notes'}
      updateNoteLoading={updateProjectNoteState.isLoading}
    />
  );
}
