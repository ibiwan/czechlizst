import { useProjectsPanel } from '@state/projects/useProjectsPanel';
import { NotesDetailSection } from '@utilities/NotesDetailSection';

import { ProjectDetailHeader } from './ProjectNotesDetail/ProjectDetailHeader';
import { ProjectStatusRow } from './ProjectNotesDetail/ProjectStatusRow';

export function ProjectNotesDetail() {
  const {
    activeProject,
    createProjectNoteState,
    effectiveProjectStatus,
    newProjectNoteBody,
    newProjectNoteReferenceUrl,
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
    setNewProjectNoteReferenceUrl,
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
      onSetProjectStatus={setProjectStatus}
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
      newNoteReferenceUrl={newProjectNoteReferenceUrl}
      notes={projectNotes}
      notesError={Boolean(projectNotesQuery.error)}
      notesLoading={projectNotesQuery.isLoading}
      onUpdateNote={onUpdateProjectNote}
      onChangeNoteBody={setNewProjectNoteBody}
      onChangeNoteReferenceUrl={setNewProjectNoteReferenceUrl}
      onCreateNote={onCreateProjectNote}
      onToggleOpen={setProjectNoteInputOpen}
      open={projectNoteInputOpen}
      resetNoteBody={() => setNewProjectNoteBody('')}
      resetNoteReferenceUrl={() => setNewProjectNoteReferenceUrl('')}
      testIdPrefix="project-notes"
      title={activeProject ? activeProject.name : 'Project Notes'}
      updateNoteLoading={updateProjectNoteState.isLoading}
    />
  );
}
