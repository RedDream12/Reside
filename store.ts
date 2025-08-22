import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AppState, User, UserData, Task } from './types';
import { calculateStreak } from './lib/dateUtils';
import { scheduleNotification, cancelNotification } from './hooks/useNotifications';

// --- In a real app, use a proper hashing library like bcrypt ---
const simpleHash = async (password: string) => {
    // This is NOT secure and is for demonstration purposes only.
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
};

const getFutureDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const createDefaultUserData = (code: string): UserData => ({
  settings: {
    theme: 'dark',
    primaryColor: '#00bfff', // electric blue
    fontSize: '16px',
    pomodoroWork: 25,
    pomodoroBreak: 5,
    language: 'en',
  },
  todos: [{ id: `list-welcome`, title: "My First List", tasks: [], streak: 0 }],
  notes: [],
  habits: [],
  subscriptionExpiry: getFutureDate(30),
  usedActivationCode: code,
});

const initialState: Pick<AppState, 'settings' | 'todos' | 'notes' | 'habits' | 'currentUser' | 'users' | 'usedCodes' | 'justSignedUp'> = {
  settings: createDefaultUserData('').settings,
  todos: [],
  notes: [],
  habits: [],
  currentUser: null,
  users: {},
  usedCodes: {},
  justSignedUp: false,
};

export const useStore = create<AppState>()(
  persist(
    immer((set, get) => ({
      ...initialState,
      setSettings: (newSettings) => set((state) => {
        if (!state.currentUser) return;
        state.settings = { ...state.settings, ...newSettings };
        state.users[state.currentUser.email].data.settings = state.settings;
        
        // Immediately apply language settings for responsiveness
        if (newSettings.language) {
            document.documentElement.lang = newSettings.language;
            document.documentElement.dir = newSettings.language === 'ar' ? 'rtl' : 'ltr';
        }
      }),
      applySettings: () => {
        const { settings } = get();
        if (!settings) return;
        const { primaryColor, fontSize, language } = settings;
        const root = document.documentElement;
        
        root.lang = language;
        root.dir = language === 'ar' ? 'rtl' : 'ltr';

        const hexToHsl = (hex: string) => {
          let r = 0, g = 0, b = 0;
          if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16);
          } else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16); g = parseInt(hex.substring(3, 5), 16); b = parseInt(hex.substring(5, 7), 16);
          }
          r /= 255; g /= 255; b /= 255;
          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          let h = 0, s = 0, l = (max + min) / 2;
          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
          }
          return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
        };
        
        const primaryHsl = hexToHsl(primaryColor);
        root.style.setProperty('--primary', `${primaryHsl.h} ${primaryHsl.s}% ${primaryHsl.l}%`);
        root.style.setProperty('--ring', `${primaryHsl.h} ${primaryHsl.s}% ${primaryHsl.l}%`);
        const isDark = primaryHsl.l < 50;
        root.style.setProperty('--primary-foreground', `0 0% ${isDark ? '98%' : '10%'}`);
        document.body.style.fontSize = fontSize;
      },
      // === TODOS ===
      addTodoList: (title) => set((state) => {
        if (!state.currentUser) return;
        state.todos.push({ id: `list-${Date.now()}`, title, tasks: [], streak: 0 });
      }),
      updateTodoList: (id, title) => set(state => {
        const list = state.todos.find(l => l.id === id);
        if (list) list.title = title;
      }),
      deleteTodoList: (id) => set((state) => {
        const list = state.todos.find(l => l.id === id);
        if (list) {
            list.tasks.forEach(task => {
                if (task.reminderId) cancelNotification(task.reminderId);
            });
        }
        state.todos = state.todos.filter(list => list.id !== id);
      }),
      addTask: (listId, task) => set((state) => {
        const list = state.todos.find(l => l.id === listId);
        if (list) {
            const reminderId = scheduleNotification(task);
            const newTask = { ...task, reminderId };
            list.tasks.push(newTask);
        }
      }),
      updateTask: (listId, updatedTask) => set((state) => {
        const list = state.todos.find(l => l.id === listId);
        if (list) {
          const taskIndex = list.tasks.findIndex(t => t.id === updatedTask.id);
          if (taskIndex > -1) {
              const oldTask = list.tasks[taskIndex];
              if (oldTask.reminderId) {
                  cancelNotification(oldTask.reminderId);
              }
              const reminderId = scheduleNotification(updatedTask);
              list.tasks[taskIndex] = { ...updatedTask, reminderId };
          }
        }
      }),
      deleteTask: (listId, taskId) => set((state) => {
        const list = state.todos.find(l => l.id === listId);
        if (list) {
            const task = list.tasks.find(t => t.id === taskId);
            if (task?.reminderId) {
                cancelNotification(task.reminderId);
            }
            list.tasks = list.tasks.filter(t => t.id !== taskId);
        }
      }),
      toggleTaskCompletion: (listId, taskId) => set(state => {
        const list = state.todos.find(l => l.id === listId);
        const task = list?.tasks.find(t => t.id === taskId);
        if(task) task.completed = !task.completed;
      }),
      toggleSubtaskCompletion: (listId, taskId, subtaskId) => set(state => {
        const list = state.todos.find(l => l.id === listId);
        const task = list?.tasks.find(t => t.id === taskId);
        const subtask = task?.subtasks.find(st => st.id === subtaskId);
        if(subtask) subtask.completed = !subtask.completed;
      }),
      // === NOTES ===
      addNote: (note) => set((state) => { 
        if (!state.currentUser) return;
        state.notes.unshift({
            ...note,
            id: `note-${Date.now()}`,
            createdAt: new Date().toISOString()
        }); 
      }),
      updateNote: (updatedNote) => set((state) => {
        const noteIndex = state.notes.findIndex(n => n.id === updatedNote.id);
        if (noteIndex > -1) state.notes[noteIndex] = updatedNote;
      }),
      deleteNote: (id) => set((state) => {
        state.notes = state.notes.filter(n => n.id !== id);
      }),
      // === HABITS ===
      addHabit: (habit) => set((state) => {
        if (!state.currentUser) return;
        state.habits.push({ ...habit, log: {}, streak: 0 });
      }),
      deleteHabit: (id) => set((state) => {
        state.habits = state.habits.filter(h => h.id !== id);
      }),
      toggleHabit: (id, date) => set((state) => {
        const habit = state.habits.find(h => h.id === id);
        if (habit) {
          habit.log[date] = !habit.log[date];
          habit.streak = calculateStreak(habit.log);
        }
      }),
      // === AUTH ===
      signup: async (user, password, code) => {
        const { users, usedCodes } = get();
        if (code !== 'YL10') throw new Error("Invalid activation code.");
        if (usedCodes[code]) throw new Error("This activation code has already been used.");
        if (users[user.email]) throw new Error("User with this email already exists.");
        
        const passwordHash = await simpleHash(password);
        const newUser: User = { ...user, passwordHash };
        const newUserData = createDefaultUserData(code);

        set(state => {
          state.users[user.email] = { user: newUser, data: newUserData };
          state.usedCodes[code] = user.email;
          state.currentUser = newUser;
          // Hydrate top-level state
          state.settings = newUserData.settings;
          state.todos = newUserData.todos;
          state.notes = newUserData.notes;
          state.habits = newUserData.habits;
          state.justSignedUp = true;
        });
      },
      login: async (email, password) => {
        const { users } = get();
        const userAccount = users[email];
        if (!userAccount) throw new Error("User not found.");
        
        const passwordHash = await simpleHash(password);
        if (passwordHash !== userAccount.user.passwordHash) throw new Error("Invalid password.");
        
        if (new Date() > new Date(userAccount.data.subscriptionExpiry)) {
            throw new Error("Subscription expired");
        }

        set(state => {
            state.currentUser = userAccount.user;
            // Hydrate top-level state
            const userData = userAccount.data;
            state.settings = userData.settings;
            state.todos = userData.todos;
            state.notes = userData.notes;
            state.habits = userData.habits;
            state.justSignedUp = false;
        });
      },
      logout: () => {
        set(state => {
          // Before logging out, save the current user's data back to the users object
          if (state.currentUser) {
              const currentUserEmail = state.currentUser.email;
              if (state.users[currentUserEmail]) {
                  state.users[currentUserEmail].data.settings = state.settings;
                  state.users[currentUserEmail].data.todos = state.todos;
                  state.users[currentUserEmail].data.notes = state.notes;
                  state.users[currentUserEmail].data.habits = state.habits;
              }
          }
          state.currentUser = null;
          // Reset top-level state to defaults
          state.settings = createDefaultUserData('').settings;
          state.todos = [];
          state.notes = [];
          state.habits = [];
          state.justSignedUp = false;
        });
      },
      reactivateAccount: async (email, code) => {
          const { users, usedCodes, login } = get();
          if (code !== 'YL10') throw new Error("Invalid activation code.");
          if (usedCodes[code]) throw new Error("This activation code has already been used.");
          
          const userAccount = users[email];
          if (!userAccount) throw new Error("User not found.");

          set(state => {
              const newExpiry = getFutureDate(30);
              state.users[email].data.subscriptionExpiry = newExpiry;
              state.users[email].data.usedActivationCode = code;
              state.usedCodes[code] = email;
          });
          
          // Attempt to log the user in again automatically after reactivation
          await login(userAccount.user.email, "dummy_password_for_relogin");
      },
      updateProfile: (updates) => set(state => {
          if (!state.currentUser) return;
          const currentUserEmail = state.currentUser.email;
          const updatedUser = { ...state.users[currentUserEmail].user, ...updates };
          
          state.users[currentUserEmail].user = updatedUser;
          state.currentUser = updatedUser;
      }),
      clearJustSignedUp: () => set({ justSignedUp: false }),
    })),
    {
      name: 'rerange-auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Persist users map, used codes, and current user info
      partialize: (state) => ({ users: state.users, usedCodes: state.usedCodes, currentUser: state.currentUser }),
      // On rehydration, if a user was logged in, load their data
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate from storage:", error);
        } else if (state?.currentUser?.email) {
          const userAccount = state.users[state.currentUser.email];
          if (userAccount) {
            // Check for subscription expiry on rehydration
            if (new Date() > new Date(userAccount.data.subscriptionExpiry)) {
              console.log("User subscription expired on load. Logging out.");
              state.currentUser = null; // Log out the user
              return;
            }
            state.settings = userAccount.data.settings;
            state.todos = userAccount.data.todos;
            state.notes = userAccount.data.notes;
            state.habits = userAccount.data.habits;
          } else {
            // User existed but their data is gone, log them out.
            state.currentUser = null;
          }
        }
      },
    }
  )
);
// A little hack for reactivateAccount to call login without needing the password
useStore.subscribe(
  (state, prevState) => {
    if (prevState.login !== state.login && state.reactivateAccount.toString().includes("dummy_password_for_relogin")) {
      const originalLogin = state.login;
      // @ts-ignore
      state.login = async (email, password) => {
        if (password === "dummy_password_for_relogin") {
          const userAccount = useStore.getState().users[email];
          if (!userAccount) throw new Error("User not found.");
          useStore.setState(s => {
            s.currentUser = userAccount.user;
            s.settings = userAccount.data.settings;
            s.todos = userAccount.data.todos;
            s.notes = userAccount.data.notes;
            s.habits = userAccount.data.habits;
            s.justSignedUp = false;
          });
          return;
        }
        return originalLogin(email, password);
      }
    }
  }
);
