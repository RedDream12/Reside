import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import TaskItem from '../todos/TaskItem';
import { ChevronLeftIcon, ChevronRightIcon, AddIcon } from '../../components/Icons';
import { getDateString } from '../../lib/dateUtils';
import { useTranslation } from '../../hooks/useTranslation';

type CalendarViewMode = 'month' | 'week' | 'day';

interface CalendarViewProps {
  openModal: (type: 'task' | 'list', params?: any) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ openModal }) => {
  const { todos, settings } = useStore();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const locale = settings.language;

  const tasksByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    todos.forEach(list => {
      list.tasks.forEach(task => {
        if (task.dueDate) {
          const dateKey = task.dueDate.split('T')[0];
          const tasks = map.get(dateKey) || [];
          tasks.push({ ...task, listId: list.id });
          map.set(dateKey, tasks);
        }
      });
    });
    return map;
  }, [todos]);

  const changeDate = (amount: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'day') newDate.setDate(newDate.getDate() + amount);
      if (viewMode === 'week') newDate.setDate(newDate.getDate() + (amount * 7));
      if (viewMode === 'month') {
        newDate.setDate(1);
        newDate.setMonth(newDate.getMonth() + amount);
      }
      return newDate;
    });
  };
  
  const handleAddTask = (date: Date) => {
    if(todos.length === 0) {
        alert(t('calendar_create_list_prompt'));
        openModal('list');
    } else {
        openModal('task', { listId: todos[0].id, dueDate: date.toISOString().slice(0, 16) });
    }
  };

  const getHeaderTitle = () => {
    switch (viewMode) {
      case 'day': return currentDate.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
      case 'week':
        const start = new Date(currentDate);
        start.setDate(start.getDate() - start.getDay());
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return `${start.toLocaleString(locale, { month: 'short', day: 'numeric' })} - ${end.toLocaleString(locale, { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`;
      case 'month': return currentDate.toLocaleString(locale, { month: 'long', year: 'numeric' });
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="bg-card rounded-xl shadow-sm border border-border p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
            <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-muted"><ChevronLeftIcon className="w-5 h-5 rtl-flip"/></button>
            <h2 className="font-bold text-lg text-center">{getHeaderTitle()}</h2>
            <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-muted"><ChevronRightIcon className="w-5 h-5 rtl-flip"/></button>
        </div>
        {/* View Mode Toggle */}
        <div className="flex justify-center bg-muted p-1 rounded-lg mb-4">
            {(['day', 'week', 'month'] as CalendarViewMode[]).map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)} className={`w-full capitalize px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === mode ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                    {t(`calendar_view_${mode}`)}
                </button>
            ))}
        </div>
        {viewMode === 'month' && <MonthGrid currentDate={currentDate} tasksByDate={tasksByDate} onDateClick={(date) => { setCurrentDate(date); setViewMode('day'); }} locale={locale} />}
        {viewMode === 'week' && <WeekGrid currentDate={currentDate} tasksByDate={tasksByDate} onAddTask={handleAddTask} openModal={openModal} locale={locale} />}
        {viewMode === 'day' && <DayView currentDate={currentDate} tasks={tasksByDate.get(getDateString(currentDate)) || []} onAddTask={handleAddTask} openModal={openModal} />}
      </div>
    </div>
  );
};

// --- MONTH GRID ---
const MonthGrid = ({ currentDate, tasksByDate, onDateClick, locale }: any) => {
    const { t } = useTranslation();
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay());
    const endDate = new Date(monthEnd);
    if (monthEnd.getDay() !== 6) {
        endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));
    }

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const dayKey = getDateString(cloneDay);
        const isToday = new Date().toDateString() === cloneDay.toDateString();
        const isCurrentMonth = cloneDay.getMonth() === currentDate.getMonth();

        days.push(
          <div key={day.toString()} className="py-1 flex justify-center items-center">
            <button
              onClick={() => onDateClick(cloneDay)}
              className={`w-9 h-9 rounded-full mx-auto flex items-center justify-center relative text-sm font-medium transition-colors
                ${!isCurrentMonth ? 'text-muted-foreground/50' : 'text-foreground'}
                ${isToday ? 'bg-secondary font-bold' : ''}
                hover:bg-muted
              `}
            >
              {cloneDay.getDate()}
              {tasksByDate.has(dayKey) && (
                <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary`}></span>
              )}
            </button>
          </div>
        );
        day.setDate(day.getDate() + 1);
      }
      rows.push(<div className="grid grid-cols-7" key={day.toString()}>{days}</div>);
      days = [];
    }
    const dayNames = {
        'en': ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        'ar': ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س']
    };
    return <>
        <div className="grid grid-cols-7 text-center text-sm text-muted-foreground font-medium mb-2">
            {dayNames[locale].map(day => <div key={day}>{day}</div>)}
        </div>
        <div>{rows}</div>
    </>;
};

// --- WEEK GRID ---
const WeekGrid = ({ currentDate, tasksByDate, onAddTask, openModal, locale }: any) => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(date.getDate() + i);
        return date;
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {days.map(day => {
                const dayKey = getDateString(day);
                const tasks = tasksByDate.get(dayKey) || [];
                const isToday = new Date().toDateString() === day.toDateString();
                return (
                    <div key={dayKey} className="bg-muted/50 rounded-lg p-2 flex flex-col">
                        <div className={`text-center font-semibold text-sm mb-2 ${isToday ? 'text-primary' : ''}`}>
                            <p className="text-xs text-muted-foreground">{day.toLocaleDateString(locale, { weekday: 'short' })}</p>
                            {day.getDate()}
                        </div>
                        <div className="space-y-1 flex-grow">
                            {tasks.map((task: any) => <div key={task.id} onClick={() => openModal('task', { listId: task.listId, taskId: task.id })} className="text-xs bg-background p-1.5 rounded-md cursor-pointer hover:bg-primary/10 truncate">{task.title}</div>)}
                        </div>
                        <button onClick={() => onAddTask(day)} className="mt-2 w-full flex items-center justify-center p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors">
                            <AddIcon className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

// --- DAY VIEW ---
const DayView = ({ tasks, onAddTask, openModal }: any) => {
    const { t } = useTranslation();
    return (
        <div>
            <button onClick={() => onAddTask(new Date())} className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary font-semibold py-2 rounded-lg hover:bg-primary/20 transition-colors">
                <AddIcon className="w-5 h-5"/> {t('calendar_add_task_for_day')}
            </button>
            {tasks.length > 0 ? (
                <div className="space-y-1 mt-4">
                    {tasks.map((task: any) => (
                        <TaskItem key={task.id} task={task} listId={task.listId} openModal={openModal} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    <p className="font-medium">{t('calendar_no_tasks_title')}</p>
                    <p className="text-sm">{t('calendar_no_tasks_subtitle')}</p>
                </div>
            )}
        </div>
    );
};

export default CalendarView;
