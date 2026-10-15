"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { BP } from "@/lib/basepath";

const slides = [
  { label: "Collect responses", title: "Build with AI and turn responses into customers", prompt: "Build a feedback form for our upcoming launch and nurture positive reviewers to upgrade" },
  { label: "Create a conversation", title: "Make every question feel personal", prompt: "Welcome your respondents with a form that feels like a conversation" },
  { label: "Understand results", title: "Turn responses into your next step", prompt: "Explore answers, find patterns, and export your results" },
];

function Chevron({ back = false }: { back?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d={back ? "m14 6-6 6 6 6" : "m10 6 6 6-6 6"} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function LoginShowcase() {
  const [slide, setSlide] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const rotating = playing && !reducedMotion;
  useEffect(() => {
    if (!rotating || interacting) return;
    const timer = window.setInterval(() => setSlide(current => (current + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, [rotating, interacting]);

  const select = (index: number) => { setSlide((index + slides.length) % slides.length); setPlaying(false); };
  return <section className="tfl-right" aria-label="Product previews" aria-roledescription="carousel"
    onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
    onFocusCapture={() => setInteracting(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}>
    <h2>Continue exploring powerful features<br className="tfl-heading-break" /> that make data collection effortless</h2>
    <div className="tfl-carousel">
      <div className="tfl-track" style={{ "--slide": slide } as CSSProperties} aria-live={rotating ? "off" : "polite"}>
        {slides.map((item, index) => <article className="tfl-card" key={item.label} aria-hidden={slide !== index} aria-label={`${index + 1} of ${slides.length}`} aria-roledescription="slide">
          <div className="tfl-cardin"><p>{item.label}</p><h3>{item.title}</h3>
            <div className={`tfl-mock tfl-mock--${index}`} aria-hidden="true">
              <div className="tfl-example"><div className="tfl-example-fields"><span /><span /></div>
                <Image unoptimized src={`${BP}/art/profile-portrait.jpg`} alt="" width={600} height={900} />
              </div>
              <div className="tfl-prompt"><span>{item.prompt}<i /></span><div className="tfl-prompt-tools">
                <svg viewBox="0 0 20 20"><rect x="8" y="2" width="4" height="9" rx="2" /><path d="M5 8v2a5 5 0 0 0 10 0V8M10 15v3M7 18h6" /></svg>
                <svg viewBox="0 0 20 20"><path d="m5 4 11 6-11 6 2-6-2-6Zm2 6h8" /></svg>
              </div></div>
            </div>
          </div>
        </article>)}
      </div>
    </div>
    <div className="tfl-ctl">
      <button type="button" aria-label="Previous preview" onClick={() => select(slide - 1)}><Chevron back /></button>
      <button type="button" aria-label={rotating ? "Pause previews" : "Play previews"} onClick={() => { setPlaying(!rotating); setReducedMotion(false); }}>
        {rotating ? <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="3" width="4" height="14" rx="1.5" /><rect x="12" y="3" width="4" height="14" rx="1.5" /></svg> : <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 3 11 7-11 7Z" /></svg>}
      </button>
      {slides.map((item, index) => <button type="button" className="tfl-dot" key={item.label} aria-label={`Show preview ${index + 1}: ${item.label}`} aria-pressed={slide === index} onClick={() => select(index)}><span /></button>)}
      <button type="button" aria-label="Next preview" onClick={() => select(slide + 1)}><Chevron /></button>
    </div>
  </section>;
}
