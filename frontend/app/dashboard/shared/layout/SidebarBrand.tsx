type SidebarBrandProps = {
  collapsed: boolean;
  appLabel: string; // e.g. "Admin Console" or "Intern Space"
};

export function SidebarBrand({ collapsed, appLabel }: SidebarBrandProps) {
  return (
    <div className="flex items-center gap-3 px-5 pt-6 pb-2">
      <div
        className="h-10 w-10 shrink-0 rounded-xl grid place-items-center text-[15px] font-bold tracking-tight"
        style={{
          backgroundColor: "var(--gold-500)",
          color: "var(--coal)",
          boxShadow: "0 12px 28px -10px rgba(255, 214, 10, 0.6)",
        }}
      >
        EC
      </div>

      {!collapsed && (
        <div className="flex flex-col leading-tight min-w-0">
          <span
            className="text-[13px] font-bold tracking-[0.24em]"
            style={{ color: "var(--gold-500)" }}
          >
            SIWES
          </span>
          <span
            className="mt-0.5 text-[10px] font-semibold tracking-[0.22em] uppercase truncate"
            style={{ color: "var(--muted)" }}
          >
            {appLabel}
          </span>
        </div>
      )}
    </div>
  );
}
