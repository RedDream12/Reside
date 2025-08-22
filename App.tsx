import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import Layout from './components/Layout';
import TodosView from './features/todos/TodosView';
import CalendarView from './features/calendar/CalendarView';
import NotesView from './features/notes/NotesView';
import HabitsView from './features/habits/HabitsView';
import SettingsView from './features/settings/SettingsView';
import { AddIcon } from './components/Icons';
import TaskModal from './features/todos/TaskModal';
import NoteModal from './features/notes/NoteModal';
import HabitModal from './features/habits/HabitModal';
import ListModal from './features/todos/ListModal';
import AuthView from './features/auth/AuthView';
import WelcomeView from './features/auth/WelcomeView';
import { useNotifications } from './hooks/useNotifications';
import { useTranslation } from './hooks/useTranslation';

type View = 'todos' | 'calendar' | 'notes' | 'habits' | 'settings';
type ModalType = 'task' | 'note' | 'habit' | 'list' | null;

const App: React.FC = () => {
  const { settings, applySettings, todos, currentUser, justSignedUp, clearJustSignedUp } = useStore();
  const [currentView, setCurrentView] = useState<View>('todos');
  const [modal, setModal] = useState<ModalType>(null);
  const [modalParams, setModalParams] = useState<any>({});
  const { requestPermission, scheduleAllReminders } = useNotifications();
  const { t, isLoaded } = useTranslation();

  useEffect(() => {
    if (currentUser) {
      applySettings();
      requestPermission();
      scheduleAllReminders(todos.flatMap(list => list.tasks));
    }
  }, [settings, applySettings, currentUser, todos, requestPermission, scheduleAllReminders]);

  const openModal = (type: ModalType, params = {}) => {
    setModal(type);
    setModalParams(params);
  };

  const closeModal = () => {
    setModal(null);
    setModalParams({});
  };

  if (!isLoaded) {
    return <div className="w-full h-full flex items-center justify-center bg-background"><p>Loading...</p></div>;
  }

  if (!currentUser) {
    return <AuthView />;
  }

  if (justSignedUp) {
    return <WelcomeView onFinish={clearJustSignedUp} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'todos':
        return <TodosView openModal={openModal} />;
      case 'calendar':
        return <CalendarView openModal={openModal} />;
      case 'notes':
        return <NotesView openModal={openModal} />;
      case 'habits':
        return <HabitsView openModal={openModal} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TodosView openModal={openModal} />;
    }
  };

  const handleFabClick = () => {
    switch (currentView) {
      case 'todos':
        if (todos.length > 0) {
          openModal('task', { listId: todos[0].id });
        } else {
          openModal('list');
        }
        break;
      case 'notes':
        openModal('note');
        break;
      case 'habits':
        openModal('habit');
        break;
      default:
        break;
    }
  };

  const showFab = ['todos', 'notes', 'habits'].includes(currentView);

  return (
    <>
      <Layout currentView={currentView} setCurrentView={setCurrentView}>
        <main className="flex-grow overflow-y-auto p-4 pb-24">
          {renderView()}
        </main>
      </Layout>

      {showFab && (
        <button
          onClick={handleFabClick}
          className="fixed bottom-20 right-5 rtl:right-auto rtl:left-5 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all transform active:scale-95 z-50 animate-scale-in"
          aria-label={t('fab_add_item')}
        >
          <AddIcon className="w-8 h-8" />
        </button>
      )}
      
      {modal === 'task' && <TaskModal isOpen={true} onClose={closeModal} {...modalParams} />}
      {modal === 'note' && <NoteModal isOpen={true} onClose={closeModal} {...modalParams} />}
      {modal === 'habit' && <HabitModal isOpen={true} onClose={closeModal} {...modalParams} />}
      {modal === 'list' && <ListModal isOpen={true} onClose={closeModal} {...modalParams} />}

    </>
  );
};

export default App;
