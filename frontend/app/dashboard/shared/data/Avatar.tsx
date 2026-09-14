type AvatarProps = {
  firstName: string;
  lastName?: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 48,
};

export function Avatar({ firstName, lastName, size = "md" }: AvatarProps) {
  const initials =
    (firstName?.[0] ?? "").toUpperCase() + (lastName?.[0] ?? "").toUpperCase();

  const px = sizeMap[size];

  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold shrink-0"
      style={{
        width: px,
        height: px,
        fontSize: size === "sm" ? 12 : size === "md" ? 14 : 16,
        backgroundColor: "var(--bg-card-elevated)",
        color: "var(--text-primary)",
        border: "1px solid var(--border-subtle)",
      }}
      aria-hidden="true"
    >
      {initials || "?"}
    </div>
  );
}
