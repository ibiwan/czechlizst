import { type FC, type ReactNode } from 'react';
import { NotesDetailSection } from '@utilities/NotesDetailSection';
import { useProjectsPanel } from '@state/projects/useProjectsPanel';

type ProjectNotesSectionProps = {
  beforeList?: ReactNode;
  headerAction?: ReactNode;
  titleNode?: ReactNode;
};

export const ProjectNotesSection: FC<ProjectNotesSectionProps> = ({
  beforeList,
  headerAction,
  titleNode
}) => {
  const {
    activeProject,
    createProjectNoteState,
    newProjectNoteBody,
    newProjectNoteReferenceUrl,
    onCreateProjectNote,
    onUpdateProjectNote,
    projectNoteInputOpen,
    projectNotes,
    projectNotesQuery,
    setNewProjectNoteBody,
    setNewProjectNoteReferenceUrl,
    setProjectNoteInputOpen,
    updateProjectNoteState
  } = useProjectsPanel();

  return (
    <NotesDetailSection
      addNoteLabel="New note"
      beforeList={beforeList}
      createNoteLoading={createProjectNoteState.isLoading}
      headerAction={headerAction}
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
      titleNode={titleNode}
      title={activeProject ? activeProject.name : 'Project Notes'}
      updateNoteLoading={updateProjectNoteState.isLoading}
    />
  );
};
