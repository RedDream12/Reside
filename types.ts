export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string; // Should be ISO string with date and time for reminders
  tags?: string[];
  recurring?: boolean;
  imageBase64?: string;
  subtasks: Subtask[];
  reminderOffset?: number; // in minutes
  reminderId?: string;
}

export interface TodoList {
  id: string;
  title: string;
  tasks: Task[];
  streak: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  log: Record<string, boolean>;
  streak: number;
}

export interface Settings {
  theme: 'light' | 'dark';
  primaryColor: string;
  fontSize: string;
  pomodoroWork: number;
  pomodoroBreak: number;
  language: 'en' | 'ar';
}

export interface User {
  name: string;
  email: string;
  passwordHash: string; // In a real app, this would be a secure hash
  profilePicture?: string; // base64 string
}

export interface UserData {
  settings: Settings;
  todos: TodoList[];
  notes: Note[];
  habits: Habit[];
  subscriptionExpiry: string; // ISO date string
  usedActivationCode: string;
}

export interface AppState extends Omit<UserData, 'subscriptionExpiry' | 'usedActivationCode'> {
  users: Record<string, { user: User, data: UserData }>;
  usedCodes: Record<string, string>; // Maps code -> user email
  currentUser: User | null;
  justSignedUp: boolean;

  setSettings: (settings: Partial<Settings>) => void;
  addTodoList: (title: string) => void;
  updateTodoList: (id: string, title: string) => void;
  deleteTodoList: (id: string) => void;
  addTask: (listId: string, task: Task) => void;
  updateTask: (listId: string, task: Task) => void;
  deleteTask: (listId: string, taskId: string) => void;
  toggleTaskCompletion: (listId: string, taskId: string) => void;
  toggleSubtaskCompletion: (listId: string, taskId: string, subtaskId: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  addHabit: (habit: Omit<Habit, 'streak' | 'log'>) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string, date: string) => void;
  applySettings: () => void;
  
  // Auth
  signup: (user: Omit<User, 'passwordHash'>, password: string, code: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  reactivateAccount: (email: string, code: string) => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'profilePicture'>>) => void;
  clearJustSignedUp: () => void;
}
