import { useState, useEffect, useRef } from "react";
import { Plus, ArrowLeft, Send, Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ProfileAvatar } from "../../ui/ProfileAvatar";
import { Modal } from "../../ui/Modal";

// ─── Types ───────────────────────────────────────────────────────
type UserLite = {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_picture: string | null;
};
type Conv = {
  id: string;
  other_user: UserLite;
  last_message: { body: string; sender_id: string; created_at: string } | null;
  unread_count: number;
  updated_at: string;
};
type Msg = {
  id: string;
  sender_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
};
type Thread = Conv & { messages: Msg[] };

// ─── Helpers ─────────────────────────────────────────────────────
const formatTime = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString())
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const POLL_MS = 10000;
const NEAR_BOTTOM_PX = 80;

// ─── Main Layout ─────────────────────────────────────────────────
type MessagesLayoutProps = {
  currentUserId: string;
  /** Called after a conversation is opened (messages marked read). */
  onConversationOpened?: () => void;
};

export function MessagesLayout({
  currentUserId,
  onConversationOpened,
}: MessagesLayoutProps) {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [thread, setThread] = useState<Thread | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);

  // Conversations: fetch on mount + poll
  useEffect(() => {
    let isMounted = true;
    const fetchConvs = async () => {
      try {
        const data = await apiFetch<Conv[]>("/messages/conversations/");
        if (isMounted) setConvs(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchConvs();
    const interval = setInterval(fetchConvs, POLL_MS);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Thread: fetch on open + poll while open (D2 — live incoming messages)
  useEffect(() => {
    if (!activeId) return;
    let isMounted = true;
    const fetchThread = async () => {
      try {
        const data = await apiFetch<Thread>(
          `/messages/conversations/${activeId}/`,
        );
        if (isMounted) {
          setThread(data);
          setConvs((prev) =>
            prev.map((c) =>
              c.id === activeId ? { ...c, unread_count: 0 } : c,
            ),
          );
          onConversationOpened?.();
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchThread();
    const interval = setInterval(fetchThread, POLL_MS);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeId, onConversationOpened]);

  // Jump to bottom when a different conversation is opened
  useEffect(() => {
    nearBottomRef.current = true;
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeId]);

  // D3 — auto-scroll on NEW messages only when the user is near bottom
  const lastMessageId =
    thread?.messages[thread.messages.length - 1]?.id ?? null;
  useEffect(() => {
    if (nearBottomRef.current && scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lastMessageId]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    nearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
  };

  // D4 — apiFetch throws on !ok; errors surface inline, draft preserved
  const handleSend = async () => {
    if (!draft.trim() || !activeId || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const msg = await apiFetch<Msg>(
        `/messages/conversations/${activeId}/messages/`,
        {
          method: "POST",
          body: JSON.stringify({ body: draft.trim() }),
        },
      );
      setThread((prev) =>
        prev ? { ...prev, messages: [...prev.messages, msg] } : null,
      );
      setConvs((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                last_message: {
                  body: msg.body,
                  sender_id: msg.sender_id,
                  created_at: msg.created_at,
                },
                updated_at: msg.created_at,
              }
            : c,
        ),
      );
      setDraft("");
      nearBottomRef.current = true;
      if (scrollRef.current)
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // D5 — create an empty thread; no auto-sent "Hi!"
  const handleStartChat = async (userId: string) => {
    const newConv = await apiFetch<Conv>("/messages/conversations/", {
      method: "POST",
      body: JSON.stringify({ recipient_id: userId }),
    });
    setConvs((prev) => [newConv, ...prev.filter((c) => c.id !== newConv.id)]);
    setActiveId(newConv.id);
    setModalOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-[var(--surface)] rounded-[28px] border border-[var(--line)] overflow-hidden shadow-sm">
      {/* LEFT PANE: Conversations */}
      <div
        className={`w-full md:w-80 border-r border-[var(--line)] flex flex-col bg-[var(--bg)] ${activeId ? "hidden md:flex" : "flex"}`}
      >
        <div className="p-5 border-b border-[var(--line)] flex items-center justify-between">
          <h2
            className="text-[18px] font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
          >
            Messages
          </h2>
          <button
            onClick={() => setModalOpen(true)}
            className="h-8 w-8 rounded-full grid place-items-center bg-[var(--gold-500)] text-[var(--coal)] hover:opacity-90 transition-opacity"
            aria-label="New message"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {convs.length === 0 && (
            <p className="p-5 text-[13px] text-[var(--muted)] text-center">
              No conversations yet.
            </p>
          )}
          {convs.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full p-4 flex items-start gap-3 border-b border-[var(--line)] hover:bg-[var(--surface)] transition-colors text-left ${activeId === c.id ? "bg-[var(--surface)]" : ""}`}
            >
              <ProfileAvatar
                src={c.other_user.profile_picture}
                firstName={c.other_user.first_name}
                lastName={c.other_user.last_name}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-[14px] font-semibold truncate"
                    style={{ color: "var(--text)" }}
                  >
                    {c.other_user.first_name} {c.other_user.last_name}
                  </span>
                  {c.last_message && (
                    <span className="text-[11px] text-[var(--muted)] shrink-0">
                      {formatTime(c.last_message.created_at)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {c.unread_count > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[var(--gold-500)] shrink-0" />
                  )}
                  <p
                    className={`text-[13px] truncate ${c.unread_count > 0 ? "font-semibold text-[var(--text)]" : "text-[var(--muted)]"}`}
                  >
                    {c.last_message
                      ? (c.last_message.sender_id === currentUserId
                          ? "You: "
                          : "") + c.last_message.body
                      : "Start of conversation"}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT PANE: Thread */}
      <div
        className={`flex-1 flex flex-col bg-[var(--surface)] ${activeId ? "flex" : "hidden md:flex"}`}
      >
        {activeId && thread ? (
          <>
            <div className="p-4 border-b border-[var(--line)] flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveId(null);
                  setThread(null);
                }}
                className="md:hidden h-8 w-8 rounded-full grid place-items-center hover:bg-[var(--surface2)]"
                aria-label="Back to conversations"
              >
                <ArrowLeft size={18} />
              </button>
              <ProfileAvatar
                src={thread.other_user.profile_picture}
                firstName={thread.other_user.first_name}
                lastName={thread.other_user.last_name}
                size="md"
              />
              <div>
                <p
                  className="text-[15px] font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {thread.other_user.first_name} {thread.other_user.last_name}
                </p>
                <p className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                  {thread.other_user.role}
                </p>
              </div>
            </div>

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-5 space-y-4"
            >
              {thread.messages.map((m) => {
                const isMe = m.sender_id === currentUserId;
                return (
                  <div
                    key={m.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-[20px] ${isMe ? "bg-[var(--gold-500)] text-[var(--coal)] rounded-br-sm" : "bg-[var(--surface2)] text-[var(--text)] rounded-bl-sm"}`}
                    >
                      <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">
                        {m.body}
                      </p>
                      <p
                        className={`text-[10px] mt-1 text-right ${isMe ? "text-[var(--coal)]/70" : "text-[var(--muted)]"}`}
                      >
                        {formatTime(m.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-[var(--line)]">
              {sendError && (
                <p
                  className="text-[12px] mb-2"
                  style={{ color: "var(--status-action-text)" }}
                >
                  {sendError}
                </p>
              )}
              <div className="flex items-center gap-2 bg-[var(--bg)] rounded-full border border-[var(--line)] px-4 py-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent outline-none text-[14px] text-[var(--text)] placeholder-[var(--muted)]"
                />
                <button
                  onClick={handleSend}
                  disabled={!draft.trim() || sending}
                  className="h-8 w-8 rounded-full grid place-items-center bg-[var(--gold-500)] text-[var(--coal)] disabled:opacity-50 hover:opacity-90 transition-opacity"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 grid place-items-center text-[var(--muted)] text-[14px]">
            Select a conversation to start messaging
          </div>
        )}
      </div>

      {modalOpen && (
        <NewChatModal
          onClose={() => setModalOpen(false)}
          onStart={handleStartChat}
        />
      )}
    </div>
  );
}

// ─── New Chat Modal ──────────────────────────────────────────────
function NewChatModal({
  onClose,
  onStart,
}: {
  onClose: () => void;
  onStart: (id: string) => Promise<void>;
}) {
  const [users, setUsers] = useState<UserLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((u) =>
    `${u.first_name} ${u.last_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        const data = await apiFetch<UserLite[]>("/messages/users/");
        if (isMounted) setUsers(data);
      } catch (e) {
        if (isMounted)
          setError(e instanceof Error ? e.message : "Failed to load users");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePick = async (id: string) => {
    if (starting) return;
    setStarting(true);
    setError(null);
    try {
      await onStart(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start conversation");
      setStarting(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose} title="New Message" size="sm">
      <div className="space-y-2 max-h-80 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-[var(--surface)] pb-3 pt-1">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--muted)" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full h-9 pl-9 pr-3 rounded-full text-[13px] border border-[var(--line)] bg-[var(--surface2)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]"
            />
          </div>
        </div>

        {loading && (
          <p className="text-[13px] text-[var(--muted)] p-4 text-center">
            Loading users...
          </p>
        )}
        {!loading && error && (
          <p
            className="text-[13px] p-4 text-center"
            style={{ color: "var(--status-action-text)" }}
          >
            {error}
          </p>
        )}
        {!loading && !error && filteredUsers.length === 0 && (
          <p className="text-[13px] text-[var(--muted)] p-4 text-center">
            {users.length === 0
              ? "No users available to message."
              : "No users match your search."}
          </p>
        )}
        {filteredUsers.map((u) => (
          <button
            key={u.id}
            onClick={() => handlePick(u.id)}
            disabled={starting}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface2)] transition-colors text-left disabled:opacity-50"
          >
            <ProfileAvatar
              src={u.profile_picture}
              firstName={u.first_name}
              lastName={u.last_name}
              size="md"
            />
            <div>
              <p className="text-[14px] font-semibold text-[var(--text)]">
                {u.first_name} {u.last_name}
              </p>
              <p className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                {u.role}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
