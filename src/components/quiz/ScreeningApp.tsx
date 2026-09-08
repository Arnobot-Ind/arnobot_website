"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArnobotLogo, Diamonds } from "./Brand";

type Step = "login" | "role" | "resume" | "profile" | "exam" | "result";

type RoleOption = { id: string; name: string; skills: string[] };

type Question = {
  id: number;
  category: string;
  question: string;
  image: string | null;
  options: string[];
};
type QuizData = {
  token: string;
  questions: Question[];
  passPercent: number;
  timeLimitMin: number;
  total: number;
};
type Breakdown = Record<string, { correct: number; total: number }>;
type Result = {
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  passPercent: number;
  breakdown: Breakdown;
};

type Profile = {
  name: string;
  email: string;
  phone: string;
  address: string;
  place: string;
  birthYear: string;
  gradYear: string;
  college: string;
  degree: string;
  cgpa: string;
  projects: string;
};

const EMPTY_PROFILE: Profile = {
  name: "",
  email: "",
  phone: "",
  address: "",
  place: "",
  birthYear: "",
  gradYear: "",
  college: "",
  degree: "",
  cgpa: "",
  projects: "",
};

const REQUIRED: (keyof Profile)[] = ["name", "address", "birthYear", "gradYear"];

export default function ScreeningApp() {
  const [step, setStep] = useState<Step>("login");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [roleId, setRoleId] = useState<string>("");
  const [missing, setMissing] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [leftExam, setLeftExam] = useState(false); // exam ended by leaving the tab

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const answersRef = useRef<Record<string, number>>({});
  const endingRef = useRef(false); // guards single-fire when the exam tab is left
  const [result, setResult] = useState<Result | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // ── Login ────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: v }),
      });
      await res.json().catch(() => null);
      // Retakes are allowed — proceed regardless of any prior completion.
      setEmail(v);
      setProfile((p) => ({ ...p, email: v }));
      // Load selectable roles; skip the role step if none are configured.
      try {
        const rr = await fetch("/api/roles");
        const rd = await rr.json();
        const list: RoleOption[] = Array.isArray(rd?.roles) ? rd.roles : [];
        setRoles(list);
        setStep(list.length ? "role" : "resume");
      } catch {
        setRoles([]);
        setStep("resume");
      }
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // ── Resume upload + parse ────────────────────────────────────────
  async function handleResume() {
    if (!file) {
      setError("Please choose your resume file.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("email", email);
      fd.append("resume", file);
      const res = await fetch("/api/resume/parse", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not process the resume.");
        return;
      }
      const p = data.parsed as Partial<Profile>;
      setProfile((prev) => ({
        ...prev,
        ...Object.fromEntries(
          Object.keys(EMPTY_PROFILE).map((k) => [
            k,
            (p as Record<string, string>)[k] ?? prev[k as keyof Profile] ?? "",
          ])
        ),
        email,
      } as Profile));
      setMissing(new Set<string>(data.missing || []));
      setStep("profile");
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // ── Start / restart the exam ─────────────────────────────────────
  const startExam = useCallback(async () => {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, profile, roleId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.missing) setMissing(new Set(data.missing));
        if (data.roleGone) {
          // Role was removed mid-flow — reload roles and re-pick.
          try {
            const rr = await fetch("/api/roles");
            const rd = await rr.json();
            setRoles(Array.isArray(rd?.roles) ? rd.roles : []);
          } catch {
            /* ignore */
          }
          setRoleId("");
          setStep("role");
        }
        setError(data.error || "Could not start the assessment.");
        return;
      }
      const q: QuizData = data;
      setQuiz(q);
      answersRef.current = {};
      endingRef.current = false;
      setLeftExam(false);
      setResult(null);
      setQIndex(0);
      setSelected(null);
      setTimeLeft(q.timeLimitMin > 0 ? q.timeLimitMin * 60 : null);
      setStep("exam");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }, [email, profile, roleId]);

  // ── Profile → start exam ─────────────────────────────────────────
  function handleStartExam(e: React.FormEvent) {
    e.preventDefault();
    const miss = REQUIRED.filter((k) => !String(profile[k]).trim());
    const badYear =
      !/^\d{4}$/.test(profile.birthYear.trim()) || !/^\d{4}$/.test(profile.gradYear.trim());
    if (miss.length || badYear) {
      setMissing(new Set([...miss, ...(badYear ? ["birthYear", "gradYear"] : [])]));
      setError("Please complete all required fields (marked *). Years must be 4 digits.");
      return;
    }
    void startExam();
  }

  // Retake keeps the confirmed profile, so it re-starts a fresh randomized exam.
  const retake = useCallback(() => {
    void startExam();
  }, [startExam]);

  // ── Exam navigation (forward-only) ───────────────────────────────
  function next() {
    if (!quiz || selected === null) return;
    const item = quiz.questions[qIndex];
    if (!item) return;
    answersRef.current[String(item.id)] = selected;
    const n = qIndex + 1;
    if (n < quiz.questions.length) {
      setQIndex(n);
      setSelected(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      void submitExam(false);
    }
  }

  // The compiler declines to take over this `useCallback` — it writes through
  // `answersRef` before awaiting, which it will not re-order behind its own
  // memoization. The manual memo has to stay regardless: the leave-the-tab
  // effect below lists `submitExam` in its deps, so an unstable identity would
  // tear down and re-add the visibilitychange listener on every render.
  /* eslint-disable react-hooks/preserve-manual-memoization -- see the note above. */
  const submitExam = useCallback(
    async (timedOut: boolean) => {
      if (!quiz) return;
      const answered = quiz.questions[qIndex];
      if (!timedOut && selected !== null && answered) {
        answersRef.current[String(answered.id)] = selected;
      }
      setBusy(true);
      setTimeLeft(null);
      try {
        const res = await fetch("/api/quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: quiz.token, answers: answersRef.current }),
        });
        const data: Result = await res.json();
        if (!res.ok) {
          setError((data as unknown as { error?: string }).error || "Submission failed.");
          return;
        }
        setResult(data);
        setStep("result");
        window.scrollTo({ top: 0 });
      } catch {
        setError("Could not submit. Please check your connection.");
      } finally {
        setBusy(false);
      }
    },
    [quiz, qIndex, selected]
  );
  /* eslint-enable react-hooks/preserve-manual-memoization */

  // ── Countdown ────────────────────────────────────────────────────
  // Sits below `submitExam` because it calls it: declared above, the reference
  // would read a `const` in its temporal dead zone on the tick that runs out.
  useEffect(() => {
    if (step !== "exam" || timeLeft == null) return;
    if (timeLeft <= 0) {
      void submitExam(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => (s == null ? s : s - 1)), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, timeLeft]);

  // ── End the exam if the candidate leaves the tab ─────────────────
  // Switching tabs / minimising during the exam ends the attempt (auto-submits
  // whatever was answered). Only armed while the exam is on screen.
  useEffect(() => {
    if (step !== "exam") return;
    const onHidden = () => {
      if (document.visibilityState === "hidden" && !endingRef.current) {
        endingRef.current = true;
        setLeftExam(true);
        void submitExam(true);
      }
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, [step, submitExam]);

  // ── Block copy / cut / right-click while the exam is on screen ────
  // Stops candidates lifting the question + options to paste into an AI.
  useEffect(() => {
    if (step !== "exam") return;
    const block = (e: Event) => e.preventDefault();
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("contextmenu", block);
    return () => {
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("contextmenu", block);
    };
  }, [step]);

  const setField = (k: keyof Profile, v: string) =>
    setProfile((p) => ({ ...p, [k]: v }));

  const roleName = roles.find((r) => r.id === roleId)?.name || "";

  // The question on screen. Bound here rather than indexed inside the JSX so
  // the exam step can gate on it: if `qIndex` ever ran past the served set we
  // would render a question with no text and no options, which looks like a
  // broken test rather than the bug it is.
  const currentQuestion = quiz?.questions[qIndex];

  // ── Shell ────────────────────────────────────────────────────────
  return (
    <div className="relative z-10 min-h-[100dvh] flex flex-col">
      {/* Top navigation with big logo */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-line shadow-nav">
        <div className="max-w-5xl mx-auto px-5 h-[76px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ArnobotLogo height={48} variant="color" />
            <span className="hidden sm:inline text-sm font-medium text-muted border-l border-line pl-4">
              Screening Assistant
            </span>
          </div>
          {step === "exam" && quiz ? (
            <div className="flex items-center gap-4">
              {timeLeft != null && (
                <span
                  className={`text-sm font-semibold tabular-nums px-3 py-1.5 rounded-lg border ${
                    timeLeft < 60
                      ? "text-bad border-bad/30 bg-badbg"
                      : "text-navy border-line bg-surfaceAlt"
                  }`}
                >
                  ⏱ {fmtTime(timeLeft)}
                </span>
              )}
              <span className="text-sm font-medium text-muted">
                {qIndex + 1} / {quiz.total}
              </span>
            </div>
          ) : (
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">
              ARNOBOT Pvt. Ltd.
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-5 py-8 sm:py-12">
        {step === "login" && (
          <Centered>
            <Card>
              <Brand
                title="Welcome to the ARNOBOT screening"
                subtitle="A short technical assessment for candidates applying to ARNOBOT Private Limited."
              />
              <form onSubmit={handleLogin} className="space-y-4 mt-7">
                <div>
                  <Label>Work or personal email</Label>
                  <input
                    autoFocus
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputCls}
                  />
                </div>
                <p className="text-sm text-muted">
                  You&apos;ll sign in with this email. Each email may attempt the assessment only once.
                </p>
                {error && <Err>{error}</Err>}
                <PrimaryButton disabled={busy}>{busy ? "Checking…" : "Continue"}</PrimaryButton>
              </form>
            </Card>
          </Centered>
        )}

        {step === "role" && (
          <Centered>
            <div className="card p-7 sm:p-9 w-full max-w-2xl mx-auto animate-pop">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel">
                Choose your role
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
                Which role are you applying for?
              </h1>
              <p className="text-base text-body mt-2">
                You&apos;ll be assessed on the skills required for the role you pick.
              </p>
              <div className="mt-6 grid gap-3">
                {roles.map((r) => {
                  const active = roleId === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setError("");
                        setRoleId(r.id);
                      }}
                      className={`text-left rounded-xl border-2 px-5 py-4 transition ${
                        active
                          ? "border-navy bg-navy/[0.04] ring-1 ring-navy/10"
                          : "border-line bg-white hover:border-steel/60 hover:bg-surfaceAlt"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-lg font-semibold text-ink">{r.name}</span>
                        <span
                          className={`shrink-0 w-5 h-5 rounded-full border-2 grid place-items-center ${
                            active ? "border-navy" : "border-line2"
                          }`}
                        >
                          {active && <span className="w-2.5 h-2.5 rounded-full bg-navy" />}
                        </span>
                      </div>
                      {r.skills.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {r.skills.map((s) => (
                            <span
                              key={s}
                              className="text-xs font-medium rounded-full px-2.5 py-1 bg-surfaceAlt border border-line text-body"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {error && <div className="mt-3"><Err>{error}</Err></div>}
              <div className="mt-6">
                <PrimaryButton
                  disabled={!roleId}
                  onClick={() => {
                    setError("");
                    setStep("resume");
                  }}
                >
                  Continue
                </PrimaryButton>
              </div>
            </div>
          </Centered>
        )}

        {step === "resume" && (
          <Centered>
            <Card>
              <StepHead n={1} total={3} title="Upload your resume" />
              {roleName && (
                <div className="mt-2 text-sm font-medium text-steel">Applying for: {roleName}</div>
              )}
              <p className="text-base text-body mt-2">
                We&apos;ll read your resume to pre-fill your details. PDF, DOC or DOCX, up to 4 MB.
              </p>
              <label className="mt-6 block cursor-pointer rounded-xl border-2 border-dashed border-line2 hover:border-steel hover:bg-surfaceAlt px-5 py-10 text-center transition">
                <div className="mx-auto w-12 h-12 rounded-xl brand-gradient grid place-items-center text-white text-xl">
                  ↑
                </div>
                <div className="text-base font-medium text-ink mt-3">
                  {file ? file.name : "Click to choose your resume"}
                </div>
                <div className="text-sm text-muted mt-1">PDF / DOC / DOCX · max 4 MB</div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => {
                    setError("");
                    setFile(e.target.files?.[0] ?? null);
                  }}
                />
              </label>
              {error && <div className="mt-3"><Err>{error}</Err></div>}
              <div className="mt-6">
                <PrimaryButton disabled={busy || !file} onClick={handleResume}>
                  {busy ? "Reading your resume…" : "Analyze & continue"}
                </PrimaryButton>
              </div>
            </Card>
          </Centered>
        )}

        {step === "profile" && (
          <Card wide>
            <StepHead n={2} total={3} title="Confirm your details" />
            <p className="text-base text-body mt-2">
              We pre-filled what we could read from your resume. Please review, correct, and fill
              anything missing. Fields marked <span className="text-bad font-semibold">*</span> are
              required.
            </p>
            <form onSubmit={handleStartExam} className="mt-7 grid sm:grid-cols-2 gap-5">
              <FieldRow label="Full name" req k="name" profile={profile} set={setField} missing={missing} />
              <FieldRow label="Email" k="email" profile={profile} set={setField} missing={missing} readOnly />
              <FieldRow label="Phone" k="phone" profile={profile} set={setField} missing={missing} />
              <FieldRow label="City / Place" k="place" profile={profile} set={setField} missing={missing} />
              <FieldRow label="Birth year" req k="birthYear" profile={profile} set={setField} missing={missing} placeholder="e.g. 2000" />
              <FieldRow label="College graduation year" req k="gradYear" profile={profile} set={setField} missing={missing} placeholder="e.g. 2023" />
              <FieldRow label="College / University" k="college" profile={profile} set={setField} missing={missing} />
              <FieldRow label="Degree" k="degree" profile={profile} set={setField} missing={missing} />
              <FieldRow label="College marks (CGPA / %)" k="cgpa" profile={profile} set={setField} missing={missing} />
              <div className="sm:col-span-2">
                <FieldRow label="Address" req k="address" profile={profile} set={setField} missing={missing} />
              </div>
              <div className="sm:col-span-2">
                <Label>Projects done</Label>
                <textarea
                  value={profile.projects}
                  onChange={(e) => setField("projects", e.target.value)}
                  rows={3}
                  placeholder="Briefly list your key projects…"
                  className={inputCls}
                />
              </div>
              {error && <div className="sm:col-span-2"><Err>{error}</Err></div>}
              <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-line mt-1">
                <span className="text-sm text-muted">
                  Your details &amp; resume are stored securely for the ARNOBOT hiring team.
                </span>
                <PrimaryButton disabled={busy} inline>
                  {busy ? "Starting…" : "Start assessment"}
                </PrimaryButton>
              </div>
            </form>
          </Card>
        )}

        {step === "exam" && quiz && currentQuestion && (
          <div
            className="max-w-3xl mx-auto select-none"
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted">
                Progress · {Math.round((qIndex / quiz.total) * 100)}%
              </span>
              <span className="text-sm font-medium text-muted">
                Question {qIndex + 1} of {quiz.total}
              </span>
            </div>
            <div className="h-2 rounded-full bg-line overflow-hidden mb-6">
              <div
                className="h-full brand-gradient transition-all duration-500"
                style={{ width: `${(qIndex / quiz.total) * 100}%` }}
              />
            </div>
            <ExamQuestion
              key={currentQuestion.id}
              q={currentQuestion}
              selected={selected}
              onSelect={setSelected}
            />
            {error && <div className="mt-3"><Err>{error}</Err></div>}
            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm text-muted">
                Forward-only · copying is disabled · leaving the tab ends the exam
              </span>
              <PrimaryButton inline disabled={selected === null || busy} onClick={next}>
                {qIndex + 1 === quiz.total ? (busy ? "Submitting…" : "Submit assessment") : "Next"}
              </PrimaryButton>
            </div>
          </div>
        )}

        {step === "result" && result && (
          <Centered>
            {leftExam ? (
              <EndedView onRetake={retake} busy={busy} />
            ) : (
              <ResultView result={result} name={profile.name} onRetake={retake} busy={busy} />
            )}
          </Centered>
        )}
      </main>

      <footer className="text-center text-xs text-muted py-5">
        © ARNOBOT Private Limited · Confidential candidate assessment
      </footer>
    </div>
  );
}

/* ───────────────────────── Shared styles ───────────────────────── */

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-steel focus:ring-4 focus:ring-steel/15";

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="grid place-items-center min-h-[55vh] animate-fade">{children}</div>;
}

function Card({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`card p-7 sm:p-9 w-full animate-pop ${wide ? "max-w-2xl mx-auto" : "max-w-md"}`}>
      {children}
    </div>
  );
}

function Brand({
  title,
  subtitle,
  tone = "navy",
}: {
  title: string;
  subtitle: string;
  tone?: "navy" | "good" | "bad";
}) {
  const ring =
    tone === "good"
      ? "bg-okbg border-ok/30"
      : tone === "bad"
      ? "bg-badbg border-bad/30"
      : "bg-surfaceAlt border-line";
  return (
    <div className="flex items-start gap-4">
      <div className={`shrink-0 grid place-items-center w-14 h-14 rounded-2xl border ${ring}`}>
        <Diamonds size={30} />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink leading-tight">{title}</h1>
        <p className="text-sm text-muted mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function StepHead({ n, total, title }: { n: number; total: number; title: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel">
        Step {n} of {total}
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">{title}</h1>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-body mb-1.5">{children}</label>;
}

function Err({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm text-bad bg-badbg border border-bad/20 rounded-lg px-3 py-2">
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  disabled,
  onClick,
  inline,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  inline?: boolean;
}) {
  return (
    <button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={disabled}
      className={`${
        inline ? "" : "w-full"
      } inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-7 py-3 text-base font-semibold text-white shadow-btn hover:bg-navy2 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition`}
    >
      {children}
    </button>
  );
}

function FieldRow({
  label,
  k,
  profile,
  set,
  missing,
  req,
  readOnly,
  placeholder,
}: {
  label: string;
  k: keyof Profile;
  profile: Profile;
  set: (k: keyof Profile, v: string) => void;
  missing: Set<string>;
  req?: boolean;
  readOnly?: boolean;
  placeholder?: string;
}) {
  const empty = !String(profile[k]).trim();
  const flag = req && missing.has(k as string) && empty;
  return (
    <div>
      <Label>
        {label} {req && <span className="text-bad font-semibold">*</span>}
        {flag && <span className="text-warn ml-1 font-medium">· please fill</span>}
      </Label>
      <input
        value={profile[k]}
        onChange={(e) => set(k, e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`${inputCls} ${flag ? "border-warn/60 bg-amber-50/40" : ""} ${
          readOnly ? "bg-surfaceAlt text-muted cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
}

function ExamQuestion({
  q,
  selected,
  onSelect,
}: {
  q: Question;
  selected: number | null;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="card p-6 sm:p-8 animate-pop">
      <span className="inline-block text-xs font-semibold uppercase tracking-wider text-steel bg-surfaceAlt border border-line rounded-full px-3 py-1">
        {q.category}
      </span>

      {q.image && (
        <div className="mt-5 rounded-xl overflow-hidden border border-line bg-white">
          { }
          <img src={q.image} alt="Question diagram" className="w-full max-h-[260px] object-contain" />
        </div>
      )}

      <h2 className="text-xl sm:text-2xl font-semibold text-ink mt-5 leading-snug">{q.question}</h2>

      <div className="mt-6 grid gap-3">
        {q.options.map((opt, i) => {
          const active = selected === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              className={`text-left rounded-xl border-2 px-4 py-4 transition flex items-start gap-4 group ${
                active
                  ? "border-navy bg-navy/[0.04] ring-1 ring-navy/10"
                  : "border-line bg-white hover:border-steel/60 hover:bg-surfaceAlt"
              }`}
            >
              <span
                className={`mt-0.5 inline-grid place-items-center w-8 h-8 rounded-lg text-sm font-bold shrink-0 transition ${
                  active
                    ? "bg-navy text-white"
                    : "bg-surfaceAlt text-steel group-hover:bg-white border border-line"
                }`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-base text-ink leading-relaxed">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EndedView({ onRetake, busy }: { onRetake: () => void; busy?: boolean }) {
  return (
    <div className="w-full max-w-md">
      <Card>
        <Brand
          tone="bad"
          title="Assessment ended"
          subtitle="ARNOBOT Private Limited · Screening"
        />
        <p className="text-base text-body mt-5">
          Your assessment ended because you switched away from the exam tab. To keep the
          assessment fair, leaving the exam window ends the current attempt.
        </p>
        <p className="text-sm text-muted mt-3">
          You can retake it below — please stay on this tab until you finish.
        </p>
        <div className="mt-6">
          <PrimaryButton onClick={onRetake} disabled={busy}>
            {busy ? "Starting…" : "Retake assessment"}
          </PrimaryButton>
        </div>
      </Card>
    </div>
  );
}

function ResultView({
  result,
  name,
  onRetake,
  busy,
}: {
  result: Result;
  name: string;
  onRetake: () => void;
  busy?: boolean;
}) {
  const first = name?.split(" ")[0] || "";
  return (
    <div className="w-full max-w-md">
      <Card>
        <Brand
          tone={result.passed ? "good" : "bad"}
          title={result.passed ? "Assessment passed" : "Assessment completed"}
          subtitle="ARNOBOT Private Limited · Screening"
        />
        <div
          className={`mt-6 rounded-2xl px-5 py-6 text-center border ${
            result.passed ? "bg-okbg border-ok/20" : "bg-badbg border-bad/20"
          }`}
        >
          <div className="text-5xl font-extrabold tabular-nums text-ink">
            {result.score}
            <span className="text-muted text-3xl">/{result.total}</span>
          </div>
          <div
            className={`text-base font-semibold mt-2 ${result.passed ? "text-ok" : "text-bad"}`}
          >
            {result.percent}% · {result.passed ? "PASS" : "Below pass mark"} (need {result.passPercent}
            %)
          </div>
        </div>

        <div className="mt-6 space-y-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted">
            Score by category
          </div>
          {Object.entries(result.breakdown).map(([cat, b]) => {
            const pct = b.total ? Math.round((b.correct / b.total) * 100) : 0;
            return (
              <div key={cat} className="flex items-center gap-3 text-sm">
                <div className="w-40 truncate text-body">{cat}</div>
                <div className="flex-1 h-2 rounded-full bg-line overflow-hidden">
                  <div className="h-full bg-steel" style={{ width: `${pct}%` }} />
                </div>
                <div className="w-10 text-right tabular-nums text-muted font-medium">
                  {b.correct}/{b.total}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-sm text-body mt-6 leading-relaxed">
          {result.passed
            ? `Thank you${first ? `, ${first}` : ""}! Our hiring team will review your profile and results and be in touch about next steps.`
            : "Thank you for completing the assessment. Your result and resume have been recorded for the ARNOBOT team."}
        </p>
        <div className="mt-6">
          <PrimaryButton onClick={onRetake} disabled={busy}>
            {busy ? "Starting…" : "Retake assessment"}
          </PrimaryButton>
        </div>
        <p className="text-xs text-muted mt-4 text-center">
          You may retake the assessment or close this window.
        </p>
      </Card>
    </div>
  );
}

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
