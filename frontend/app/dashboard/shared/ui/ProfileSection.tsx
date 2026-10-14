import { Card } from "./Card";

export type ProfileField = {
  label: string;
  value: string;
  locked?: boolean;
};

type ProfileSectionProps = {
  title: string;
  fields: ProfileField[];
  onEdit?: () => void;
  editLabel?: string;
};

export function ProfileSection({
  title,
  fields,
}: ProfileSectionProps) {
  return (
    <Card padding="lg">
      <div className="flex items-start justify-between gap-3 mb-5">
        <h3
          className="text-[16px] sm:text-[17px] font-semibold leading-tight"
          style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}
        >
          {title}
        </h3>
        
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
        {fields.map((f) => (
          <div key={f.label} className="min-w-0">
            <p
              className="text-[10.5px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: "var(--muted)" }}
            >
              {f.label}
              {f.locked}
            </p>
            <p
              className="text-[14px] mt-1 break-words"
              style={{ color: "var(--text)" }}
            >
              {f.value || "—"}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}