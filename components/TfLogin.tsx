"use client";
import { useState } from "react";
import Link from "next/link";
import type { FirebaseClientConfig } from "@/lib/isdead-auth/config";
import { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, authErrorMessage } from "@/lib/isdead-auth/client";
import { BP } from "@/lib/basepath";
import { Logo } from "@/components/Logo";
import { LoginShowcase } from "./LoginShowcase";
import "./tflogin.css";

const G = <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.2a5.3 5.3 0 01-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.4z" /><path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0012 23.5z" /><path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 010-4.4v-3H1.8a11.5 11.5 0 000 10.4z" /><path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 001.8 6.8l3.8 3A6.9 6.9 0 0112 5.4z" /></svg>;
export function TfLogin({ config, demo, to, signup = false }: { config: FirebaseClientConfig | null; demo: boolean; to: string; signup?: boolean }) {
  const [mode, setMode] = useState<"signin" | "signup" | "reset">(signup ? "signup" : "signin");
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [busy, setBusy] = useState(false), [err, setErr] = useState(""), [note, setNote] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const session = `${BP}/api/session`;
  const run = async (f: () => Promise<void>) => { setBusy(true); setErr(""); setNote(""); try { await f(); } catch (e) { setErr(authErrorMessage(e)); } finally { setBusy(false); } };
  const submit = (e: React.FormEvent) => { e.preventDefault();
    if (!config) { setErr("Sign-in isn't configured on this deployment yet."); return; }
    if (mode === "reset") return run(async () => { await resetPassword(config, email); setNote("If that email has an account, a reset link is on its way."); setMode("signin"); setStep(1); });
    if (step === 1) { setStep(2); return; }
    run(async () => { if (mode === "signup") await signUpWithEmail(config, session, email, password); else await signInWithEmail(config, session, email, password); window.location.assign(to); }); };
  const off = "Not available yet in the open-source version";
  const title = mode === "signup" ? "Sign up" : mode === "reset" ? "Reset your password" : "Log in";
  const sub = mode === "signup" ? "Create forms, collect answers and automate follow-ups, free." : mode === "reset" ? "Enter your email and we'll send you a reset link." : "Build forms, gather responses, and automate your workflows.";
  const su = mode === "signup" && !showEmail;
  return <main className={"tfl" + (mode === "signup" ? " tfl-su" : "")}>
    <header className="tfl-top"><Link href="/" className="tfl-logo"><Logo size={30} /></Link><div><span>{mode === "signup" ? <>Already have an account? <a className="tfl-lg" href="#" onClick={e => { e.preventDefault(); setMode("signin"); setStep(1); }}>Log in</a></> : <>Have a question? <a href="https://github.com/tommy-muckstack/typeformisdead/issues">Contact us</a></>}</span><button type="button" className="tfl-lang" disabled title={off}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></svg>English <span aria-hidden="true">⌄</span></button></div></header>
    <div className="tfl-split">
      <section className="tfl-left"><div className="tfl-form">
        {mode === "signup" && <div className="tfl-sulogo"><Logo size={26} /></div>}<h1>{mode === "signup" ? "Sign up today. Start with a form, end with a conversation." : title}</h1>{mode !== "signup" && <p className="tfl-description">{sub}</p>}
        {!config && <p role="status" className="tfl-note">Sign-in not configured. Email and Google sign-in turn on once Firebase is set up.</p>}
        {mode !== "reset" && (
          <button type="button" className="tfl-oauth" disabled={busy || !config} onClick={() => run(async () => { await signInWithGoogle(config!, session); window.location.assign(to); })}>{G}{mode === "signup" ? "Sign up with Google" : "Continue with Google"}</button>
        )}
        {mode === "signup" && <div className="tfl-or">OR</div>}
        {su ? <button type="button" className="tfl-cta tfl-suemail" onClick={() => setShowEmail(true)}>Sign up with email</button> : <form onSubmit={submit}>
          <label htmlFor="tf-email">Email</label>
          <input id="tf-email" type="email" required autoComplete="email" value={email} onChange={e => { setEmail(e.target.value); }} readOnly={step === 2 && mode !== "reset"} />
          {step === 2 && mode !== "reset" && <><label htmlFor="tf-pass">Password</label><input id="tf-pass" type="password" required minLength={6} autoFocus autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} /></>}
          <button className="tfl-cta" disabled={busy}>{mode === "reset" ? "Email me a reset link" : step === 1 ? "Continue with email" : mode === "signup" ? "Create account" : "Log in"}</button>
        </form>}
        {step === 2 && mode === "signin" && <div className="tfl-email-actions"><button type="button" onClick={() => { setMode("reset"); setStep(1); }}>Forgot password?</button></div>}
        {step === 2 && <div className="tfl-email-actions"><button type="button" onClick={() => { setStep(1); setPassword(""); }}>Use a different email</button></div>}
        {err && <p role="alert" className="tfl-err">{err}</p>}{note && <p role="status" className="tfl-note">{note}</p>}
        {demo && <button type="button" className="tfl-demo" onClick={async () => { const r = await fetch(`${BP}/api/session/demo`, { method: "POST" }); if (r.ok) window.location.assign(to); }}>Use the demo account</button>}
        <p className="tfl-switch">{mode === "signup" ? <>Already have an account? <a href="#" onClick={e => { e.preventDefault(); setMode("signin"); setStep(1); }}>Log in</a></> : mode === "reset" ? <a href="#" onClick={e => { e.preventDefault(); setMode("signin"); setStep(1); }}>Back to log in</a> : <>Don&apos;t have an account? <a href="#" onClick={e => { e.preventDefault(); setMode("signup"); setStep(1); }}>Sign up</a></>}</p>
      </div></section>
      <LoginShowcase />
    </div>
  </main>;
}
