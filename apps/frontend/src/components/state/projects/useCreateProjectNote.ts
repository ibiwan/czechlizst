import { useCreateProjectNoteMutation } from '@api';

export function useCreateProjectNote(projectId: number | null) {
  const [createNote, state] = useCreateProjectNoteMutation();

  async function handleCreateNote(body: string, referenceUrl: string) {
    const trimmedBody = body.trim();
    if (!trimmedBody || projectId === null) {
      return false;
    }
    const trimmedReferenceUrl = referenceUrl.trim();
    await createNote({
      projectId,
      body: trimmedBody,
      referenceUrl: trimmedReferenceUrl ? trimmedReferenceUrl : null
    }).unwrap();
    return true;
  }

  return {
    createNote: handleCreateNote,
    ...state
  };
}
