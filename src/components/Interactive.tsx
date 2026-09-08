"use client";

import { CheckCircle2, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { FormEvent, PointerEvent, useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/site";

export function ContactForm({ lang }: { lang: Lang }) {
  const it = lang === "it";
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const labels = {
    name: it ? "Nome e Cognome o Ragione Sociale*" : "Name and Surname or Company Name*", email: "Email*", phone: it ? "Telefono (consigliato)" : "Phone (recommended)",
    subject: it ? "Argomento" : "Subject", message: it ? "Messaggio*" : "Message*", consent: it ? "Acconsento al trattamento dei dati personali" : "I consent to the processing of personal data",
    submit: it ? "INVIA RICHIESTA" : "SEND ENQUIRY", required: it ? "Campo obbligatorio" : "Required field", invalidEmail: it ? "Inserisci un indirizzo email valido" : "Enter a valid email address",
  };
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget; const fd = new FormData(form); const next: Record<string, string> = {};
    ["name", "message"].forEach(k => { if (!String(fd.get(k) || "").trim()) next[k] = labels.required; });
    if (!/^\S+@\S+\.\S+$/.test(String(fd.get("email") || ""))) next.email = labels.invalidEmail;
    if (!fd.get("consent")) next.consent = labels.required;
    setErrors(next); if (Object.keys(next).length) { document.getElementById(`err-${Object.keys(next)[0]}`)?.focus(); return; }
    setState("loading");
    try {
      const body = Object.fromEntries(fd.entries());
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, lang }) });
      if (!res.ok) throw new Error(); setState("success"); form.reset();
    } catch { setState("error"); }
  }
  const err = (key: string) => errors[key] ? <span id={`err-${key}`} className="field-error" role="alert" tabIndex={-1}>{errors[key]}</span> : null;
  return <form className="contact-form" noValidate onSubmit={submit}>
    <div className="form-grid">
      <label>{labels.name}<input name="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "err-name" : undefined} />{err("name")}</label>
      <label>{labels.email}<input name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "err-email" : undefined} />{err("email")}</label>
      <label>{labels.phone}<input name="phone" type="tel" autoComplete="tel" /></label>
      <label>{labels.subject}<select name="subject"><option>{it ? "Informazioni Generali" : "General Information"}</option><option>{it ? "Uffici Arredati" : "Furnished Offices"}</option><option>{it ? "Domiciliazioni" : "Domiciliation"}</option><option>{it ? "Tariffe" : "Pricing"}</option><option>{it ? "Corsi" : "Training"}</option><option>{it ? "Altro" : "Other"}</option></select></label>
    </div>
    <label>{labels.message}<textarea name="message" rows={6} aria-invalid={!!errors.message} aria-describedby={errors.message ? "err-message" : undefined} />{err("message")}</label>
    <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <label className="check-label"><input name="consent" type="checkbox" value="true" /> <span>{labels.consent}*</span></label>{err("consent")}
    <p className="form-note">{it ? "Consulta la Privacy Policy. reCAPTCHA è attivabile tramite configurazione." : "See our Privacy Policy. reCAPTCHA can be enabled in configuration."}</p>
    <button className="button primary" disabled={state === "loading"}>{state === "loading" && <LoaderCircle className="spin" />}{labels.submit}</button>
    <div aria-live="polite" className={`form-status ${state}`}>{state === "success" ? (it ? "Grazie! La richiesta è stata inviata." : "Thank you! Your enquiry has been sent.") : state === "error" ? (it ? "Invio non riuscito. Riprova o chiamaci." : "Submission failed. Please retry or call us.") : ""}</div>
  </form>;
}

const prices = { postal: { 6: 9900, 12: 16800 }, legal: { 6: 19900, 12: 34800 } } as const;
export function Checkout({ lang }: { lang: Lang }) {
  const it = lang === "it"; const [service, setService] = useState<"postal" | "legal">("postal"); const [duration, setDuration] = useState<6 | 12>(12); const [loading, setLoading] = useState(""); const [message, setMessage] = useState("");
  const base = prices[service][duration]; const vat = Math.round(base * .22); const total = base + vat;
  async function pay(provider: "stripe" | "paypal") {
    setLoading(provider); setMessage("");
    try { const r = await fetch("/api/create-payment-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider, service, duration, email: "checkout@example.invalid", lang }) }); const data = await r.json(); if (!r.ok) throw new Error(data.error); if (data.url) window.location.href = data.url; else setMessage(data.message); } catch (e) { setMessage(e instanceof Error ? e.message : "Error"); } finally { setLoading(""); }
  }
  return <div className="checkout-card">
    <div className="step-label">01 — {it ? "CONFIGURA" : "CONFIGURE"}</div>
    <fieldset><legend>{it ? "Servizio" : "Service"}</legend><div className="option-grid"><label className={service === "postal" ? "selected" : ""}><input type="radio" name="service" checked={service === "postal"} onChange={() => setService("postal")} />{it ? "Domiciliazione postale" : "Postal domiciliation"}</label><label className={service === "legal" ? "selected" : ""}><input type="radio" name="service" checked={service === "legal"} onChange={() => setService("legal")} />{it ? "Sede legale" : "Registered office"}</label></div></fieldset>
    <fieldset><legend>{it ? "Durata" : "Duration"}</legend><div className="option-grid"><label className={duration === 6 ? "selected" : ""}><input type="radio" name="duration" checked={duration === 6} onChange={() => setDuration(6)} />6 {it ? "mesi" : "months"}</label><label className={duration === 12 ? "selected" : ""}><input type="radio" name="duration" checked={duration === 12} onChange={() => setDuration(12)} />12 {it ? "mesi" : "months"}</label></div></fieldset>
    <div className="price-box"><p><span>{it ? "Imponibile indicativo" : "Illustrative base fee"}</span><b>€ {(base / 100).toFixed(2)}</b></p><p><span>IVA / VAT 22%</span><b>€ {(vat / 100).toFixed(2)}</b></p><p className="total"><span>{it ? "Totale" : "Total"}</span><b>€ {(total / 100).toFixed(2)}</b></p><small>{it ? "Prezzi dimostrativi: inserire qui i prezzi reali prima della pubblicazione. Il contratto e i termini saranno mostrati prima dell’addebito." : "Demonstration prices: insert real prices here before launch. Contract and terms will be shown before charging."}</small></div>
    <label className="check-label"><input type="checkbox" required /> <span>{it ? "Accetto i termini del servizio e la Privacy Policy" : "I accept the service terms and Privacy Policy"}</span></label>
    <div className="payment-buttons"><button className="button stripe" onClick={() => pay("stripe")} disabled={!!loading}>{loading === "stripe" ? <LoaderCircle className="spin" /> : null}Stripe Checkout</button><button className="button paypal" onClick={() => pay("paypal")} disabled={!!loading}>{loading === "paypal" ? <LoaderCircle className="spin" /> : null}PayPal</button></div>
    <p className="secure-note"><ShieldCheck /> {it ? "Pagamento sicuro: i dati della carta non transitano sui nostri server." : "Secure payment: card data never reaches our servers."}</p><div aria-live="polite">{message}</div>
  </div>;
}

export function SignatureFlow({ lang }: { lang: Lang }) {
  const it = lang === "it"; const canvas = useRef<HTMLCanvasElement>(null); const drawing = useRef(false); const [step, setStep] = useState(1); const [phone, setPhone] = useState(""); const [otp, setOtp] = useState(""); const [status, setStatus] = useState("");
  useEffect(() => { const c = canvas.current; if (c) { const ratio = window.devicePixelRatio || 1; c.width = c.offsetWidth * ratio; c.height = 180 * ratio; c.getContext("2d")?.scale(ratio, ratio); } }, [step]);
  const point = (e: PointerEvent<HTMLCanvasElement>) => { const c = canvas.current!; const r = c.getBoundingClientRect(); return [e.clientX-r.left, e.clientY-r.top] as const; };
  function start(e: PointerEvent<HTMLCanvasElement>) { drawing.current = true; const ctx = canvas.current!.getContext("2d")!; const [x,y]=point(e); ctx.beginPath(); ctx.moveTo(x,y); e.currentTarget.setPointerCapture(e.pointerId); }
  function move(e: PointerEvent<HTMLCanvasElement>) { if(!drawing.current)return; const ctx=canvas.current!.getContext("2d")!; const [x,y]=point(e); ctx.lineWidth=2;ctx.lineCap="round";ctx.strokeStyle="#183229";ctx.lineTo(x,y);ctx.stroke(); }
  async function sendOtp() { setStatus(it ? "Invio in corso…" : "Sending…"); const r=await fetch("/api/send-otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone,orderId:"demo-order"})}); setStatus(r.ok ? (it ? "Codice inviato. In modalità demo usa 123456." : "Code sent. In demo mode use 123456.") : (it ? "Invio non riuscito." : "Could not send.")); if(r.ok)setStep(2); }
  async function verify() { const r=await fetch("/api/verify-otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone,orderId:"demo-order",code:otp})}); if(r.ok){setStep(3);setStatus("")}else setStatus(it?"Codice non valido o scaduto.":"Invalid or expired code."); }
  function finish() { if (!canvas.current) return; setStep(4); setStatus(it ? "Firma acquisita. In produzione il PDF sarà generato e inviato tramite link sicuro." : "Signature captured. In production, the PDF will be generated and sent through a secure link."); }
  return <div className="signature-flow"><div className="flow-steps"><span className={step>=1?"active":""}>1. OTP</span><span className={step>=3?"active":""}>2. {it?"Firma":"Sign"}</span><span className={step>=4?"active":""}>3. {it?"Conferma":"Confirm"}</span></div>
    {step===1&&<div><label>{it?"Numero di cellulare":"Mobile number"}<input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+39…" /></label><button className="button primary" onClick={sendOtp} disabled={!phone}>{it?"INVIA CODICE":"SEND CODE"}</button></div>}
    {step===2&&<div><label>{it?"Codice a 6 cifre":"6-digit code"}<input inputMode="numeric" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,""))} /></label><div className="inline-actions"><button className="button primary" onClick={verify}>{it?"VERIFICA":"VERIFY"}</button><button className="text-button" onClick={sendOtp}><RefreshCw/> {it?"Invia di nuovo":"Resend"}</button></div></div>}
    {step===3&&<div><p>{it?"Disegna la firma nel riquadro usando mouse o touch.":"Draw your signature below using mouse or touch."}</p><canvas ref={canvas} className="signature-canvas" aria-label={it?"Area firma":"Signature area"} onPointerDown={start} onPointerMove={move} onPointerUp={()=>drawing.current=false}/><div className="inline-actions"><button className="text-button" onClick={()=>canvas.current?.getContext("2d")?.clearRect(0,0,canvas.current.width,canvas.current.height)}>{it?"Cancella":"Clear"}</button><button className="button primary" onClick={finish}>{it?"FIRMA E INVIA":"SIGN AND SUBMIT"}</button></div></div>}
    {step===4&&<div className="success-panel"><CheckCircle2/><b>{it?"Richiesta completata":"Request complete"}</b><p>{status}</p><button className="button secondary">{it?"SCARICA PDF":"DOWNLOAD PDF"}</button></div>}<p aria-live="polite" className="form-note">{step!==4&&status}</p>
  </div>;
}
