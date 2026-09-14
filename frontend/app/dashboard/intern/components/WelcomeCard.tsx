import { Card } from "../../shared/ui/Card";

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
    <Card variant="feature" padding="lg">
      <p
        className="text-[32px] md:text-[36px] font-bold leading-tight"
        style={{
          color: "var(--text-on-feature)",
          fontFamily: "var(--font-heading)",
        }}
      >
        Welcome back, {firstName}
      </p>

      {hasProgress && (
        <p
          className="text-[15px] mt-2"
          style={{ color: "var(--text-on-feature-secondary)" }}
        >
          Week {weeksCompleted} of {totalWeeks}
        </p>
      )}
    </Card>
  );
}
