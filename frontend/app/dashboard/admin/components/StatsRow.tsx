import { FileText, GraduationCap, UserCheck, UserPlus } from "lucide-react";
import type { AdminDashboardStats } from "../types";

type StatsRowProps = {
  stats: AdminDashboardStats;
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function StatsRow({ stats }: StatsRowProps) {
  const items = [
    {
      label: "Pending interns",
      value: pad2(stats.pending_interns),
      sub: "Awaiting review",
      icon: UserPlus,
      accent: false,
    },
    {
      label: "Active interns",
      value: pad2(stats.active_interns),
      sub: "Currently on placement",
      icon: UserCheck,
      accent: false,
    },
    {
      label: "Instructors",
      value: pad2(stats.total_instructors),
      sub: "Total on roster",
      icon: GraduationCap,
      accent: false,
    },
    {
      label: "Missing documents",
      value: pad2(stats.missing_documents),
      sub: "Active interns without full docs",
      icon: FileText,
      accent: true,
    },
  ];
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <article
            key={item.label}
            className="relative overflow-hidden rounded-[24px] border p-5 md:p-6"
            style={
              item.accent
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
            {item.accent && (
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
                  item.accent
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
            </div>
            <p
              className="relative mt-7 text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={
                item.accent
                  ? { color: "rgba(27, 22, 7, 0.6)" }
                  : { color: "var(--muted)" }
              }
            >
              {item.label}
            </p>
            <p
              className="relative mt-2 text-4xl md:text-[42px] font-semibold leading-none tracking-tight"
              style={{
                color: item.accent ? "var(--coal)" : "var(--text)",
                fontFamily: "var(--font-display)",
              }}
            >
              {item.value}
            </p>
            <p
              className="relative mt-3 text-xs"
              style={
                item.accent
                  ? { color: "rgba(27, 22, 7, 0.6)" }
                  : { color: "var(--muted)" }
              }
            >
              {item.sub}
            </p>
          </article>
        );
      })}
    </section>
  );
}
