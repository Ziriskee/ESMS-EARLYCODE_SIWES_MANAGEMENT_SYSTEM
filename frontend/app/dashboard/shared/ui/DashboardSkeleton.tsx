export function DashboardSkeleton() {
  return (
    <div className="dashboard-root flex h-dvh overflow-hidden">
      {/* Sidebar skeleton */}
      <aside
        className="hidden lg:flex flex-col w-[260px] shrink-0 border-r"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--line)",
        }}
      >
        <div className="p-6">
          <div
            className="h-6 w-32 rounded animate-pulse"
            style={{ backgroundColor: "var(--surface2)" }}
          />
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-xl animate-pulse"
              style={{ backgroundColor: "var(--surface2)" }}
            />
          ))}
        </nav>
      </aside>

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col min-w-0 h-dvh">
        {/* Topbar skeleton */}
        <header
          className="h-[72px] shrink-0 border-b px-4 sm:px-6 md:px-8 lg:px-12 flex items-center justify-between"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--line)",
          }}
        >
          <div
            className="h-6 w-40 rounded animate-pulse"
            style={{ backgroundColor: "var(--surface2)" }}
          />
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--surface2)" }}
            />
            <div
              className="h-9 w-9 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--surface2)" }}
            />
          </div>
        </header>

        {/* Content skeleton */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-12 py-5 sm:py-6 md:py-8">
          <div className="space-y-6">
            {/* Stat cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-[120px] rounded-[24px] animate-pulse"
                  style={{ backgroundColor: "var(--surface2)" }}
                />
              ))}
            </div>

            {/* Content cards skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-[300px] rounded-[20px] animate-pulse"
                  style={{ backgroundColor: "var(--surface2)" }}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
