import { type FC, type ReactNode } from 'react';
import { NotesDetailSection } from '@utilities/NotesDetailSection';
import { useProjectsPanel } from '@state/projects/useProjectsPanel';
import { useCreateProjectNote } from '@state/projects/useCreateProjectNote';
import { useProjectNoteUpdate } from '@state/projects/useProjectNoteUpdate';

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
  const { activeProject, projectNotes, projectNotesQuery } = useProjectsPanel();
  const { createNote, isLoading: isCreating } = useCreateProjectNote(activeProject?.id ?? null);
  const { onUpdateProjectNote, updateProjectNoteState } = useProjectNoteUpdate(
    activeProject?.id ?? null
  );

  async function handleCreateNote(body: string, referenceUrl: string | null) {
    await createNote(body, referenceUrl || '');
  }

  return (
    <NotesDetailSection
      addNoteLabel="New note"
      beforeList={beforeList}
      createNoteLoading={isCreating}
      headerAction={headerAction}
      inputPlaceholder="Add a project note"
      notes={projectNotes}
      notesError={Boolean(projectNotesQuery.error)}
      notesLoading={projectNotesQuery.isLoading}
      onCreateNote={handleCreateNote}
      onUpdateNote={onUpdateProjectNote}
      testIdPrefix="project-notes"
      titleNode={titleNode}
      title={activeProject ? activeProject.name : 'Project Notes'}
      updateNoteLoading={updateProjectNoteState.isLoading}
    />
  );
};
