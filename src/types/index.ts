export interface UserProfile {
  name: string;
  sex: "male" | "female" | "other";
  age: number;
  weight: number; // kg
  height: number; // cm
  goal: "lose_weight" | "maintain" | "gain_muscle" | "improve_health";
  activityLevel:
    | "sedentary"
    | "light"
    | "moderate"
    | "active"
    | "very_active";
  dietaryPreferences: string[];
  allergies: string[];
  dailyCalorieGoal: number;
  macroGoals: { protein: number; carbs: number; fat: number };
  waterGoal: number; // ml
  setupComplete: boolean;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  saturatedFat?: number;
  cholesterol?: number;
  vitaminA?: string;
  vitaminC?: string;
  calcium?: string;
  iron?: string;
}

export interface FoodAnalysis {
  foodName: string;
  description: string;
  servingSize: string;
  servings: number;
  nutrition: NutritionInfo;
  allergens: string[];
  healthScore: number; // 1–10
  healthScoreReason?: string;
  insights: string[];
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  confidence?: "high" | "medium" | "low";
}

export interface MealEntry {
  id: string;
  timestamp: string; // ISO
  imageSrc?: string;
  analysis: FoodAnalysis;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: MealEntry[];
  waterIntake: number; // ml
}

export interface NotificationSettings {
  masterEnabled: boolean;
  mealReminders: {
    enabled: boolean;
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  hydrationAlerts: {
    enabled: boolean;
    intervalHours: number;
  };
  workoutReminders: {
    enabled: boolean;
    time: string;
    days: string[];
  };
  coachingTips: { enabled: boolean };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
