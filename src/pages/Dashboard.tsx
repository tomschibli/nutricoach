import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Droplets, Plus, Camera, Zap, Trash2, ChevronRight, Sparkles, Minus, X, Loader2, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import MacroRing from "@/components/MacroRing";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import type { MealEntry } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function greeting(name: string) {
  const h = new Date().getHours();
  if (h < 12) return `Guten Morgen, ${name} ☀️`;
  if (h < 17) return `Guten Tag, ${name} 👋`;
  return `Guten Abend, ${name} 🌙`;
}

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / (max || 1)) * 100, 100);
  return (
    <div className="flex-1 space-y-1.5 min-w-0">
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-gray-400">{value}g</span>
      </div>
      <div className="h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-[10px] text-gray-400">{max}g Ziel</p>
    </div>
  );
}

const mealTypeColor: Record<string, string> = {
  breakfast: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  lunch: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  dinner: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  snack: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
};

export default function Dashboard() {
  const { profile, getTodayLog, updateWater, addMealEntry, removeMealEntry } = useApp();
  const navigate = useNavigate();
  const log = getTodayLog();
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [grams, setGrams] = useState("");
  const [estimating, setEstimating] = useState(false);

  if (!profile) return null;

  const totalCals = log.meals.reduce((s, m) => s + m.analysis.nutrition.calories, 0);
  const totalProtein = log.meals.reduce((s, m) => s + m.analysis.nutrition.protein, 0);
  const totalCarbs = log.meals.reduce((s, m) => s + m.analysis.nutrition.carbs, 0);
  const totalFat = log.meals.reduce((s, m) => s + m.analysis.nutrition.fat, 0);
  const remaining = Math.max(0, profile.dailyCalorieGoal - totalCals);
  const waterPct = Math.min((log.waterIntake / (profile.waterGoal || 2500)) * 100, 100);
  const today = new Date().toISOString().split("T")[0];

  const handleManualEntry = async () => {
    if (!foodName.trim() || !grams) return;
    setEstimating(true);
    try {
      const res = await fetch(`${API_URL}/api/estimate-food`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodName: foodName.trim(), grams: Number(grams) }),
      });
      if (!res.ok) throw new Error("Schätzung fehlgeschlagen");
      const { analysis } = await res.json();
      const entry: MealEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        analysis,
      };
      addMealEntry(entry);
      toast.success(`${analysis.foodName} hinzugefügt! 🍽️`);
      setFoodName("");
      setGrams("");
      setShowManualEntry(false);
    } catch {
      toast.error("Fehler beim Schätzen. Bitte erneut versuchen.");
    } finally {
      setEstimating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-28">
      <div className="max-w-[430px] mx-auto">

        {/* Header */}
        <div className="px-4 pt-14 pb-4">
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-1">
            {new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            {greeting(profile.name)}
          </h1>
        </div>

        {/* Calorie Ring Card */}
        <div className="px-4 animate-slide-in">
          <Card className="rounded-3xl border-0 shadow-md bg-white dark:bg-zinc-900 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <MacroRing
                  value={totalCals}
                  max={profile.dailyCalorieGoal}
                  color={totalCals >= profile.dailyCalorieGoal ? "#f97316" : "#10b981"}
                  label="kcal"
                  sublabel={`${remaining} übrig`}
                />
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Konsumiert</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{totalCals}</p>
                    <p className="text-xs text-gray-400">von {profile.dailyCalorieGoal} kcal</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-2 text-center">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{remaining}</p>
                      <p className="text-[9px] text-gray-400">übrig</p>
                    </div>
                    <div className="flex-1 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-2 text-center">
                      <p className="text-xs text-orange-500 font-bold">{log.meals.length}</p>
                      <p className="text-[9px] text-gray-400">Mahlzeiten</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Macro Strip */}
        <div className="px-4 mt-3 animate-slide-in" style={{ animationDelay: "0.05s" }}>
          <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-zinc-900">
            <CardContent className="p-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Makros heute</p>
              <div className="flex gap-4">
                <MacroBar label="Protein" value={Math.round(totalProtein)} max={profile.macroGoals.protein} color="#3b82f6" />
                <MacroBar label="Kohlenhydrate" value={Math.round(totalCarbs)} max={profile.macroGoals.carbs} color="#f59e0b" />
                <MacroBar label="Fett" value={Math.round(totalFat)} max={profile.macroGoals.fat} color="#ec4899" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Water Tracker */}
        <div className="px-4 mt-3 animate-slide-in" style={{ animationDelay: "0.1s" }}>
          <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-zinc-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                    <Droplets className="h-3.5 w-3.5 text-cyan-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Hydration</p>
                </div>
                <span className="text-sm font-black text-cyan-500">
                  {(log.waterIntake / 1000).toFixed(1)}L
                  <span className="text-xs font-normal text-gray-400"> / {((profile.waterGoal || 2500) / 1000).toFixed(1)}L</span>
                </span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${waterPct}%` }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateWater(today, -500)}
                  className="w-10 h-9 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                {[200, 300, 500].map((ml) => (
                  <button
                    key={ml}
                    onClick={() => updateWater(today, ml)}
                    className="flex-1 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-all active:scale-95"
                  >
                    +{ml}ml
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Meals */}
        <div className="px-4 mt-4 animate-slide-in" style={{ animationDelay: "0.15s" }}>
          <div className="flex justify-between items-center mb-3">
            <p className="text-base font-bold text-gray-900 dark:text-white">Heutige Mahlzeiten</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowManualEntry(!showManualEntry)}
                className="flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-2.5 py-1.5 rounded-xl transition-all active:scale-95"
              >
                <UtensilsCrossed className="h-3 w-3" /> Manuell
              </button>
              <button
                onClick={() => navigate("/scan")}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1.5 rounded-xl transition-all active:scale-95"
              >
                <Camera className="h-3 w-3" /> Scan
              </button>
            </div>
          </div>

          {/* Manual Entry Form */}
          {showManualEntry && (
            <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-zinc-900 mb-3 animate-scale-in">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Gericht eintragen</p>
                  <button onClick={() => setShowManualEntry(false)}>
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="z.B. Thunfisch"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    className="flex-1 h-10 rounded-xl text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleManualEntry()}
                  />
                  <Input
                    type="number"
                    placeholder="g"
                    value={grams}
                    onChange={(e) => setGrams(e.target.value)}
                    className="w-20 h-10 rounded-xl text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleManualEntry()}
                  />
                </div>
                <Button
                  onClick={handleManualEntry}
                  disabled={!foodName.trim() || !grams || estimating}
                  className="w-full h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-sm font-bold transition-all active:scale-95"
                >
                  {estimating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hinzufügen"}
                </Button>
              </CardContent>
            </Card>
          )}

          {log.meals.length === 0 && !showManualEntry ? (
            <button
              onClick={() => navigate("/scan")}
              className="w-full rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-700 p-8 text-center hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
                <Camera className="h-7 w-7 text-gray-300 dark:text-zinc-600 group-hover:text-emerald-400 transition-colors" />
              </div>
              <p className="text-sm font-semibold text-gray-400">Erste Mahlzeit erfassen</p>
              <p className="text-xs text-gray-300 dark:text-zinc-600 mt-1">Foto machen oder manuell eintragen</p>
            </button>
          ) : (
            <div className="space-y-2">
              {log.meals.map((meal, i) => (
                <Card
                  key={meal.id}
                  className="rounded-2xl border-0 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden animate-slide-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <CardContent className="p-3 flex gap-3 items-center">
                    {meal.imageSrc ? (
                      <img src={meal.imageSrc} alt={meal.analysis.foodName} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center shrink-0">
                        <Zap className="h-5 w-5 text-gray-300 dark:text-zinc-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Badge className={`text-[10px] px-1.5 py-0 capitalize border-0 ${mealTypeColor[meal.analysis.mealType] ?? "bg-gray-100 text-gray-600"}`}>
                          {meal.analysis.mealType}
                        </Badge>
                        <span className="text-[10px] text-gray-400">
                          {new Date(meal.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{meal.analysis.foodName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        <span className="font-semibold text-gray-600 dark:text-gray-300">{meal.analysis.nutrition.calories} kcal</span>
                        {" · "}P {Math.round(meal.analysis.nutrition.protein)}g · K {Math.round(meal.analysis.nutrition.carbs)}g · F {Math.round(meal.analysis.nutrition.fat)}g
                      </p>
                    </div>
                    <button
                      onClick={() => removeMealEntry(meal.id)}
                      className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0 hover:bg-red-100 transition-all active:scale-95"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* AI Coach Banner */}
        <div className="px-4 mt-4 mb-2 animate-slide-in" style={{ animationDelay: "0.2s" }}>
          <button
            onClick={() => navigate("/coach")}
            className="w-full rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 p-4 text-left shadow-xl shadow-violet-500/25 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-xs font-bold text-white/70 uppercase tracking-widest">CedricCoach KI</span>
              </div>
              <ChevronRight className="h-4 w-4 text-white/60" />
            </div>
            <p className="text-sm text-white font-medium leading-relaxed">
              {totalCals === 0
                ? "Bereit zum Tracken? Erfasse deine erste Mahlzeit! 💪"
                : remaining > 0
                ? `Du hast ${totalCals} kcal. Noch ${remaining} kcal übrig — weiter so! 🎯`
                : "Kalorienziel erreicht! Ausgezeichnete Arbeit heute! 🏆"}
            </p>
          </button>
        </div>

      </div>
    </div>
  );
}
