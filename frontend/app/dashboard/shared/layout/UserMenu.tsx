import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { Avatar } from "../data/Avatar";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const roleLabel =
    user.role === "ADMIN"
      ? "Admin"
      : user.role === "INSTRUCTOR"
        ? "Instructor"
        : "Intern";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 h-10 pl-1 pr-3 rounded-full border transition-colors"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--bg-card)",
          color: "var(--text-primary)",
        }}
      >
        <Avatar
          firstName={user.first_name}
          lastName={user.last_name}
          size="sm"
        />
        <span className="text-[13px] font-medium hidden sm:inline">
          {user.first_name || "User"}
        </span>
        <ChevronDown size={14} strokeWidth={2} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-[14px] border overflow-hidden z-50"
          style={{
            borderColor: "var(--border-subtle)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          <div
            className="px-4 py-3 border-b"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <p
              className="text-[13px] font-semibold truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {user.first_name} {user.last_name}
            </p>
            <p
              className="text-[12px] truncate"
              style={{ color: "var(--text-secondary)" }}
            >
              {user.email}
            </p>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.06em] mt-1"
              style={{ color: "var(--text-tertiary)" }}
            >
              {roleLabel}
            </p>
          </div>

          <button
            type="button"
            role="menuitem"
            className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-left transition-colors"
            style={{ color: "var(--text-primary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--bg-card-elevated)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
            onClick={() => setOpen(false)}
          >
            <UserIcon size={16} strokeWidth={1.75} />
            Profile
          </button>

          <button
            type="button"
            role="menuitem"
            className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-left transition-colors"
            style={{ color: "var(--text-primary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--bg-card-elevated)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            <LogOut size={16} strokeWidth={1.75} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
