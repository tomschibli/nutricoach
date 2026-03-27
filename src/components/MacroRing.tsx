interface Props {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label: string;
  sublabel?: string;
}

export default function MacroRing({
  value,
  max,
  size = 170,
  strokeWidth = 15,
  color,
  label,
  sublabel,
}: Props) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value / (max || 1), 0), 1);
  const offset = circ * (1 - pct);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          className="text-gray-100 dark:text-zinc-800"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={strokeWidth}
          stroke={color}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="absolute text-center select-none">
        <p
          className="text-3xl font-bold leading-none text-gray-900 dark:text-white"
          style={{ color: pct >= 1 ? "#f97316" : undefined }}
        >
          {value}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">/ {max} kcal</p>
        <p className="text-sm font-semibold mt-1" style={{ color }}>
          {label}
        </p>
        {sublabel && (
          <p className="text-[11px] text-gray-400 mt-0.5">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
