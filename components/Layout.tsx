import React from 'react';
import { TodoIcon, CalendarIcon, NotesIcon, HabitsIcon, SettingsIcon } from './Icons';
import { useTranslation } from '../hooks/useTranslation';

type View = 'todos' | 'calendar' | 'notes' | 'habits' | 'settings';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  setCurrentView: (view: View) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setCurrentView }) => {
  const { t } = useTranslation();

  const navItems = [
    { id: 'todos', label: t('nav_todos'), icon: TodoIcon },
    { id: 'calendar', label: t('nav_calendar'), icon: CalendarIcon },
    { id: 'notes', label: t('nav_notes'), icon: NotesIcon },
    { id: 'habits', label: t('nav_habits'), icon: HabitsIcon },
    { id: 'settings', label: t('nav_settings'), icon: SettingsIcon },
  ] as const;

  const getHeaderTitle = (view: View) => {
    return navItems.find(item => item.id === view)?.label || 'RERANGE';
  }

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto bg-background">
      <header className="flex-shrink-0 bg-background/80 backdrop-blur-lg border-b border-border text-center font-bold text-lg py-3 sticky top-0 z-10">
        <h1>{getHeaderTitle(currentView)}</h1>
      </header>
      
      {children}

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-t border-border flex justify-around items-center max-w-2xl mx-auto z-10">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`relative flex flex-col items-center justify-center w-full h-full transition-colors duration-200 group focus:outline-none`}
            aria-current={currentView === item.id}
            aria-label={item.label}
          >
            <div className={`flex items-center justify-center h-8 px-4 rounded-full transition-all duration-200 ${currentView === item.id ? 'bg-primary/10' : 'group-hover:bg-muted'}`}>
                <item.icon className={`w-6 h-6 transition-colors duration-200 ${currentView === item.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
            </div>
            <span className={`text-xs font-medium transition-colors duration-200 ${currentView === item.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
