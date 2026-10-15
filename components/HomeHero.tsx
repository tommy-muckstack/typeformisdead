"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BP } from "@/lib/basepath";

function Brand() {
  return <span className="tfh-brand"><svg width="32" height="24" viewBox="0 0 32 24" aria-hidden="true"><rect x="1" y="2" width="30" height="20" rx="5" fill="currentColor" /><path d="M8 8h12M8 12h9M8 16h5" fill="none" stroke="#faf9fb" strokeWidth="2" strokeLinecap="round" /></svg>TypeformIsDead</span>;
}

export function HomeHero() {
  const [announcement, setAnnouncement] = useState(true);
  return <>
    {announcement && <div className="tfh-banner"><span>Free, open-source forms. Create, share, and collect responses with TypeformIsDead.</span><Link href="/login" data-website-cta="announcement">Try it now</Link><button type="button" aria-label="Dismiss announcement" onClick={() => setAnnouncement(false)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 14 14M5 19 19 5" /></svg></button></div>}
    <header className="tfh-nav" data-website-cta="navigation">
      <Link href="/login" className="tfh-brand-link" aria-label="Get started with TypeformIsDead"><Brand /></Link>
      <nav aria-label="Main navigation">{["Platform", "Solutions", "Resources", "Pricing"].map((label, index) => <Link href="/login" key={label}>{label}{index < 3 && <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>}</Link>)}</nav>
      <div className="tfh-nav-actions"><Link href="/login" className="tfh-login">Log in</Link><Link href="/login" className="tfh-contact">Contact sales</Link><Link href="/login" className="tfh-signup">Sign up</Link></div>
      <Link href="/login" className="tfh-mobile-menu" aria-label="Open menu and get started"><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></Link>
    </header>
    <section className="tfh-hero" aria-labelledby="home-title">
      <div className="tfh-hin"><h1 id="home-title">Build <span>a lead gen form</span><br />at the drop of a prompt</h1>
        <p>Create conversational forms, collect responses, and explore your results.<br className="tfh-desktop-break" /> Free and open source, from your first question to your next insight.</p>
        <Link className="tfh-start" href="/login" data-website-cta="hero">Get started — it&apos;s free</Link>
      </div>
      <div data-website-cta="example" className="tfh-previews" aria-label="Example conversational forms">
        <Link href="/login" className="tfh-preview tfh-preview-left" aria-label="Create a contact form"><span className="tfh-sample-brand">YOUR TEAM</span><h2><small>1</small> First, tell us about you. *</h2><span>What&apos;s your full name?*</span><p className="tfh-sample-answer">Type your answer here…</p><span className="tfh-sample-ok">OK ✓</span></Link>
        <Link href="/login" className="tfh-preview tfh-preview-right" aria-label="Create a feedback form"><span className="tfh-sample-brand">YOUR FEEDBACK</span><h2>How was your recent experience?*</h2><div className="tfh-sample-scale">{[1, 2, 3, 4, 5].map(value => <span key={value}>{value}</span>)}</div></Link>
        <Link href="/login" className="tfh-preview tfh-preview-main" aria-label="Create a form like this example">
          <div className="tfh-preview-photo"><Image unoptimized src={`${BP}/art/club-portrait.jpg`} alt="" width={800} height={1200} priority /><span>THE CLUB</span></div>
          <div className="tfh-preview-fields"><h2><small>1</small> Welcome to the club!*</h2><span>First and last name*</span><p>Jordan Avery</p><span>Email address*</span><p className="tfh-placeholder">name@example.com</p><span className="tfh-sample-ok">OK ✓</span></div>
        </Link>
      </div>
    </section>
  </>;
}
