"use client";

import Link from "next/link";
import { Building2, Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Lang } from "@/lib/site";
import { contact, ui } from "@/lib/site";

type Props = { lang: Lang; alternate: string };

export function Header({ lang, alternate }: Props) {
  const t = ui[lang];
  const [open, setOpen] = useState(false);
  const prefix = lang === "en" ? "/en" : "";
  const links = lang === "it"
    ? [["/", t.home], ["/uffici-arredati.html", t.offices], ["/servizi-domiciliazione.html", t.domiciliation], ["/tariffe.html", t.pricing], ["/chi-siamo.html", t.about], ["/contatti.html", t.contact]]
    : [["/en/index.html", t.home], ["/en/offices-furnished.html", t.offices], ["/en/domiliation-services.html", t.domiciliation], ["/en/pricing.html", t.pricing], ["/en/about.html", t.about], ["/en/contact.html", t.contact]];
  return <>
    <a href="#main" className="skip-link">{t.skip}</a>
    <header className="site-header">
      <div className="header-inner">
        <Link href={prefix || "/"} className="brand" aria-label="Roma Office Sharing home">
          <span className="brand-mark"><Building2 aria-hidden="true" /></span><span>ROMA <b>OFFICE</b><small>SHARING</small></span>
        </Link>
        <nav id="main-nav" aria-label={t.nav} className={open ? "main-nav open" : "main-nav"}>
          <button className="nav-close" onClick={() => setOpen(false)} aria-label={t.close}><X /></button>
          {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
        </nav>
        <div className="header-actions">
          <div className="lang-switch" aria-label={t.language}><span aria-current={lang === "it" ? "page" : undefined}>IT</span><span>/</span><Link href={alternate}>{lang === "it" ? "EN" : "IT"}</Link></div>
          <a href={`tel:${contact.phoneHref}`} className="phone-pill"><Phone aria-hidden="true" /><span>{lang === "it" ? "06 2111 6268" : "+39 06 21.11.6268"}</span></a>
          <button className="nav-toggle" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="main-nav"><Menu /><span className="sr-only">{t.menu}</span></button>
        </div>
      </div>
    </header>
  </>;
}

export function Footer({ lang }: { lang: Lang }) {
  const t = ui[lang];
  const prefix = lang === "en" ? "/en" : "";
  return <footer className="site-footer">
    <div className="footer-grid shell">
      <div><div className="footer-brand">ROMA <b>OFFICE</b> SHARING</div><p>{t.trademark}</p><p className="muted">Via San Martino Della Battaglia, 31 - 00185 - Roma<br />P. IVA / REA: <span className="placeholder">[inserire dati societari]</span></p></div>
      <div><h2>{lang === "it" ? "Contatti" : "Contact"}</h2><address>{contact.address}<br /><a href={`tel:${contact.phoneHref}`}>{contact.phone}</a><br />Fax: {contact.fax}<br /><a href={`mailto:${contact.email}`}>{contact.email}</a></address></div>
      <div><h2>{t.hours}</h2><p>{t.center}<br />{t.weekdays}<br />{t.saturday}</p></div>
      <div><h2>{lang === "it" ? "Informazioni" : "Information"}</h2><p><Link href={`${prefix}/privacy.html`}>Privacy</Link><br /><Link href={`${prefix}/cookie-policy.html`}>Cookie Policy</Link><br /><button className="text-button" data-cookie-settings>{t.settings}</button></p><p className="small">{t.revoke}</p></div>
    </div>
    <div className="footer-bottom shell">© 2025 Cube Engineering s.r.l. — {t.rights}</div>
  </footer>;
}

type Consent = { necessary: true; analytics: boolean; marketing: boolean };
const defaultConsent: Consent = { necessary: true, analytics: false, marketing: false };
export function CookieConsent({ lang }: { lang: Lang }) {
  const t = ui[lang];
  const [visible, setVisible] = useState(false);
  const [settings, setSettings] = useState(false);
  const [consent, setConsent] = useState<Consent>(defaultConsent);
  useEffect(() => {
    const saved = localStorage.getItem("ros_cookie_consent");
    if (!saved) setVisible(true); else { try { setConsent(JSON.parse(saved)); } catch { setVisible(true); } }
    const handler = () => { setVisible(true); setSettings(true); };
    document.querySelectorAll("[data-cookie-settings]").forEach(el => el.addEventListener("click", handler));
    return () => document.querySelectorAll("[data-cookie-settings]").forEach(el => el.removeEventListener("click", handler));
  }, []);
  const save = (next: Consent) => { localStorage.setItem("ros_cookie_consent", JSON.stringify(next)); setConsent(next); setVisible(false); setSettings(false); window.dispatchEvent(new CustomEvent("cookieConsentChanged", { detail: next })); };
  if (!visible) return null;
  return <div className="cookie-wrap" role="region" aria-label={t.cookieTitle}>
    <div className="cookie-card">
      <div><span className="eyebrow">COOKIE</span><h2>{t.cookieTitle}</h2><p>{t.cookieText}</p></div>
      {settings && <div className="cookie-options">
        <label><span>{t.necessary}<small>{t.always}</small></span><input type="checkbox" checked disabled /></label>
        <label><span>{t.analytics}</span><input type="checkbox" checked={consent.analytics} onChange={e => setConsent({ ...consent, analytics: e.target.checked })} /></label>
        <label><span>{t.marketing}</span><input type="checkbox" checked={consent.marketing} onChange={e => setConsent({ ...consent, marketing: e.target.checked })} /></label>
      </div>}
      <div className="cookie-actions">
        <button className="button secondary" onClick={() => save(defaultConsent)}>{t.reject}</button>
        {settings ? <button className="button primary" onClick={() => save(consent)}>{t.save}</button> : <><button className="button ghost" onClick={() => setSettings(true)}>{t.settings}</button><button className="button primary" onClick={() => save({ necessary: true, analytics: true, marketing: true })}>{t.accept}</button></>}
      </div>
    </div>
  </div>;
}
