import { useState } from "react";

type ProfileAvatarProps = {
  src?: string | null;
  firstName: string;
  lastName: string;
  size?: "md" | "lg";
};

/**
 * Shows the user's picture (e.g. Google avatar) when available.
 * Falls back to initials on missing src OR failed image load.
 */
export function ProfileAvatar({
  src,
  firstName,
  lastName,
  size = "lg",
}: ProfileAvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = (
    (firstName || "?").charAt(0) + (lastName || "").charAt(0)
  ).toUpperCase();
  const dim = size === "lg" ? 72 : 44;
  const showImage = !!src && !failed;

  return (
    <div
      className="relative rounded-full overflow-hidden shrink-0 grid place-items-center"
      style={{
        width: dim,
        height: dim,
        backgroundColor: "var(--tint)",
        border: "1px solid var(--line)",
      }}
    >
      {showImage ? (
        <img
          src={src as string}
          alt={`${firstName} ${lastName}`}
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span
          className="font-semibold select-none"
          style={{
            color: "var(--gold-800)",
            fontFamily: "var(--font-display)",
            fontSize: size === "lg" ? 26 : 16,
          }}
        >
          {initials}
        </span>
      )}
      <span
        className="absolute rounded-full"
        style={{
          width: size === "lg" ? 14 : 10,
          height: size === "lg" ? 14 : 10,
          right: 2,
          bottom: 2,
          backgroundColor: "var(--status-approved-bg)",
          border: "2px solid var(--surface)",
        }}
        aria-label="Active"
      />
    </div>
  );
}