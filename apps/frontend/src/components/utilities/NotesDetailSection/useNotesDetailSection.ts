import { useState, type FormEvent } from 'react';
import { type NoteView } from '@app-types/view';

interface UseNotesDetailSectionReturn {
  // Form state
  isAddingNote: boolean;
  newNoteBody: string;
  newNoteReferenceUrl: string;
  setIsAddingNote: (open: boolean) => void;
  setNewNoteBody: (body: string) => void;
  setNewNoteReferenceUrl: (url: string) => void;
  resetNewNoteForm: () => void;

  // Edit state
  editingNoteId: number | null;
  editingBody: string;
  editingReferenceUrl: string;
  setEditingBody: (body: string) => void;
  setEditingReferenceUrl: (url: string) => void;

  // Edit handlers
  onStartEdit: (note: NoteView) => void;
  onCancelEdit: () => void;
  onSubmitEdit: (note: NoteView, onUpdateNote: (noteId: number, body: string, referenceUrl: string | null) => void) => (event: FormEvent<HTMLFormElement>) => void;

  // Create handler
  onCreateNote: (onCreateNote: (body: string, referenceUrl: string | null) => Promise<void>) => (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useNotesDetailSection(): UseNotesDetailSectionReturn {
  // Form state for adding new note
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteBody, setNewNoteBody] = useState('');
  const [newNoteReferenceUrl, setNewNoteReferenceUrl] = useState('');

  // Edit state for inline editing
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingBody, setEditingBody] = useState('');
  const [editingReferenceUrl, setEditingReferenceUrl] = useState('');

  const resetNewNoteForm = () => {
    setNewNoteBody('');
    setNewNoteReferenceUrl('');
    setIsAddingNote(false);
  };

  const onCancelEdit = () => {
    setEditingNoteId(null);
    setEditingBody('');
    setEditingReferenceUrl('');
  };

  const onStartEdit = (note: NoteView) => {
    setEditingNoteId(note.id);
    setEditingBody(note.body);
    setEditingReferenceUrl(note.referenceUrl ?? '');
  };

  const onSubmitEdit = (note: NoteView, onUpdateNote: (noteId: number, body: string, referenceUrl: string | null) => void) => {
    return (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = editingBody.trim();
      if (!trimmed) return;
      const ref = editingReferenceUrl.trim() || null;
      onUpdateNote?.(note.id, trimmed, ref);
      onCancelEdit();
    };
  };

  const handleCreateNote = (onCreateNote: (body: string, referenceUrl: string | null) => Promise<void>) => {
    return async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = newNoteBody.trim();
      if (!trimmed) return;
      const ref = newNoteReferenceUrl.trim() || null;
      await onCreateNote(trimmed, ref);
      resetNewNoteForm();
    };
  };

  return {
    // Form state
    isAddingNote,
    newNoteBody,
    newNoteReferenceUrl,
    setIsAddingNote,
    setNewNoteBody,
    setNewNoteReferenceUrl,
    resetNewNoteForm,

    // Edit state
    editingNoteId,
    editingBody,
    editingReferenceUrl,
    setEditingBody,
    setEditingReferenceUrl,

    // Edit handlers
    onStartEdit,
    onCancelEdit,
    onSubmitEdit,

    // Create handler
    onCreateNote: handleCreateNote,
  };
}
