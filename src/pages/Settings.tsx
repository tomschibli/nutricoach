import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Moon, Sun, Bell, User, ChevronRight, Check, Edit3,
  Heart, Activity, Sparkles, Crown, RotateCcw, Info,
  Droplets, Dumbbell, Lightbulb, Scale,
} from "lucide-react";
import { useApp, calcDailyCalories, calcMacroGoals } from "@/context/AppContext";
import { toast } from "sonner";
import ProModal from "@/components/ProModal";

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 mb-2 mt-6">
      {children}
    </p>
  );
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-zinc-800">
      {children}
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  iconBg,
  label,
  desc,
  right,
  onClick,
  danger,
}: {
  icon: React.ElementType;
  iconBg: string;
  label: string;
  desc?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3.5 px-4 py-3.5 ${onClick ? "cursor-pointer active:bg-gray-50 dark:active:bg-zinc-800 transition-colors" : ""}`}
    >
      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${danger ? "text-red-500" : "text-gray-900 dark:text-white"}`}>
          {label}
        </p>
        {desc && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{desc}</p>}
      </div>
      {right ?? (onClick && <ChevronRight className="h-4 w-4 text-gray-300 dark:text-zinc-600 shrink-0" />)}
    </div>
  );
}

export default function Settings() {
  const {
    profile, updateProfile,
    notificationSettings, updateNotifications,
    darkMode, toggleDarkMode,
    isPro,
  } = useApp();

  const [showPro, setShowPro] = useState(false);
  const [editingCals, setEditingCals] = useState(false);
  const [calorieInput, setCalorieInput] = useState(profile?.dailyCalorieGoal?.toString() ?? "");
  const [units, setUnits] = useState<"metric" | "imperial">("metric");

  if (!profile) return null;
  const notifs = notificationSettings;

  const saveCalorieGoal = () => {
    const v = parseInt(calorieInput);
    if (!v || v < 800 || v > 10000) { toast.error("800–10000 kcal eingeben"); return; }
    const macros = calcMacroGoals(v, profile.weight, profile.goal);
    updateProfile({ ...profile, dailyCalorieGoal: v, macroGoals: macros });
    setEditingCals(false);
    toast.success("Kalorienziel gespeichert!");
  };

  const recalc = () => {
    const cal = calcDailyCalories(profile);
    const macros = calcMacroGoals(cal, profile.weight, profile.goal);
    updateProfile({ ...profile, dailyCalorieGoal: cal, macroGoals: macros });
    setCalorieInput(cal.toString());
    toast.success("Ziele neu berechnet 🎯");
  };

  const requestNotif = async () => {
    if (!("Notification" in window)) { toast.error("Benachrichtigungen nicht unterstützt"); return false; }
    const p = await Notification.requestPermission();
    return p === "granted";
  };

  const toggleMaster = async () => {
    if (!notifs.masterEnabled) {
      const ok = await requestNotif();
      if (!ok) { toast.error("Zugriff verweigert"); return; }
    }
    updateNotifications({ ...notifs, masterEnabled: !notifs.masterEnabled });
  };

  const goalLabel: Record<string, string> = {
    lose_weight: "Abnehmen", maintain: "Gewicht halten",
    gain_muscle: "Muskelaufbau", improve_health: "Gesünder essen",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-32">
      {showPro && <ProModal onClose={() => setShowPro(false)} />}

      <div className="max-w-[430px] mx-auto px-4">

        {/* Header */}
        <div className="pt-14 pb-2">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Einstellungen</h1>
        </div>

        {/* ── ACCOUNT ─────────────────────────────── */}
        <SectionLabel>Account</SectionLabel>
        <SettingsCard>
          {/* Avatar + Profile */}
          <div className="px-4 py-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl font-black text-white shadow-md shadow-violet-500/20 shrink-0">
              {profile.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-gray-900 dark:text-white truncate">{profile.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {profile.age} J · {profile.weight} kg · {profile.height} cm
              </p>
              <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                {goalLabel[profile.goal] ?? profile.goal}
              </span>
            </div>
          </div>

          {/* Calorie goal */}
          <div className="px-4 py-3.5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Tägliches Kalorienziel</p>
              <button
                onClick={() => { setEditingCals(!editingCals); setCalorieInput(profile.dailyCalorieGoal.toString()); }}
                className="text-xs font-bold text-violet-600 dark:text-violet-400"
              >
                {editingCals ? "Abbrechen" : "Bearbeiten"}
              </button>
            </div>
            {editingCals ? (
              <div className="flex gap-2">
                <Input type="number" value={calorieInput} onChange={(e) => setCalorieInput(e.target.value)}
                  className="h-10 rounded-xl text-sm flex-1" placeholder="z.B. 1800" />
                <Button onClick={saveCalorieGoal} size="sm" className="h-10 px-4 rounded-xl bg-violet-600 hover:bg-violet-700">
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-end justify-between">
                <p className="text-3xl font-black text-violet-600 dark:text-violet-400">
                  {profile.dailyCalorieGoal}
                  <span className="text-sm font-normal text-gray-400 ml-1">kcal</span>
                </p>
                <button onClick={recalc} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  <RotateCcw className="h-3 w-3" /> Neu berechnen
                </button>
              </div>
            )}

            {/* Macros */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { label: "Protein", value: profile.macroGoals.protein, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
                { label: "Kohlenhydrate", value: profile.macroGoals.carbs, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
                { label: "Fett", value: profile.macroGoals.fat, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-50 dark:bg-pink-900/20" },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl py-2.5 text-center`}>
                  <p className={`text-base font-black ${color}`}>{value}g</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <SettingsRow
            icon={Edit3}
            iconBg="bg-blue-500"
            label="Masse neu eintragen"
            desc="Zurück zur Umfrage — Daten bleiben erhalten"
            onClick={() => {
              if (confirm("Masse wirklich neu eintragen?")) {
                const s = localStorage.getItem("nc_profile");
                if (s) localStorage.setItem("nc_profile", JSON.stringify({ ...JSON.parse(s), setupComplete: false }));
                window.location.reload();
              }
            }}
          />
        </SettingsCard>

        {/* ── APP PREFERENCES ─────────────────────── */}
        <SectionLabel>App Einstellungen</SectionLabel>
        <SettingsCard>
          <SettingsRow
            icon={darkMode ? Moon : Sun}
            iconBg={darkMode ? "bg-indigo-500" : "bg-amber-400"}
            label="Erscheinungsbild"
            desc={darkMode ? "Dunkles Design" : "Helles Design"}
            right={
              <Switch
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
                className="data-[state=checked]:bg-indigo-500"
              />
            }
          />
          <div className="flex items-center gap-3.5 px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Einheitensystem</p>
              <p className="text-xs text-gray-400 mt-0.5">{units === "metric" ? "Metrisch (kg, cm)" : "Imperial (lbs, ft)"}</p>
            </div>
            <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-xl p-1">
              {(["metric", "imperial"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnits(u)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-150 ${
                    units === u
                      ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {u === "metric" ? "Metrisch" : "Imperial"}
                </button>
              ))}
            </div>
          </div>
        </SettingsCard>

        {/* ── INTEGRATIONS ────────────────────────── */}
        <SectionLabel>Integrationen</SectionLabel>
        <SettingsCard>
          <SettingsRow
            icon={Heart}
            iconBg="bg-red-500"
            label="Apple Health"
            desc="Schritte & Aktivität synchronisieren"
            right={<Switch disabled className="opacity-50" />}
          />
          <SettingsRow
            icon={Activity}
            iconBg="bg-green-500"
            label="Google Fit"
            desc="Workout-Daten synchronisieren"
            right={<Switch disabled className="opacity-50" />}
          />
          <div className="px-4 pb-3 pt-1">
            <p className="text-xs text-gray-400">Integrationen werden in einer zukünftigen Version verfügbar sein.</p>
          </div>
        </SettingsCard>

        {/* ── NOTIFICATIONS ───────────────────────── */}
        <SectionLabel>Benachrichtigungen</SectionLabel>
        <SettingsCard>
          <SettingsRow
            icon={Bell}
            iconBg="bg-blue-500"
            label="Benachrichtigungen"
            desc={notifs.masterEnabled ? "Aktiv" : "Deaktiviert"}
            right={<Switch checked={notifs.masterEnabled} onCheckedChange={toggleMaster} />}
          />
          {notifs.masterEnabled && (
            <>
              <SettingsRow
                icon={Bell}
                iconBg="bg-orange-400"
                label="Mahlzeiten-Erinnerungen"
                desc={notifs.mealReminders.enabled
                  ? `${notifs.mealReminders.breakfast} · ${notifs.mealReminders.lunch} · ${notifs.mealReminders.dinner}`
                  : "Aus"}
                right={
                  <Switch
                    checked={notifs.mealReminders.enabled}
                    onCheckedChange={(v) => updateNotifications({ ...notifs, mealReminders: { ...notifs.mealReminders, enabled: v } })}
                  />
                }
              />
              {notifs.mealReminders.enabled && (
                <div className="px-4 pb-3 pt-1 grid grid-cols-3 gap-2 ml-[52px]">
                  {(["breakfast", "lunch", "dinner"] as const).map((m) => (
                    <div key={m}>
                      <p className="text-[10px] text-gray-400 capitalize mb-1">
                        {m === "breakfast" ? "Frühstück" : m === "lunch" ? "Mittagessen" : "Abendessen"}
                      </p>
                      <Input type="time" value={notifs.mealReminders[m]}
                        onChange={(e) => updateNotifications({ ...notifs, mealReminders: { ...notifs.mealReminders, [m]: e.target.value } })}
                        className="h-8 text-xs rounded-lg" />
                    </div>
                  ))}
                </div>
              )}
              <SettingsRow
                icon={Droplets}
                iconBg="bg-cyan-500"
                label="Hydration-Erinnerungen"
                desc={notifs.hydrationAlerts.enabled ? `Alle ${notifs.hydrationAlerts.intervalHours}h` : "Aus"}
                right={
                  <Switch
                    checked={notifs.hydrationAlerts.enabled}
                    onCheckedChange={(v) => updateNotifications({ ...notifs, hydrationAlerts: { ...notifs.hydrationAlerts, enabled: v } })}
                  />
                }
              />
              <SettingsRow
                icon={Dumbbell}
                iconBg="bg-purple-500"
                label="Workout-Erinnerungen"
                desc={notifs.workoutReminders.enabled
                  ? `${notifs.workoutReminders.days.join(", ")} · ${notifs.workoutReminders.time}`
                  : "Aus"}
                right={
                  <Switch
                    checked={notifs.workoutReminders.enabled}
                    onCheckedChange={(v) => updateNotifications({ ...notifs, workoutReminders: { ...notifs.workoutReminders, enabled: v } })}
                  />
                }
              />
              {notifs.workoutReminders.enabled && (
                <div className="px-4 pb-3 pt-1 ml-[52px] space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS.map((d) => (
                      <button key={d}
                        onClick={() => {
                          const days = notifs.workoutReminders.days.includes(d)
                            ? notifs.workoutReminders.days.filter((x) => x !== d)
                            : [...notifs.workoutReminders.days, d];
                          updateNotifications({ ...notifs, workoutReminders: { ...notifs.workoutReminders, days } });
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                          notifs.workoutReminders.days.includes(d)
                            ? "bg-purple-500 text-white border-purple-500"
                            : "border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400"
                        }`}
                      >{d}</button>
                    ))}
                  </div>
                  <Input type="time" value={notifs.workoutReminders.time}
                    onChange={(e) => updateNotifications({ ...notifs, workoutReminders: { ...notifs.workoutReminders, time: e.target.value } })}
                    className="h-8 text-xs rounded-lg w-28" />
                </div>
              )}
              <SettingsRow
                icon={Lightbulb}
                iconBg="bg-yellow-400"
                label="Tägliche Coach-Tipps"
                desc="Personalisierte KI-Ratschläge"
                right={
                  <Switch
                    checked={notifs.coachingTips.enabled}
                    onCheckedChange={(v) => updateNotifications({ ...notifs, coachingTips: { enabled: v } })}
                  />
                }
              />
            </>
          )}
        </SettingsCard>

        {/* ── PREMIUM ─────────────────────────────── */}
        <SectionLabel>Premium</SectionLabel>

        {isPro ? (
          <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center gap-3 relative">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-white">Pro aktiv ✓</p>
                <p className="text-xs text-white/70">Alle Features freigeschaltet</p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowPro(true)}
            className="relative w-full overflow-hidden rounded-2xl p-5 text-left shadow-lg shadow-violet-500/20 transition-all active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 60%, #6366f1 100%)" }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center gap-3 relative">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-white">CedricCoach Pro</p>
                <p className="text-xs text-white/70">Food Scanner · Unlimited Chat · Analytics</p>
              </div>
              <div className="shrink-0 bg-white/20 rounded-xl px-3 py-1.5">
                <p className="text-xs font-black text-white">CHF 9.99</p>
              </div>
            </div>
          </button>
        )}

        {/* ── ABOUT ───────────────────────────────── */}
        <SectionLabel>Über die App</SectionLabel>
        <SettingsCard>
          <SettingsRow
            icon={Info}
            iconBg="bg-gray-400"
            label="CedricCoach"
            desc="Version 1.0 · Powered by Claude AI"
          />
        </SettingsCard>

        <p className="text-center text-xs text-gray-300 dark:text-zinc-600 mt-8">
          Made with ♥ · CedricCoach 2025
        </p>
      </div>
    </div>
  );
}
