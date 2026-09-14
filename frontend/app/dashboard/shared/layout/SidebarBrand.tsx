type SidebarBrandProps = {
  collapsed: boolean;
};

export function SidebarBrand({ collapsed }: SidebarBrandProps) {
  return (
    <div className="flex items-center gap-3 px-5 h-[72px] shrink-0">
      <div
        className="h-10 w-10 shrink-0 rounded-[10px] flex items-center justify-center font-bold text-[15px]"
        style={{
          backgroundColor: "var(--gold)",
          color: "var(--text-on-gold)",
        }}
      >
        EC
      </div>

      {!collapsed && (
        <div className="flex flex-col leading-tight min-w-0">
          <span
            className="text-[12px] font-semibold tracking-[0.14em] uppercase truncate"
            style={{ color: "var(--gold)" }}
          >
            SIWES
          </span>
          <span
            className="text-[11px] font-medium tracking-[0.08em] uppercase truncate"
            style={{ color: "var(--sidebar-nav-icon)" }}
          >
            Intern Space
          </span>
        </div>
      )}
    </div>
  );
}
