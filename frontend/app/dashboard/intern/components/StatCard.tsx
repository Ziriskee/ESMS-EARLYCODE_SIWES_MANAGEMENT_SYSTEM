import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";

type StatTone = 1 | 2 | 3 | 4;

type StatCardProps = {
  label: string;
  value: string;
  tone: StatTone;
  icon: LucideIcon;
  sub?: string;
  delta?: string;
  trend?: "up" | "down";
};

function useCountUp(target: number, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

function formatValue(raw: string): {
  animate: boolean;
  target: number;
  display: string;
} {
  // Pure numeric strings get the count-up treatment.
  if (/^\d+$/.test(raw)) {
    return { animate: true, target: parseInt(raw, 10), display: raw };
  }
  return { animate: false, target: 0, display: raw };
}

export function StatCard({
  label,
  value,
  tone,
  icon: Icon,
  sub,
  delta,
  trend,
}: StatCardProps) {
  const parsed = formatValue(value);
  const animated = useCountUp(parsed.animate ? parsed.target : 0);
  const display = parsed.animate
    ? String(animated).padStart(2, "0")
    : parsed.display;

  // Tone 4 = accent (gold card). Tones 1–3 = neutral.
  const isAccent = tone === 4;

  return (
    <article
      className="relative overflow-hidden rounded-[24px] border p-5 md:p-6"
      style={
        isAccent
          ? {
              background:
                "linear-gradient(140deg, #FFE566 0%, #FFD60A 52%, #F2C200 100%)",
              borderColor: "rgba(27, 22, 7, 0.1)",
              color: "var(--coal)",
              boxShadow: "0 22px 50px -22px rgba(242, 194, 0, 0.5)",
            }
          : {
              backgroundColor: "var(--surface)",
              borderColor: "var(--line)",
            }
      }
    >
      {isAccent && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full border"
            style={{ borderColor: "rgba(27, 22, 7, 0.1)" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 -top-4 h-24 w-24 rounded-full border"
            style={{ borderColor: "rgba(27, 22, 7, 0.1)" }}
          />
        </>
      )}

      <div className="relative flex items-start justify-between gap-2">
        <div
          className="grid h-10 w-10 place-items-center rounded-xl"
          style={
            isAccent
              ? {
                  backgroundColor: "rgba(27, 22, 7, 0.1)",
                  color: "var(--coal)",
                }
              : {
                  backgroundColor: "rgba(255, 214, 10, 0.1)",
                  color: "var(--gold-700)",
                  border: "1px solid rgba(255, 214, 10, 0.25)",
                }
          }
        >
          <Icon size={18} strokeWidth={1.8} />
        </div>

        {delta && trend && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold"
            style={
              isAccent
                ? {
                    backgroundColor: "rgba(27, 22, 7, 0.1)",
                    color: "rgba(27, 22, 7, 0.8)",
                  }
                : {
                    backgroundColor: "var(--tint)",
                    color: "var(--muted)",
                  }
            }
          >
            {trend === "up" ? "↑" : "↓"} {delta}
          </span>
        )}
      </div>

      <p
        className="relative mt-7 text-[11px] font-semibold uppercase tracking-[0.2em]"
        style={
          isAccent
            ? { color: "rgba(27, 22, 7, 0.6)" }
            : { color: "var(--muted)" }
        }
      >
        {label}
      </p>

      <p
        className="relative mt-2 text-4xl md:text-[42px] font-semibold leading-none tracking-tight"
        style={{
          color: isAccent ? "var(--coal)" : "var(--text)",
          fontFamily: "var(--font-display)",
        }}
      >
        {display}
      </p>

      {sub && (
        <p
          className="relative mt-3 text-xs"
          style={
            isAccent
              ? { color: "rgba(27, 22, 7, 0.6)" }
              : { color: "var(--muted)" }
          }
        >
          {sub}
        </p>
      )}
    </article>
  );
}