import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { useStore } from '../../store';
import type { Note } from '../../types';
import { TrashIcon, SparklesIcon } from '../../components/Icons';
import { summarizeNote } from '../../services/geminiService';
import { useTranslation } from '../../hooks/useTranslation';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId?: string;
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, noteId }) => {
  const { notes, addNote, updateNote, deleteNote } = useStore();
  const { t } = useTranslation();
  const note = notes.find(n => n.id === noteId);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setTitle(note?.title || '');
        setContent(note?.content || '');
    }
  }, [note, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !title.trim()) return;

    if (note) {
      updateNote({ ...note, title, content });
    } else {
      addNote({ title, content });
    }
    onClose();
  };
  
  const handleSummarize = async () => {
    if(!content.trim()) return;
    setIsSummarizing(true);
    try {
        const summary = await summarizeNote(content);
        const newContent = `## ${t('ai_summary')}\n${summary}\n\n---\n\n${content}`;
        setContent(newContent);
    } catch (error) {
        console.error(error);
        alert((error as Error).message);
    } finally {
        setIsSummarizing(false);
    }
  };

  const handleDelete = () => {
    if (noteId) {
      deleteNote(noteId);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={note ? 'note_modal_edit_title' : 'note_modal_add_title'}>
      <form onSubmit={handleSubmit} className="space-y-4 flex flex-col h-[70vh]">
        <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('note_modal_title_placeholder')}
            className="w-full bg-input rounded-md border-border focus:ring-primary focus:border-primary p-2 font-semibold text-lg"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-grow w-full bg-input rounded-md border-border focus:ring-primary focus:border-primary p-2 resize-none"
          placeholder={t('note_modal_content_placeholder')}
        />
        <div className="flex justify-between items-center pt-2 flex-shrink-0">
          <div className="flex gap-2">
            {noteId && (
              <button type="button" onClick={handleDelete} className="px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md flex items-center gap-1">
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
             <button type="button" onClick={handleSummarize} disabled={isSummarizing || !content.trim()} className="px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-md flex items-center gap-1 disabled:opacity-50">
                <SparklesIcon className="w-4 h-4" /> {t('summarize')}
              </button>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90">{t('save')}</button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default NoteModal;
