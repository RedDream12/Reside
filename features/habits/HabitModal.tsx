import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HabitModal: React.FC<HabitModalProps> = ({ isOpen, onClose }) => {
  const { addHabit } = useStore();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  
  useEffect(() => {
      if(isOpen) {
          setName('');
      }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addHabit({ id: `habit-${Date.now()}`, name });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="habit_modal_add_title">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="habit-name" className="block text-sm font-medium text-muted-foreground">{t('habit_modal_name_label')}</label>
          <input
            id="habit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full bg-input rounded-md border-border focus:ring-primary focus:border-primary"
            required
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">{t('cancel')}</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90">{t('save')}</button>
        </div>
      </form>
    </Modal>
  );
};

export default HabitModal;
