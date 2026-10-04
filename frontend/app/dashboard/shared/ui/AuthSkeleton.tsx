export function AuthSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6">
        <div
          className="h-8 w-48 mx-auto rounded animate-pulse"
          style={{ backgroundColor: "var(--surface2)" }}
        />
        <div
          className="h-[400px] rounded-[20px] animate-pulse"
          style={{ backgroundColor: "var(--surface2)" }}
        />
      </div>
    </div>
  );
}
