import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, Leaf, Zap, Heart, TrendingDown, Dumbbell } from "lucide-react";
import { useApp, calcDailyCalories, calcMacroGoals } from "@/context/AppContext";
import type { UserProfile } from "@/types";

const TOTAL_STEPS = 6;

const GOAL_OPTIONS = [
  { value: "lose_weight", label: "Lose Weight", icon: TrendingDown, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800" },
  { value: "maintain", label: "Maintain", icon: Heart, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800" },
  { value: "gain_muscle", label: "Build Muscle", icon: Dumbbell, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-800" },
  { value: "improve_health", label: "Eat Healthier", icon: Leaf, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800" },
];

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
  { value: "light", label: "Lightly Active", desc: "Exercise 1–3 days/week" },
  { value: "moderate", label: "Moderately Active", desc: "Exercise 3–5 days/week" },
  { value: "active", label: "Very Active", desc: "Exercise 6–7 days/week" },
  { value: "very_active", label: "Extra Active", desc: "Physical job or 2× training" },
];

const DIET_OPTIONS = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo", "Halal", "Kosher", "Low-Carb", "Low-Fat"];
const ALLERGY_OPTIONS = ["Peanuts", "Tree Nuts", "Milk", "Eggs", "Wheat", "Soy", "Fish", "Shellfish", "Sesame"];

export default function Onboarding() {
  const { updateProfile } = useApp();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Partial<UserProfile>>({
    sex: "other",
    dietaryPreferences: [],
    allergies: [],
  });

  const set = <K extends keyof UserProfile>(k: K, v: UserProfile[K]) =>
    setDraft((p) => ({ ...p, [k]: v }));

  const toggle = (field: "dietaryPreferences" | "allergies", val: string) => {
    setDraft((p) => {
      const arr = (p[field] as string[]) ?? [];
      return {
        ...p,
        [field]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val],
      };
    });
  };

  const canNext = () => {
    if (step === 1) return !!draft.name?.trim();
    if (step === 2) return !!(
      draft.age && draft.age >= 16 && draft.age <= 90 &&
      draft.weight && draft.weight >= 40 && draft.weight <= 150 &&
      draft.height && draft.height >= 130 && draft.height <= 210
    );
    if (step === 3) return !!draft.goal;
    if (step === 4) return !!draft.activityLevel;
    return true;
  };

  const finish = () => {
    const calories = calcDailyCalories(draft);
    const macros = calcMacroGoals(calories, draft.weight ?? 70, draft.goal ?? "maintain");
    const profile: UserProfile = {
      name: draft.name ?? "Friend",
      sex: draft.sex ?? "other",
      age: draft.age ?? 30,
      weight: draft.weight ?? 70,
      height: draft.height ?? 170,
      goal: draft.goal ?? "maintain",
      activityLevel: draft.activityLevel ?? "moderate",
      dietaryPreferences: draft.dietaryPreferences ?? [],
      allergies: draft.allergies ?? [],
      dailyCalorieGoal: calories,
      macroGoals: macros,
      waterGoal: 2500,
      setupComplete: true,
    };
    updateProfile(profile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <Progress value={(step / TOTAL_STEPS) * 100} className="h-1.5" />
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to CedricCoach</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Your AI-powered nutrition & fitness companion</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">What's your name?</label>
              <Input
                placeholder="Enter your name"
                value={draft.name ?? ""}
                onChange={(e) => set("name", e.target.value)}
                className="text-lg h-12"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Step 2: Stats */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Stats</h2>
              <p className="text-gray-500 text-sm mt-1">Used to calculate your personal calorie goals</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Biological Sex</label>
              <div className="grid grid-cols-3 gap-2">
                {(["male", "female", "other"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => set("sex", s)}
                    className={`py-2.5 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                      draft.sex === s
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                        : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {[
              { key: "age", label: "Alter", placeholder: "16–90", unit: "Jahre", min: 16, max: 90 },
              { key: "weight", label: "Gewicht", placeholder: "40–150", unit: "kg", min: 40, max: 150 },
              { key: "height", label: "Grösse", placeholder: "130–210", unit: "cm", min: 130, max: 210 },
            ].map(({ key, label, placeholder, unit, min, max }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    value={(draft as Record<string, unknown>)[key] as string ?? ""}
                    onChange={(e) => set(key as keyof UserProfile, Number(e.target.value) as UserProfile[keyof UserProfile])}
                    className="h-11 flex-1"
                  />
                  <span className="text-sm text-gray-400 w-10">{unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Goal */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Goal</h2>
              <p className="text-gray-500 text-sm mt-1">What do you want to achieve?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {GOAL_OPTIONS.map(({ value, label, icon: Icon, color, bg, border }) => (
                <button
                  key={value}
                  onClick={() => set("goal", value as UserProfile["goal"])}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    draft.goal === value
                      ? `${bg} ${border}`
                      : "border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600"
                  }`}
                >
                  <Icon className={`h-6 w-6 ${color} mb-2`} />
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Activity */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Level</h2>
              <p className="text-gray-500 text-sm mt-1">How active are you on a typical week?</p>
            </div>
            <div className="space-y-2">
              {ACTIVITY_OPTIONS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => set("activityLevel", value as UserProfile["activityLevel"])}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    draft.activityLevel === value
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                      : "border-gray-200 dark:border-zinc-700 hover:border-gray-300"
                  }`}
                >
                  <p className={`font-semibold text-sm ${draft.activityLevel === value ? "text-emerald-700 dark:text-emerald-300" : "text-gray-800 dark:text-gray-200"}`}>
                    {label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Diet + Allergies */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dietary Preferences</h2>
              <p className="text-gray-500 text-sm mt-1">Select all that apply (optional)</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Diet style</p>
              <div className="flex flex-wrap gap-2">
                {DIET_OPTIONS.map((d) => (
                  <Badge
                    key={d}
                    variant="outline"
                    className={`cursor-pointer select-none transition-all py-1.5 px-3 text-xs ${
                      draft.dietaryPreferences?.includes(d)
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "border-gray-300 dark:border-zinc-600 text-gray-600 dark:text-gray-400 hover:border-emerald-400"
                    }`}
                    onClick={() => toggle("dietaryPreferences", d)}
                  >
                    {d}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allergies / Intolerances</p>
              <div className="flex flex-wrap gap-2">
                {ALLERGY_OPTIONS.map((a) => (
                  <Badge
                    key={a}
                    variant="outline"
                    className={`cursor-pointer select-none transition-all py-1.5 px-3 text-xs ${
                      draft.allergies?.includes(a)
                        ? "bg-red-500 text-white border-red-500"
                        : "border-gray-300 dark:border-zinc-600 text-gray-600 dark:text-gray-400 hover:border-red-400"
                    }`}
                    onClick={() => toggle("allergies", a)}
                  >
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: All set */}
        {step === 6 && (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <Zap className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">You're all set, {draft.name}! 🎉</h2>
              <p className="text-gray-500 mt-2 text-sm">
                Your personalized plan is ready. Here's a summary:
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Daily Calories", value: calcDailyCalories(draft), unit: "kcal" },
                { label: "Protein", value: calcMacroGoals(calcDailyCalories(draft), draft.weight ?? 70, draft.goal ?? "maintain").protein, unit: "g" },
                { label: "Water Goal", value: "2,500", unit: "ml" },
              ].map(({ label, value, unit }) => (
                <div key={label} className="bg-gray-50 dark:bg-zinc-800 rounded-2xl p-3">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{unit}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 h-12"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
          <Button
            className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25"
            disabled={!canNext()}
            onClick={() => {
              if (step < TOTAL_STEPS) setStep((s) => s + 1);
              else finish();
            }}
          >
            {step === TOTAL_STEPS ? "Start Coaching" : "Continue"}
            {step < TOTAL_STEPS && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
