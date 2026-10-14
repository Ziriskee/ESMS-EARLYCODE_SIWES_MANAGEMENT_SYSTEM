import { useEffect, useState } from "react";
import { Card } from "../../shared/ui/Card";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ProfileHeaderCard } from "../../shared/ui/ProfileHeaderCard";
import { ProfileSection } from "../../shared/ui/ProfileSection";
import { apiFetch } from "../../../../lib/api";

type InternOwnProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  gender: string;
  profile_picture: string | null;
  state_of_origin: string;
  institution: string;
  course: string;
  level: string;
  matric_number: string;
  start_date: string | null;
  end_date: string | null;
  duration: string;
  instructor_name: string;
};

type InternDocument = {
  id: string;
  type: string;
  type_display: string;
  file_url: string | null;
  uploaded_at: string;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function InternProfilePage() {
  const [profile, setProfile] = useState<InternOwnProfile | null>(null);
  const [documents, setDocuments] = useState<InternDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        const [profileData, docsData] = await Promise.all([
          apiFetch<InternOwnProfile>("/intern/profile/"),
          apiFetch<{ results: InternDocument[] }>("/intern/documents/"),
        ]);
        if (!isMounted) return;
        setProfile(profileData);
        setDocuments(docsData.results ?? []);
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
    run();
    return () => {
      isMounted = false;
    };
  }, []);

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
    <div className="max-w-3xl space-y-4 sm:space-y-5">
      <ProfileHeaderCard
        src={profile.profile_picture}
        firstName={profile.first_name}
        lastName={profile.last_name}
        email={profile.email}
        roleLabel="Intern"
        locationLine={profile.institution}
      />
      <ProfileSection
        title="Personal information"
        fields={[
          { label: "First name", value: profile.first_name, locked: true },
          { label: "Last name", value: profile.last_name, locked: true },
          { label: "Email", value: profile.email, locked: true },
          { label: "Phone", value: profile.phone, locked: true },
          { label: "Gender", value: profile.gender, locked: true },
          {
            label: "State of origin",
            value: profile.state_of_origin,
            locked: true,
          },
        ]}
      />
      <ProfileSection
        title="Academic details"
        fields={[
          { label: "Institution", value: profile.institution, locked: true },
          { label: "Course of study", value: profile.course, locked: true },
          { label: "Current level", value: profile.level, locked: true },
          {
            label: "Matric number",
            value: profile.matric_number,
            locked: true,
          },
        ]}
      />
      <ProfileSection
        title="Placement"
        fields={[
          {
            label: "Start date",
            value: formatDate(profile.start_date),
            locked: true,
          },
          {
            label: "End date",
            value: formatDate(profile.end_date),
            locked: true,
          },
          { label: "Duration", value: profile.duration, locked: true },
          {
            label: "Assigned instructor",
            value: profile.instructor_name || "Not assigned",
            locked: true,
          },
        ]}
      />
      <Card padding="lg">
        <h3
          className="text-[16px] sm:text-[17px] font-semibold leading-tight mb-4"
          style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}
        >
          My documents
        </h3>
        {documents.length === 0 ? (
          <p className="text-[13px]" style={{ color: "var(--muted)" }}>
            No documents yet. Your acceptance letter and code of conduct appear
            here once they are generated.
          </p>
        ) : (
          <ul className="space-y-3">
            {documents.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p
                    className="text-[13.5px] font-semibold truncate"
                    style={{ color: "var(--text)" }}
                  >
                    {d.type_display}
                  </p>
                  <p
                    className="text-[11.5px] mt-0.5"
                    style={{ color: "var(--muted)" }}
                  >
                    {formatDate(d.uploaded_at)}
                  </p>
                </div>
                {d.file_url && (
                  <a
                    href={d.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 px-4 rounded-full text-[12.5px] font-semibold shrink-0 inline-flex items-center"
                    style={{
                      backgroundColor: "var(--surface2)",
                      color: "var(--text)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    Download
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
      <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>
        Your details are managed by the admin. Contact them if anything needs
        correcting.
      </p>
    </div>
  );
}
