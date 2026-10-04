import { Card } from "./Card";
import { ProfileAvatar } from "./ProfileAvatar";

type ProfileHeaderCardProps = {
  src?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  roleLabel: string;
  locationLine: string;
  action?: React.ReactNode;
};

export function ProfileHeaderCard({
  src,
  firstName,
  lastName,
  email,
  roleLabel,
  locationLine,
  action,
}: ProfileHeaderCardProps) {
  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-center gap-4">
        <ProfileAvatar src={src} firstName={firstName} lastName={lastName} />
        <div className="min-w-0 flex-1">
          <h2
            className="text-[20px] sm:text-[22px] font-semibold leading-tight truncate"
            style={{
              color: "var(--gold-800)",
              fontFamily: "var(--font-display)",
            }}
          >
            {firstName} {lastName}
          </h2>
          <p
            className="text-[13px] mt-1 truncate"
            style={{ color: "var(--muted)" }}
          >
            {email}
          </p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-[3px] rounded-full"
              style={{ backgroundColor: "var(--tint)", color: "var(--muted)" }}
            >
              {roleLabel}
            </span>
            {locationLine && (
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-[3px] rounded-full"
                style={{
                  backgroundColor: "var(--tint)",
                  color: "var(--muted)",
                }}
              >
                {locationLine}
              </span>
            )}
          </div>
        </div>
        {action}
      </div>
    </Card>
  );
}
