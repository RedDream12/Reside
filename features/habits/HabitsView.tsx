import React from 'react';
import { useStore } from '../../store';
import { getDateString } from '../../lib/dateUtils';
import { TrashIcon, CheckIcon } from '../../components/Icons';
import { useTranslation } from '../../hooks/useTranslation';

interface HabitsViewProps {
  openModal: (type: 'habit', params?: any) => void;
}

const HabitGrid = ({ log }: { log: Record<string, boolean> }) => {
    const days = Array.from({ length: 35 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return getDateString(date);
    }).reverse();

    return (
        <div className="grid grid-cols-7 gap-1.5 mt-3">
            {days.map(day => (
                <div key={day} title={day} className={`w-full aspect-square rounded-sm transition-colors ${log[day] ? 'bg-success' : 'bg-muted'}`}></div>
            ))}
        </div>
    );
};

const HabitsView: React.FC<HabitsViewProps> = ({ openModal }) => {
  const { habits, toggleHabit, deleteHabit } = useStore();
  const { t } = useTranslation();
  const todayStr = getDateString(new Date());

  return (
    <div className="space-y-4">
      <button 
        onClick={() => openModal('habit')}
        className="w-full bg-card border border-border text-foreground rounded-lg py-2.5 hover:bg-muted transition-colors font-medium"
      >
        {t('habits_add_new')}
      </button>

      {habits.length === 0 ? (
         <div className="text-center text-muted-foreground mt-8 animate-fade-in">
            <p className="font-medium">{t('habits_no_habits_title')}</p>
            <p className="text-sm">{t('habits_no_habits_subtitle')}</p>
        </div>
      ) : (
        habits.map((habit, index) => (
          <div key={habit.id} className="bg-card rounded-xl shadow-sm border border-border p-4 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{habit.name}</h3>
                <p className="text-sm font-medium text-amber-500">{t('habits_streak')}: 🔥 {habit.streak}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => toggleHabit(habit.id, todayStr)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all ${!!habit.log[todayStr] ? 'bg-success border-success' : 'bg-muted border-muted'}`}
                >
                    {!!habit.log[todayStr] && <CheckIcon className="w-6 h-6 text-white" />}
                </button>
              </div>
            </div>
            <HabitGrid log={habit.log} />
          </div>
        ))
      )}
    </div>
  );
};

export default HabitsView;
