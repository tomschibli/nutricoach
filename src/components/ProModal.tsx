import { useState } from "react";
import { X, Sparkles, Camera, BarChart3, MessageSquare, Check, Zap } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface ProModalProps {
  onClose: () => void;
}

const FEATURES = [
  {
    icon: Camera,
    title: "Food Scanner & AI Analysis",
    desc: "Snap any meal and get instant nutrition data powered by Claude AI.",
    color: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: MessageSquare,
    title: "Unlimited AI Coach",
    desc: "Chat with your personal coach anytime — no daily message limits.",
    color: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    desc: "Deep insights into your nutrition trends, streaks, and progress.",
    color: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Zap,
    title: "Priority Everything",
    desc: "Faster responses, priority support, and early access to new features.",
    color: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
];

export default function ProModal({ onClose }: ProModalProps) {
  const { upgradeToPro, isPro } = useApp();
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [purchased, setPurchased] = useState(false);

  const price = billing === "yearly" ? "CHF 9.99" : "CHF 1.99";
  const priceLabel = billing === "yearly" ? "einmalig · für immer" : "/ Monat";
  const savings = billing === "yearly" ? "Spare 80% — einmalige Zahlung" : null;

  const handlePurchase = () => {
    setPurchased(true);
    upgradeToPro();
    setTimeout(onClose, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(12px)", backgroundColor: "rgba(0,0,0,0.55)" }}
    >
      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden animate-scale-in">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Header */}
        <div className="relative px-6 pt-8 pb-6 text-center overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-violet-50 to-white dark:from-violet-950/30 dark:to-zinc-900 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-violet-400/20 blur-3xl rounded-full pointer-events-none" />

          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/40">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h2
              className="text-2xl font-black tracking-tight"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #6366f1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              CedricCoach Pro
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Alle Features. Einmal bezahlen. Für immer.
            </p>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="px-6 mb-4">
          <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-xl p-1">
            {(["monthly", "yearly"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                  billing === b
                    ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {b === "monthly" ? "Monatlich" : "Einmalig"}
                {b === "yearly" && (
                  <span className="ml-1.5 text-[9px] font-bold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/40 px-1.5 py-0.5 rounded-full">
                    BEST
                  </span>
                )}
              </button>
            ))}
          </div>
          {savings && (
            <p className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
              ✦ {savings}
            </p>
          )}
        </div>

        {/* Features */}
        <div className="px-6 space-y-3 mb-5">
          {FEATURES.map(({ icon: Icon, title, desc, color, iconColor }) => (
            <div key={title} className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
              <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-1" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 pb-7">
          {isPro || purchased ? (
            <div className="w-full h-14 rounded-2xl bg-emerald-500 flex items-center justify-center gap-2">
              <Check className="h-5 w-5 text-white" />
              <span className="text-white font-bold">Pro aktiv!</span>
            </div>
          ) : (
            <button
              onClick={handlePurchase}
              className="relative w-full h-14 rounded-2xl font-bold text-white text-base overflow-hidden group transition-all duration-200 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 60%, #6366f1 100%)",
                boxShadow: "0 8px 32px rgba(124,58,237,0.4)",
              }}
            >
              {/* Hover shimmer */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg, #6d28d9 0%, #9333ea 60%, #4f46e5 100%)" }}
              />
              <span className="relative flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                Pro freischalten — {price}
                <span className="text-white/70 text-xs font-normal">{priceLabel}</span>
              </span>
            </button>
          )}
          <p className="text-center text-xs text-gray-400 mt-3">
            {billing === "yearly" ? "Einmalige Zahlung · Kein Abo · Keine versteckten Kosten" : "Jederzeit kündbar"}
          </p>
        </div>
      </div>
    </div>
  );
}
