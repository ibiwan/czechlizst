import { useUpdateProjectNoteMutation } from '@api';

export function useProjectNoteUpdate(activeProjectId: number | null) {
  const [updateProjectNote, updateProjectNoteState] = useUpdateProjectNoteMutation();

  async function onUpdateProjectNote(noteId: number, body: string, referenceUrl: string | null) {
    if (activeProjectId === null) {
      return;
    }
    const trimmed = body.trim();
    if (!trimmed) {
      return;
    }
    await updateProjectNote({
      noteId,
      projectId: activeProjectId,
      body: trimmed,
      referenceUrl
    }).unwrap();
  }

  return {
    onUpdateProjectNote,
    updateProjectNoteState
  };
}
