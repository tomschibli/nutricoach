import { useNavigate, useLocation } from "react-router-dom";
import { Home, Camera, MessageCircle, BarChart2, User } from "lucide-react";

const tabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/coach", icon: MessageCircle, label: "Coach" },
  { path: "/scan", icon: Camera, label: "Scan", isAction: true },
  { path: "/history", icon: BarChart2, label: "History" },
  { path: "/settings", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 flex justify-center pointer-events-none">
      <nav className="w-full max-w-[430px] pointer-events-auto bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-gray-200/60 dark:border-zinc-800/60">
        <div className="flex items-end justify-around h-16 px-2 pb-1">
          {tabs.map(({ path, icon: Icon, label, isAction }) => {
            const active = pathname === path;
            if (isAction) {
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="flex flex-col items-center -mt-6"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/40 ring-4 ring-white dark:ring-zinc-950">
                    <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] mt-1 text-gray-400 dark:text-zinc-500 font-medium">
                    {label}
                  </span>
                </button>
              );
            }
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-[48px]"
              >
                <Icon
                  className={`h-[22px] w-[22px] transition-colors ${
                    active
                      ? "text-emerald-500"
                      : "text-gray-400 dark:text-zinc-500"
                  }`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    active
                      ? "text-emerald-500"
                      : "text-gray-400 dark:text-zinc-500"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
