import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Upload, Loader2, Camera } from "lucide-react";

interface NutritionData {
  calories: number;
  protein: string;
  carbohydrates: string;
  fat: string;
  fiber: string;
}

interface FoodAnalysis {
  foodName: string;
  description: string;
  estimatedServing: string;
  nutrition: NutritionData;
  healthHighlights: string[];
  suggestions: string[];
}

const API_URL = "http://localhost:3001";

export default function FoodAnalyzer() {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{
    base64: string;
    mimeType: string;
  } | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      const base64 = result.split(",")[1];
      setImageData({ base64, mimeType: file.type });
      setAnalysis(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const analyzeFood = async () => {
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
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze image."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Food Analyzer</h1>
            <p className="text-sm text-gray-500">
              Upload a food photo for nutritional insights
            </p>
          </div>
        </div>

        {/* Upload area */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                dragOver
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Food preview"
                  className="max-h-64 mx-auto rounded-lg object-contain"
                />
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-center gap-3">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">
                    Drop a food photo here
                  </p>
                  <p className="text-sm text-gray-400">
                    or click to browse — JPG, PNG, WEBP
                  </p>
                </div>
              )}
            </div>

            {imagePreview && (
              <div className="flex gap-2 mt-4">
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={analyzeFood}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    "Analyze Food"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setImagePreview(null);
                    setImageData(null);
                    setAnalysis(null);
                    setError(null);
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-4 pb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {analysis && (
          <div className="space-y-4">
            {/* Food ID */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{analysis.foodName}</CardTitle>
                <p className="text-sm text-gray-500">{analysis.description}</p>
                <Badge variant="secondary" className="w-fit mt-1">
                  Serving: {analysis.estimatedServing}
                </Badge>
              </CardHeader>
            </Card>

            {/* Nutrition */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Nutrition Facts</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {analysis.nutrition.calories}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Calories
                    </p>
                  </div>
                  {[
                    {
                      label: "Protein",
                      value: analysis.nutrition.protein,
                      color: "blue",
                    },
                    {
                      label: "Carbs",
                      value: analysis.nutrition.carbohydrates,
                      color: "yellow",
                    },
                    {
                      label: "Fat",
                      value: analysis.nutrition.fat,
                      color: "red",
                    },
                    {
                      label: "Fiber",
                      value: analysis.nutrition.fiber,
                      color: "green",
                    },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className={`bg-${color}-50 rounded-lg p-3 text-center`}
                    >
                      <p
                        className={`text-lg font-semibold text-${color}-600`}
                      >
                        {value}
                      </p>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Health highlights */}
            {analysis.healthHighlights?.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Health Highlights</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {analysis.healthHighlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-emerald-500 mt-0.5">✓</span>
                        <span className="text-gray-700">{h}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Suggestions */}
            {analysis.suggestions?.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {analysis.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-400 mt-0.5">→</span>
                        <span className="text-gray-700">{s}</span>
                      </li>
                    ))}
                  </ul>
                  <Separator className="mt-4" />
                  <p className="text-xs text-gray-400 mt-3">
                    Nutritional values are estimates based on the image. Consult
                    a nutritionist for precise dietary guidance.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
