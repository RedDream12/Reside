import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { useStore } from '../../store';

interface ListModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId?: string;
}

const ListModal: React.FC<ListModalProps> = ({ isOpen, onClose, listId }) => {
  const { todos, addTodoList, updateTodoList } = useStore();
  const list = todos.find(l => l.id === listId);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(list?.title || '');
    }
  }, [list, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (list) {
      updateTodoList(listId!, title);
    } else {
      addTodoList(title);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={list ? 'Edit List' : 'Add New List'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="list-title" className="block text-sm font-medium text-muted-foreground">List Title</label>
          <input
            id="list-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full bg-input rounded-md border-border focus:ring-primary focus:border-primary"
            required
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90">Save</button>
        </div>
      </form>
    </Modal>
  );
};

export default ListModal;