import React, { useState, useEffect, ChangeEvent } from 'react';
import Modal from '../../components/Modal';
import { useStore } from '../../store';
import type { Task } from '../../types';
import { TrashIcon } from '../../components/Icons';
import { useTranslation } from '../../hooks/useTranslation';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  taskId?: string;
}

const reminderOptions = [
    { value: -1, label: 'reminder_none' },
    { value: 0, label: 'reminder_at_time' },
    { value: 5, label: 'reminder_5_min_before' },
    { value: 10, label: 'reminder_10_min_before' },
    { value: 30, label: 'reminder_30_min_before' },
    { value: 60, label: 'reminder_1_hour_before' },
    { value: 1440, label: 'reminder_1_day_before' },
];

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, listId, taskId }) => {
  const { todos, addTask, updateTask, deleteTask } = useStore();
  const { t } = useTranslation();
  const list = todos.find(l => l.id === listId);
  const task = list?.tasks.find(t => t.id === taskId);

  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    priority: 'medium',
    dueDate: '',
    tags: [],
    recurring: false,
    imageBase64: '',
    reminderOffset: -1,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        priority: task.priority || 'medium',
        dueDate: task.dueDate || '',
        tags: task.tags || [],
        recurring: task.recurring || false,
        imageBase64: task.imageBase64 || '',
        reminderOffset: task.reminderOffset ?? -1,
      });
    } else {
      setFormData({
        title: '',
        priority: 'medium',
        dueDate: '',
        tags: [],
        recurring: false,
        imageBase64: '',
        reminderOffset: -1,
      });
    }
  }, [task, taskId, isOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isChecked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    const finalValue = name === 'reminderOffset' ? Number(value) : (isChecked !== undefined ? isChecked : value);
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageBase64: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleTagChange = (e: ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setFormData(prev => ({ ...prev, tags }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    const finalData = { ...formData };
    if (finalData.reminderOffset === -1) {
        delete finalData.reminderOffset;
    }

    if (task) {
      updateTask(listId, { ...task, ...finalData });
    } else {
      addTask(listId, {
        id: `task-${Date.now()}`,
        completed: false,
        subtasks: [],
        ...finalData,
      } as Task);
    }
    onClose();
  };

  const handleDelete = () => {
    if (taskId) {
      deleteTask(listId, taskId);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'task_modal_edit_title' : 'task_modal_add_title'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-muted-foreground">{t('form_title')}</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full bg-input rounded-md border-border focus:ring-primary focus:border-primary" required />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-muted-foreground">{t('form_priority')}</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className="mt-1 block w-full bg-input rounded-md border-border focus:ring-primary focus:border-primary">
              <option value="low">{t('priority_low')}</option>
              <option value="medium">{t('priority_medium')}</option>
              <option value="high">{t('priority_high')}</option>
              <option value="critical">{t('priority_critical')}</option>
            </select>
          </div>
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-muted-foreground">{t('form_due_date')}</label>
            <input type="datetime-local" name="dueDate" value={formData.dueDate} onChange={handleChange} className="mt-1 block w-full bg-input rounded-md border-border focus:ring-primary focus:border-primary" />
          </div>
        </div>

        <div>
            <label htmlFor="reminderOffset" className="block text-sm font-medium text-muted-foreground">{t('form_reminder')}</label>
            <select name="reminderOffset" value={formData.reminderOffset} onChange={handleChange} disabled={!formData.dueDate} className="mt-1 block w-full bg-input rounded-md border-border focus:ring-primary focus:border-primary disabled:opacity-50">
                {reminderOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{t(opt.label)}</option>
                ))}
            </select>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-muted-foreground">{t('form_tags')}</label>
          <input type="text" name="tags" value={formData.tags?.join(', ')} onChange={handleTagChange} className="mt-1 block w-full bg-input rounded-md border-border focus:ring-primary focus:border-primary" />
        </div>

        <div>
            <label htmlFor="taskImage" className="block text-sm font-medium text-muted-foreground">{t('form_attach_image')}</label>
            <input type="file" id="taskImage" onChange={handleImageChange} accept="image/*" className="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
            {formData.imageBase64 && <img src={formData.imageBase64} alt="Preview" className="mt-2 rounded-md max-h-40"/>}
        </div>

        <div className="flex items-center gap-2">
            <input type="checkbox" name="recurring" checked={!!formData.recurring} onChange={handleChange} className="h-4 w-4 rounded text-primary bg-input border-border focus:ring-primary"/>
            <label htmlFor="recurring" className="text-sm font-medium text-muted-foreground">{t('form_recurring_task')}</label>
        </div>


        <div className="flex justify-between items-center pt-4">
          <div>
            {taskId && (
              <button type="button" onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md flex items-center gap-1">
                <TrashIcon className="w-4 h-4" /> {t('delete')}
              </button>
            )}
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

export default TaskModal;
