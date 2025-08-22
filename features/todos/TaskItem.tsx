import React, { useState } from 'react';
import { Task } from '../../types';
import { useStore } from '../../store';
import { breakdownTaskIntoSubtasks } from '../../services/geminiService';
import { SparklesIcon, CheckIcon, PriorityFlagIcon, DateIcon, TagIcon, RecurringIcon } from '../../components/Icons';

interface TaskItemProps {
  task: Task;
  listId: string;
  openModal: (type: 'task', params: { listId: string; taskId: string }) => void;
}

const priorityMap: { [key: string]: { iconClass: string; textClass: string; } } = {
  low: { iconClass: 'text-success', textClass: 'text-success' },
  medium: { iconClass: 'text-warning', textClass: 'text-warning' },
  high: { iconClass: 'text-destructive', textClass: 'text-destructive' },
  critical: { iconClass: 'text-critical', textClass: 'text-critical' },
};


const TaskItem: React.FC<TaskItemProps> = ({ task, listId, openModal }) => {
  const { toggleTaskCompletion, toggleSubtaskCompletion, updateTask } = useStore();
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  
  const handleAiBreakdown = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBreakingDown(true);
    try {
      const subtaskTitles = await breakdownTaskIntoSubtasks(task.title);
      const newSubtasks = subtaskTitles.map(st => ({
        id: `subtask-${Date.now()}-${Math.random()}`,
        title: st.title,
        completed: false,
      }));
      updateTask(listId, { ...task, subtasks: [...task.subtasks, ...newSubtasks] });
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setIsBreakingDown(false);
    }
  };
  
  const priorityInfo = task.priority ? priorityMap[task.priority] : null;

  return (
    <div className="group animate-fade-in-up">
        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
          <button
            onClick={() => toggleTaskCompletion(listId, task.id)}
            className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
              ${task.completed ? 'bg-primary border-primary' : 'border-border group-hover:border-muted-foreground'}`}
          >
            {task.completed && <CheckIcon className="w-3 h-3 text-primary-foreground" />}
          </button>
          
          <div className="flex-grow cursor-pointer pt-0.5" onClick={() => openModal('task', { listId, taskId: task.id })}>
            <p className={`${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</p>
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
              {task.dueDate && <span className="flex items-center gap-1"><DateIcon className="w-3.5 h-3.5" /> {task.dueDate}</span>}
              {priorityInfo && <span className={`flex items-center gap-1 font-medium ${priorityInfo.textClass}`}><PriorityFlagIcon className="w-3.5 h-3.5" /> {task.priority}</span>}
              {task.tags && task.tags.length > 0 && <span className="flex items-center gap-1"><TagIcon className="w-3.5 h-3.5" /> {task.tags.join(', ')}</span>}
              {task.recurring && <span className="flex items-center gap-1"><RecurringIcon className="w-3.5 h-3.5" /> Recurring</span>}
            </div>
          </div>
          
          <button 
            onClick={handleAiBreakdown}
            disabled={isBreakingDown}
            className="p-1 text-muted-foreground hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed group-hover:opacity-100 opacity-0 transition-opacity"
            title="Breakdown task with AI"
          >
            {isBreakingDown 
              ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              : <SparklesIcon className="w-5 h-5"/>
            }
          </button>
        </div>

        {task.subtasks && task.subtasks.length > 0 && (
        <div className="ml-5 pl-5 border-l-2 border-border space-y-1 py-1">
          {task.subtasks.map(subtask => (
            <div key={subtask.id} className="flex items-center gap-3 p-1 rounded-md hover:bg-muted transition-colors">
               <button
                 onClick={() => toggleSubtaskCompletion(listId, task.id, subtask.id)}
                 className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all duration-200
                   ${subtask.completed ? 'bg-primary border-primary' : 'border-border group-hover:border-muted-foreground'}`}
               >
                 {subtask.completed && <CheckIcon className="w-2.5 h-2.5 text-primary-foreground" />}
               </button>
              <p className={`flex-grow text-sm ${subtask.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {subtask.title}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskItem;