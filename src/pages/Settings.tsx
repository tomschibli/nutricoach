import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bell, Moon, User, Droplets, Dumbbell, Lightbulb, Info, ChevronRight, Edit2, Check, Sparkles, Crown
} from "lucide-react";
import { useApp, calcDailyCalories, calcMacroGoals } from "@/context/AppContext";
import { toast } from "sonner";
import { ProGate } from "@/components/ProGate";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1 mb-2 mt-5">
      {title}
    </p>
  );
}

function SettingRow({
  icon: Icon,
  iconColor,
  label,
  desc,
  right,
  onClick,
}: {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  desc?: string;
  right?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 py-3 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div className={`w-8 h-8 rounded-xl ${iconColor} flex items-center justify-center shrink-0`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5 truncate">{desc}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
      {onClick && !right && <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />}
    </div>
  );
}

export default function Settings() {
  const { profile, updateProfile, notificationSettings, updateNotifications, darkMode, toggleDarkMode, isPro } = useApp();
  const [editingGoal, setEditingGoal] = useState(false);
  const [calorieInput, setCalorieInput] = useState(profile?.dailyCalorieGoal?.toString() ?? "");
  const [showProGate, setShowProGate] = useState(false);

  if (!profile) return null;

  const notifs = notificationSettings;

  const requestNotifPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Notifications not supported in this browser");
      return false;
    }
    const perm = await Notification.requestPermission();
    return perm === "granted";
  };

  const toggleMaster = async () => {
    if (!notifs.masterEnabled) {
      const granted = await requestNotifPermission();
      if (!granted) { toast.error("Notification permission denied"); return; }
      toast.success("Notifications enabled! ✅");
    }
    updateNotifications({ ...notifs, masterEnabled: !notifs.masterEnabled });
  };

  const saveCalorieGoal = () => {
    const v = parseInt(calorieInput);
    if (!v || v < 800 || v > 10000) { toast.error("Enter a value between 800–10000 kcal"); return; }
    const macros = calcMacroGoals(v, profile.weight, profile.goal);
    updateProfile({ ...profile, dailyCalorieGoal: v, macroGoals: macros });
    setEditingGoal(false);
    toast.success("Calorie goal updated!");
  };

  const recalcGoals = () => {
    const calories = calcDailyCalories(profile);
    const macros = calcMacroGoals(calories, profile.weight, profile.goal);
    updateProfile({ ...profile, dailyCalorieGoal: calories, macroGoals: macros });
    setCalorieInput(calories.toString());
    toast.success("Goals recalculated! 🎯");
  };

  const goalLabel: Record<string, string> = {
    lose_weight: "Lose Weight",
    maintain: "Maintain",
    gain_muscle: "Build Muscle",
    improve_health: "Eat Healthier",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-28">
      {showProGate && <ProGate feature="Pro" description="Schalte alle Features frei." onClose={() => setShowProGate(false)} />}
      <div className="max-w-[430px] mx-auto">
        {/* Header */}
        <div className="px-4 pt-12 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Einstellungen</h1>
        </div>

        {/* Pro Banner */}
        {!isPro && (
          <div className="px-4 mb-2">
            <button
              onClick={() => setShowProGate(true)}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 p-4 flex items-center gap-3 shadow-lg shadow-violet-500/20 transition-all active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-white">CedricCoach Pro</p>
                <p className="text-xs text-white/70">Alle Features · CHF 9.99 einmalig</p>
              </div>
              <ChevronRight className="h-4 w-4 text-white/60 shrink-0" />
            </button>
          </div>
        )}
        {isPro && (
          <div className="px-4 mb-2">
            <div className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-4 flex items-center gap-3 shadow-lg shadow-emerald-500/20">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Pro aktiv ✓</p>
                <p className="text-xs text-white/70">Alle Features freigeschaltet</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="px-4">
          <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-zinc-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-2xl font-bold text-white shadow-md">
                  {profile.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-gray-900 dark:text-white">{profile.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {profile.age}y · {profile.weight}kg · {profile.height}cm
                  </p>
                  <Badge className="mt-1.5 text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0">
                    {goalLabel[profile.goal] ?? profile.goal}
                  </Badge>
                </div>
                <button
                  className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center"
                  onClick={recalcGoals}
                >
                  <Edit2 className="h-3.5 w-3.5 text-gray-500" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals */}
        <div className="px-4">
          <SectionHeader title="Nutrition Goals" />
          <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-zinc-900">
            <CardContent className="p-4 space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Calorie Goal</p>
                  <button
                    onClick={() => { setEditingGoal(!editingGoal); setCalorieInput(profile.dailyCalorieGoal.toString()); }}
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-medium"
                  >
                    {editingGoal ? "Cancel" : "Edit"}
                  </button>
                </div>
                {editingGoal ? (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={calorieInput}
                      onChange={(e) => setCalorieInput(e.target.value)}
                      className="h-9 text-sm"
                      placeholder="e.g. 1800"
                    />
                    <Button size="sm" className="h-9 bg-emerald-500 hover:bg-emerald-600" onClick={saveCalorieGoal}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-2xl font-black text-emerald-500">{profile.dailyCalorieGoal} <span className="text-sm font-normal text-gray-400">kcal</span></p>
                )}
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Protein", value: profile.macroGoals.protein, color: "text-blue-500" },
                  { label: "Carbs", value: profile.macroGoals.carbs, color: "text-amber-500" },
                  { label: "Fat", value: profile.macroGoals.fat, color: "text-pink-500" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-gray-50 dark:bg-zinc-800 rounded-xl py-2">
                    <p className={`text-lg font-black ${color}`}>{value}g</p>
                    <p className="text-[11px] text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={recalcGoals}
              >
                Recalculate from profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Dietary Preferences */}
        <div className="px-4">
          <SectionHeader title="Dietary Profile" />
          <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-zinc-900">
            <CardContent className="p-4 space-y-3">
              {profile.dietaryPreferences.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Diet preferences</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.dietaryPreferences.map((d) => (
                      <Badge key={d} className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0">{d}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.allergies.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Allergies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.allergies.map((a) => (
                      <Badge key={a} className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-0">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.dietaryPreferences.length === 0 && profile.allergies.length === 0 && (
                <p className="text-sm text-gray-400">No dietary restrictions set</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <div className="px-4">
          <SectionHeader title="Notifications" />
          <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-zinc-900">
            <CardContent className="p-4">
              <SettingRow
                icon={Bell}
                iconColor="bg-blue-500"
                label="Allow Notifications"
                desc={notifs.masterEnabled ? "Notifications are active" : "Tap to enable"}
                right={<Switch checked={notifs.masterEnabled} onCheckedChange={toggleMaster} />}
              />

              {notifs.masterEnabled && (
                <>
                  <Separator className="my-1" />
                  <SettingRow
                    icon={Bell}
                    iconColor="bg-orange-400"
                    label="Meal Reminders"
                    desc={notifs.mealReminders.enabled ? `${notifs.mealReminders.breakfast} · ${notifs.mealReminders.lunch} · ${notifs.mealReminders.dinner}` : "Off"}
                    right={
                      <Switch
                        checked={notifs.mealReminders.enabled}
                        onCheckedChange={(v) => updateNotifications({ ...notifs, mealReminders: { ...notifs.mealReminders, enabled: v } })}
                      />
                    }
                  />
                  {notifs.mealReminders.enabled && (
                    <div className="ml-11 grid grid-cols-3 gap-2 pb-2">
                      {["breakfast", "lunch", "dinner"].map((meal) => (
                        <div key={meal}>
                          <p className="text-[10px] text-gray-400 capitalize mb-1">{meal}</p>
                          <Input
                            type="time"
                            value={notifs.mealReminders[meal as "breakfast" | "lunch" | "dinner"]}
                            onChange={(e) => updateNotifications({ ...notifs, mealReminders: { ...notifs.mealReminders, [meal]: e.target.value } })}
                            className="h-8 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <Separator className="my-1" />
                  <SettingRow
                    icon={Droplets}
                    iconColor="bg-cyan-500"
                    label="Hydration Alerts"
                    desc={notifs.hydrationAlerts.enabled ? `Every ${notifs.hydrationAlerts.intervalHours}h` : "Off"}
                    right={
                      <Switch
                        checked={notifs.hydrationAlerts.enabled}
                        onCheckedChange={(v) => updateNotifications({ ...notifs, hydrationAlerts: { ...notifs.hydrationAlerts, enabled: v } })}
                      />
                    }
                  />

                  <Separator className="my-1" />
                  <SettingRow
                    icon={Dumbbell}
                    iconColor="bg-purple-500"
                    label="Workout Reminders"
                    desc={notifs.workoutReminders.enabled ? `${notifs.workoutReminders.days.join(", ")} at ${notifs.workoutReminders.time}` : "Off"}
                    right={
                      <Switch
                        checked={notifs.workoutReminders.enabled}
                        onCheckedChange={(v) => updateNotifications({ ...notifs, workoutReminders: { ...notifs.workoutReminders, enabled: v } })}
                      />
                    }
                  />
                  {notifs.workoutReminders.enabled && (
                    <div className="ml-11 pb-2 space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {DAYS.map((d) => (
                          <button
                            key={d}
                            onClick={() => {
                              const days = notifs.workoutReminders.days.includes(d)
                                ? notifs.workoutReminders.days.filter((x) => x !== d)
                                : [...notifs.workoutReminders.days, d];
                              updateNotifications({ ...notifs, workoutReminders: { ...notifs.workoutReminders, days } });
                            }}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                              notifs.workoutReminders.days.includes(d)
                                ? "bg-purple-500 text-white border-purple-500"
                                : "border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                      <Input
                        type="time"
                        value={notifs.workoutReminders.time}
                        onChange={(e) => updateNotifications({ ...notifs, workoutReminders: { ...notifs.workoutReminders, time: e.target.value } })}
                        className="h-8 text-xs w-32"
                      />
                    </div>
                  )}

                  <Separator className="my-1" />
                  <SettingRow
                    icon={Lightbulb}
                    iconColor="bg-yellow-500"
                    label="Daily Coaching Tips"
                    desc="Personalized advice from your AI coach"
                    right={
                      <Switch
                        checked={notifs.coachingTips.enabled}
                        onCheckedChange={(v) => updateNotifications({ ...notifs, coachingTips: { enabled: v } })}
                      />
                    }
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Appearance */}
        <div className="px-4">
          <SectionHeader title="Appearance" />
          <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-zinc-900">
            <CardContent className="p-4">
              <SettingRow
                icon={Moon}
                iconColor="bg-indigo-500"
                label="Dark Mode"
                desc={darkMode ? "Dark theme active" : "Light theme active"}
                right={<Switch checked={darkMode} onCheckedChange={toggleDarkMode} />}
              />
            </CardContent>
          </Card>
        </div>

        {/* About */}
        <div className="px-4">
          <SectionHeader title="About" />
          <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-zinc-900">
            <CardContent className="p-4">
              <SettingRow icon={Info} iconColor="bg-gray-400" label="CedricCoach" desc="Version 1.0 · Powered by Claude AI" />
              <Separator className="my-1" />
              <SettingRow
                icon={User}
                iconColor="bg-blue-400"
                label="Masse neu eintragen"
                desc="Zurück zur Umfrage — Daten bleiben erhalten"
                onClick={() => {
                  if (confirm("Möchtest du deine Masse neu eintragen?")) {
                    const stored = localStorage.getItem("nc_profile");
                    if (stored) {
                      const p = JSON.parse(stored);
                      localStorage.setItem("nc_profile", JSON.stringify({ ...p, setupComplete: false }));
                    }
                    window.location.reload();
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
