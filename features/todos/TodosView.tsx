import React from 'react';
import { useStore } from '../../store';
import TaskItem from './TaskItem';
import { TrashIcon } from '../../components/Icons';
import { useTranslation } from '../../hooks/useTranslation';

interface TodosViewProps {
  openModal: (type: 'task' | 'list', params?: any) => void;
}

const TodosView: React.FC<TodosViewProps> = ({ openModal }) => {
  const { todos, deleteTodoList } = useStore();
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <button 
        onClick={() => openModal('list')}
        className="w-full bg-card border border-border text-foreground rounded-lg py-2.5 hover:bg-muted transition-colors font-medium"
      >
        {t('todos_add_new_list')}
      </button>

      {todos.length === 0 && (
        <div className="text-center text-muted-foreground mt-8 animate-fade-in">
            <p className="font-medium">{t('todos_no_lists_title')}</p>
            <p className="text-sm">{t('todos_no_lists_subtitle')}</p>
        </div>
      )}

      {todos.map((list, index) => {
        const totalTasks = list.tasks.flatMap(t => [t, ...(t.subtasks || [])]).length;
        const completedTasks = list.tasks.flatMap(t => [t, ...(t.subtasks || [])]).filter(t => t.completed).length;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        return (
          <div key={list.id} 
               className="bg-card rounded-xl shadow-sm border border-border p-4 animate-fade-in-up" 
               style={{ animationDelay: `${index * 50}ms` }}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-lg cursor-pointer hover:text-primary transition-colors" onClick={() => openModal('list', { listId: list.id })}>{list.title}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-amber-500 flex items-center gap-1">🔥 {list.streak || 0}</span>
                <button 
                  onClick={() => deleteTodoList(list.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                  aria-label={`${t('delete_list')} ${list.title}`}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="w-full bg-muted rounded-full h-2 mb-3">
              <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="space-y-1">
              {list.tasks.map(task => (
                <TaskItem key={task.id} task={task} listId={list.id} openModal={openModal} />
              ))}
            </div>
            
            <button
              onClick={() => openModal('task', { listId: list.id })}
              className="w-full mt-3 text-sm font-medium text-primary hover:bg-primary/10 rounded-md py-2 transition-colors"
            >
              + {t('todos_add_task')}
            </button>
          </div>
        )
      })}
    </div>
  );
};

export default TodosView;
