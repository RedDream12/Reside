import React from 'react';
import { useStore } from '../../store';
import { Note } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface NotesViewProps {
  openModal: (type: 'note', params?: any) => void;
}

const NoteCard: React.FC<{ note: Note; onClick: () => void; style: React.CSSProperties }> = ({ note, onClick, style }) => {
  const { t } = useTranslation();
  const preview = note.content.replace(/#+\s/g, '').substring(0, 150);
  return (
    <div
      onClick={onClick}
      className="bg-card rounded-xl shadow-sm border border-border p-4 cursor-pointer hover:border-primary transition-all duration-200 flex flex-col justify-between animate-fade-in-up"
      style={style}
    >
        <div>
            <h3 className="font-bold text-foreground mb-2 truncate">{note.title || t('notes_untitled')}</h3>
            <p className="text-foreground/80 text-sm whitespace-pre-wrap break-words">{preview}{note.content.length > 150 ? '...' : ''}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-4 pt-2 border-t border-border">{new Date(note.createdAt).toLocaleString()}</p>
    </div>
  );
};

const NotesView: React.FC<NotesViewProps> = ({ openModal }) => {
  const { notes } = useStore();
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <button 
        onClick={() => openModal('note')}
        className="w-full bg-card border border-border text-foreground rounded-lg py-2.5 hover:bg-muted transition-colors font-medium"
      >
        {t('notes_add_new')}
      </button>

      {notes.length === 0 ? (
        <div className="text-center text-muted-foreground mt-8 animate-fade-in">
            <p className="font-medium">{t('notes_no_notes_title')}</p>
            <p className="text-sm">{t('notes_no_notes_subtitle')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {notes.map((note, index) => (
            <NoteCard 
                key={note.id} 
                note={note} 
                onClick={() => openModal('note', { noteId: note.id })}
                style={{ animationDelay: `${index * 50}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesView;
