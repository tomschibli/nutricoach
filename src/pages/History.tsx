import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Droplets, TrendingUp, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useApp } from "@/context/AppContext";
import type { DailyLog } from "@/types";

function formatDay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function formatDateFull(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function isToday(dateStr: string) {
  return dateStr === new Date().toISOString().split("T")[0];
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

const mealTypeColor: Record<string, string> = {
  breakfast: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  lunch: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  dinner: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  snack: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
};

function MealDetail({ log }: { log: DailyLog }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (log.meals.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Zap className="h-6 w-6 text-gray-300 dark:text-zinc-600" />
        </div>
        <p className="text-sm text-gray-400">No meals logged this day</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {log.meals.map((meal) => (
        <Card
          key={meal.id}
          className="rounded-2xl border-0 shadow-sm bg-white dark:bg-zinc-900 cursor-pointer"
          onClick={() => setExpanded(expanded === meal.id ? null : meal.id)}
        >
          <CardContent className="p-3">
            <div className="flex gap-3 items-center">
              {meal.imageSrc ? (
                <img src={meal.imageSrc} alt={meal.analysis.foodName} className="w-12 h-12 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <Flame className="h-5 w-5 text-gray-300 dark:text-zinc-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{meal.analysis.foodName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge className={`text-[10px] px-1.5 py-0 capitalize border-0 ${mealTypeColor[meal.analysis.mealType] ?? "bg-gray-100 text-gray-600"}`}>
                        {meal.analysis.mealType}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(meal.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white shrink-0 ml-2">
                    {meal.analysis.nutrition.calories} kcal
                  </p>
                </div>
              </div>
            </div>

            {expanded === meal.id && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: "Protein", value: `${Math.round(meal.analysis.nutrition.protein)}g`, color: "text-blue-500" },
                    { label: "Carbs", value: `${Math.round(meal.analysis.nutrition.carbs)}g`, color: "text-amber-500" },
                    { label: "Fat", value: `${Math.round(meal.analysis.nutrition.fat)}g`, color: "text-pink-500" },
                    { label: "Fiber", value: `${Math.round(meal.analysis.nutrition.fiber)}g`, color: "text-emerald-500" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-gray-50 dark:bg-zinc-800 rounded-xl py-2">
                      <p className={`text-sm font-bold ${color}`}>{value}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
                {meal.analysis.healthScore && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Health score: <span className="font-semibold">{meal.analysis.healthScore}/10</span> · {meal.analysis.servingSize}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function History() {
  const { logs, profile, getLog } = useApp();
  const last7 = getLast7Days();
  const [selected, setSelected] = useState(last7[6]); // today

  const selectedLog = getLog(selected);
  const selectedCals = selectedLog.meals.reduce((s, m) => s + m.analysis.nutrition.calories, 0);
  const selectedProtein = selectedLog.meals.reduce((s, m) => s + m.analysis.nutrition.protein, 0);

  const chartData = last7.map((date) => {
    const log = getLog(date);
    const cals = log.meals.reduce((s, m) => s + m.analysis.nutrition.calories, 0);
    return { day: formatDay(date), calories: cals, date, goal: profile?.dailyCalorieGoal ?? 2000 };
  });

  // Streak calculation
  const streak = (() => {
    let count = 0;
    const today = new Date().toISOString().split("T")[0];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split("T")[0];
      if (dStr > today) continue;
      const log = getLog(dStr);
      if (log.meals.length > 0) count++;
      else if (dStr < today) break;
    }
    return count;
  })();

  const totalMealsLogged = logs.reduce((s, l) => s + l.meals.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-24">
      <div className="max-w-[430px] mx-auto">
        {/* Header */}
        <div className="px-4 pt-12 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">History</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your nutrition journey</p>
        </div>

        {/* Stats Row */}
        <div className="px-4 grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Day Streak", value: streak, icon: "🔥", color: "text-orange-500" },
            { label: "Meals Logged", value: totalMealsLogged, icon: "🍽️", color: "text-emerald-500" },
            { label: "Active Days", value: logs.filter((l) => l.meals.length > 0).length, icon: "📅", color: "text-blue-500" },
          ].map(({ label, value, icon, color }) => (
            <Card key={label} className="rounded-2xl border-0 shadow-sm bg-white dark:bg-zinc-900">
              <CardContent className="p-3 text-center">
                <p className="text-lg">{icon}</p>
                <p className={`text-xl font-black mt-0.5 ${color}`}>{value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly Chart */}
        <div className="px-4 mb-4">
          <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-zinc-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">7-Day Calories</p>
              </div>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={chartData} barSize={20}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: 12,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [`${v} kcal`, "Calories"]}
                    cursor={{ fill: "rgba(16,185,129,0.05)" }}
                  />
                  <Bar dataKey="calories" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.date}
                        fill={entry.date === selected ? "#10b981" : "#d1fae5"}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelected(entry.date)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {profile && (
                <p className="text-[11px] text-gray-400 text-center mt-1">
                  Goal: {profile.dailyCalorieGoal} kcal/day
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Day Selector */}
        <div className="px-4 mb-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {last7.map((date) => {
              const log = getLog(date);
              const hasMeals = log.meals.length > 0;
              const active = date === selected;
              return (
                <button
                  key={date}
                  onClick={() => setSelected(date)}
                  className={`flex flex-col items-center py-2 px-3 rounded-2xl shrink-0 transition-all ${
                    active
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                      : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <span className="text-[11px] font-medium">{formatDay(date)}</span>
                  <span className={`text-base font-bold mt-0.5 ${active ? "text-white" : "text-gray-800 dark:text-gray-200"}`}>
                    {new Date(date + "T00:00:00").getDate()}
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 ${hasMeals ? (active ? "bg-white" : "bg-emerald-400") : "bg-transparent"}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {isToday(selected) ? "Today" : formatDateFull(selected)}
              </p>
              {selectedCals > 0 && (
                <p className="text-xs text-gray-400">{selectedCals} kcal · {Math.round(selectedProtein)}g protein</p>
              )}
            </div>
            {selectedLog.waterIntake > 0 && (
              <div className="flex items-center gap-1.5 text-cyan-500">
                <Droplets className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{(selectedLog.waterIntake / 1000).toFixed(1)}L</span>
              </div>
            )}
          </div>
          <MealDetail log={selectedLog} />
        </div>
      </div>
    </div>
  );
}
