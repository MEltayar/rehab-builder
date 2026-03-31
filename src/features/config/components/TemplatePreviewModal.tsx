import { X } from 'lucide-react';
import type { ColorPalette, ExportTemplate } from '../../../types';

interface TemplatePreviewModalProps {
  template: ExportTemplate | null;
  palette: ColorPalette;
  onClose: () => void;
}

const EXERCISES = [
  { name: 'Shoulder Pendulum', sets: 3, reps: '10', hold: '—', rest: '30s', notes: 'Keep arm relaxed' },
  { name: 'Cat-Camel Stretch', sets: 2, reps: '12', hold: '—', rest: '20s', notes: '' },
  { name: 'Hip Bridge', sets: 3, reps: '15', hold: '3s', rest: '45s', notes: 'Squeeze glutes at top' },
];

type CS = ColorPalette['colorScheme'];

// ────────────────────────────────────────────────────────────
// 1. PROFESSIONAL
// ────────────────────────────────────────────────────────────
function ProfessionalPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: cs.darkText }}>
      <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: cs.light }}>
        <span style={{ color: cs.primary, fontWeight: 700, fontSize: 8 }}>LOGO</span>
      </div>
      <div>
        <p style={{ color: cs.text, fontWeight: 700, fontSize: 12 }}>City Physio Clinic</p>
        <p style={{ color: cs.light, fontSize: 8 }}>clinic@example.com · +1 555 000 1234</p>
      </div>
    </div>
    <div className="px-4 py-1 flex items-center justify-between" style={{ backgroundColor: cs.primary }}>
      <span style={{ color: cs.text, fontWeight: 700, fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rehabilitation Program Report</span>
      <span style={{ color: cs.light, fontSize: 7 }}>Jan 1, 2026</span>
    </div>
    <div className="px-4 pt-3 pb-4">
      <div className="rounded overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
        <div className="px-3 py-1.5 flex items-center gap-2" style={{ backgroundColor: cs.secondary }}>
          <span className="px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: cs.darkText, color: cs.light, fontSize: 8 }}>1</span>
          <span style={{ color: cs.text, fontWeight: 700, fontSize: 9 }}>Day 1 — Morning Session</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead><tr style={{ backgroundColor: '#f1f5f9' }}>
            {['Exercise','Sets','Reps','Hold','Rest','Notes'].map(h => <th key={h} style={{ padding: '3px 5px', fontWeight: 700, color: '#64748b', textAlign: h==='Exercise'||h==='Notes'?'left':'center', textTransform: 'uppercase', fontSize: 7 }}>{h}</th>)}
          </tr></thead>
          <tbody>{EXERCISES.map((ex,i) => <tr key={i} style={{ backgroundColor: i%2===0?'#fff':'#f8fafc' }}>
            <td style={{ padding: '3px 5px', fontWeight: 700, color: '#1e293b', fontSize: 8 }}>{ex.name}</td>
            <td style={{ padding: '3px 5px', textAlign: 'center', color: '#64748b' }}>{ex.sets}</td>
            <td style={{ padding: '3px 5px', textAlign: 'center', color: '#64748b' }}>{ex.reps}</td>
            <td style={{ padding: '3px 5px', textAlign: 'center', color: '#64748b' }}>{ex.hold}</td>
            <td style={{ padding: '3px 5px', textAlign: 'center', color: '#64748b' }}>{ex.rest}</td>
            <td style={{ padding: '3px 5px', color: '#94a3b8', fontSize: 7 }}>{ex.notes}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 2. PATIENT
// ────────────────────────────────────────────────────────────
function PatientPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="flex flex-col items-center py-4 px-4" style={{ backgroundColor: cs.darkText }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1" style={{ backgroundColor: cs.light }}>
        <span style={{ color: cs.primary, fontWeight: 700, fontSize: 8 }}>LOGO</span>
      </div>
      <span style={{ color: cs.text, fontWeight: 700, fontSize: 13 }}>City Physio Clinic</span>
      <span style={{ color: cs.light, fontSize: 8, marginTop: 2 }}>Your Trusted Partner</span>
    </div>
    <div className="px-4 py-1.5" style={{ backgroundColor: cs.light }}>
      <span style={{ color: cs.darkText, fontWeight: 700, fontSize: 8 }}>Your Rehab Program — Jan 2026</span>
    </div>
    <div className="px-4 pt-2 pb-4">
      <div className="mb-2 pb-1" style={{ borderBottom: `2px solid ${cs.primary}` }}>
        <span style={{ color: cs.darkText, fontWeight: 700, fontSize: 9 }}>Day 1 — Morning</span>
      </div>
      {EXERCISES.map((ex,i) => <div key={i} className="rounded px-3 py-1.5 mb-1" style={{ backgroundColor: i%2===0?'#fff':cs.light, border: `1px solid ${cs.light}` }}>
        <p style={{ color: cs.darkText, fontWeight: 700, fontSize: 9 }}>{ex.name}</p>
        <p style={{ color: '#64748b', fontSize: 8 }}>{ex.sets} sets · {ex.reps} reps · Rest: {ex.rest}</p>
      </div>)}
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 3. CHECKLIST
// ────────────────────────────────────────────────────────────
function ChecklistPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="px-4 py-3" style={{ borderLeft: `4px solid ${cs.primary}`, borderBottom: '1px solid #e2e8f0' }}>
      <p style={{ color: cs.darkText, fontWeight: 700, fontSize: 13 }}>City Physio Clinic</p>
      <p style={{ color: '#64748b', fontSize: 8 }}>clinic@example.com</p>
    </div>
    <div className="px-4 pt-3 pb-4">
      <p style={{ color: cs.darkText, fontWeight: 700, fontSize: 9, marginBottom: 6 }}>Day 1 — Morning Session</p>
      {EXERCISES.map((ex,i) => <div key={i} className="flex items-start gap-2 mb-2">
        <div className="shrink-0 mt-0.5 w-4 h-4 rounded-sm" style={{ border: `1.5px solid ${cs.primary}` }} />
        <div className="flex-1"><p style={{ color: '#1e293b', fontWeight: 700, fontSize: 9 }}>{ex.name}</p></div>
        <span style={{ color: cs.primary, fontWeight: 700, fontSize: 9 }}>{ex.sets}×{ex.reps}</span>
      </div>)}
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 4. CLINICAL
// ────────────────────────────────────────────────────────────
function ClinicalPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="px-4 py-3" style={{ borderBottom: `2px solid ${cs.primary}` }}>
      <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 13 }}>City Physio Clinic</p>
      <p style={{ color: '#64748b', fontSize: 8 }}>clinic@example.com</p>
    </div>
    <div className="px-4 pt-3 pb-4">
      <p style={{ color: '#64748b', fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>Session 1: Morning</p>
      {EXERCISES.map((ex,i) => <div key={i} className="pl-2 mb-1.5">
        <p style={{ fontSize: 8, color: '#1e293b' }}>
          <span style={{ color: cs.primary, fontWeight: 700 }}>{i+1}. </span>
          <span style={{ fontWeight: 700 }}>{ex.name}</span>
          <span style={{ color: '#64748b' }}> — {ex.sets}×{ex.reps}, rest {ex.rest}</span>
        </p>
      </div>)}
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 5. MODERN
// ────────────────────────────────────────────────────────────
function ModernPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="flex flex-col items-center py-4 px-4" style={{ backgroundColor: cs.primary }}>
      <span style={{ color: cs.text, fontWeight: 700, fontSize: 14 }}>City Physio Clinic</span>
    </div>
    <div style={{ height: 3, backgroundColor: cs.secondary }} />
    <div className="px-4 pt-3 pb-4">
      <div className="mb-2 pl-3 py-1" style={{ borderLeft: `4px solid ${cs.primary}`, backgroundColor: '#f8fafc' }}>
        <span style={{ color: '#1e293b', fontWeight: 700, fontSize: 9 }}>Day 1 — Morning</span>
      </div>
      {EXERCISES.map((ex,i) => <div key={i} className="flex mb-1.5" style={{ borderLeft: `3px solid ${cs.secondary}`, borderRadius: 3 }}>
        <div className="flex-1 px-2 py-1.5" style={{ backgroundColor: i%2===0?'#fff':'#f8fafc' }}>
          <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 8 }}>{ex.name}</p>
        </div>
        <div className="flex items-center gap-2 px-2" style={{ backgroundColor: cs.light }}>
          <div className="text-center">
            <p style={{ color: cs.primary, fontWeight: 700, fontSize: 12, lineHeight: 1 }}>{ex.sets}</p>
            <p style={{ color: cs.darkText, fontSize: 6, textTransform: 'uppercase' }}>sets</p>
          </div>
          <div className="text-center">
            <p style={{ color: cs.primary, fontWeight: 700, fontSize: 12, lineHeight: 1 }}>{ex.reps}</p>
            <p style={{ color: cs.darkText, fontSize: 6, textTransform: 'uppercase' }}>reps</p>
          </div>
        </div>
      </div>)}
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 6. MINIMAL
// ────────────────────────────────────────────────────────────
function MinimalPreview({ cs }: { cs: CS }) {
  return (<div className="px-4 pt-4 pb-4">
    <div className="mb-2 pb-1.5" style={{ borderBottom: `1px solid ${cs.primary}` }}>
      <p style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>City Physio Clinic</p>
      <p style={{ color: '#94a3b8', fontSize: 8 }}>clinic@example.com</p>
    </div>
    <p style={{ color: '#94a3b8', fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 6 }}>Rehab Program · Jan 2026</p>
    <p style={{ color: '#64748b', fontSize: 7, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Session 1 — Morning</p>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
      <thead><tr style={{ borderBottom: '1px solid #e2e8f0' }}>
        {['Exercise','Sets','Reps','Notes'].map(h => <th key={h} style={{ padding: '2px 3px', color: '#94a3b8', fontSize: 6, textTransform: 'uppercase', textAlign: h==='Exercise'||h==='Notes'?'left':'center', fontWeight: 700 }}>{h}</th>)}
      </tr></thead>
      <tbody>{EXERCISES.map((ex,i) => <tr key={i} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
        <td style={{ padding: '3px', color: '#1e293b', fontWeight: 600 }}>{ex.name}</td>
        <td style={{ padding: '3px', color: '#64748b', textAlign: 'center' }}>{ex.sets}</td>
        <td style={{ padding: '3px', color: '#64748b', textAlign: 'center' }}>{ex.reps}</td>
        <td style={{ padding: '3px', color: '#94a3b8', fontSize: 7 }}>{ex.notes}</td>
      </tr>)}</tbody>
    </table>
  </div>);
}

// ────────────────────────────────────────────────────────────
// 7. BOLD
// ────────────────────────────────────────────────────────────
function BoldPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="flex flex-col items-center py-3 px-4" style={{ backgroundColor: cs.darkText }}>
      <span style={{ color: cs.text, fontWeight: 800, fontSize: 15 }}>City Physio Clinic</span>
    </div>
    <div style={{ height: 4, backgroundColor: cs.primary }} />
    <div className="px-4 pt-3 pb-4">
      <div className="mb-2 px-2 py-1.5 rounded" style={{ backgroundColor: cs.primary }}>
        <span style={{ color: cs.text, fontWeight: 700, fontSize: 9 }}>Day 1 — Morning</span>
      </div>
      {EXERCISES.map((ex,i) => <div key={i} className="pb-2 mb-2" style={{ borderBottom: '0.5px solid #e2e8f0' }}>
        <p style={{ color: '#1e293b', fontWeight: 800, fontSize: 12 }}>{ex.name}</p>
        <div className="flex gap-1.5 mt-1 flex-wrap">
          {([['Sets',String(ex.sets)],['Reps',ex.reps],['Rest',ex.rest]] as [string,string][]).map(([l,v]) => (
            <span key={l} className="px-2 py-0.5 rounded-full" style={{ backgroundColor: cs.light, fontSize: 8, color: cs.darkText }}><strong>{v}</strong> {l}</span>
          ))}
        </div>
      </div>)}
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 8. EXECUTIVE
// ────────────────────────────────────────────────────────────
function ExecutivePreview({ cs }: { cs: CS }) {
  return (<>
    <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: '#1e293b' }}>
      <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: cs.light }}>
        <span style={{ color: cs.primary, fontWeight: 700, fontSize: 8 }}>LOGO</span>
      </div>
      <div>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>City Physio Clinic</p>
        <p style={{ color: '#94a3b8', fontSize: 8 }}>clinic@example.com</p>
      </div>
    </div>
    <div style={{ height: 3, backgroundColor: cs.primary }} />
    <div className="px-4 py-1 flex justify-between" style={{ backgroundColor: '#0f172a' }}>
      <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rehabilitation Program</span>
      <span style={{ color: '#64748b', fontSize: 7 }}>Jan 2026</span>
    </div>
    <div className="px-4 pt-2 pb-4">
      <div className="rounded overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
        <div className="px-3 py-1.5" style={{ backgroundColor: '#1e293b' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 9 }}>Session 1 — Morning</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead><tr style={{ backgroundColor: '#f8fafc' }}>
            {['Exercise','Sets','Reps','Rest'].map(h => <th key={h} style={{ padding: '3px 5px', fontWeight: 700, color: '#64748b', textAlign: h==='Exercise'?'left':'center', fontSize: 7, textTransform: 'uppercase' }}>{h}</th>)}
          </tr></thead>
          <tbody>{EXERCISES.map((ex,i) => <tr key={i} style={{ backgroundColor: i%2===0?'#fff':'#f8fafc' }}>
            <td style={{ padding: '3px 5px', fontWeight: 700, color: '#1e293b' }}>{ex.name}</td>
            <td style={{ padding: '3px 5px', textAlign: 'center', color: '#64748b' }}>{ex.sets}</td>
            <td style={{ padding: '3px 5px', textAlign: 'center', color: '#64748b' }}>{ex.reps}</td>
            <td style={{ padding: '3px 5px', textAlign: 'center', color: '#64748b' }}>{ex.rest}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 9. COMPACT
// ────────────────────────────────────────────────────────────
function CompactPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="flex items-center justify-between px-3 py-1.5" style={{ backgroundColor: cs.primary }}>
      <span style={{ color: cs.text, fontWeight: 700, fontSize: 10 }}>City Physio Clinic</span>
      <span style={{ color: cs.light, fontSize: 7 }}>Jan 2026</span>
    </div>
    <div className="px-3 pt-2 pb-3">
      <div className="rounded overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
        <div className="px-2 py-0.5" style={{ backgroundColor: cs.secondary }}>
          <span style={{ color: cs.text, fontWeight: 700, fontSize: 7 }}>Session 1</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 7 }}>
          <thead><tr style={{ backgroundColor: '#f1f5f9' }}>
            {['Exercise','Sets','Reps','Hold','Rest','Notes'].map(h => <th key={h} style={{ padding: '1px 3px', color: '#64748b', textAlign: h==='Exercise'||h==='Notes'?'left':'center', fontSize: 6, textTransform: 'uppercase' }}>{h}</th>)}
          </tr></thead>
          <tbody>{EXERCISES.map((ex,i) => <tr key={i} style={{ backgroundColor: i%2===0?'#fff':'#f8fafc' }}>
            <td style={{ padding: '1px 3px', fontWeight: 700, color: '#1e293b' }}>{ex.name}</td>
            <td style={{ padding: '1px 3px', textAlign: 'center', color: '#64748b' }}>{ex.sets}</td>
            <td style={{ padding: '1px 3px', textAlign: 'center', color: '#64748b' }}>{ex.reps}</td>
            <td style={{ padding: '1px 3px', textAlign: 'center', color: '#64748b' }}>{ex.hold}</td>
            <td style={{ padding: '1px 3px', textAlign: 'center', color: '#64748b' }}>{ex.rest}</td>
            <td style={{ padding: '1px 3px', color: '#94a3b8', fontSize: 6 }}>{ex.notes}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 10. TWO-COLUMN
// ────────────────────────────────────────────────────────────
function TwoColumnPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: cs.primary }}>
      <span style={{ color: cs.text, fontWeight: 700, fontSize: 12 }}>City Physio Clinic</span>
    </div>
    <div className="px-4 pt-3 pb-4">
      <div className="mb-2 pb-1" style={{ borderBottom: `2px solid ${cs.secondary}` }}>
        <span style={{ color: '#1e293b', fontWeight: 700, fontSize: 9 }}>Day 1 — Morning</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
        {EXERCISES.map((ex,i) => <div key={i} className="rounded overflow-hidden" style={{ border: `1px solid ${cs.light}` }}>
          <div className="px-2 py-1" style={{ backgroundColor: cs.secondary }}>
            <span style={{ color: cs.text, fontWeight: 700, fontSize: 8 }}>{ex.name}</span>
          </div>
          <div className="px-2 py-1.5" style={{ backgroundColor: cs.light }}>
            <p style={{ color: cs.darkText, fontWeight: 700, fontSize: 8 }}>{ex.sets} sets · {ex.reps} reps</p>
          </div>
        </div>)}
      </div>
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 11. LEDGER
// ────────────────────────────────────────────────────────────
function LedgerPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="px-4 py-3" style={{ backgroundColor: cs.light, borderBottom: `3px solid ${cs.primary}` }}>
      <p style={{ color: cs.darkText, fontWeight: 700, fontSize: 13 }}>City Physio Clinic</p>
    </div>
    <div className="px-4 pt-3 pb-4">
      <p style={{ color: cs.darkText, fontWeight: 700, fontSize: 9, marginBottom: 3 }}>Day 1 — Morning</p>
      <div style={{ border: `1px solid ${cs.light}`, borderRadius: 4, overflow: 'hidden' }}>
        {EXERCISES.map((ex,i) => <div key={i} className="flex items-stretch" style={{ backgroundColor: i%2===0?cs.light:'#fff' }}>
          <div className="flex items-center justify-center w-7" style={{ backgroundColor: cs.primary }}>
            <span style={{ color: cs.text, fontWeight: 700, fontSize: 8 }}>{i+1}</span>
          </div>
          <div className="flex-1 px-3 py-1.5">
            <span style={{ color: '#1e293b', fontWeight: 700, fontSize: 9 }}>{ex.name}</span>
          </div>
          <div className="px-3 py-1.5">
            <span style={{ color: cs.darkText, fontWeight: 700, fontSize: 9 }}>{ex.sets}×{ex.reps}</span>
          </div>
        </div>)}
      </div>
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 12. TIMELINE
// ────────────────────────────────────────────────────────────
function TimelinePreview({ cs }: { cs: CS }) {
  return (<>
    <div className="px-4 py-3" style={{ borderLeft: `4px solid ${cs.primary}`, borderBottom: '1px solid #e2e8f0' }}>
      <p style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>City Physio Clinic</p>
    </div>
    <div className="px-4 pt-3 pb-4">
      <span style={{ color: '#1e293b', fontWeight: 700, fontSize: 9, display: 'block', marginBottom: 8 }}>Day 1 — Morning</span>
      <div style={{ paddingLeft: 8 }}>
        {EXERCISES.map((ex,i) => <div key={i} className="flex items-start gap-2 relative" style={{ paddingBottom: i<EXERCISES.length-1?10:0 }}>
          {i<EXERCISES.length-1 && <div style={{ position: 'absolute', left: 6, top: 14, width: 2, bottom: 0, backgroundColor: cs.primary, opacity: 0.25 }} />}
          <div className="shrink-0 flex items-center justify-center rounded-full" style={{ width: 14, height: 14, backgroundColor: cs.primary, marginTop: 1 }}>
            <span style={{ color: '#fff', fontSize: 7, fontWeight: 700 }}>{i+1}</span>
          </div>
          <div>
            <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 9 }}>{ex.name}</p>
            <p style={{ color: '#64748b', fontSize: 7 }}>{ex.sets} sets · {ex.reps} reps</p>
          </div>
        </div>)}
      </div>
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 13. HANDOUT
// ────────────────────────────────────────────────────────────
function HandoutPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="flex flex-col items-center py-4 px-4" style={{ backgroundColor: cs.darkText }}>
      <span style={{ color: cs.text, fontWeight: 700, fontSize: 15 }}>City Physio Clinic</span>
      <span style={{ color: cs.light, fontSize: 9, marginTop: 2 }}>Your Rehabilitation Plan</span>
    </div>
    <div className="px-4 py-1.5" style={{ backgroundColor: cs.light }}>
      <span style={{ color: cs.darkText, fontWeight: 700, fontSize: 9 }}>Session 1 — January 2026</span>
    </div>
    <div className="px-4 pt-2 pb-4">
      {EXERCISES.map((ex,i) => <div key={i} className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid #f1f5f9' }}>
        <div className="shrink-0 rounded" style={{ width: 14, height: 14, border: `2px solid ${cs.primary}`, marginTop: 2 }} />
        <div>
          <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 11 }}>{ex.name}</p>
          <p style={{ color: '#64748b', fontSize: 9 }}>{ex.sets} sets · {ex.reps} reps · Rest: {ex.rest}</p>
        </div>
      </div>)}
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 14. REPORT
// ────────────────────────────────────────────────────────────
function ReportPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="px-4 py-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
      <p style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>City Physio Clinic</p>
      <p style={{ color: '#64748b', fontSize: 8 }}>clinic@example.com</p>
    </div>
    <div className="mx-4" style={{ height: 2, backgroundColor: cs.primary }} />
    <div className="px-4 pt-2 pb-1">
      <p style={{ fontWeight: 700, fontSize: 10, color: '#1e293b' }}>Rehabilitation Program Report</p>
      <p style={{ color: '#94a3b8', fontSize: 7 }}>January 1, 2026 · Patient: John Doe</p>
    </div>
    <div className="px-4 pt-1 pb-4">
      <div className="px-3 py-1 mb-2" style={{ backgroundColor: '#f1f5f9', borderLeft: `3px solid ${cs.primary}` }}>
        <span style={{ fontWeight: 700, fontSize: 8, color: '#1e293b' }}>Section 1: Morning Session</span>
      </div>
      {EXERCISES.map((ex,i) => <div key={i} className="pl-2 py-1" style={{ borderBottom: '0.5px solid #f1f5f9' }}>
        <p style={{ fontSize: 8, color: '#1e293b' }}>
          <span style={{ color: cs.primary, fontWeight: 700 }}>{i+1}. </span>
          <span style={{ fontWeight: 700 }}>{ex.name}</span>
          <span style={{ color: '#64748b' }}> — {ex.sets}×{ex.reps}, rest {ex.rest}</span>
        </p>
      </div>)}
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 15. CARD
// ────────────────────────────────────────────────────────────
function CardPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="px-4 py-2" style={{ backgroundColor: cs.primary }}>
      <p style={{ color: cs.text, fontWeight: 700, fontSize: 12 }}>City Physio Clinic</p>
    </div>
    <div style={{ height: 3, backgroundColor: cs.darkText }} />
    <div className="px-4 pt-3 pb-4">
      <span style={{ color: '#1e293b', fontWeight: 700, fontSize: 9, display: 'block', marginBottom: 5 }}>Day 1 — Morning</span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
        {EXERCISES.map((ex,i) => <div key={i} className="rounded overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
          <div className="px-2 py-1.5" style={{ backgroundColor: cs.primary }}>
            <span style={{ color: cs.text, fontWeight: 700, fontSize: 8 }}>{ex.name}</span>
          </div>
          <div className="px-2 py-1.5">
            <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 10 }}>{ex.sets} × {ex.reps}</p>
            <p style={{ color: '#64748b', fontSize: 7 }}>Rest: {ex.rest}</p>
          </div>
        </div>)}
      </div>
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 16. STRIPED
// ────────────────────────────────────────────────────────────
function StripedPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="px-4 py-2">
      <p style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>City Physio Clinic</p>
      <p style={{ color: '#94a3b8', fontSize: 8 }}>clinic@example.com · Jan 2026</p>
    </div>
    <div style={{ height: 4, backgroundColor: cs.primary }} />
    <div className="px-4 pt-2 pb-4">
      <p style={{ color: cs.primary, fontWeight: 700, fontSize: 9, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Day 1 — Morning Session</p>
      {EXERCISES.map((ex,i) => <div key={i} className="flex items-center px-3 py-2" style={{ backgroundColor: i%2===0?cs.light:'#fff' }}>
        <div className="flex-1">
          <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 9 }}>{ex.name}</p>
          {ex.notes && <p style={{ color: '#94a3b8', fontSize: 7, fontStyle: 'italic' }}>{ex.notes}</p>}
        </div>
        <span style={{ color: cs.darkText, fontWeight: 700, fontSize: 10 }}>{ex.sets}×{ex.reps}</span>
      </div>)}
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 17. MAGAZINE
// ────────────────────────────────────────────────────────────
function MagazinePreview({ cs }: { cs: CS }) {
  return (<>
    <div className="px-4 py-3" style={{ backgroundColor: cs.primary, borderBottom: `4px solid ${cs.darkText}` }}>
      <p style={{ color: cs.text, fontWeight: 900, fontSize: 14, letterSpacing: '-0.02em' }}>City Physio Clinic</p>
      <p style={{ color: cs.light, fontSize: 8 }}>Rehabilitation Program · Jan 2026</p>
    </div>
    <div className="px-4 pt-3 pb-4">
      <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 9, marginBottom: 6 }}>Day 1 — Morning</p>
      {EXERCISES.map((ex,i) => <div key={i} className="flex items-start gap-3 mb-2 pb-2" style={{ borderBottom: '0.5px solid #e2e8f0' }}>
        <span style={{ fontWeight: 900, fontSize: 28, lineHeight: 1, color: cs.primary, opacity: 0.2, minWidth: 24, textAlign: 'center' }}>{i+1}</span>
        <div className="flex-1">
          <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 10 }}>{ex.name}</p>
          <p style={{ color: '#64748b', fontSize: 8 }}>{ex.sets} sets · {ex.reps} reps · Rest: {ex.rest}</p>
        </div>
      </div>)}
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 18. SIDEBAR
// ────────────────────────────────────────────────────────────
function SidebarPreview({ cs }: { cs: CS }) {
  return (<div className="flex" style={{ minHeight: 160 }}>
    <div className="flex flex-col px-3 py-3 gap-4" style={{ backgroundColor: cs.primary, width: 70 }}>
      <div>
        <p style={{ color: cs.text, fontWeight: 700, fontSize: 9, writingMode: undefined }}>City Physio</p>
        <p style={{ color: cs.light, fontSize: 7 }}>Jan 2026</p>
      </div>
      <div className="mt-2">
        <div className="rounded px-1.5 py-1 mb-1" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
          <p style={{ color: cs.text, fontWeight: 700, fontSize: 7 }}>Session 1</p>
          <p style={{ color: cs.light, fontSize: 6 }}>Morning</p>
        </div>
      </div>
    </div>
    <div className="flex-1 px-3 py-3">
      {EXERCISES.map((ex,i) => <div key={i} className="py-1.5" style={{ borderBottom: '0.5px solid #f1f5f9' }}>
        <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 9 }}>{ex.name}</p>
        <p style={{ color: '#64748b', fontSize: 8 }}>{ex.sets} sets · {ex.reps} reps</p>
      </div>)}
    </div>
  </div>);
}

// ────────────────────────────────────────────────────────────
// 19. ACADEMIC
// ────────────────────────────────────────────────────────────
function AcademicPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="px-4 py-3" style={{ borderBottom: `1px solid #e2e8f0` }}>
      <p style={{ fontWeight: 700, fontSize: 12, color: '#1e293b' }}>CITY PHYSIO CLINIC</p>
      <p style={{ color: '#94a3b8', fontSize: 7, letterSpacing: '0.05em' }}>REHABILITATION PROGRAM REPORT · JANUARY 2026</p>
    </div>
    <div className="px-4 pt-3 pb-4">
      <p style={{ fontWeight: 700, fontSize: 8, color: '#1e293b', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>§1. Morning Session</p>
      <div style={{ borderLeft: `2px solid ${cs.primary}`, paddingLeft: 8 }}>
        {EXERCISES.map((ex,i) => <div key={i} className="mb-2">
          <p style={{ fontSize: 8, color: '#1e293b' }}>
            <span style={{ color: cs.primary, fontWeight: 700 }}>[{i+1}] </span>
            <span style={{ fontWeight: 700 }}>{ex.name}.</span>
            <span style={{ color: '#64748b' }}> {ex.sets} sets × {ex.reps} repetitions; rest interval: {ex.rest}.</span>
          </p>
          {ex.notes && <p style={{ color: '#94a3b8', fontSize: 7, fontStyle: 'italic', paddingLeft: 12 }}>{ex.notes}</p>}
        </div>)}
      </div>
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 20. OUTLINE
// ────────────────────────────────────────────────────────────
function OutlinePreview({ cs }: { cs: CS }) {
  return (<>
    <div className="px-4 py-3" style={{ borderBottom: '2px solid #e2e8f0' }}>
      <p style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>City Physio Clinic</p>
    </div>
    <div className="px-4 pt-3 pb-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cs.primary }} />
        <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 9 }}>Session 1: Morning</p>
      </div>
      {EXERCISES.map((ex,i) => <div key={i} className="flex items-start gap-2 ml-4 mb-1.5">
        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: cs.secondary }} />
        <div>
          <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 8 }}>{ex.name}</p>
          <p style={{ color: '#64748b', fontSize: 7, paddingLeft: 8 }}>{ex.sets} sets × {ex.reps} reps — rest {ex.rest}</p>
        </div>
      </div>)}
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 21. RECEIPT
// ────────────────────────────────────────────────────────────
function ReceiptPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="px-4 py-2 text-center" style={{ backgroundColor: cs.primary }}>
      <p style={{ color: cs.text, fontWeight: 700, fontSize: 12 }}>City Physio Clinic</p>
      <p style={{ color: cs.light, fontSize: 7 }}>————————————————</p>
    </div>
    <div className="px-4 pt-2 pb-4">
      <div className="flex justify-between mb-2" style={{ borderBottom: `1px dashed ${cs.primary}` }}>
        <span style={{ color: '#64748b', fontSize: 7, fontWeight: 700, textTransform: 'uppercase' }}>Morning Session</span>
        <span style={{ color: '#64748b', fontSize: 7 }}>Jan 2026</span>
      </div>
      {EXERCISES.map((ex,i) => <div key={i} className="flex justify-between items-start py-1" style={{ borderBottom: '0.5px dashed #e2e8f0' }}>
        <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 8, flex: 1 }}>{ex.name}</p>
        <p style={{ color: cs.primary, fontWeight: 700, fontSize: 9, marginLeft: 8 }}>{ex.sets}×{ex.reps}</p>
      </div>)}
      <div className="flex justify-center mt-2">
        <p style={{ color: '#94a3b8', fontSize: 7 }}>————————————————</p>
      </div>
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 22. NOTEBOOK
// ────────────────────────────────────────────────────────────
function NotebookPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: `3px solid ${cs.primary}` }}>
      <div className="w-2 h-8 rounded" style={{ backgroundColor: cs.primary }} />
      <div>
        <p style={{ fontWeight: 700, fontSize: 12, color: '#1e293b' }}>City Physio Clinic</p>
        <p style={{ color: '#94a3b8', fontSize: 7 }}>Rehabilitation Program · Jan 2026</p>
      </div>
    </div>
    <div className="px-4 pt-3 pb-4" style={{ background: 'repeating-linear-gradient(to bottom, transparent, transparent 19px, #e2e8f0 19px, #e2e8f0 20px)' }}>
      <p style={{ color: cs.primary, fontWeight: 700, fontSize: 9, marginBottom: 6 }}>Day 1 — Morning</p>
      {EXERCISES.map((ex,i) => <div key={i} className="flex items-center mb-1" style={{ height: 20 }}>
        <div className="w-3 h-3 rounded-sm mr-2 shrink-0" style={{ border: `1.5px solid ${cs.primary}` }} />
        <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 8, flex: 1 }}>{ex.name}</p>
        <span style={{ color: cs.primary, fontSize: 8, fontWeight: 700 }}>{ex.sets}×{ex.reps}</span>
      </div>)}
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 23. POSTER
// ────────────────────────────────────────────────────────────
function PosterPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="flex flex-col items-center py-5 px-4" style={{ backgroundColor: cs.primary }}>
      <p style={{ color: cs.text, fontWeight: 900, fontSize: 20, letterSpacing: '-0.02em', textAlign: 'center', lineHeight: 1.1 }}>City Physio{'\n'}Clinic</p>
      <div className="mt-2 px-3 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
        <span style={{ color: cs.text, fontSize: 8 }}>Rehabilitation Program · Jan 2026</span>
      </div>
    </div>
    <div className="px-4 pt-3 pb-4">
      <p style={{ color: cs.primary, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Morning Session</p>
      {EXERCISES.map((ex,i) => <div key={i} className="mb-2 pb-2" style={{ borderBottom: `1px solid ${cs.light}` }}>
        <p style={{ color: '#1e293b', fontWeight: 800, fontSize: 12 }}>{ex.name}</p>
        <p style={{ color: '#64748b', fontSize: 8 }}>{ex.sets} sets · {ex.reps} reps · Rest {ex.rest}</p>
      </div>)}
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 24. PLAIN
// ────────────────────────────────────────────────────────────
function PlainPreview({ cs: _cs }: { cs: CS }) {
  return (<div className="px-5 py-4">
    <p style={{ fontWeight: 700, fontSize: 13, color: '#000', marginBottom: 2 }}>City Physio Clinic</p>
    <p style={{ color: '#64748b', fontSize: 8, marginBottom: 12 }}>clinic@example.com · Rehabilitation Program · January 2026</p>
    <p style={{ fontWeight: 700, fontSize: 8, color: '#000', marginBottom: 4, textTransform: 'uppercase' }}>Day 1 — Morning Session</p>
    {EXERCISES.map((ex,i) => <div key={i} className="mb-2">
      <p style={{ fontSize: 9, color: '#000' }}>
        <span style={{ fontWeight: 700 }}>{ex.name}</span>
        <span style={{ color: '#64748b' }}> — {ex.sets} sets × {ex.reps} reps, rest {ex.rest}</span>
      </p>
      {ex.notes && <p style={{ color: '#94a3b8', fontSize: 7, fontStyle: 'italic', paddingLeft: 10 }}>{ex.notes}</p>}
    </div>)}
  </div>);
}

// ────────────────────────────────────────────────────────────
// 25. ROUNDED
// ────────────────────────────────────────────────────────────
function RoundedPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="mx-3 mt-3 rounded-xl flex flex-col items-center py-4" style={{ backgroundColor: cs.primary }}>
      <p style={{ color: cs.text, fontWeight: 700, fontSize: 13 }}>City Physio Clinic</p>
      <p style={{ color: cs.light, fontSize: 8, marginTop: 2 }}>Your Rehabilitation Partner</p>
    </div>
    <div className="px-3 pt-3 pb-3">
      <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 9, marginBottom: 6, paddingLeft: 4 }}>Day 1 — Morning</p>
      {EXERCISES.map((ex,i) => <div key={i} className="rounded-xl px-3 py-2 mb-2" style={{ backgroundColor: i%2===0?cs.light:'#fff', border: `1px solid ${cs.light}` }}>
        <p style={{ color: cs.darkText, fontWeight: 700, fontSize: 9 }}>{ex.name}</p>
        <p style={{ color: '#64748b', fontSize: 8, marginTop: 2 }}>{ex.sets} sets · {ex.reps} reps · Rest: {ex.rest}</p>
      </div>)}
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 26. HIGHLIGHT
// ────────────────────────────────────────────────────────────
function HighlightPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="px-4 py-3" style={{ borderBottom: `2px solid ${cs.primary}` }}>
      <p style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>City Physio Clinic</p>
    </div>
    <div className="px-4 pt-2 pb-4">
      <p style={{ color: '#64748b', fontSize: 8, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Day 1 — Morning</p>
      {EXERCISES.map((ex,i) => <div key={i} className="mb-1.5">
        <div className="px-3 py-1" style={{ backgroundColor: cs.primary }}>
          <span style={{ color: cs.text, fontWeight: 700, fontSize: 9 }}>{ex.name}</span>
        </div>
        <div className="px-3 py-1" style={{ backgroundColor: cs.light }}>
          <span style={{ color: cs.darkText, fontSize: 8 }}>{ex.sets} sets · {ex.reps} reps · Rest: {ex.rest}</span>
          {ex.notes && <span style={{ color: '#94a3b8', fontSize: 7, fontStyle: 'italic', marginLeft: 6 }}>{ex.notes}</span>}
        </div>
      </div>)}
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 27. THREE-COLUMN
// ────────────────────────────────────────────────────────────
function ColumnsPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="px-4 py-2" style={{ backgroundColor: cs.primary }}>
      <p style={{ color: cs.text, fontWeight: 700, fontSize: 12 }}>City Physio Clinic</p>
    </div>
    <div className="px-4 pt-3 pb-4">
      <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 9, marginBottom: 6 }}>Day 1 — Morning</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
        {EXERCISES.map((ex,i) => <div key={i} className="rounded overflow-hidden" style={{ border: `1px solid ${cs.light}` }}>
          <div className="px-1.5 py-1" style={{ backgroundColor: cs.secondary }}>
            <p style={{ color: cs.text, fontWeight: 700, fontSize: 7, lineHeight: 1.2 }}>{ex.name}</p>
          </div>
          <div className="px-1.5 py-1" style={{ backgroundColor: cs.light }}>
            <p style={{ color: cs.darkText, fontWeight: 700, fontSize: 9 }}>{ex.sets}×{ex.reps}</p>
            <p style={{ color: '#64748b', fontSize: 7 }}>{ex.rest}</p>
          </div>
        </div>)}
      </div>
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 28. DIVIDER
// ────────────────────────────────────────────────────────────
function DividerPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="px-4 py-3" style={{ backgroundColor: cs.light, borderBottom: `1px solid ${cs.secondary}` }}>
      <p style={{ color: cs.darkText, fontWeight: 700, fontSize: 13 }}>City Physio Clinic</p>
      <p style={{ color: cs.darkText, fontSize: 8 }}>Rehabilitation Program · Jan 2026</p>
    </div>
    <div className="px-4 pt-3 pb-4">
      <p style={{ color: cs.primary, fontWeight: 700, fontSize: 9, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Day 1 — Morning Session</p>
      {EXERCISES.map((ex,i) => <div key={i} className="pb-2 mb-2" style={{ borderBottom: `2px solid ${cs.primary}` }}>
        <div className="flex items-center justify-between">
          <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 10 }}>{ex.name}</p>
          <span style={{ color: cs.primary, fontWeight: 700, fontSize: 10 }}>{ex.sets}×{ex.reps}</span>
        </div>
        <p style={{ color: '#64748b', fontSize: 8 }}>Rest: {ex.rest}{ex.notes ? ` · ${ex.notes}` : ''}</p>
      </div>)}
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 29. SCHEDULE
// ────────────────────────────────────────────────────────────
function SchedulePreview({ cs }: { cs: CS }) {
  return (<>
    <div className="px-4 py-2" style={{ backgroundColor: cs.darkText }}>
      <p style={{ color: cs.text, fontWeight: 700, fontSize: 12 }}>City Physio — Week Schedule</p>
    </div>
    <div className="overflow-x-auto">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
        <thead>
          <tr>
            <th style={{ padding: '4px 6px', backgroundColor: cs.primary, color: cs.text, fontWeight: 700, textAlign: 'left', fontSize: 7, width: 90 }}>Exercise</th>
            {['Mon','Wed','Fri'].map(d => <th key={d} style={{ padding: '4px 6px', backgroundColor: cs.secondary, color: cs.text, fontWeight: 700, textAlign: 'center', fontSize: 7 }}>{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {EXERCISES.map((ex,i) => <tr key={i} style={{ backgroundColor: i%2===0?cs.light:'#fff' }}>
            <td style={{ padding: '4px 6px', fontWeight: 700, color: '#1e293b', fontSize: 8 }}>{ex.name}</td>
            {['Mon','Wed','Fri'].map(d => <td key={d} style={{ padding: '4px 6px', textAlign: 'center', color: cs.primary, fontWeight: 700, fontSize: 9 }}>{ex.sets}×{ex.reps}</td>)}
          </tr>)}
        </tbody>
      </table>
    </div>
  </>);
}

// ────────────────────────────────────────────────────────────
// 30. COMPACT CARDS
// ────────────────────────────────────────────────────────────
function CompactCardPreview({ cs }: { cs: CS }) {
  return (<>
    <div className="px-4 py-2" style={{ backgroundColor: cs.primary }}>
      <p style={{ color: cs.text, fontWeight: 700, fontSize: 12 }}>City Physio Clinic</p>
    </div>
    <div className="px-3 pt-3 pb-4">
      <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 9, marginBottom: 5 }}>Day 1 — Morning</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
        {EXERCISES.map((ex,i) => <div key={i} className="rounded p-1.5" style={{ border: `1.5px solid ${cs.primary}`, backgroundColor: i%2===0?cs.light:'#fff' }}>
          <p style={{ color: cs.darkText, fontWeight: 700, fontSize: 7, lineHeight: 1.2, marginBottom: 3 }}>{ex.name}</p>
          <p style={{ color: cs.primary, fontWeight: 800, fontSize: 10 }}>{ex.sets}×{ex.reps}</p>
          <p style={{ color: '#94a3b8', fontSize: 6 }}>{ex.rest}</p>
        </div>)}
      </div>
    </div>
  </>);
}

// ── Style descriptions ────────────────────────────────────
const STYLE_DESCRIPTIONS: Record<string, string> = {
  professional:  'Full table layout with colored header banner — structured and formal',
  patient:       'Large card blocks with readable metrics — easy for patients to follow',
  checklist:     'Minimal tick-list format — perfect for print and self-tracking',
  clinical:      'Plain numbered list, no color fill — clean medical document style',
  modern:        'Large metrics, accent bars per exercise — contemporary premium look',
  minimal:       'Ultra-clean with thin borders only — no fills, maximum whitespace',
  bold:          'Large exercise names with pill badges — high visual impact',
  executive:     'Near-black header with accent line — authoritative corporate style',
  compact:       'Maximum density, condensed table — fits the most exercises per page',
  twoColumn:     'Two side-by-side exercise columns — efficient use of page width',
  ledger:        'Accounting-style alternating stripes with numbered rows',
  timeline:      'Vertical timeline with bullet connectors — process flow style',
  handout:       'Large fonts and big checkboxes — ideal for patient take-home sheets',
  report:        'Formal numbered sections with sub-headers — medical report format',
  card:          'Each exercise as a bordered card — clear and visually separated',
  striped:       'Wide alternating color stripes — no banner, clean and airy',
  magazine:      'Giant decorative numbers flanking each exercise — editorial style',
  sidebar:       'Colored session sidebar on the left — clear session separation',
  academic:      'Formal section numbers and indented structure — academic paper style',
  outline:       'Hierarchical bullet-point outline — clear visual nesting',
  receipt:       'Name left, metrics right with dashed dividers — receipt-inspired',
  notebook:      'Ruled lines background with checkbox rows — notebook feel',
  poster:        'Oversized clinic name, bold exercise text — wall poster format',
  plain:         'Zero decoration, pure black-and-white typography only',
  rounded:       'Generous rounded corners, soft card look — gentle and friendly',
  highlight:     'Color band behind every exercise name — strong visual anchoring',
  columns:       'Three exercises side by side — maximum layout efficiency',
  divider:       'Thick color rule separating every exercise — clear section breaks',
  schedule:      'Timetable layout with day columns — weekly session planning view',
  compactCard:   'Tiny 3-per-row cards — most exercises visible at a glance',
};

// ── Modal ─────────────────────────────────────────────────
export default function TemplatePreviewModal({ template, palette, onClose }: TemplatePreviewModalProps) {
  if (!template) return null;

  const cs = palette.colorScheme;
  const { layoutVariant } = template;

  const PreviewContent = () => {
    switch (layoutVariant) {
      case 'patient':      return <PatientPreview cs={cs} />;
      case 'checklist':    return <ChecklistPreview cs={cs} />;
      case 'clinical':     return <ClinicalPreview cs={cs} />;
      case 'modern':       return <ModernPreview cs={cs} />;
      case 'minimal':      return <MinimalPreview cs={cs} />;
      case 'bold':         return <BoldPreview cs={cs} />;
      case 'executive':    return <ExecutivePreview cs={cs} />;
      case 'compact':      return <CompactPreview cs={cs} />;
      case 'twoColumn':    return <TwoColumnPreview cs={cs} />;
      case 'ledger':       return <LedgerPreview cs={cs} />;
      case 'timeline':     return <TimelinePreview cs={cs} />;
      case 'handout':      return <HandoutPreview cs={cs} />;
      case 'report':       return <ReportPreview cs={cs} />;
      case 'card':         return <CardPreview cs={cs} />;
      case 'striped':      return <StripedPreview cs={cs} />;
      case 'magazine':     return <MagazinePreview cs={cs} />;
      case 'sidebar':      return <SidebarPreview cs={cs} />;
      case 'academic':     return <AcademicPreview cs={cs} />;
      case 'outline':      return <OutlinePreview cs={cs} />;
      case 'receipt':      return <ReceiptPreview cs={cs} />;
      case 'notebook':     return <NotebookPreview cs={cs} />;
      case 'poster':       return <PosterPreview cs={cs} />;
      case 'plain':        return <PlainPreview cs={cs} />;
      case 'rounded':      return <RoundedPreview cs={cs} />;
      case 'highlight':    return <HighlightPreview cs={cs} />;
      case 'columns':      return <ColumnsPreview cs={cs} />;
      case 'divider':      return <DividerPreview cs={cs} />;
      case 'schedule':     return <SchedulePreview cs={cs} />;
      case 'compactCard':  return <CompactCardPreview cs={cs} />;
      default:             return <ProfessionalPreview cs={cs} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl bg-white dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{template.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {palette.name} palette · Export preview
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" aria-label="Close preview">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 text-xs font-sans bg-white">
            <PreviewContent />
            <div className="px-4 pb-3 pt-1">
              <p style={{ color: '#94a3b8', fontSize: 8 }}>Generated · City Physio Clinic · {palette.name} palette</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {STYLE_DESCRIPTIONS[layoutVariant] ?? ''}
          </p>
        </div>
      </div>
    </div>
  );
}
