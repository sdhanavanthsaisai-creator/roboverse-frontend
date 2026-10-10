import { useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import TearTicket from './TearTicket';
import './TicketIsland.css';

/* NOTE — privacy by construction: `name` lives in React state only.
   It is never written to localStorage/sessionStorage, never sent
   anywhere, and vanishes on refresh. Time aboard is derived from
   performance.timeOrigin (page-load clock), also never stored. */

export default function TicketIsland() {
  const [name, setName] = useState('');
  const [admitted, setAdmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(iv);
  }, []);

  const mins = Math.max(0, Math.floor((now - performance.timeOrigin) / 60000));
  const ticketNo = useMemo(() => String(Math.floor(100000 + Math.random() * 900000)), []);
  const dateStr = useMemo(
    () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
    [],
  );
  const displayName = name.trim() || 'WALK-IN VISITOR';

  const download = async () => {
    const el = printRef.current;
    if (!el || saving) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#151515' });
      const pdf = new jsPDF({
        unit: 'px',
        format: [canvas.width, canvas.height],
        hotfixes: ['px_scaling'],
      });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`RB25-visitor-ticket-${ticketNo}.pdf`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ticket-island">
      <p className="ticket-kick">07 — Visitor ticket</p>
      <h2 className="ticket-title">
        Take your <span className="ticket-ol">stub.</span>
      </h2>
      <p className="ticket-sub">
        You were here. Type your name, tear the stub, download the ticket as a PDF souvenir.
      </p>

      <label className="ticket-field">
        <span>Name for the ticket</span>
        <input
          value={name}
          maxLength={24}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Ada Lovelace"
          autoComplete="off"
        />
        <em>Name lives only on this page — never stored, never sent.</em>
      </label>

      <div className="ticket-stage">
        <TearTicket
          background="#171717"
          color="#f5f5f5"
          width={460}
          height={250}
          stubSize={150}
          rotate={3}
          onTear={() => setAdmitted(true)}
          ariaLabel="Tear off the ticket stub"
          stub={
            <div className="tk-stub">
              <h4>ADMIT ONE</h4>
              <p>
                Field unit RB/25
                <br />
                {dateStr}
              </p>
              <span>No. {ticketNo}</span>
            </div>
          }
        >
          <div className="tk-body">
            <p className="tk-kicker">ROBOTO® · RB/25 · VISITOR PASS</p>
            <h3 className="tk-name">{displayName}</h3>
            <p className="tk-meta">
              {mins} MIN ABOARD · {dateStr}
            </p>
            {admitted ? <p className="tk-admitted">STUB TORN — ADMITTED ✓</p> : null}
          </div>
        </TearTicket>
      </div>

      <button type="button" className="ticket-dl" onClick={download} disabled={saving}>
        {saving ? 'MAKING PDF…' : 'DOWNLOAD TICKET (PDF)'}
      </button>

      {/* Hidden print replica — flat hex colors only (html2canvas-safe). */}
      <div className="ticket-printwrap" aria-hidden="true">
        <div ref={printRef} className="ticket-print">
          <div className="tp-left">
            <p className="tp-kicker">ROBOTO® · RB/25 · VISITOR PASS</p>
            <h3 className="tp-name">{displayName}</h3>
            <p className="tp-meta">
              {mins} MIN ABOARD · {dateStr}
            </p>
            <p className="tp-note">Single-file WebGL · monochrome build · Built to escape mazes</p>
          </div>
          <div className="tp-right">
            <h4>ADMIT ONE</h4>
            <p>
              Field unit RB/25
              <br />
              {dateStr}
            </p>
            <span>No. {ticketNo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
