import { useEffect, useState } from "react";
import { Card } from "../../shared/ui/Card";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ProfileHeaderCard } from "../../shared/ui/ProfileHeaderCard";
import { ProfileSection } from "../../shared/ui/ProfileSection";
import { AdminProfileEditModal } from "../components/AdminProfileEditModal";
import { apiFetch } from "../../../../lib/api";

type AdminOwnProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  campus: string;
  profile_picture: string | null;
};

function formatCampus(campus: string): string {
  if (!campus) return "—";
  return campus.charAt(0).toUpperCase() + campus.slice(1);
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminOwnProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  
  // Bumping this key re-triggers the useEffect to refetch data
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<AdminOwnProfile>("/admin/profile/");
        if (isMounted) setProfile(data);
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load your profile",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]); // Re-runs when refreshKey changes

  if (loading && !profile) {
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
          roleLabel="Admin"
          locationLine={formatCampus(profile.campus)}
          action={
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="h-9 px-4 rounded-full text-[13px] font-semibold shrink-0"
              style={{ backgroundColor: "var(--gold-500)", color: "var(--coal)" }}
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
          // onEdit={() => setEditOpen(true)}
        />

        <ProfileSection
          title="Work"
          fields={[{ label: "Campus", value: formatCampus(profile.campus) }]}
          onEdit={() => setEditOpen(true)}
        />
      </div>

      <AdminProfileEditModal
        key={editOpen ? `edit-${profile.id}` : "closed"}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialPhone={profile.phone}
        initialCampus={profile.campus}
        onSaved={() => setRefreshKey((k) => k + 1)} // Triggers refetch
      />
    </>
  );
}