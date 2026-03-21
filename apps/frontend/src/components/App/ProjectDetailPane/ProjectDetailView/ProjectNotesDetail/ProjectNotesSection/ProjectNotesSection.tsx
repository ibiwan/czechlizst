import { type FC, type ReactNode } from 'react';
import { useDeleteProjectNoteMutation } from '@api';
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
  const [deleteProjectNote, deleteProjectNoteState] = useDeleteProjectNoteMutation();

  async function handleCreateNote(body: string, referenceUrl: string | null) {
    await createNote(body, referenceUrl || '');
  }

  async function handleDeleteNote(noteId: number) {
    if (activeProject === null) {
      return;
    }
    const note = projectNotes.find((entry) => entry.id === noteId) ?? null;
    if (!note) {
      return;
    }
    const preview = note.body.length > 80 ? `${note.body.slice(0, 77)}...` : note.body;
    const confirmed = window.confirm(`Delete note "${preview}"?`);
    if (!confirmed) {
      return;
    }
    await deleteProjectNote({ noteId, projectId: activeProject.id }).unwrap();
  }

  return (
    <NotesDetailSection
      addNoteLabel="New note"
      beforeList={beforeList}
      createNoteLoading={isCreating}
      deleteNoteLoading={deleteProjectNoteState.isLoading}
      headerAction={headerAction}
      inputPlaceholder="Add a project note"
      notes={projectNotes}
      notesError={Boolean(projectNotesQuery.error)}
      notesLoading={projectNotesQuery.isLoading}
      onCreateNote={handleCreateNote}
      onDeleteNote={handleDeleteNote}
      onUpdateNote={onUpdateProjectNote}
      testIdPrefix="project-notes"
      titleNode={titleNode}
      title={activeProject ? activeProject.name : 'Project Notes'}
      updateNoteLoading={updateProjectNoteState.isLoading}
    />
  );
};
