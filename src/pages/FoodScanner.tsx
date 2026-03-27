import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Camera, Upload, Loader2, Zap, AlertTriangle, Check, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { FoodAnalysis, MealEntry } from "@/types";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function healthScoreColor(score: number) {
  if (score >= 8) return "#10b981";
  if (score >= 5) return "#f59e0b";
  return "#ef4444";
}

function healthScoreLabel(score: number) {
  if (score >= 8) return "Excellent";
  if (score >= 6) return "Good";
  if (score >= 4) return "Moderate";
  return "Poor";
}

export default function FoodScanner() {
  const { addMealEntry, profile } = useApp();
  const navigate = useNavigate();

  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [logged, setLogged] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please upload an image file."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      setImageData({ base64: result.split(",")[1], mimeType: file.type });
      setAnalysis(null);
      setError(null);
      setLogged(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const analyze = async () => {
    if (!imageData) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/analyze-food`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageData.base64,
          mimeType: imageData.mimeType,
          userProfile: profile
            ? { allergies: profile.allergies, goal: profile.goal, dietaryPreferences: profile.dietaryPreferences }
            : undefined,
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Make sure the API server is running.");
    } finally {
      setLoading(false);
    }
  };

  const logMeal = () => {
    if (!analysis) return;
    const entry: MealEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      imageSrc: preview ?? undefined,
      analysis,
    };
    addMealEntry(entry);
    setLogged(true);
    toast.success(`${analysis.foodName} logged! 🎉`);
  };

  // Check allergen warnings
  const allergenWarnings = profile?.allergies.filter((a) =>
    analysis?.allergens.map((x) => x.toLowerCase()).some((x) => x.includes(a.toLowerCase()))
  ) ?? [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-24">
      <div className="max-w-[430px] mx-auto">
        {/* Header */}
        <div className="px-4 pt-12 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Food Scanner</h1>
          <p className="text-sm text-gray-400 mt-0.5">Photograph your meal for instant nutrition insights</p>
        </div>

        {/* Upload Zone */}
        <div className="px-4">
          <div
            className={`relative rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
              dragOver
                ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                : preview
                ? "border-transparent"
                : "border-gray-200 dark:border-zinc-700 hover:border-emerald-300 bg-white dark:bg-zinc-900"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !preview && document.getElementById("food-file")?.click()}
          >
            <input
              id="food-file"
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
            />
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Food" className="w-full max-h-64 object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); setPreview(null); setImageData(null); setAnalysis(null); setLogged(false); }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
                {loading && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                    <p className="text-white text-sm font-medium">Analyzing with AI…</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-zinc-800 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-emerald-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tap to take a photo</p>
                  <p className="text-xs text-gray-400 mt-0.5">or drag & drop an image</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); document.getElementById("food-file")?.click(); }}
                  className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium"
                >
                  <Upload className="h-3.5 w-3.5" /> Browse files
                </button>
              </div>
            )}
          </div>

          {preview && !analysis && (
            <Button
              className="w-full mt-3 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-500/25"
              onClick={analyze}
              disabled={loading}
            >
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing…</> : <><Zap className="h-4 w-4 mr-2" />Analyze Nutrition</>}
            </Button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 mt-3">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-3">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {analysis && (
          <div className="px-4 mt-4 space-y-3">
            {/* Allergen warning */}
            {allergenWarnings.length > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-3 flex gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-orange-700 dark:text-orange-300 text-sm">
                  <strong>Allergen alert:</strong> Contains {allergenWarnings.join(", ")} which you've listed as an allergy.
                </p>
              </div>
            )}

            {/* Food ID + Health Score */}
            <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-zinc-900">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{analysis.foodName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{analysis.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">{analysis.servingSize}</Badge>
                      <Badge variant="secondary" className="text-xs capitalize">{analysis.mealType}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-center ml-3 shrink-0">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: healthScoreColor(analysis.healthScore) }}
                    >
                      {analysis.healthScore}
                    </div>
                    <p className="text-[10px] mt-1 font-medium" style={{ color: healthScoreColor(analysis.healthScore) }}>
                      {healthScoreLabel(analysis.healthScore)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calories highlight */}
            <Card className="rounded-3xl border-0 shadow-sm bg-gradient-to-r from-orange-400 to-pink-500">
              <CardContent className="p-4">
                <p className="text-white/70 text-xs uppercase tracking-wide font-semibold">Total Calories</p>
                <p className="text-4xl font-black text-white mt-0.5">{analysis.nutrition.calories}</p>
                <p className="text-white/70 text-xs mt-0.5">kcal per serving</p>
              </CardContent>
            </Card>

            {/* Macros */}
            <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-zinc-900">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Macronutrients</p>
                <div className="space-y-3">
                  {[
                    { label: "Protein", value: analysis.nutrition.protein, unit: "g", max: 50, color: "#3b82f6" },
                    { label: "Carbohydrates", value: analysis.nutrition.carbs, unit: "g", max: 100, color: "#f59e0b" },
                    { label: "Fat", value: analysis.nutrition.fat, unit: "g", max: 50, color: "#ec4899" },
                    { label: "Fiber", value: analysis.nutrition.fiber, unit: "g", max: 25, color: "#10b981" },
                  ].map(({ label, value, unit, max, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{value}{unit}</span>
                      </div>
                      <Progress value={Math.min((value / max) * 100, 100)} className="h-2" style={{ "--progress-bg": color } as React.CSSProperties} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Micronutrients */}
            {(analysis.nutrition.sodium || analysis.nutrition.sugar || analysis.nutrition.vitaminC) && (
              <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-zinc-900">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Micronutrients</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Sodium", value: analysis.nutrition.sodium, unit: "mg" },
                      { label: "Sugar", value: analysis.nutrition.sugar, unit: "g" },
                      { label: "Saturated Fat", value: analysis.nutrition.saturatedFat, unit: "g" },
                      { label: "Cholesterol", value: analysis.nutrition.cholesterol, unit: "mg" },
                      { label: "Vitamin A", value: analysis.nutrition.vitaminA, unit: "" },
                      { label: "Vitamin C", value: analysis.nutrition.vitaminC, unit: "" },
                      { label: "Calcium", value: analysis.nutrition.calcium, unit: "" },
                      { label: "Iron", value: analysis.nutrition.iron, unit: "" },
                    ]
                      .filter((x) => x.value !== undefined && x.value !== null)
                      .map(({ label, value, unit }) => (
                        <div key={label} className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-2.5">
                          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                            {value}{unit}
                          </p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Allergens */}
            {analysis.allergens.length > 0 && (
              <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-zinc-900">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Contains</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.allergens.map((a) => (
                      <Badge key={a} className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0 capitalize">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Insights */}
            {analysis.insights?.length > 0 && (
              <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-zinc-900">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2.5">AI Insights</p>
                  <ul className="space-y-2">
                    {analysis.insights.map((ins, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-emerald-500 mt-0.5 shrink-0">✦</span>
                        {ins}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Disclaimer + Log Button */}
            <Separator className="my-1" />
            <p className="text-[11px] text-gray-400 text-center px-2">
              Values are AI estimates. Consult a nutritionist for precise dietary guidance.
            </p>

            <div className="flex gap-2 pb-2">
              <Button
                className={`flex-1 h-12 rounded-2xl font-semibold transition-all ${
                  logged
                    ? "bg-emerald-500 text-white"
                    : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
                }`}
                onClick={logged ? () => navigate("/") : logMeal}
              >
                {logged ? (
                  <><Check className="h-4 w-4 mr-2" />Logged — View Dashboard</>
                ) : (
                  <>Log This Meal</>
                )}
              </Button>
              {!logged && (
                <Button
                  variant="outline"
                  className="h-12 rounded-2xl"
                  onClick={() => { setPreview(null); setImageData(null); setAnalysis(null); }}
                >
                  Rescan
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
