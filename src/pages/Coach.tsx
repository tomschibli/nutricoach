import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, RotateCcw, Sparkles, Zap } from "lucide-react";
import { useApp } from "@/context/AppContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const STARTERS = [
  "What should I eat today?",
  "How can I hit my protein goals?",
  "Suggest a healthy breakfast",
  "I'm feeling low energy — help!",
  "Best pre-workout snacks?",
  "Am I on track with my goals?",
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function buildSystemPrompt(
  profile: ReturnType<typeof useApp>["profile"],
  todayCalories: number,
  mealCount: number
): string {
  if (!profile) {
    return "You are NutriCoach, a premium AI nutrition and fitness coach. Be encouraging, specific, and actionable. Use emojis warmly.";
  }
  const goalLabels: Record<string, string> = {
    lose_weight: "lose weight", maintain: "maintain weight",
    gain_muscle: "build muscle", improve_health: "improve health",
  };
  return `You are NutriCoach, a premium AI nutrition and fitness coach for ${profile.name}.

Profile: ${profile.age}y · ${profile.weight}kg · ${profile.height}cm · ${profile.sex}
Goal: ${goalLabels[profile.goal] ?? profile.goal}
Activity: ${profile.activityLevel.replace(/_/g, " ")}
Diet: ${profile.dietaryPreferences.join(", ") || "No restrictions"}
Allergies: ${profile.allergies.join(", ") || "None"}
Daily calorie goal: ${profile.dailyCalorieGoal} kcal
Macro goals: ${profile.macroGoals.protein}g protein · ${profile.macroGoals.carbs}g carbs · ${profile.macroGoals.fat}g fat

Today's progress: ${todayCalories} kcal consumed · ${mealCount} meals logged · ${Math.max(0, profile.dailyCalorieGoal - todayCalories)} kcal remaining

Be warm, personalized, and actionable. Keep responses concise (2–4 paragraphs). Use emojis to engage.`;
}

export default function Coach() {
  const { profile, getTodayLog } = useApp();
  const log = getTodayLog();
  const todayCals = log.meals.reduce((s, m) => s + m.analysis.nutrition.calories, 0);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: profile
        ? `Hey ${profile.name}! 👋 I'm your NutriCoach AI. I know you want to ${profile.goal.replace(/_/g, " ")} and I'm here every step of the way. What can I help with today?`
        : "Hi! I'm your NutriCoach AI. I'm here to help with nutrition, fitness, and reaching your health goals. What's on your mind?",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || streaming) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: t };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setError(null);
    setStreaming(true);
    setStreamingContent("");

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history
            .filter((m) => m.id !== "welcome")
            .map((m) => ({ role: m.role, content: m.content })),
          system: buildSystemPrompt(profile, todayCals, log.meals.length),
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") break;
          try {
            const { text: chunk, error: e } = JSON.parse(payload);
            if (e) throw new Error(e);
            if (chunk) { acc += chunk; setStreamingContent(acc); }
          } catch {}
        }
      }

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: acc },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reach API server.");
    } finally {
      setStreaming(false);
      setStreamingContent("");
      textareaRef.current?.focus();
    }
  };

  const reset = () => {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: profile
        ? `Hey ${profile.name}! 👋 Starting fresh — what can I help you with?`
        : "Starting a new conversation — what's on your mind?",
    }]);
    setInput("");
    setError(null);
  };

  const displayMessages = [...messages];
  if (streaming && streamingContent) {
    displayMessages.push({ id: "streaming", role: "assistant", content: streamingContent });
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-zinc-950 max-w-[430px] mx-auto">
      {/* Header */}
      <div className="flex-none px-4 pt-12 pb-3 flex items-center justify-between bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white">NutriCoach AI</h1>
            <p className="text-xs text-emerald-500 font-medium">● Online · Claude</p>
          </div>
        </div>
        {messages.length > 1 && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <RotateCcw className="h-3.5 w-3.5" /> New chat
          </button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-4 space-y-3">
          {displayMessages.map((msg, i) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 mr-2 mt-1 shadow-sm">
                  <Zap className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-br-md"
                    : "bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-200 rounded-bl-md"
                }`}
              >
                {msg.content}
                {msg.id === "streaming" && (
                  <span className="inline-block w-1.5 h-4 bg-violet-300 ml-0.5 animate-pulse align-middle rounded-sm" />
                )}
              </div>
            </div>
          ))}

          {/* Quick starters */}
          {messages.length === 1 && !streaming && (
            <div className="mt-4">
              <p className="text-xs text-center text-gray-400 mb-3">Quick prompts</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-full px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-3 py-2 text-red-600 dark:text-red-400 text-xs">
              ⚠️ {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input bar */}
      <div className="flex-none bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 px-4 py-3 pb-24">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
            }}
            placeholder="Ask your coach anything…"
            className="resize-none min-h-[44px] max-h-28 flex-1 text-sm rounded-2xl border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus-visible:ring-violet-500"
            rows={1}
            disabled={streaming}
          />
          <Button
            onClick={() => send(input)}
            disabled={!input.trim() || streaming}
            className="h-10 w-10 p-0 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shrink-0 shadow-md shadow-violet-500/30"
          >
            {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
