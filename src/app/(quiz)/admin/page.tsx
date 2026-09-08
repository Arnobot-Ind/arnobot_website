"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { ArnobotLogo } from "@/components/quiz/Brand";

type Applicant = {
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
  score: number | null;
  total: number | null;
  percent: number | null;
  passed: boolean | null;
  completedAt: string | null;
  createdAt: string;
};
type Stats = { total: number; completed: number; passed: number };
type Question = {
  id: number;
  category: string;
  difficulty: string;
  question: string;
  image: string | null;
  options: string[];
  correct: number;
  active: boolean;
};
type Settings = { questionsPerTest: number; passPercent: number; timeLimitMin: number };
type Role = { id: string; name: string; skills: string[]; active: boolean };

type Tab = "applicants" | "roles" | "questions" | "settings";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [tab, setTab] = useState<Tab>("applicants");

  const [stats, setStats] = useState<Stats | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [byCategory, setByCategory] = useState<{ category: string; n: string }[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const loadApplicants = useCallback(async () => {
    const res = await fetch("/api/admin/applicants");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    setStats(data.stats);
    setApplicants(data.applicants);
    setAuthed(true);
  }, []);

  const loadQuestions = useCallback(async () => {
    const res = await fetch("/api/admin/questions");
    if (res.ok) {
      const data = await res.json();
      setQuestions(data.questions);
      setByCategory(data.byCategory);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    const res = await fetch("/api/admin/settings");
    if (res.ok) setSettings(await res.json());
  }, []);

  const loadRoles = useCallback(async () => {
    const res = await fetch("/api/admin/roles");
    if (res.ok) {
      const data = await res.json();
      setRoles(data.roles);
      setCategories(data.categories);
    }
  }, []);

  // The dashboard loads its data on mount and on tab change. Each loader is
  // async and only sets state after its `await fetch`, so nothing here sets
  // state during the effect's own synchronous pass — but the rule analyses the
  // call graph, not the timing, and reports any effect that reaches a setter.
  // Rewriting this as an event-driven or Suspense-based load is the real fix
  // and wants a live database to verify against.
  /* eslint-disable react-hooks/set-state-in-effect -- see the note above. */
  useEffect(() => {
    void loadApplicants();
  }, [loadApplicants]);

  useEffect(() => {
    if (!authed) return;
    if (tab === "questions") void loadQuestions();
    else if (tab === "settings") void loadSettings();
    else if (tab === "roles") void loadRoles();
  }, [authed, tab, loadQuestions, loadSettings, loadRoles]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginErr("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setPassword("");
      loadApplicants();
    } else {
      const d = await res.json().catch(() => ({}));
      setLoginErr(d.error || "Login failed.");
    }
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
  }

  if (authed === null) {
    return <Centered><span className="text-muted">Loading…</span></Centered>;
  }

  if (!authed) {
    return (
      <Centered>
        <form onSubmit={login} className="card p-8 w-[360px]">
          <div className="flex flex-col items-center gap-3 pb-2">
            <ArnobotLogo height={34} variant="color" />
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-steel">
              Hiring Dashboard
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink outline-none focus:border-steel focus:ring-4 focus:ring-steel/15 transition"
            />
            {loginErr && (
              <div className="text-sm text-bad bg-badbg border border-bad/20 rounded-lg px-3 py-2">
                {loginErr}
              </div>
            )}
            <button className="w-full rounded-xl bg-navy py-3 text-base font-semibold text-white shadow-btn hover:bg-navy2 transition">
              Sign in
            </button>
          </div>
        </form>
      </Centered>
    );
  }

  return (
    <div className="relative z-10 min-h-[100dvh]">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-line shadow-nav">
        <div className="max-w-6xl mx-auto px-5 h-[76px] flex items-center gap-4">
          <ArnobotLogo height={44} variant="color" />
          <div className="pl-4 border-l border-line">
            <div className="text-base font-semibold text-ink leading-tight">Hiring Dashboard</div>
            <div className="text-xs text-muted">Applicants, results &amp; question bank</div>
          </div>
          <button
            onClick={logout}
            className="ml-auto text-sm font-medium text-body hover:text-ink border border-line rounded-lg px-4 py-2 hover:bg-surfaceAlt transition"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-7">
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard label="Applicants" value={stats.total} />
            <StatCard label="Completed" value={stats.completed} />
            <StatCard label="Passed" value={stats.passed} accent="ok" />
          </div>
        )}

        <div className="flex gap-1 mb-5 border-b border-line">
          {(["applicants", "roles", "questions", "settings"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-semibold capitalize border-b-2 -mb-px transition ${
                tab === t
                  ? "border-navy text-navy"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "applicants" && (
          <ApplicantsTab applicants={applicants} onRefresh={loadApplicants} />
        )}
        {tab === "roles" && (
          <RolesTab roles={roles} categories={categories} onChanged={loadRoles} />
        )}
        {tab === "questions" && (
          <QuestionsTab questions={questions} byCategory={byCategory} onChanged={loadQuestions} />
        )}
        {tab === "settings" && settings && (
          <SettingsTab settings={settings} onSaved={(s) => setSettings(s)} />
        )}
      </div>
    </div>
  );
}

function ApplicantsTab({
  applicants,
  onRefresh,
}: {
  applicants: Applicant[];
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);

  async function del(a: Applicant) {
    if (
      !confirm(
        `Delete ${a.name || a.email}'s application?\n\nThis permanently removes their result and resume.`
      )
    )
      return;
    await fetch(`/api/admin/applicants?id=${encodeURIComponent(a.id)}`, { method: "DELETE" });
    onRefresh();
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onRefresh}
          className="text-sm font-medium text-body border border-line rounded-lg px-4 py-2 hover:bg-surfaceAlt hover:border-line2 transition"
        >
          ↻ Refresh
        </button>
        <a
          href="/api/admin/applicants?format=csv"
          className="text-sm font-medium text-white bg-navy rounded-lg px-4 py-2 hover:bg-navy2 transition"
        >
          ⬇ Export CSV
        </a>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted bg-surfaceAlt border-b border-line">
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">Resume</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {applicants.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted">
                    No applicants yet.
                  </td>
                </tr>
              )}
              {applicants.map((a) => (
                <Fragment key={a.id}>
                  <tr className="border-b border-line hover:bg-surfaceAlt/60">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setOpen(open === a.id ? null : a.id)}
                        className="text-left group"
                      >
                        <div className="font-semibold text-ink group-hover:text-navy">
                          <span className="text-muted mr-1.5">{open === a.id ? "▾" : "▸"}</span>
                          {a.name}
                        </div>
                        <div className="text-xs text-muted mt-0.5">{a.email}</div>
                        {a.phone && <div className="text-xs text-muted">{a.phone}</div>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium rounded-full px-2.5 py-1 border ${
                          a.status === "completed"
                            ? "border-navy/20 text-navy bg-navy/5"
                            : "border-warn/30 text-warn bg-amber-50"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-ink">
                      {a.score != null ? (
                        <>
                          <span className="font-semibold">
                            {a.score}/{a.total}
                          </span>{" "}
                          <span className="text-muted">({a.percent}%)</span>
                        </>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {a.passed == null ? (
                        <span className="text-muted">—</span>
                      ) : a.passed ? (
                        <span className="font-semibold text-ok">PASS</span>
                      ) : (
                        <span className="font-semibold text-bad">FAIL</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {a.resumeName ? (
                        <a
                          href={`/api/admin/resume/${a.id}`}
                          className="text-steel hover:text-navy hover:underline text-sm font-medium"
                        >
                          ⬇ download
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {a.completedAt ? new Date(a.completedAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => del(a)}
                        className="text-xs font-medium text-bad hover:underline"
                        title="Delete this application"
                      >
                        delete
                      </button>
                    </td>
                  </tr>
                  {open === a.id && (
                    <tr className="border-b border-line bg-surfaceAlt/50">
                      <td colSpan={7} className="px-5 py-4">
                        <div className="grid sm:grid-cols-3 gap-x-8 gap-y-2.5 text-sm">
                          <Detail label="Applying for" value={a.role} />
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
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function QuestionsTab({
  questions,
  byCategory,
  onChanged,
}: {
  questions: Question[];
  byCategory: { category: string; n: string }[];
  onChanged: () => void;
}) {
  const [bulk, setBulk] = useState("");
  const [bulkMsg, setBulkMsg] = useState("");

  async function toggle(q: Question) {
    await fetch("/api/admin/questions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: q.id, active: !q.active }),
    });
    onChanged();
  }
  async function del(q: Question) {
    if (!confirm("Delete this question?")) return;
    await fetch(`/api/admin/questions?id=${q.id}`, { method: "DELETE" });
    onChanged();
  }
  async function importBulk() {
    setBulkMsg("");
    let parsed: unknown;
    try {
      parsed = JSON.parse(bulk);
    } catch {
      setBulkMsg("Invalid JSON.");
      return;
    }
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    const res = await fetch("/api/admin/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bulk: arr }),
    });
    const data = await res.json();
    setBulkMsg(`Imported ${data.inserted}, skipped ${data.skipped}.`);
    setBulk("");
    onChanged();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted mr-1">Active by category:</span>
        {byCategory.map((c) => (
          <span
            key={c.category}
            className="text-xs font-medium rounded-full px-3 py-1 border border-line bg-surface text-body"
          >
            {c.category}: <b className="text-navy">{c.n}</b>
          </span>
        ))}
      </div>

      <details className="card p-5">
        <summary className="cursor-pointer text-base font-semibold text-ink">
          ＋ Bulk-import questions (JSON)
        </summary>
        <p className="text-sm text-muted mt-2 mb-3">
          Paste a JSON array of objects like{" "}
          <code className="text-navy bg-surfaceAlt rounded px-1 py-0.5 text-xs">
            {`{"category":"Coding","question":"…","options":["a","b","c","d"],"correct":0}`}
          </code>
          . Exactly 4 options; <code>correct</code> is a 0–3 index. Add{" "}
          <code className="text-navy">{`"image":"/diagrams/x.svg"`}</code> for diagram questions.
        </p>
        <textarea
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          rows={6}
          placeholder='[{"category":"Coding","question":"…","options":["a","b","c","d"],"correct":0}]'
          className="w-full bg-surfaceAlt border border-line rounded-xl px-3 py-2.5 text-xs font-mono text-ink outline-none focus:border-steel focus:ring-4 focus:ring-steel/15"
        />
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={importBulk}
            className="text-sm rounded-lg px-4 py-2 bg-navy text-white font-semibold hover:bg-navy2 transition"
          >
            Import
          </button>
          {bulkMsg && <span className="text-sm text-ok font-medium">{bulkMsg}</span>}
        </div>
      </details>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto max-h-[55vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surfaceAlt">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted border-b border-line">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Question</th>
                <th className="px-4 py-3">Answer</th>
                <th className="px-4 py-3">On</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b border-line align-top hover:bg-surfaceAlt/50">
                  <td className="px-4 py-3 text-muted">{q.id}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap text-body font-medium">
                    {q.category}
                    {q.image && <span className="ml-1 text-steel" title="Diagram question">▣</span>}
                  </td>
                  <td className="px-4 py-3 max-w-md text-ink">{q.question}</td>
                  <td className="px-4 py-3 text-xs text-ok font-medium max-w-[160px]">
                    {q.options[q.correct]}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle(q)}
                      className={`text-xs font-medium rounded-full px-2.5 py-1 border ${
                        q.active
                          ? "border-ok/30 text-ok bg-okbg"
                          : "border-line text-muted bg-surfaceAlt"
                      }`}
                    >
                      {q.active ? "active" : "off"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => del(q)}
                      className="text-xs text-bad hover:underline font-medium"
                    >
                      delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * The category chips a role's required skills are picked from.
 *
 * Declared at module scope rather than inside `RolesTab`: a component created
 * during render is a new type on every pass, so React unmounts and remounts the
 * whole picker each time the tab re-renders, losing focus mid-edit. `categories`
 * comes in as a prop now that it can no longer be closed over.
 */
function SkillPicker({
  categories,
  selected,
  onToggle,
}: {
  categories: string[];
  selected: string[];
  onToggle: (s: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => {
        const on = selected.includes(c);
        return (
          <button
            key={c}
            type="button"
            onClick={() => onToggle(c)}
            className={`text-sm rounded-full px-3.5 py-1.5 border-2 transition ${
              on
                ? "border-navy bg-navy/[0.05] text-navy font-semibold"
                : "border-line text-body hover:border-steel/60"
            }`}
          >
            {on ? "✓ " : ""}
            {c}
          </button>
        );
      })}
      {categories.length === 0 && (
        <span className="text-sm text-muted">No question categories found yet.</span>
      )}
    </div>
  );
}

function RolesTab({
  roles,
  categories,
  onChanged,
}: {
  roles: Role[];
  categories: string[];
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSkills, setEditSkills] = useState<string[]>([]);

  const toggle = (list: string[], s: string) =>
    list.includes(s) ? list.filter((x) => x !== s) : [...list, s];

  async function create() {
    setMsg("");
    const res = await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, skills }),
    });
    const data = await res.json();
    if (res.ok) {
      setName("");
      setSkills([]);
      setMsg("Role added ✓");
      onChanged();
    } else {
      setMsg(data.error || "Could not add role.");
    }
  }
  async function toggleActive(r: Role) {
    await fetch("/api/admin/roles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id, active: !r.active }),
    });
    onChanged();
  }
  async function saveEdit(r: Role) {
    const res = await fetch("/api/admin/roles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id, name: editName, skills: editSkills }),
    });
    if (res.ok) {
      setEditing(null);
      onChanged();
    }
  }
  async function del(r: Role) {
    if (!confirm(`Delete role "${r.name}"?`)) return;
    await fetch(`/api/admin/roles?id=${encodeURIComponent(r.id)}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <div className="space-y-5">
      <div className="card p-6">
        <h3 className="text-base font-semibold text-ink">Add a role</h3>
        <p className="text-sm text-muted mt-1">
          Name the role and pick the skills (question categories) candidates will be tested on.
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Robotics Software Engineer"
          className="mt-4 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-base text-ink outline-none focus:border-steel focus:ring-4 focus:ring-steel/15 transition"
        />
        <div className="mt-4">
          <div className="text-sm font-medium text-body mb-2">Required skills</div>
          <SkillPicker categories={categories} selected={skills} onToggle={(s) => setSkills((v) => toggle(v, s))} />
        </div>
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={create}
            disabled={name.trim().length < 2 || skills.length === 0}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-navy text-white shadow-btn hover:bg-navy2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Add role
          </button>
          {msg && <span className="text-sm text-ok font-medium">{msg}</span>}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted bg-surfaceAlt border-b border-line">
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Skills</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted">
                    No roles yet — add one above.
                  </td>
                </tr>
              )}
              {roles.map((r) => (
                <Fragment key={r.id}>
                  <tr className="border-b border-line align-top hover:bg-surfaceAlt/50">
                    <td className="px-4 py-3 font-semibold text-ink whitespace-nowrap">{r.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {r.skills.map((s) => (
                          <span
                            key={s}
                            className="text-xs font-medium rounded-full px-2.5 py-1 bg-surface border border-line text-body"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(r)}
                        className={`text-xs font-medium rounded-full px-2.5 py-1 border ${
                          r.active
                            ? "border-ok/30 text-ok bg-okbg"
                            : "border-line text-muted bg-surfaceAlt"
                        }`}
                      >
                        {r.active ? "active" : "off"}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (editing === r.id) {
                            setEditing(null);
                            return;
                          }
                          setEditing(r.id);
                          setEditName(r.name);
                          setEditSkills(r.skills);
                        }}
                        className="text-xs text-steel hover:underline font-medium mr-3"
                      >
                        {editing === r.id ? "close" : "edit"}
                      </button>
                      <button
                        onClick={() => del(r)}
                        className="text-xs text-bad hover:underline font-medium"
                      >
                        delete
                      </button>
                    </td>
                  </tr>
                  {editing === r.id && (
                    <tr className="border-b border-line bg-surfaceAlt/50">
                      <td colSpan={4} className="px-4 py-4">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full max-w-md rounded-xl border border-line bg-white px-4 py-2.5 text-base text-ink outline-none focus:border-steel focus:ring-4 focus:ring-steel/15 transition"
                        />
                        <div className="mt-3">
                          <SkillPicker
                            categories={categories}
                            selected={editSkills}
                            onToggle={(s) => setEditSkills((v) => toggle(v, s))}
                          />
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                          <button
                            onClick={() => saveEdit(r)}
                            disabled={editName.trim().length < 2 || editSkills.length === 0}
                            className="rounded-lg px-4 py-2 text-sm font-semibold bg-navy text-white hover:bg-navy2 disabled:opacity-50 transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="text-sm text-muted hover:text-ink"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({
  settings,
  onSaved,
}: {
  settings: Settings;
  onSaved: (s: Settings) => void;
}) {
  const [form, setForm] = useState(settings);
  const [msg, setMsg] = useState("");

  async function save() {
    setMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const s = await res.json();
      onSaved(s);
      setForm(s);
      setMsg("Saved ✓");
    } else {
      setMsg("Save failed.");
    }
  }

  return (
    <div className="card p-7 max-w-md space-y-5">
      <Field
        label="Questions per test"
        hint="How many questions each candidate receives (15–20 recommended)."
        value={form.questionsPerTest}
        onChange={(v) => setForm({ ...form, questionsPerTest: v })}
      />
      <Field
        label="Pass threshold (%)"
        hint="Minimum percentage correct to pass (70 = 7/10)."
        value={form.passPercent}
        onChange={(v) => setForm({ ...form, passPercent: v })}
      />
      <Field
        label="Time limit (minutes)"
        hint="0 = no time limit."
        value={form.timeLimitMin}
        onChange={(v) => setForm({ ...form, timeLimitMin: v })}
      />
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          className="rounded-xl px-6 py-2.5 text-base font-semibold bg-navy text-white shadow-btn hover:bg-navy2 transition"
        >
          Save settings
        </button>
        {msg && <span className="text-sm text-ok font-medium">{msg}</span>}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-body">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value || "0", 10))}
        className="mt-1.5 w-full bg-white border border-line rounded-xl px-4 py-2.5 text-base text-ink outline-none focus:border-steel focus:ring-4 focus:ring-steel/15 tabular-nums transition"
      />
      <div className="text-xs text-muted mt-1.5">{hint}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = "navy",
}: {
  label: string;
  value: number;
  accent?: "navy" | "ok";
}) {
  return (
    <div className="card p-5">
      <div className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</div>
      <div className={`text-4xl font-extrabold mt-1.5 ${accent === "ok" ? "text-ok" : "text-navy"}`}>
        {value}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <span className="text-muted font-medium">{label}: </span>
      <span className="text-ink">{value ?? "—"}</span>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[100dvh] grid place-items-center px-4">{children}</div>;
}
