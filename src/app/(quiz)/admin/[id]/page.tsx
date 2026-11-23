"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArnobotLogo } from "@/components/quiz/Brand";
import { STAGES } from "@/lib/hiring-stages";
import {
  Centered,
  DecisionBadge,
  Detail,
  ProgressEditor,
  ResumeViewer,
  draftFor,
  type Applicant,
} from "../_shared";

/** One applicant on its own page: summary, decision, progress, email and resume. */
export default function ApplicantPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [a, setA] = useState<Applicant | null | "missing" | "unauthorized">(null);
  const [compose, setCompose] = useState<{ subject: string; body: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [view, setView] = useState<"overview" | "emails">("overview");
  const [emails, setEmails] = useState<SentEmail[]>([]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/applicants?id=${encodeURIComponent(id)}`);
    if (res.status === 401) return setA("unauthorized");
    const data = await res.json();
    setA(data.applicants?.[0] ?? "missing");
  }, [id]);

  const loadEmails = useCallback(async () => {
    const res = await fetch(`/api/admin/emails?applicant=${encodeURIComponent(id)}`);
    if (res.ok) setEmails((await res.json()).emails);
  }, [id]);

  /* eslint-disable react-hooks/set-state-in-effect -- same async-load pattern as the dashboard. */
  useEffect(() => {
    void load();
    void loadEmails();
  }, [load, loadEmails]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (a === null) return <Centered><span className="text-muted">Loading…</span></Centered>;
  if (a === "unauthorized" || a === "missing") {
    return (
      <Centered>
        <div className="card p-8 text-center">
          <p className="text-ink font-semibold">
            {a === "unauthorized" ? "Please sign in first." : "Applicant not found."}
          </p>
          <Link href="/admin" className="inline-block mt-4 text-steel font-medium hover:underline">
            ← Back to the dashboard
          </Link>
        </div>
      </Centered>
    );
  }

  async function decide(decision: Applicant["decision"]) {
    await fetch("/api/admin/applicants", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, decision }),
    });
    void load();
  }

  async function del(app: Applicant) {
    if (!confirm(`Delete ${app.name || app.email}'s application?\n\nThis permanently removes their result and resume.`)) return;
    await fetch(`/api/admin/applicants?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    router.push("/admin");
  }

  async function send() {
    if (!compose) return;
    setSending(true);
    setMsg("");
    const res = await fetch("/api/admin/applicants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...compose }),
    });
    setSending(false);
    if (res.ok) {
      setCompose(null);
      setMsg("Mail sent ✓");
      void loadEmails();
    } else {
      const d = await res.json().catch(() => ({}));
      setMsg(d.error || "Mail failed.");
    }
  }

  const btn = "rounded-lg px-4 py-2 text-sm font-semibold border transition";

  return (
    <div className="relative z-10 min-h-[100dvh]">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-line shadow-nav">
        <div className="max-w-6xl mx-auto px-5 h-[76px] flex items-center gap-4">
          <ArnobotLogo height={44} variant="color" />
          <div className="pl-4 border-l border-line">
            <div className="text-base font-semibold text-ink leading-tight">Applicant details</div>
            <div className="text-xs text-muted">Hiring Dashboard</div>
          </div>
          <Link
            href="/admin"
            className="ml-auto text-sm font-medium text-body hover:text-ink border border-line rounded-lg px-4 py-2 hover:bg-surfaceAlt transition"
          >
            ← All applicants
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-7 space-y-5">
        {/* Summary + actions */}
        <div className="card p-6">
          <div className="flex flex-wrap items-start gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold text-ink">{a.name}</h1>
              <div className="text-sm text-muted mt-1">
                {a.email}
                {a.phone && <> · {a.phone}</>}
              </div>
              <div className="text-sm text-body mt-1">{a.role ?? "Role not chosen"}</div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <DecisionBadge decision={a.decision} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
            <Fact label="Score" value={a.score != null ? `${a.score}/${a.total} (${a.percent}%)` : "—"} />
            <Fact
              label="Result"
              value={a.passed == null ? "—" : a.passed ? "PASS" : "FAIL"}
              tone={a.passed == null ? undefined : a.passed ? "text-ok" : "text-bad"}
            />
            <Fact label="Stage" value={`${a.stage ?? "Applied"} (${STAGES.indexOf(a.stage ?? "Applied") + 1}/${STAGES.length})`} />
            <Fact label="Completed" value={a.completedAt ? new Date(a.completedAt).toLocaleString() : "—"} />
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-line">
            {a.decision !== "accepted" && (
              <button onClick={() => decide("accepted")} className={`${btn} border-ok/30 text-ok bg-okbg hover:brightness-95`}>
                ✓ Accept
              </button>
            )}
            {a.decision !== "rejected" && (
              <button onClick={() => decide("rejected")} className={`${btn} border-bad/20 text-bad bg-badbg hover:brightness-95`}>
                ✕ Reject
              </button>
            )}
            {a.decision && (
              <button onClick={() => decide(null)} className={`${btn} border-line text-body hover:bg-surfaceAlt`}>
                ↺ Reset to pending
              </button>
            )}
            <button
              onClick={() => {
                setMsg("");
                setCompose(compose ? null : draftFor(a));
              }}
              className={`${btn} border-navy bg-navy text-white hover:bg-navy2`}
            >
              ✉ Send email
            </button>
            {msg && <span className="text-sm font-medium text-body">{msg}</span>}
            <button onClick={() => del(a)} className="ml-auto text-sm font-medium text-bad hover:underline">
              🗑 Delete application
            </button>
          </div>

          {compose && (
            <div className="mt-5 rounded-xl border border-line bg-surfaceAlt/50 p-4">
              <div className="text-xs text-muted mb-2">
                From contact@arnobot.in to <b className="text-ink">{a.email}</b>
              </div>
              <input
                value={compose.subject}
                onChange={(e) => setCompose({ ...compose, subject: e.target.value })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-steel"
              />
              <textarea
                value={compose.body}
                onChange={(e) => setCompose({ ...compose, body: e.target.value })}
                rows={8}
                className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-steel"
              />
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={send}
                  disabled={sending || !compose.subject.trim() || !compose.body.trim()}
                  className="rounded-lg px-4 py-2 text-sm font-semibold bg-navy text-white hover:bg-navy2 disabled:opacity-50 transition"
                >
                  {sending ? "Sending…" : "Send"}
                </button>
                <button onClick={() => setCompose(null)} className="text-sm text-muted hover:text-ink">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-1 border-b border-line">
          {(
            [
              ["overview", "Overview"],
              ["emails", `Emails sent (${emails.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
                view === key ? "border-navy text-navy" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {view === "emails" && <EmailsTab emails={emails} />}

        {view === "overview" && (
        <>
        <ProgressEditor key={`${a.id}:${a.remarks ?? ""}`} a={a} onSaved={load} />

        <div className="card p-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">Profile</div>
          <div className="grid sm:grid-cols-3 gap-x-8 gap-y-2.5 text-sm">
            <Detail label="Birth year" value={a.birthYear} />
            <Detail label="Graduation year" value={a.gradYear} />
            <Detail label="City / Place" value={a.place} />
            <Detail label="College" value={a.college} />
            <Detail label="Degree" value={a.degree} />
            <Detail label="CGPA / Marks" value={a.cgpa} />
            <div className="sm:col-span-3">
              <Detail label="Address" value={a.address} />
            </div>
            {a.projects && (
              <div className="sm:col-span-3">
                <div className="text-muted mb-1 font-medium">Projects</div>
                <div className="whitespace-pre-wrap text-ink">{a.projects}</div>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <ResumeViewer a={a} />
        </div>
        </>
        )}
      </div>
    </div>
  );
}

type SentEmail = { id: number; to: string; subject: string; body: string; messageId: string | null; sentAt: string };

/** Gmail search for the exact message; works when signed in to the sending mailbox. */
function gmailLink(messageId: string): string {
  const q = `rfc822msgid:${messageId.replace(/[<>]/g, "")}`;
  return `https://mail.google.com/mail/?authuser=contact@arnobot.in#search/${encodeURIComponent(q)}`;
}

function EmailsTab({ emails }: { emails: SentEmail[] }) {
  if (emails.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-muted">
        No emails sent to this candidate yet. Use <b className="text-ink">✉ Send email</b> above.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {emails.map((e) => (
        <details key={e.id} className="card p-5 group">
          <summary className="cursor-pointer list-none flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="text-xs font-semibold rounded-full px-2.5 py-1 border border-ok/30 text-ok bg-okbg">✓ sent</span>
            <span className="font-semibold text-ink">{e.subject}</span>
            <span className="text-xs text-muted">to {e.to}</span>
            <span className="ml-auto text-xs text-muted">{new Date(e.sentAt).toLocaleString()}</span>
          </summary>
          <div className="mt-4 whitespace-pre-wrap text-sm text-body border-t border-line pt-4">{e.body}</div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
            <a href={`/api/admin/emails?id=${e.id}`} target="_blank" rel="noopener" className="text-steel hover:underline">
              ↗ View email as sent
            </a>
            {e.messageId && (
              <a
                href={gmailLink(e.messageId)}
                target="_blank"
                rel="noopener"
                className="text-steel hover:underline"
                title="Opens the message in the contact@arnobot.in Gmail, if you're signed in to it"
              >
                ↗ Open in Gmail
              </a>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}

function Fact({ label, value, tone = "text-ink" }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className={`text-sm font-semibold mt-1 ${tone}`}>{value}</div>
    </div>
  );
}
