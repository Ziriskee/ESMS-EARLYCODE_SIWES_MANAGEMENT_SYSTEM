import { useState } from "react";
import { Card } from "../../shared/ui/Card";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ProfileHeaderCard } from "../../shared/ui/ProfileHeaderCard";
import { ProfileSection } from "../../shared/ui/ProfileSection";
import { useInstructorProfile } from "../hooks/useInstructorProfile";
import { ProfileEditModal } from "../components/ProfileEditModal";

function formatCampus(campus: string): string {
  if (!campus) return "—";
  return campus.charAt(0).toUpperCase() + campus.slice(1);
}

export default function InstructorProfilePage() {
  const { profile, loading, error, refetch } = useInstructorProfile();
  const [editOpen, setEditOpen] = useState(false);

  if (loading) {
    return (
      <Card padding="lg">
        <p className="text-[14px]" style={{ color: "var(--muted)" }}>
          Loading your profile...
        </p>
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <Card padding="lg">
        <EmptyState
          title="We couldn't load your profile."
          description={error ?? "Please try again in a moment."}
        />
      </Card>
    );
  }

  return (
    <>
      <div className="max-w-3xl space-y-4 sm:space-y-5">
        <ProfileHeaderCard
          src={profile.profile_picture}
          firstName={profile.first_name}
          lastName={profile.last_name}
          email={profile.email}
          roleLabel="Instructor"
          locationLine={formatCampus(profile.campus)}
          action={
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="h-9 px-4 rounded-full text-[13px] font-semibold shrink-0"
              style={{
                backgroundColor: "var(--gold-500)",
                color: "var(--coal)",
              }}
            >
              Edit profile
            </button>
          }
        />

        <ProfileSection
          title="Personal information"
          fields={[
            { label: "First name", value: profile.first_name },
            { label: "Last name", value: profile.last_name },
            { label: "Email", value: profile.email, locked: true },
            { label: "Phone", value: profile.phone },
          ]}
        />

        <ProfileSection
          title="Work"
          fields={[
            { label: "Department", value: profile.department },
            {
              label: "Campus",
              value: formatCampus(profile.campus),
              locked: true,
            },
            {
              label: "Interns assigned",
              value: String(profile.assigned_intern_count),
              locked: true,
            },
          ]}
        />

        <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>
          Name, email and campus are managed by the admin. You can update your
          phone and department yourself.
        </p>
      </div>

      <ProfileEditModal
        key={editOpen ? `edit-${profile.id}` : "closed"}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
        onSaved={refetch}
      />
    </>
  );
}
