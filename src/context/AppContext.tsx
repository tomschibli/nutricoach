import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type {
  UserProfile,
  DailyLog,
  MealEntry,
  NotificationSettings,
  ChatMessage,
} from "../types";

interface AppContextType {
  profile: UserProfile | null;
  logs: DailyLog[];
  notificationSettings: NotificationSettings;
  chatHistory: ChatMessage[];
  darkMode: boolean;
  isPro: boolean;
  dailyMessageCount: number;
  updateProfile: (p: UserProfile) => void;
  addMealEntry: (entry: MealEntry) => void;
  removeMealEntry: (mealId: string) => void;
  updateWater: (date: string, delta: number) => void;
  getTodayLog: () => DailyLog;
  getLog: (date: string) => DailyLog;
  updateNotifications: (s: NotificationSettings) => void;
  addChatMessage: (m: ChatMessage) => void;
  clearChat: () => void;
  toggleDarkMode: () => void;
  upgradeToPro: () => void;
  incrementMessageCount: () => void;
}

const defaultNotifications: NotificationSettings = {
  masterEnabled: false,
  mealReminders: { enabled: true, breakfast: "08:00", lunch: "13:00", dinner: "19:00" },
  hydrationAlerts: { enabled: true, intervalHours: 2 },
  workoutReminders: { enabled: false, time: "07:00", days: ["Mon", "Wed", "Fri"] },
  coachingTips: { enabled: true },
};

const AppContext = createContext<AppContextType | null>(null);

function useLocalStorage<T>(key: string, init: T): [T, (v: T) => void] {
  const [val, setVal] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? (JSON.parse(s) as T) : init;
    } catch {
      return init;
    }
  });
  const set = (v: T) => {
    setVal(v);
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {}
  };
  return [val, set];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useLocalStorage<UserProfile | null>("nc_profile", null);
  const [logs, setLogs] = useLocalStorage<DailyLog[]>("nc_logs", []);
  const [notificationSettings, setNotifications] = useLocalStorage<NotificationSettings>("nc_notifs", defaultNotifications);
  const [chatHistory, setChatHistory] = useLocalStorage<ChatMessage[]>("nc_chat", []);
  const [darkMode, setDarkMode] = useLocalStorage<boolean>("nc_dark", false);
  const [isPro, setIsPro] = useLocalStorage<boolean>("nc_pro", false);
  const [msgData, setMsgData] = useLocalStorage<{ date: string; count: number }>("nc_msgs", { date: "", count: 0 });

  const today = () => new Date().toISOString().split("T")[0];

  // Reset message count daily
  const dailyMessageCount = msgData.date === today() ? msgData.count : 0;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const getLog = (date: string): DailyLog =>
    logs.find((l) => l.date === date) ?? { date, meals: [], waterIntake: 0 };

  const getTodayLog = () => getLog(today());

  const addMealEntry = (entry: MealEntry) => {
    const d = today();
    setLogs((prev) => {
      const existing = prev.find((l) => l.date === d);
      if (existing) {
        return prev.map((l) =>
          l.date === d ? { ...l, meals: [...l.meals, entry] } : l
        );
      }
      return [...prev, { date: d, meals: [entry], waterIntake: 0 }];
    });
  };

  const removeMealEntry = (mealId: string) => {
    const d = today();
    setLogs((prev) =>
      prev.map((l) =>
        l.date === d ? { ...l, meals: l.meals.filter((m) => m.id !== mealId) } : l
      )
    );
  };

  const updateWater = (date: string, delta: number) => {
    setLogs((prev) => {
      const existing = prev.find((l) => l.date === date);
      if (existing) {
        return prev.map((l) =>
          l.date === date
            ? { ...l, waterIntake: Math.max(0, l.waterIntake + delta) }
            : l
        );
      }
      return [...prev, { date, meals: [], waterIntake: Math.max(0, delta) }];
    });
  };

  const incrementMessageCount = () => {
    const d = today();
    setMsgData({ date: d, count: (msgData.date === d ? msgData.count : 0) + 1 });
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        logs,
        notificationSettings,
        chatHistory,
        darkMode,
        isPro,
        dailyMessageCount,
        updateProfile: setProfile,
        addMealEntry,
        removeMealEntry,
        updateWater,
        getTodayLog,
        getLog,
        updateNotifications: setNotifications,
        addChatMessage: (m) => setChatHistory((p) => [...p, m]),
        clearChat: () => setChatHistory([]),
        toggleDarkMode: () => setDarkMode(!darkMode),
        upgradeToPro: () => setIsPro(true),
        incrementMessageCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}

export function calcDailyCalories(p: Partial<UserProfile>): number {
  const {
    sex = "other",
    age = 30,
    weight = 70,
    height = 170,
    activityLevel = "moderate",
    goal = "maintain",
  } = p;
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr += sex === "male" ? 5 : sex === "female" ? -161 : -78;
  const mult = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 }[activityLevel] ?? 1.55;
  let tdee = bmr * mult;
  if (goal === "lose_weight") tdee -= 500;
  if (goal === "gain_muscle") tdee += 300;
  return Math.round(tdee);
}

export function calcMacroGoals(calories: number, weight: number, goal: string) {
  const protein = Math.round(weight * (goal === "gain_muscle" ? 2.2 : 1.6));
  const fat = Math.round((calories * 0.28) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
  return { protein, carbs, fat };
}
