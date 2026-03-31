import ExcelJS from 'exceljs';
import type { Exercise, ExportTemplate, Program } from '../../../types';
import type { ClinicInfo } from './pdfExportService';

// ── Colour helpers ────────────────────────────────────────

function buildColors(template?: ExportTemplate) {
  const cs = template?.colorScheme;
  const strip = (hex: string) => hex.replace('#', '');
  return {
    primaryDark:  strip(cs?.darkText  ?? '#134e4a'),
    primary:      strip(cs?.primary   ?? '#0f766e'),
    primaryLight: strip(cs?.light     ?? '#ccfbf1'),
    accent:       strip(cs?.secondary ?? '#0369a1'),
    amber50:      'fffbeb',
    amber200:     'fde68a',
    amber700:     'b45309',
    white:        'ffffff',
    gray50:       'f8fafc',
    gray100:      'f1f5f9',
    gray200:      'e2e8f0',
    gray300:      'd1d5db',
    gray400:      '94a3b8',
    gray600:      '475569',
    gray800:      '1e293b',
    green600:     '16a34a',
    green100:     'dcfce7',
  };
}

type COLOR = ReturnType<typeof buildColors>;

function argb(hex: string) { return `ff${hex}`; }

function fillSolid(hex: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(hex) } };
}

function thinBorder(hex = 'e2e8f0'): ExcelJS.Borders {
  const side: ExcelJS.BorderStyle = 'thin';
  const color = { argb: argb(hex) };
  return { top: { style: side, color }, bottom: { style: side, color }, left: { style: side, color }, right: { style: side, color }, diagonal: {} };
}

// ── Misc helpers ──────────────────────────────────────────

interface SocialLink { label: string; display: string; href: string; }

function buildSocialLinks(clinic: ClinicInfo): SocialLink[] {
  const strip = (p: string) => p.replace(/[^\d+]/g, '').replace(/(?<!^)\+/g, '');
  return ([
    clinic.clinicWhatsApp ? { label: 'WhatsApp', display: `WhatsApp: ${clinic.clinicWhatsApp}`, href: `https://wa.me/${strip(clinic.clinicWhatsApp)}` } : null,
    clinic.clinicGmail    ? { label: 'Gmail',    display: `Gmail: ${clinic.clinicGmail}`,          href: `mailto:${clinic.clinicGmail}` } : null,
    clinic.clinicInstagram ? { label: 'Instagram', display: 'Instagram', href: clinic.clinicInstagram } : null,
    clinic.clinicFacebook  ? { label: 'Facebook',  display: 'Facebook',  href: clinic.clinicFacebook } : null,
  ]).filter(Boolean) as SocialLink[];
}

function sanitizeFilename(clientName: string, programName: string): string {
  const part = (s: string) => s.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
  return `${part(clientName)}_${part(programName)}.xlsx`;
}

function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return iso; }
}

function dash(v: string | number | undefined | null): string {
  return v === undefined || v === null || v === '' ? '—' : String(v);
}

function metricStr(pe: { sets?: number; reps?: string; holdTime?: number; restSeconds?: number }): string {
  return [
    pe.sets        != null ? `${pe.sets} sets`     : null,
    pe.reps        != null ? `${pe.reps} reps`     : null,
    pe.holdTime    != null ? `hold ${pe.holdTime}s`    : null,
    pe.restSeconds != null ? `rest ${pe.restSeconds}s` : null,
  ].filter(Boolean).join(' · ');
}

// ── Done? dropdown helper ─────────────────────────────────

const DONE_DROPDOWN: ExcelJS.DataValidation = {
  type: 'list',
  allowBlank: true,
  formulae: ['"✓,✗"'],
  showErrorMessage: true,
  errorTitle: 'Invalid entry',
  error: 'Please select ✓ (done) or ✗ (not done) from the dropdown',
};

function addDoneCell(sheet: ExcelJS.Worksheet, row: number, col: string, COLOR: COLOR) {
  const cell = sheet.getCell(`${col}${row}`);
  cell.value = '✗';
  cell.font = { size: 11, bold: true, color: { argb: argb(COLOR.gray400) } };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
  cell.fill = fillSolid(COLOR.gray100);
  cell.border = thinBorder(COLOR.gray200);
  cell.dataValidation = DONE_DROPDOWN;
}

// ── Session tracking for dashboard ───────────────────────

interface SessionInfo {
  label: string;
  exercises: Array<{ name: string; rowNum: number }>;
}

// ── Progress dashboard sheet ──────────────────────────────

function createProgressDashboard(
  workbook: ExcelJS.Workbook,
  program: Program,
  clientName: string,
  clinic: ClinicInfo,
  sessionInfoList: SessionInfo[],
  exportDateStr: string,
  COLOR: COLOR,
) {
  const dash = workbook.addWorksheet('Progress Dashboard');
  dash.properties.tabColor = { argb: argb(COLOR.primary) };

  dash.columns = [
    { width: 4  },  // A spacer / number
    { width: 36 },  // B name
    { width: 12 },  // C total
    { width: 12 },  // D completed
    { width: 12 },  // E remaining
    { width: 10 },  // F % done
    { width: 42 },  // G progress bar
  ];

  let dr = 1;
  const addRow = (height = 18) => { dash.getRow(dr).height = height; return dr++; };
  const spacer = (h = 8) => { dash.getRow(dr).height = h; dr++; };

  const totalExercises = sessionInfoList.reduce((sum, s) => sum + s.exercises.length, 0);

  // ── Header ────────────────────────────────────────────
  const h1 = addRow(30);
  dash.mergeCells(`A${h1}:G${h1}`);
  const h1cell = dash.getCell(`A${h1}`);
  h1cell.value = `Progress Dashboard — ${program.name}`;
  h1cell.font = { bold: true, size: 14, color: { argb: argb(COLOR.white) } };
  h1cell.fill = fillSolid(COLOR.primaryDark);
  h1cell.alignment = { vertical: 'middle', indent: 1 };

  const h2 = addRow(18);
  dash.mergeCells(`A${h2}:G${h2}`);
  const h2cell = dash.getCell(`A${h2}`);
  h2cell.value = `Client: ${clientName}   ·   Exported: ${exportDateStr}   ·   Therapist: ${clinic.therapistName ?? '—'}`;
  h2cell.font = { size: 9, color: { argb: argb(COLOR.primaryLight) } };
  h2cell.fill = fillSolid(COLOR.primary);
  h2cell.alignment = { vertical: 'middle', indent: 1 };

  const noteRow = addRow(14);
  dash.mergeCells(`A${noteRow}:G${noteRow}`);
  const noteCell = dash.getCell(`A${noteRow}`);
  noteCell.value = 'Auto-updated from the "Program" sheet — tick ✓ in column H there to track progress. Do not edit this sheet.';
  noteCell.font = { size: 8, italic: true, color: { argb: argb(COLOR.gray600) } };
  noteCell.fill = fillSolid(COLOR.gray50);
  noteCell.alignment = { vertical: 'middle', indent: 1 };

  spacer();

  // ── Overall progress ──────────────────────────────────
  const secH1 = addRow(20);
  dash.mergeCells(`A${secH1}:G${secH1}`);
  const secH1cell = dash.getCell(`A${secH1}`);
  secH1cell.value = 'OVERALL PROGRESS';
  secH1cell.font = { bold: true, size: 10, color: { argb: argb(COLOR.white) } };
  secH1cell.fill = fillSolid(COLOR.accent);
  secH1cell.alignment = { vertical: 'middle', indent: 1 };

  // Build overall countif range across all sessions
  const allFirstRows = sessionInfoList
    .filter((s) => s.exercises.length > 0)
    .map((s) => s.exercises[0].rowNum);
  const allLastRows = sessionInfoList
    .filter((s) => s.exercises.length > 0)
    .map((s) => s.exercises[s.exercises.length - 1].rowNum);

  const overallFirst = allFirstRows.length > 0 ? Math.min(...allFirstRows) : 2;
  const overallLast  = allLastRows.length > 0  ? Math.max(...allLastRows)  : 2;

  const overallCountif = `COUNTIF('Program'!H${overallFirst}:H${overallLast},"✓")`;

  // Label row
  const labelRow = addRow(16);
  (['B', 'C', 'D', 'E', 'F'] as const).forEach((col, i) => {
    const headers = ['', 'Total', 'Completed', 'Remaining', '% Done'];
    const cell = dash.getCell(`${col}${labelRow}`);
    cell.value = headers[i];
    cell.font = { bold: true, size: 8, color: { argb: argb(COLOR.primary) } };
    cell.fill = fillSolid(COLOR.primaryLight);
    cell.border = thinBorder();
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Values row
  const valRow = addRow(22);
  dash.getCell(`B${valRow}`).value = program.name;
  dash.getCell(`B${valRow}`).font = { bold: true, size: 10, color: { argb: argb(COLOR.gray800) } };
  dash.getCell(`B${valRow}`).border = thinBorder();
  dash.getCell(`B${valRow}`).alignment = { vertical: 'middle', indent: 1 };
  dash.getCell(`C${valRow}`).value = totalExercises;
  dash.getCell(`C${valRow}`).font = { bold: true, size: 11, color: { argb: argb(COLOR.gray800) } };
  dash.getCell(`C${valRow}`).border = thinBorder();
  dash.getCell(`C${valRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
  dash.getCell(`D${valRow}`).value = { formula: `=${overallCountif}` };
  dash.getCell(`D${valRow}`).font = { bold: true, size: 11, color: { argb: argb(COLOR.green600) } };
  dash.getCell(`D${valRow}`).fill = fillSolid(COLOR.green100);
  dash.getCell(`D${valRow}`).border = thinBorder();
  dash.getCell(`D${valRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
  dash.getCell(`E${valRow}`).value = { formula: `=${totalExercises}-${overallCountif}` };
  dash.getCell(`E${valRow}`).font = { bold: true, size: 11, color: { argb: argb(COLOR.gray600) } };
  dash.getCell(`E${valRow}`).border = thinBorder();
  dash.getCell(`E${valRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
  dash.getCell(`F${valRow}`).value = { formula: `=TEXT(IFERROR(${overallCountif}/${totalExercises},0),"0%")` };
  dash.getCell(`F${valRow}`).font = { bold: true, size: 11, color: { argb: argb(COLOR.primary) } };
  dash.getCell(`F${valRow}`).fill = fillSolid(COLOR.primaryLight);
  dash.getCell(`F${valRow}`).border = thinBorder();
  dash.getCell(`F${valRow}`).alignment = { vertical: 'middle', horizontal: 'center' };

  // Overall progress bar
  const barRow = addRow(24);
  dash.mergeCells(`B${barRow}:G${barRow}`);
  const barCell = dash.getCell(`B${barRow}`);
  barCell.value = {
    formula: `=REPT("█",ROUND(IFERROR(${overallCountif}/${totalExercises},0)*30,0))&REPT("░",30-ROUND(IFERROR(${overallCountif}/${totalExercises},0)*30,0))&"  "&TEXT(IFERROR(${overallCountif}/${totalExercises},0),"0% complete")`,
  };
  barCell.font = { size: 13, color: { argb: argb(COLOR.primary) }, name: 'Courier New' };
  barCell.fill = fillSolid(COLOR.primaryLight);
  barCell.border = thinBorder();
  barCell.alignment = { vertical: 'middle', indent: 1 };

  spacer();

  // ── Session breakdown ─────────────────────────────────
  const secH2 = addRow(20);
  dash.mergeCells(`A${secH2}:G${secH2}`);
  const secH2cell = dash.getCell(`A${secH2}`);
  secH2cell.value = 'PROGRESS BY SESSION';
  secH2cell.font = { bold: true, size: 10, color: { argb: argb(COLOR.white) } };
  secH2cell.fill = fillSolid(COLOR.accent);
  secH2cell.alignment = { vertical: 'middle', indent: 1 };

  // Session column headers
  const sColRow = addRow(16);
  const sHeaders = ['#', 'Session', 'Total', 'Done', 'Left', '% Done', 'Progress  (updates as you tick ✓ in Program sheet)'];
  (['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const).forEach((col, i) => {
    const cell = dash.getCell(`${col}${sColRow}`);
    cell.value = sHeaders[i];
    cell.font = { bold: true, size: 8, color: { argb: argb(COLOR.primary) } };
    cell.fill = fillSolid(COLOR.primaryLight);
    cell.border = thinBorder();
    cell.alignment = { vertical: 'middle', horizontal: i < 2 ? 'left' : 'center', indent: i < 2 ? 1 : 0 };
  });

  // One row per session
  sessionInfoList.forEach((sinfo, si) => {
    const total = sinfo.exercises.length;
    const firstRow = total > 0 ? sinfo.exercises[0].rowNum : 0;
    const lastRow  = total > 0 ? sinfo.exercises[total - 1].rowNum : 0;
    const countif = total > 0 ? `COUNTIF('Program'!H${firstRow}:H${lastRow},"✓")` : '0';
    const isEven = si % 2 === 0;
    const bg = isEven ? COLOR.white : COLOR.gray50;

    const sr = addRow(22);
    const numCell = dash.getCell(`A${sr}`);
    numCell.value = si + 1;
    numCell.font = { bold: true, size: 9, color: { argb: argb(COLOR.primary) } };
    numCell.fill = fillSolid(bg);
    numCell.border = thinBorder();
    numCell.alignment = { vertical: 'middle', horizontal: 'center' };

    const nameCell = dash.getCell(`B${sr}`);
    nameCell.value = sinfo.label;
    nameCell.font = { bold: true, size: 9, color: { argb: argb(COLOR.gray800) } };
    nameCell.fill = fillSolid(bg);
    nameCell.border = thinBorder();
    nameCell.alignment = { vertical: 'middle', indent: 1 };

    const totalCell = dash.getCell(`C${sr}`);
    totalCell.value = total;
    totalCell.font = { size: 10, color: { argb: argb(COLOR.gray600) } };
    totalCell.fill = fillSolid(bg);
    totalCell.border = thinBorder();
    totalCell.alignment = { vertical: 'middle', horizontal: 'center' };

    const doneCell = dash.getCell(`D${sr}`);
    doneCell.value = total > 0 ? { formula: `=${countif}` } : 0;
    doneCell.font = { bold: true, size: 10, color: { argb: argb(COLOR.green600) } };
    doneCell.fill = fillSolid(total > 0 ? COLOR.green100 : bg);
    doneCell.border = thinBorder();
    doneCell.alignment = { vertical: 'middle', horizontal: 'center' };

    const leftCell = dash.getCell(`E${sr}`);
    leftCell.value = total > 0 ? { formula: `=${total}-${countif}` } : 0;
    leftCell.font = { size: 10, color: { argb: argb(COLOR.gray400) } };
    leftCell.fill = fillSolid(bg);
    leftCell.border = thinBorder();
    leftCell.alignment = { vertical: 'middle', horizontal: 'center' };

    const pctCell = dash.getCell(`F${sr}`);
    pctCell.value = total > 0 ? { formula: `=TEXT(IFERROR(${countif}/${total},0),"0%")` } : '—';
    pctCell.font = { bold: true, size: 10, color: { argb: argb(COLOR.primary) } };
    pctCell.fill = fillSolid(bg);
    pctCell.border = thinBorder();
    pctCell.alignment = { vertical: 'middle', horizontal: 'center' };

    const progressCell = dash.getCell(`G${sr}`);
    progressCell.value = total > 0
      ? { formula: `=REPT("█",ROUND(IFERROR(${countif}/${total},0)*15,0))&REPT("░",15-ROUND(IFERROR(${countif}/${total},0)*15,0))&"  "&TEXT(IFERROR(${countif}/${total},0),"0%")` }
      : 'No exercises';
    progressCell.font = { size: 11, color: { argb: argb(COLOR.primary) }, name: 'Courier New' };
    progressCell.fill = fillSolid(bg);
    progressCell.border = thinBorder();
    progressCell.alignment = { vertical: 'middle', indent: 1 };
  });

  spacer();

  // ── Exercise status ───────────────────────────────────
  const secH3 = addRow(20);
  dash.mergeCells(`A${secH3}:G${secH3}`);
  const secH3cell = dash.getCell(`A${secH3}`);
  secH3cell.value = 'EXERCISE STATUS';
  secH3cell.font = { bold: true, size: 10, color: { argb: argb(COLOR.white) } };
  secH3cell.fill = fillSolid(COLOR.accent);
  secH3cell.alignment = { vertical: 'middle', indent: 1 };

  // Exercise column headers
  const exColRow = addRow(16);
  const exHeaders = ['#', 'Exercise', 'Session', '', '', '', 'Status'];
  (['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const).forEach((col, i) => {
    const cell = dash.getCell(`${col}${exColRow}`);
    cell.value = exHeaders[i];
    cell.font = { bold: true, size: 8, color: { argb: argb(COLOR.primary) } };
    cell.fill = fillSolid(COLOR.primaryLight);
    cell.border = thinBorder();
    cell.alignment = { vertical: 'middle', horizontal: i < 3 ? 'left' : 'center', indent: i < 3 ? 1 : 0 };
  });
  dash.mergeCells(`C${exColRow}:F${exColRow}`);

  let exerciseNum = 0;
  sessionInfoList.forEach((sinfo) => {
    sinfo.exercises.forEach((ex) => {
      exerciseNum++;
      const isOdd = exerciseNum % 2 !== 0;
      const bg = isOdd ? COLOR.white : COLOR.gray50;
      const exRow = addRow(18);

      const numCell = dash.getCell(`A${exRow}`);
      numCell.value = exerciseNum;
      numCell.font = { size: 8, color: { argb: argb(COLOR.gray400) } };
      numCell.fill = fillSolid(bg);
      numCell.border = thinBorder();
      numCell.alignment = { vertical: 'middle', horizontal: 'center' };

      const nameCell = dash.getCell(`B${exRow}`);
      nameCell.value = ex.name;
      nameCell.font = { size: 9, bold: true, color: { argb: argb(COLOR.gray800) } };
      nameCell.fill = fillSolid(bg);
      nameCell.border = thinBorder();
      nameCell.alignment = { vertical: 'middle', indent: 1 };

      dash.mergeCells(`C${exRow}:F${exRow}`);
      const sessionCell = dash.getCell(`C${exRow}`);
      sessionCell.value = sinfo.label;
      sessionCell.font = { size: 8, color: { argb: argb(COLOR.gray600) } };
      sessionCell.fill = fillSolid(bg);
      sessionCell.border = thinBorder();
      sessionCell.alignment = { vertical: 'middle', indent: 1 };

      // Status cell: live reference to Done? cell in Program sheet
      const statusCell = dash.getCell(`G${exRow}`);
      statusCell.value = { formula: `='Program'!H${ex.rowNum}` };
      statusCell.font = { bold: true, size: 11, color: { argb: argb(COLOR.primary) } };
      statusCell.fill = fillSolid(bg);
      statusCell.border = thinBorder();
      statusCell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
  });

  spacer();

  // Footer
  const footerRow = addRow(14);
  dash.mergeCells(`A${footerRow}:G${footerRow}`);
  const footerCell = dash.getCell(`A${footerRow}`);
  footerCell.value = `Generated ${exportDateStr} · ${clinic.clinicName || 'Rehab Program Builder'} · Tick ✓ in "Program" sheet → H column to update this dashboard`;
  footerCell.font = { size: 8, italic: true, color: { argb: argb(COLOR.gray400) } };
  footerCell.alignment = { indent: 1 };
}

// ── Main export ───────────────────────────────────────────

export async function generateExcel(
  program: Program,
  clientName: string,
  exercises: Exercise[],
  clinic: ClinicInfo,
  template?: ExportTemplate,
): Promise<void> {
  const COLOR = buildColors(template);
  const layout = template?.layoutVariant ?? 'professional';

  // Map 30 layout variants into 3 Excel rendering modes
  const richLayouts  = new Set([
    'professional', 'patient', 'modern', 'executive', 'bold', 'ledger', 'report', 'twoColumn', 'minimal',
    'striped', 'magazine', 'sidebar', 'academic', 'highlight', 'columns', 'divider', 'schedule', 'rounded',
  ]);
  const chkLayouts   = new Set([
    'checklist', 'handout', 'card', 'timeline',
    'outline', 'receipt', 'notebook', 'poster', 'plain', 'compactCard',
  ]);
  // Remaining known layouts (clinical, compact) → clinical/plain mode
  const clinicalLayouts = new Set(['clinical', 'compact']);
  if (!richLayouts.has(layout) && !chkLayouts.has(layout) && !clinicalLayouts.has(layout)) {
    console.warn(`[ExcelExport] Unknown layout "${layout}" — falling back to clinical mode.`);
  }

  const baseRowHeight =
    chkLayouts.has(layout)       ? 20 :
    layout === 'handout'         ? 28 :
    layout === 'patient'         ? 24 :
    layout === 'bold'            ? 26 :
    layout === 'compact'         ? 14 :
    18;

  const exerciseMap  = new Map<string, string>();
  const exerciseVideoMap = new Map<string, string>();
  for (const ex of exercises) {
    exerciseMap.set(ex.id, ex.name);
    if (ex.videoUrl) exerciseVideoMap.set(ex.id, ex.videoUrl);
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = clinic.clinicName || 'Rehab Builder';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Program', {
    pageSetup: {
      paperSize: 9, orientation: 'portrait',
      fitToPage: true, fitToWidth: 1, fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
    },
  });
  sheet.properties.tabColor = { argb: argb(COLOR.primaryDark) };

  // 8 columns: 7 content + col H = Done?
  sheet.columns = [
    { key: 'col1', width: 32 },
    { key: 'col2', width: 14 },
    { key: 'col3', width: 14 },
    { key: 'col4', width: 14 },
    { key: 'col5', width: 14 },
    { key: 'col6', width: 14 },
    { key: 'col7', width: 28 },
    { key: 'col8', width: 10 },  // Done?
  ];

  let r = 1;
  const exportDateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const socialLinks = buildSocialLinks(clinic);

  // Track exercise rows for the dashboard
  const sessionInfoList: SessionInfo[] = [];

  // ── Shared header helpers ────────────────────────────────

  function addClinicBanner() {
    const clinicRow = sheet.getRow(r++);
    clinicRow.height = 32;
    const clinicCell = sheet.getCell(`A${r - 1}`);
    clinicCell.value = clinic.clinicName || 'Rehabilitation Program Report';
    clinicCell.font = { bold: true, size: 16, color: { argb: argb(COLOR.white) } };
    clinicCell.fill = fillSolid(COLOR.primaryDark);
    clinicCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    sheet.mergeCells(`A${r - 1}:H${r - 1}`);

    const contactParts: string[] = [];
    if (clinic.therapistName) contactParts.push(`Therapist: ${clinic.therapistName}`);
    if (clinic.clinicEmail)   contactParts.push(`Email: ${clinic.clinicEmail}`);
    if (clinic.clinicAddress) contactParts.push(clinic.clinicAddress);
    if (clinic.clinicWebsite) contactParts.push(clinic.clinicWebsite);
    if (contactParts.length > 0) {
      const row = sheet.getRow(r++); row.height = baseRowHeight;
      const cell = sheet.getCell(`A${r - 1}`);
      cell.value = contactParts.join('   ·   ');
      cell.font = { size: 9, color: { argb: argb(COLOR.primaryLight) } };
      cell.fill = fillSolid(COLOR.primary);
      cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      sheet.mergeCells(`A${r - 1}:H${r - 1}`);
    }

    if (socialLinks.length > 0) {
      const row = sheet.getRow(r++); row.height = baseRowHeight;
      const COLS = ['A', 'B', 'C', 'D'] as const;
      socialLinks.forEach((link, i) => {
        const cell = sheet.getCell(`${COLS[i]}${r - 1}`);
        cell.value = { text: link.display, hyperlink: link.href };
        cell.font = { size: 9, bold: true, color: { argb: argb(COLOR.primary) }, underline: true };
        cell.fill = fillSolid(COLOR.primaryLight);
        cell.alignment = { vertical: 'middle', indent: 1 };
        cell.border = thinBorder();
      });
    }

    const titleRow = sheet.getRow(r++); titleRow.height = 22;
    const titleCell = sheet.getCell(`A${r - 1}`);
    titleCell.value = 'REHABILITATION PROGRAM REPORT';
    titleCell.font = { bold: true, size: 10, color: { argb: argb(COLOR.white) } };
    titleCell.fill = fillSolid(COLOR.primary);
    titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    sheet.mergeCells(`A${r - 1}:H${r - 1}`);
  }

  function addPlainClinicHeader() {
    const clinicRow = sheet.getRow(r++); clinicRow.height = 28;
    const clinicCell = sheet.getCell(`A${r - 1}`);
    clinicCell.value = clinic.clinicName || 'Rehabilitation Program Report';
    clinicCell.font = { bold: true, size: 14, color: { argb: argb(COLOR.gray800) } };
    clinicCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    sheet.mergeCells(`A${r - 1}:H${r - 1}`);

    const contactParts = [clinic.clinicEmail, clinic.clinicPhone, clinic.clinicAddress].filter(Boolean);
    if (contactParts.length > 0) {
      const row = sheet.getRow(r++); row.height = 14;
      const cell = sheet.getCell(`A${r - 1}`);
      cell.value = contactParts.join('  ·  ');
      cell.font = { size: 9, color: { argb: argb(COLOR.gray600) } };
      cell.alignment = { vertical: 'middle', indent: 1 };
      sheet.mergeCells(`A${r - 1}:H${r - 1}`);
    }

    const sepRow = sheet.getRow(r++); sepRow.height = 3;
    sheet.getCell(`A${r - 1}`).fill = fillSolid(COLOR.primary);
    sheet.mergeCells(`A${r - 1}:H${r - 1}`);

    const titleRow = sheet.getRow(r++); titleRow.height = 16;
    const titleCell = sheet.getCell(`A${r - 1}`);
    titleCell.value = `REHABILITATION PROGRAM REPORT  ·  ${exportDateStr}`;
    titleCell.font = { bold: true, size: 8, color: { argb: argb(COLOR.gray600) } };
    titleCell.alignment = { vertical: 'middle', indent: 1 };
    sheet.mergeCells(`A${r - 1}:H${r - 1}`);
  }

  function addDoneColumnNote() {
    const noteRow = sheet.getRow(r++); noteRow.height = 14;
    const noteCell = sheet.getCell(`A${r - 1}`);
    noteCell.value = '← Tick ✓ in the Done? column (H) as you complete each exercise. The Progress Dashboard sheet will update automatically.';
    noteCell.font = { size: 8, italic: true, color: { argb: argb(COLOR.primary) } };
    noteCell.fill = fillSolid(COLOR.primaryLight);
    noteCell.alignment = { vertical: 'middle', indent: 1 };
    sheet.mergeCells(`A${r - 1}:H${r - 1}`);
  }

  function addProgramInfoGrid() {
    sheet.getRow(r++).height = 6;

    const infoItems: [string, string][] = [
      ['Program', program.name],
      ['Client', clientName],
      ['Condition', program.condition],
      ['Duration', `${program.durationWeeks} week${program.durationWeeks !== 1 ? 's' : ''}`],
      ['Start Date', formatDate(program.startDate)],
      ['Sessions', String(program.sessions.length)],
    ];
    if (clinic.therapistName) infoItems.push(['Therapist', clinic.therapistName]);

    const halfLen = Math.ceil(infoItems.length / 2);
    const leftItems = infoItems.slice(0, halfLen);
    const rightItems = infoItems.slice(halfLen);
    const infoStart = r;

    for (let i = 0; i < halfLen; i++) {
      const rowIdx = infoStart + i;
      const row = sheet.getRow(rowIdx); row.height = baseRowHeight;

      const labelL = sheet.getCell(`A${rowIdx}`);
      labelL.value = leftItems[i][0];
      labelL.font = { bold: true, size: 9, color: { argb: argb(COLOR.primary) } };
      labelL.fill = fillSolid(COLOR.primaryLight);
      labelL.alignment = { vertical: 'middle', indent: 1 };
      labelL.border = thinBorder();

      sheet.mergeCells(`B${rowIdx}:C${rowIdx}`);
      const valueL = sheet.getCell(`B${rowIdx}`);
      valueL.value = leftItems[i][1];
      valueL.font = { size: 10, bold: true, color: { argb: argb(COLOR.gray800) } };
      valueL.fill = fillSolid(COLOR.white);
      valueL.alignment = { vertical: 'middle', indent: 1 };
      valueL.border = thinBorder();

      if (rightItems[i]) {
        const labelR = sheet.getCell(`E${rowIdx}`);
        labelR.value = rightItems[i][0];
        labelR.font = { bold: true, size: 9, color: { argb: argb(COLOR.primary) } };
        labelR.fill = fillSolid(COLOR.primaryLight);
        labelR.alignment = { vertical: 'middle', indent: 1 };
        labelR.border = thinBorder();

        sheet.mergeCells(`F${rowIdx}:G${rowIdx}`);
        const valueR = sheet.getCell(`F${rowIdx}`);
        valueR.value = rightItems[i][1];
        valueR.font = { size: 10, bold: true, color: { argb: argb(COLOR.gray800) } };
        valueR.fill = fillSolid(COLOR.white);
        valueR.alignment = { vertical: 'middle', indent: 1 };
        valueR.border = thinBorder();
      }
    }
    r = infoStart + halfLen;
  }

  function addGoal() {
    if (!program.goal) return;
    sheet.getRow(r++).height = 6;

    const labelRow = sheet.getRow(r++); labelRow.height = 16;
    const labelCell = sheet.getCell(`A${r - 1}`);
    labelCell.value = 'REHABILITATION GOAL';
    labelCell.font = { bold: true, size: 9, color: { argb: argb(COLOR.amber700) } };
    labelCell.fill = fillSolid(COLOR.amber200);
    labelCell.alignment = { vertical: 'middle', indent: 1 };
    labelCell.border = thinBorder(COLOR.amber200);
    sheet.mergeCells(`A${r - 1}:H${r - 1}`);

    const valueRow = sheet.getRow(r++); valueRow.height = 24;
    const valueCell = sheet.getCell(`A${r - 1}`);
    valueCell.value = program.goal;
    valueCell.font = { size: 10, color: { argb: argb(COLOR.gray800) } };
    valueCell.fill = fillSolid(COLOR.amber50);
    valueCell.alignment = { vertical: 'middle', wrapText: true, indent: 1 };
    valueCell.border = thinBorder(COLOR.amber200);
    sheet.mergeCells(`A${r - 1}:H${r - 1}`);
  }

  function addFooter() {
    sheet.getRow(r++).height = 8;
    const footerRow = sheet.getRow(r++); footerRow.height = 14;
    const footerCell = sheet.getCell(`A${r - 1}`);
    footerCell.value = `Generated on ${exportDateStr} by ${clinic.clinicName || 'Rehab Program Builder'} · Check "Progress Dashboard" sheet to track completion`;
    footerCell.font = { size: 8, italic: true, color: { argb: argb(COLOR.gray400) } };
    footerCell.alignment = { indent: 1 };
    sheet.mergeCells(`A${r - 1}:H${r - 1}`);
  }

  // ── Render main sheet by style ───────────────────────────

  if (richLayouts.has(layout)) {
    addClinicBanner();
    sheet.getRow(r++).height = 6;
    addProgramInfoGrid();
    addGoal();
    addDoneColumnNote();

    for (let si = 0; si < program.sessions.length; si++) {
      const session = program.sessions[si];
      sheet.getRow(r++).height = 8;

      const sHeaderRow = sheet.getRow(r++); sHeaderRow.height = 22;
      const sHeaderCell = sheet.getCell(`A${r - 1}`);
      sHeaderCell.value = `Session ${si + 1}: ${session.label}`;
      sHeaderCell.font = { bold: true, size: 11, color: { argb: argb(COLOR.white) } };
      sHeaderCell.fill = fillSolid(COLOR.accent);
      sHeaderCell.alignment = { vertical: 'middle', indent: 1 };
      sheet.mergeCells(`A${r - 1}:H${r - 1}`);

      const sessionInfo: SessionInfo = { label: session.label, exercises: [] };

      if (session.exercises.length === 0) {
        const emptyRow = sheet.getRow(r++); emptyRow.height = 16;
        sheet.getCell(`A${r - 1}`).value = 'Empty session';
        sheet.getCell(`A${r - 1}`).font = { size: 9, italic: true, color: { argb: argb(COLOR.gray400) } };
        sheet.mergeCells(`A${r - 1}:H${r - 1}`);
        sessionInfoList.push(sessionInfo);
        continue;
      }

      if (layout === 'modern' || layout === 'bold') {
        for (let ei = 0; ei < session.exercises.length; ei++) {
          const pe = session.exercises[ei];
          const exName = exerciseMap.get(pe.exerciseId) ?? 'Unknown exercise';
          const videoUrl = exerciseVideoMap.get(pe.exerciseId);
          const bg = ei % 2 === 0 ? COLOR.white : COLOR.gray50;

          const nameRow = sheet.getRow(r++); nameRow.height = 18;
          const exerciseRowNum = r - 1;

          const nameCell = sheet.getCell(`A${exerciseRowNum}`);
          nameCell.value = exName;
          nameCell.font = { bold: true, size: 10, color: { argb: argb(COLOR.gray800) } };
          nameCell.fill = fillSolid(bg);
          nameCell.alignment = { vertical: 'middle', indent: 1 };
          nameCell.border = thinBorder();
          sheet.mergeCells(`A${exerciseRowNum}:D${exerciseRowNum}`);

          const metricsData: [string, string][] = [
            [pe.sets != null ? `${pe.sets}` : '—', 'SETS'],
            [pe.reps ?? '—', 'REPS'],
            [pe.holdTime != null ? `${pe.holdTime}s` : pe.restSeconds != null ? `${pe.restSeconds}s` : '—', pe.holdTime != null ? 'HOLD' : 'REST'],
          ];
          (['E', 'F', 'G'] as const).forEach((col, i) => {
            const cell = sheet.getCell(`${col}${exerciseRowNum}`);
            cell.value = `${metricsData[i][0]}  ${metricsData[i][1]}`;
            cell.font = { bold: true, size: 11, color: { argb: argb(COLOR.primary) } };
            cell.fill = fillSolid(COLOR.primaryLight);
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = thinBorder();
          });

          addDoneCell(sheet, exerciseRowNum, 'H', COLOR);
          sessionInfo.exercises.push({ name: exName, rowNum: exerciseRowNum });

          if (pe.notes || videoUrl) {
            const notesRow = sheet.getRow(r++); notesRow.height = 14;
            const notesCell = sheet.getCell(`A${r - 1}`);
            const parts: string[] = [];
            if (pe.notes) parts.push(pe.notes);
            if (videoUrl) parts.push('▶ Video available');
            notesCell.value = parts.join('  ·  ');
            notesCell.font = { size: 8, italic: true, color: { argb: argb(COLOR.gray400) } };
            notesCell.fill = fillSolid(COLOR.gray50);
            notesCell.alignment = { vertical: 'middle', indent: 2 };
            sheet.mergeCells(`A${r - 1}:H${r - 1}`);
          }
        }
      } else {
        // professional / patient: standard table
        const colHeaderRow = sheet.getRow(r++); colHeaderRow.height = baseRowHeight;
        const HEADERS = ['Exercise', 'Sets', 'Reps', 'Hold (s)', 'Rest (s)', 'Video', 'Notes', 'Done?'];
        const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
        HEADERS.forEach((h, i) => {
          const cell = sheet.getCell(`${COLS[i]}${r - 1}`);
          cell.value = h;
          cell.font = { bold: true, size: 9, color: { argb: argb(COLOR.primary) } };
          cell.fill = fillSolid(COLOR.primaryLight);
          cell.alignment = { vertical: 'middle', horizontal: i === 0 || i === 6 ? 'left' : 'center', indent: i === 0 || i === 6 ? 1 : 0 };
          cell.border = thinBorder();
        });

        for (let ei = 0; ei < session.exercises.length; ei++) {
          const pe = session.exercises[ei];
          const exName = exerciseMap.get(pe.exerciseId) ?? 'Unknown exercise';
          const isOdd = ei % 2 !== 0;
          const bg = isOdd ? COLOR.gray50 : COLOR.white;

          const exRow = sheet.getRow(r++); exRow.height = layout === 'patient' ? 24 : baseRowHeight;
          const exerciseRowNum = r - 1;
          const videoUrl = exerciseVideoMap.get(pe.exerciseId);

          const data: [typeof COLS[number], string | number][] = [
            ['A', exName], ['B', pe.sets ?? '—'], ['C', pe.reps ?? '—'],
            ['D', pe.holdTime ?? '—'], ['E', pe.restSeconds ?? '—'], ['F', ''], ['G', pe.notes ?? ''],
          ];
          data.forEach(([col, val], i) => {
            const cell = sheet.getCell(`${col}${exerciseRowNum}`);
            if (i === 5 && videoUrl) {
              cell.value = { text: 'Watch ▶', hyperlink: videoUrl };
              cell.font = { size: 9, color: { argb: argb(COLOR.primary) }, underline: true };
            } else {
              cell.value = typeof val === 'number' ? val : dash(val as string);
              cell.font = { size: 9, bold: i === 0, color: { argb: argb(i === 0 ? COLOR.gray800 : COLOR.gray600) } };
            }
            cell.fill = fillSolid(bg);
            cell.alignment = { vertical: 'middle', horizontal: i === 0 || i === 6 ? 'left' : 'center', indent: i === 0 || i === 6 ? 1 : 0 };
            cell.border = thinBorder();
          });

          addDoneCell(sheet, exerciseRowNum, 'H', COLOR);
          sessionInfo.exercises.push({ name: exName, rowNum: exerciseRowNum });
        }
      }

      sessionInfoList.push(sessionInfo);
    }

    addFooter();
  }

  else if (chkLayouts.has(layout)) {
    addPlainClinicHeader();
    sheet.getRow(r++).height = 6;
    addProgramInfoGrid();
    addGoal();
    addDoneColumnNote();

    for (let si = 0; si < program.sessions.length; si++) {
      const session = program.sessions[si];
      sheet.getRow(r++).height = 8;

      const sHeaderRow = sheet.getRow(r++); sHeaderRow.height = 18;
      const sHeaderCell = sheet.getCell(`A${r - 1}`);
      sHeaderCell.value = `Session ${si + 1}: ${session.label}`;
      sHeaderCell.font = { bold: true, size: 10, color: { argb: argb(COLOR.gray800) } };
      sHeaderCell.alignment = { vertical: 'middle', indent: 1 };
      sHeaderCell.border = { bottom: { style: 'medium', color: { argb: argb(COLOR.primary) } }, diagonal: {} };
      sheet.mergeCells(`A${r - 1}:H${r - 1}`);

      const sessionInfo: SessionInfo = { label: session.label, exercises: [] };

      if (session.exercises.length === 0) {
        sheet.getRow(r++).height = 16;
        sheet.getCell(`A${r - 1}`).value = 'Empty session';
        sheet.getCell(`A${r - 1}`).font = { size: 9, italic: true, color: { argb: argb(COLOR.gray400) } };
        sheet.mergeCells(`A${r - 1}:H${r - 1}`);
        sessionInfoList.push(sessionInfo);
        continue;
      }

      for (let ei = 0; ei < session.exercises.length; ei++) {
        const pe = session.exercises[ei];
        const exName = exerciseMap.get(pe.exerciseId) ?? 'Unknown exercise';
        const videoUrl = exerciseVideoMap.get(pe.exerciseId);

        const exRow = sheet.getRow(r++); exRow.height = baseRowHeight;
        const exerciseRowNum = r - 1;

        sheet.getCell(`A${exerciseRowNum}`).value = '□';
        sheet.getCell(`A${exerciseRowNum}`).font = { size: 12, color: { argb: argb(COLOR.primary) } };
        sheet.getCell(`A${exerciseRowNum}`).alignment = { vertical: 'middle', horizontal: 'center' };
        sheet.getCell(`A${exerciseRowNum}`).border = thinBorder(COLOR.gray200);

        sheet.mergeCells(`B${exerciseRowNum}:D${exerciseRowNum}`);
        const nameCell = sheet.getCell(`B${exerciseRowNum}`);
        nameCell.value = exName;
        nameCell.font = { bold: true, size: 10, color: { argb: argb(COLOR.gray800) } };
        nameCell.alignment = { vertical: 'middle', indent: 1 };
        nameCell.border = thinBorder(COLOR.gray200);

        const notesCell = sheet.getCell(`E${exerciseRowNum}`);
        notesCell.value = pe.notes || '';
        notesCell.font = { size: 8, italic: true, color: { argb: argb(COLOR.gray400) } };
        notesCell.alignment = { vertical: 'middle', indent: 1 };
        notesCell.border = thinBorder(COLOR.gray200);

        const metric = pe.sets != null ? `${pe.sets}×${pe.reps ?? '?'}` : (pe.reps ?? '');
        const metricCell = sheet.getCell(`F${exerciseRowNum}`);
        metricCell.value = metric;
        metricCell.font = { bold: true, size: 10, color: { argb: argb(COLOR.primary) } };
        metricCell.alignment = { vertical: 'middle', horizontal: 'center' };
        metricCell.border = thinBorder(COLOR.gray200);

        const vidCell = sheet.getCell(`G${exerciseRowNum}`);
        if (videoUrl) {
          vidCell.value = { text: 'Video ▶', hyperlink: videoUrl };
          vidCell.font = { size: 9, color: { argb: argb(COLOR.primary) }, underline: true };
        }
        vidCell.alignment = { vertical: 'middle', horizontal: 'center' };
        vidCell.border = thinBorder(COLOR.gray200);

        addDoneCell(sheet, exerciseRowNum, 'H', COLOR);
        sessionInfo.exercises.push({ name: exName, rowNum: exerciseRowNum });
      }

      sessionInfoList.push(sessionInfo);
    }

    addFooter();
  }

  else {
    // clinical
    addPlainClinicHeader();
    sheet.getRow(r++).height = 6;
    addProgramInfoGrid();
    addGoal();
    addDoneColumnNote();

    for (let si = 0; si < program.sessions.length; si++) {
      const session = program.sessions[si];
      sheet.getRow(r++).height = 6;

      const sHeaderRow = sheet.getRow(r++); sHeaderRow.height = 18;
      const sHeaderCell = sheet.getCell(`A${r - 1}`);
      sHeaderCell.value = `SESSION ${si + 1}: ${session.label.toUpperCase()}`;
      sHeaderCell.font = { bold: true, size: 9, color: { argb: argb(COLOR.gray600) } };
      sHeaderCell.alignment = { vertical: 'middle', indent: 1 };
      sHeaderCell.border = { bottom: { style: 'thin', color: { argb: argb(COLOR.gray300) } }, diagonal: {} };
      sheet.mergeCells(`A${r - 1}:H${r - 1}`);

      const sessionInfo: SessionInfo = { label: session.label, exercises: [] };

      if (session.exercises.length === 0) {
        sheet.getRow(r++).height = 14;
        sheet.getCell(`A${r - 1}`).value = 'Empty session';
        sheet.getCell(`A${r - 1}`).font = { size: 9, italic: true, color: { argb: argb(COLOR.gray400) } };
        sheet.mergeCells(`A${r - 1}:H${r - 1}`);
        sessionInfoList.push(sessionInfo);
        continue;
      }

      for (let ei = 0; ei < session.exercises.length; ei++) {
        const pe = session.exercises[ei];
        const exName = exerciseMap.get(pe.exerciseId) ?? 'Unknown exercise';
        const videoUrl = exerciseVideoMap.get(pe.exerciseId);
        const detail = metricStr(pe);

        const exRow = sheet.getRow(r++); exRow.height = baseRowHeight;
        const exerciseRowNum = r - 1;

        const numCell = sheet.getCell(`A${exerciseRowNum}`);
        numCell.value = `${ei + 1}.`;
        numCell.font = { bold: true, size: 9, color: { argb: argb(COLOR.primary) } };
        numCell.alignment = { vertical: 'middle', horizontal: 'center' };

        sheet.mergeCells(`B${exerciseRowNum}:E${exerciseRowNum}`);
        const nameCell = sheet.getCell(`B${exerciseRowNum}`);
        nameCell.value = `${exName}${detail ? '  —  ' + detail : ''}`;
        nameCell.font = { size: 9, color: { argb: argb(COLOR.gray800) } };
        nameCell.alignment = { vertical: 'middle', indent: 1 };

        const notesCell = sheet.getCell(`F${exerciseRowNum}`);
        notesCell.value = pe.notes || '';
        notesCell.font = { size: 8, italic: true, color: { argb: argb(COLOR.gray400) } };
        notesCell.alignment = { vertical: 'middle', indent: 1 };

        const vidCell = sheet.getCell(`G${exerciseRowNum}`);
        if (videoUrl) {
          vidCell.value = { text: '▶ Video', hyperlink: videoUrl };
          vidCell.font = { size: 8, color: { argb: argb(COLOR.primary) }, underline: true };
          vidCell.alignment = { vertical: 'middle', horizontal: 'center' };
        }

        addDoneCell(sheet, exerciseRowNum, 'H', COLOR);
        sessionInfo.exercises.push({ name: exName, rowNum: exerciseRowNum });
      }

      sessionInfoList.push(sessionInfo);
    }

    addFooter();
  }

  // ── Build Progress Dashboard sheet ──────────────────────
  createProgressDashboard(workbook, program, clientName, clinic, sessionInfoList, exportDateStr, COLOR);

  // ── Download ─────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = sanitizeFilename(clientName, program.name);
  a.click();
  URL.revokeObjectURL(url);
}
