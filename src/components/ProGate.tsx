import { useState } from "react";
import { Sparkles, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";

interface ProGateProps {
  feature: string;
  description: string;
  onClose?: () => void;
}

const FREE_LIMIT = 3;

export function ProGate({ feature, description, onClose }: ProGateProps) {
  const { upgradeToPro } = useApp();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    upgradeToPro();
    setDone(true);
    setLoading(false);
    setTimeout(() => onClose?.(), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[430px] bg-white dark:bg-zinc-900 rounded-t-3xl p-6 pb-10 animate-slide-up">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/30">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CedricCoach Pro</h2>
          <p className="text-gray-500 text-sm mt-1 max-w-xs">{description}</p>
        </div>

        <div className="bg-gray-50 dark:bg-zinc-800 rounded-2xl p-4 mb-6 space-y-3">
          {[
            { text: "Unbegrenzte KI-Coach Nachrichten", pro: true },
            { text: "Foto-Scan & Nährwertanalyse", pro: true },
            { text: "Detaillierte Mahlzeiten-Insights", pro: true },
            { text: "Allergen-Erkennung", pro: true },
            { text: `Kostenlos: ${FREE_LIMIT} Nachrichten/Tag`, pro: false },
          ].map(({ text, pro }) => (
            <div key={text} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${pro ? "bg-emerald-500" : "bg-gray-200 dark:bg-zinc-700"}`}>
                <Check className={`h-3 w-3 ${pro ? "text-white" : "text-gray-400"}`} />
              </div>
              <span className={`text-sm ${pro ? "text-gray-800 dark:text-gray-200 font-medium" : "text-gray-400"}`}>{text}</span>
              {pro && <span className="ml-auto text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">PRO</span>}
            </div>
          ))}
        </div>

        <Button
          onClick={handlePurchase}
          disabled={loading || done}
          className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/30 transition-all duration-200 active:scale-95"
        >
          {done ? (
            <span className="flex items-center gap-2"><Check className="h-5 w-5" /> Aktiviert!</span>
          ) : loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Pro kaufen — CHF 9.99 einmalig"
          )}
        </Button>
        <p className="text-center text-xs text-gray-400 mt-3">Einmalige Zahlung · Keine Abonnement-Kosten</p>
      </div>
    </div>
  );
}

export { FREE_LIMIT };
