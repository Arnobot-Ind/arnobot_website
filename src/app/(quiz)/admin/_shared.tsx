"use client";

/** Pieces shared by the admin list page and the applicant detail page. */

import { useState } from "react";
import { STAGES, type Stage } from "@/lib/hiring-stages";

export type Applicant = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  place: string | null;
  birthYear: number | null;
  gradYear: number | null;
  college: string | null;
  degree: string | null;
  cgpa: string | null;
  projects: string | null;
  role: string | null;
  resumeName: string | null;
  status: string;
  decision: "accepted" | "rejected" | null;
  stage: Stage | null;
  remarks: string | null;
  score: number | null;
  total: number | null;
  percent: number | null;
  passed: boolean | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

export function DecisionBadge({ decision }: { decision: Applicant["decision"] }) {
  return (
    <span
      className={`text-xs font-semibold rounded-full px-2.5 py-1 border ${
        decision === "accepted"
          ? "border-ok/30 text-ok bg-okbg"
          : decision === "rejected"
            ? "border-bad/20 text-bad bg-badbg"
            : "border-line text-muted bg-surfaceAlt"
      }`}
    >
      {decision ?? "pending"}
    </span>
  );
}

export /** Stepper for the hiring stage (saves on click) plus a remarks box. */
function ProgressEditor({ a, onSaved }: { a: Applicant; onSaved: () => void }) {
  const [remarks, setRemarks] = useState(a.remarks ?? "");
  const [msg, setMsg] = useState("");
  const current = STAGES.indexOf(a.stage ?? "Applied");

  async function save(patch: { stage?: Stage; remarks?: string }) {
    setMsg("");
    const res = await fetch("/api/admin/applicants", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: a.id, ...patch }),
    });
    setMsg(res.ok ? "Saved ✓" : "Save failed.");
    if (res.ok) onSaved();
  }

  return (
    <div className="card p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Hiring progress</div>
      <ol className="flex flex-wrap items-center gap-1.5">
        {STAGES.map((st, i) => (
          <li key={st} className="flex items-center gap-1.5">
            <button
              onClick={() => save({ stage: st })}
              className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition ${
                i === current
                  ? "bg-navy text-white border-navy"
                  : i < current
                    ? "bg-navy/10 text-navy border-navy/20 hover:bg-navy/15"
                    : "bg-white text-muted border-line hover:border-steel/60 hover:text-ink"
              }`}
              aria-current={i === current ? "step" : undefined}
            >
              {i < current ? "✓ " : ""}
              {st}
            </button>
            {i < STAGES.length - 1 && <span className={`h-px w-4 ${i < current ? "bg-navy/40" : "bg-line"}`} />}
          </li>
        ))}
      </ol>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted mt-4 mb-1.5">Remarks</label>
      <textarea
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        rows={3}
        placeholder="Interview notes, follow-ups, anything the team should know…"
        className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-steel focus:ring-4 focus:ring-steel/15"
      />
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={() => save({ remarks })}
          disabled={remarks === (a.remarks ?? "")}
          className="rounded-lg px-4 py-2 text-sm font-semibold bg-navy text-white hover:bg-navy2 disabled:opacity-40 transition"
        >
          Save remarks
        </button>
        {msg && <span className="text-sm font-medium text-ok">{msg}</span>}
      </div>
    </div>
  );
}

/** Shows a PDF resume inline; other formats (DOC/DOCX) can only be downloaded. */
export function ResumeViewer({ a }: { a: Applicant }) {
  if (!a.resumeName) {
    return <div className="mt-6 text-sm text-muted">No resume uploaded.</div>;
  }
  const url = `/api/admin/resume/${a.id}`;
  const isPdf = /\.pdf$/i.test(a.resumeName);
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted">Resume · {a.resumeName}</div>
        <div className="flex gap-4 text-sm font-medium">
          {isPdf && (
            <a href={`${url}?inline=1`} target="_blank" rel="noopener" className="text-steel hover:underline">
              ↗ open in new tab
            </a>
          )}
          <a href={url} className="text-steel hover:underline">
            ⬇ download
          </a>
        </div>
      </div>
      {isPdf ? (
        <iframe src={`${url}?inline=1`} title={`Resume of ${a.name}`} className="w-full h-[75vh] rounded-xl border border-line bg-white" />
      ) : (
        <div className="card p-4 text-sm text-muted">Word documents can&apos;t be previewed in the browser — use download.</div>
      )}
    </div>
  );
}


export /** A reply drafted for the candidate's decision; editable before sending. */
function draftFor(a: Applicant): { subject: string; body: string } {
  const first = a.name.split(" ")[0] || a.name;
  const role = a.role ? ` for the ${a.role} role` : "";
  const [subject, body] =
    a.decision === "accepted"
      ? [
          "Your ARNOBOT application: next steps",
          `Hi ${first},\n\nThank you for applying to ARNOBOT${role}. We are pleased to tell you that you have been shortlisted. We will be in touch shortly to arrange the next round.\n\nRegards,\nARNOBOT Hiring Team`,
        ]
      : a.decision === "rejected"
        ? [
            "Your ARNOBOT application",
            `Hi ${first},\n\nThank you for applying to ARNOBOT${role} and for the time you put into the assessment. After careful review, we will not be moving forward with your application at this time. We wish you the very best.\n\nRegards,\nARNOBOT Hiring Team`,
          ]
        : ["Your ARNOBOT application", `Hi ${first},\n\n`];
  return { subject, body };
}


export function Detail({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <span className="text-muted font-medium">{label}: </span>
      <span className="text-ink">{value ?? "—"}</span>
    </div>
  );
}


export function Centered({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[100dvh] grid place-items-center px-4">{children}</div>;
}

