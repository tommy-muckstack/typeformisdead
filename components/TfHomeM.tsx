import Link from "next/link";
import data from "./tfmitems.json";
import "./tfhomem.css";

type Item = { k: string; x: number; y: number; w: number; h: number; fs?: string; lh?: string; fw?: string; c?: string; ta?: string; ls?: string; t?: string; nw?: number; disp?: boolean; bg?: string; bd?: string; r?: string; media?: number };
const LINK = /get started|sign up|log in|contact sales|explore|browse|view integrations|read all/i;

/** Mobile (<=900px) home: sections laid out at the original's measured 390px geometry (copy and boxes from the live page). */
export function TfHomeM() {
  const items = data.items as Item[];
  return <div className="tfhm" style={{ height: data.H }} aria-label="Typeform home">
    {data.bgs.map((b, i) => <div key={"s" + i} className="s" style={{ top: b.y, height: b.h, background: b.bg }} />)}
    <div className="nav"><svg width="43" height="24" viewBox="0 0 43 24" aria-hidden><rect width="43" height="24" rx="6" fill="#faf9fb" /><rect x="8" y="7" width="10" height="10" rx="2" fill="#2a222b" /><rect x="24" y="7" width="10" height="10" rx="2" fill="#2a222b" opacity=".5" /></svg>
      <span className="burger" aria-hidden><i /><i /><i /></span></div>
    {items.map((it, i) => {
      if (it.k === "b") return <div key={i} className={"b" + (it.media ? " m" : "")} style={{ left: it.x, top: it.y, width: it.w, height: it.h, background: it.bg || undefined, border: it.bd ? `1px solid ${it.bd.split(" ").slice(1).join("")}` : undefined, borderRadius: it.r }} />;
      const style = { left: it.x, top: it.y, width: it.w, fontSize: it.fs, lineHeight: it.lh, fontWeight: it.fw, color: it.c, textAlign: it.ta as "center", letterSpacing: it.ls === "normal" ? undefined : it.ls, whiteSpace: it.nw || (it.lh && it.h <= parseFloat(it.lh) * 1.3) ? ("nowrap" as const) : undefined };
      const cls = "t" + (it.disp ? " d" : "") + (it.fs === "48px" ? " d" : "");
      return LINK.test(it.t || "") ? <Link key={i} href="/login" className={cls} style={style}>{it.t}</Link> : <div key={i} className={cls} style={style}>{it.t}</div>;
    })}
  </div>;
}
