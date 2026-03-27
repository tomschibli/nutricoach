import { useNavigate } from "react-router-dom";
import { Bell, Droplets, Plus, Camera, ChevronRight, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MacroRing from "@/components/MacroRing";
import { useApp } from "@/context/AppContext";

function greeting(name: string) {
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${name}! ☀️`;
  if (h < 17) return `Good afternoon, ${name}! 👋`;
  return `Good evening, ${name}! 🌙`;
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / (max || 1)) * 100, 100);
  return (
    <div className="flex-1 space-y-1.5 min-w-0">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-gray-400 dark:text-gray-500">{value}g</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-[11px] text-gray-400">{max}g goal</p>
    </div>
  );
}

export default function Dashboard() {
  const { profile, getTodayLog, updateWater } = useApp();
  const navigate = useNavigate();
  const log = getTodayLog();

  if (!profile) return null;

  // Totals
  const totalCals = log.meals.reduce((s, m) => s + m.analysis.nutrition.calories, 0);
  const totalProtein = log.meals.reduce((s, m) => s + m.analysis.nutrition.protein, 0);
  const totalCarbs = log.meals.reduce((s, m) => s + m.analysis.nutrition.carbs, 0);
  const totalFat = log.meals.reduce((s, m) => s + m.analysis.nutrition.fat, 0);
  const remaining = Math.max(0, profile.dailyCalorieGoal - totalCals);
  const waterPct = Math.min((log.waterIntake / profile.waterGoal) * 100, 100);

  const mealTypeColor: Record<string, string> = {
    breakfast: "bg-amber-100 text-amber-700",
    lunch: "bg-blue-100 text-blue-700",
    dinner: "bg-purple-100 text-purple-700",
    snack: "bg-green-100 text-green-700",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-24">
      <div className="max-w-[430px] mx-auto">
        {/* Header */}
        <div className="px-4 pt-12 pb-2 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">
              {greeting(profile.name)}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{formatDate()}</p>
          </div>
          <button
            onClick={() => navigate("/settings")}
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center shadow-sm"
          >
            <Bell className="h-4.5 w-4.5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Calorie Ring Card */}
        <div className="px-4 mt-4">
          <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <MacroRing
                  value={totalCals}
                  max={profile.dailyCalorieGoal}
                  color={totalCals >= profile.dailyCalorieGoal ? "#f97316" : "#10b981"}
                  label="Calories"
                  sublabel={`${remaining} kcal left`}
                />
                <div className="flex-1 pl-4 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Flame className="h-4 w-4 text-orange-400" />
                      <span className="text-xs text-gray-500">Consumed</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCals}</p>
                    <p className="text-xs text-gray-400">of {profile.dailyCalorieGoal} kcal</p>
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 space-y-1">
                    <p className="text-xs text-gray-400">Remaining</p>
                    <p className="text-lg font-bold text-emerald-500">{remaining} kcal</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Macro Strip */}
        <div className="px-4 mt-4">
          <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-zinc-900">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Macros</p>
              <div className="flex gap-4">
                <MacroBar label="Protein" value={Math.round(totalProtein)} max={profile.macroGoals.protein} color="#3b82f6" />
                <MacroBar label="Carbs" value={Math.round(totalCarbs)} max={profile.macroGoals.carbs} color="#f59e0b" />
                <MacroBar label="Fat" value={Math.round(totalFat)} max={profile.macroGoals.fat} color="#ec4899" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Water Tracker */}
        <div className="px-4 mt-4">
          <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-zinc-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-cyan-500" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Hydration</p>
                </div>
                <span className="text-sm font-bold text-cyan-500">
                  {(log.waterIntake / 1000).toFixed(1)}L / {(profile.waterGoal / 1000).toFixed(1)}L
                </span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${waterPct}%` }}
                />
              </div>
              <div className="flex gap-2">
                {[200, 300, 500].map((ml) => (
                  <Button
                    key={ml}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8 border-cyan-200 dark:border-cyan-900 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                    onClick={() => updateWater(new Date().toISOString().split("T")[0], ml)}
                  >
                    +{ml}ml
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Meals */}
        <div className="px-4 mt-5">
          <div className="flex justify-between items-center mb-3">
            <p className="text-base font-bold text-gray-900 dark:text-white">Today's Meals</p>
            <button
              onClick={() => navigate("/scan")}
              className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
            >
              <Plus className="h-3.5 w-3.5" /> Add meal
            </button>
          </div>

          {log.meals.length === 0 ? (
            <button
              onClick={() => navigate("/scan")}
              className="w-full rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-700 p-6 text-center hover:border-emerald-300 transition-colors"
            >
              <Camera className="h-8 w-8 text-gray-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-400">Snap your first meal</p>
              <p className="text-xs text-gray-300 dark:text-zinc-600 mt-1">Take a photo to analyze nutrition</p>
            </button>
          ) : (
            <div className="space-y-2">
              {log.meals.map((meal) => (
                <Card
                  key={meal.id}
                  className="rounded-2xl border-0 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden"
                >
                  <CardContent className="p-3 flex gap-3 items-center">
                    {meal.imageSrc ? (
                      <img
                        src={meal.imageSrc}
                        alt={meal.analysis.foodName}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        <Zap className="h-6 w-6 text-gray-300 dark:text-zinc-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Badge
                          className={`text-[10px] px-1.5 py-0 capitalize ${mealTypeColor[meal.analysis.mealType] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {meal.analysis.mealType}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {meal.analysis.foodName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {meal.analysis.nutrition.calories} kcal · P {Math.round(meal.analysis.nutrition.protein)}g · C {Math.round(meal.analysis.nutrition.carbs)}g · F {Math.round(meal.analysis.nutrition.fat)}g
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 shrink-0">
                      {new Date(meal.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* AI Coach Tip */}
        <div className="px-4 mt-4 mb-2">
          <button
            onClick={() => navigate("/coach")}
            className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 p-4 text-left shadow-lg shadow-violet-500/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">NutriCoach AI</span>
              </div>
              <ChevronRight className="h-4 w-4 text-white/60" />
            </div>
            <p className="text-sm text-white font-medium">
              {totalCals === 0
                ? "Ready to start tracking? Log your first meal and I'll give you personalized insights! 💪"
                : `You've had ${totalCals} kcal so far. ${remaining > 0 ? `${remaining} kcal remaining — keep it up!` : "You've reached your calorie goal for today! Great work!"} 🎯`}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
