import { Clock } from "lucide-react";

type WelcomeCardProps = {
  firstName: string;
  weeksCompleted: number | null;
  totalWeeks: number | null;
};

export function WelcomeCard({
  firstName,
  weeksCompleted,
  totalWeeks,
}: WelcomeCardProps) {
  const hasProgress =
    typeof weeksCompleted === "number" && typeof totalWeeks === "number";

  return (
    <section
      className="relative overflow-hidden rounded-[28px] px-6 py-8 sm:px-9 md:py-11"
      style={{
        background:
          "linear-gradient(115deg, #FFE566 0%, #FFD60A 46%, #F0C000 100%)",
        color: "var(--coal)",
        boxShadow: "0 28px 70px -32px rgba(255, 214, 10, 0.5)",
      }}
    >
      {/* Decorative concentric circles */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-44 h-[440px] w-[440px] rounded-full border"
        style={{ borderColor: "rgba(27, 22, 7, 0.1)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-24 h-[260px] w-[260px] rounded-full border"
        style={{ borderColor: "rgba(27, 22, 7, 0.1)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 left-1/3 h-44 w-44 rounded-full border"
        style={{ borderColor: "rgba(27, 22, 7, 0.1)" }}
      />

      {/* Week chip */}
      {hasProgress && (
        <div
          className="absolute right-6 top-6 hidden items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] sm:flex md:right-9 md:top-8"
          style={{
            backgroundColor: "rgba(27, 22, 7, 0.1)",
            color: "var(--coal)",
            border: "1px solid rgba(27, 22, 7, 0.15)",
          }}
        >
          <Clock size={13} strokeWidth={2} />
          Week {weeksCompleted} of {totalWeeks}
        </div>
      )}

      <p
        className="text-[11px] font-bold uppercase tracking-[0.3em] md:text-xs"
        style={{ color: "rgba(27, 22, 7, 0.6)" }}
      >
        SIWES Intern
      </p>

      <h1
        className="mt-3 max-w-2xl text-[clamp(30px,5vw,54px)] font-semibold leading-[1.04] tracking-tight"
        style={{
          color: "var(--coal)",
          fontFamily: "var(--font-display)",
        }}
      >
        Welcome back, {firstName}
      </h1>

      {/* Mobile week chip (shown below on small screens) */}
      {hasProgress && (
        <div
          className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] sm:hidden"
          style={{
            backgroundColor: "rgba(27, 22, 7, 0.1)",
            color: "var(--coal)",
            border: "1px solid rgba(27, 22, 7, 0.15)",
          }}
        >
          <Clock size={13} strokeWidth={2} />
          Week {weeksCompleted} of {totalWeeks}
        </div>
      )}
    </section>
  );
}
