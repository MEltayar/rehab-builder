import { pdf } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import { createElement, type ComponentType, type ReactElement } from 'react';
import ExcelJS from 'exceljs';
import type { DietPlan, ExportTemplate, FoodItem } from '../../../types';
import DietPlanPDF from '../components/DietPlanPDF';
import type { ClinicInfo } from '../../pdf/services/pdfExportService';
import { calcItemMacros, sumMacros } from '../utils/macros';

// ── Helpers ───────────────────────────────────────────────────────────────────

function sanitize(s: string) {
  return s.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
}

function fmt(n: number) {
  return n % 1 === 0 ? n : parseFloat(n.toFixed(1));
}

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return iso; }
}

function servingLabel(item: { quantity: number; servingLabel?: string }, food: FoodItem) {
  const base = item.servingLabel ?? `${food.servingSize}${food.servingUnit}`;
  return item.quantity !== 1 ? `${item.quantity} × ${base}` : base;
}

// ── PDF Export ────────────────────────────────────────────────────────────────

interface DietPlanPDFProps {
  plan: DietPlan;
  clientName: string;
  foodMap: Map<string, FoodItem>;
  clinic?: ClinicInfo;
  template?: ExportTemplate;
}

export async function generateDietPlanPDFBlob(
  plan: DietPlan,
  clientName: string,
  foodMap: Map<string, FoodItem>,
  clinic?: ClinicInfo,
  template?: ExportTemplate,
): Promise<{ blob: Blob; filename: string }> {
  const props: DietPlanPDFProps = { plan, clientName, foodMap, clinic, template };
  const element = createElement(DietPlanPDF as ComponentType<DietPlanPDFProps>, props);
  const blob = await pdf(element as unknown as ReactElement<DocumentProps>).toBlob();
  const filename = `${sanitize(clientName || 'client')}_${sanitize(plan.name || 'diet-plan')}.pdf`;
  return { blob, filename };
}

export async function downloadDietPlanPDF(
  plan: DietPlan,
  clientName: string,
  foodMap: Map<string, FoodItem>,
  clinic?: ClinicInfo,
  template?: ExportTemplate,
): Promise<void> {
  const { blob, filename } = await generateDietPlanPDFBlob(plan, clientName, foodMap, clinic, template);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Excel Export ──────────────────────────────────────────────────────────────

function toArgb(hex: string): string {
  return 'ff' + hex.replace('#', '');
}

function buildExcelPalette(template?: ExportTemplate) {
  const cs = template?.colorScheme;
  return {
    primary:   toArgb(cs?.primary   ?? '#15803d'),
    secondary: toArgb(cs?.secondary ?? '#16a34a'),
    light:     toArgb(cs?.light     ?? '#dcfce7'),
    darkText:  toArgb(cs?.darkText  ?? '#14532d'),
    gray800:  'ff1e293b',
    gray600:  'ff475569',
    gray400:  'ff94a3b8',
    gray200:  'ffe2e8f0',
    gray100:  'fff1f5f9',
    white:    'ffffffff',
    red:      'ffdc2626',
    yellow:   'ffd97706',
    purple:   'ff7c3aed',
  };
}

function solid(argb: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}

function border(argb = 'ffe2e8f0'): ExcelJS.Borders {
  const side: ExcelJS.BorderStyle = 'thin';
  const color = { argb };
  return { top: { style: side, color }, bottom: { style: side, color }, left: { style: side, color }, right: { style: side, color }, diagonal: {} };
}

const COLS = ['A', 'B', 'C', 'D', 'E', 'F'];

function setRow(
  ws: ExcelJS.Worksheet,
  rowNum: number,
  values: (string | number)[],
  opts?: {
    bold?: boolean;
    bg?: string;
    fg?: string;
    fontSize?: number;
    height?: number;
    align?: ExcelJS.Alignment['horizontal'];
  },
  defaultFg = 'ff1e293b',
) {
  const row = ws.getRow(rowNum);
  values.forEach((v, i) => {
    const cell = row.getCell(i + 1);
    cell.value = v;
    if (opts?.bold)     cell.font = { ...cell.font, bold: true, color: { argb: opts.fg ?? defaultFg } };
    else                cell.font = { ...cell.font, color: { argb: opts?.fg ?? defaultFg } };
    if (opts?.fontSize) cell.font = { ...cell.font, size: opts.fontSize };
    if (opts?.bg)       cell.fill = solid(opts.bg);
    if (opts?.align)    cell.alignment = { horizontal: opts.align, vertical: 'middle' };
    else                cell.alignment = { vertical: 'middle' };
    cell.border = border();
  });
  if (opts?.height) row.height = opts.height;
}

function mergeTitle(ws: ExcelJS.Worksheet, rowNum: number, text: string, opts: { bg: string; fg: string; fontSize?: number; height?: number }) {
  ws.mergeCells(`A${rowNum}:F${rowNum}`);
  const cell = ws.getCell(`A${rowNum}`);
  cell.value = text;
  cell.font = { bold: true, size: opts.fontSize ?? 11, color: { argb: opts.fg } };
  cell.fill = solid(opts.bg);
  cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  cell.border = border(opts.bg);
  if (opts.height) ws.getRow(rowNum).height = opts.height;
}

export async function exportDietPlanExcel(
  plan: DietPlan,
  clientName: string,
  foodMap: Map<string, FoodItem>,
  clinic?: ClinicInfo,
  template?: ExportTemplate,
): Promise<void> {
  const G = buildExcelPalette(template);
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Diet Plan');

  // Column widths
  ws.getColumn('A').width = 30;  // Food name
  ws.getColumn('B').width = 22;  // Serving
  ws.getColumn('C').width = 10;  // kcal
  ws.getColumn('D').width = 10;  // Protein
  ws.getColumn('E').width = 10;  // Carbs
  ws.getColumn('F').width = 10;  // Fat

  let r = 1;

  // ── Clinic header ────────────────────────────────────────────────────────────
  if (clinic?.clinicName) {
    ws.mergeCells(`A${r}:D${r}`);
    ws.getCell(`A${r}`).value = clinic.clinicName;
    ws.getCell(`A${r}`).font = { bold: true, size: 11, color: { argb: G.primary } };
    ws.getCell(`A${r}`).fill = solid(G.light);
    ws.getCell(`A${r}`).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    ws.mergeCells(`E${r}:F${r}`);
    const coachCell = ws.getCell(`E${r}`);
    coachCell.value = clinic.therapistName ? `Coach: ${clinic.therapistName}` : '';
    coachCell.font = { size: 9, color: { argb: G.gray600 } };
    coachCell.fill = solid(G.light);
    coachCell.alignment = { horizontal: 'right', vertical: 'middle' };
    ['C', 'D', 'E', 'F'].forEach((col) => { ws.getCell(`${col}${r}`).fill = solid(G.light); });
    ws.getRow(r).height = 20;
    r++;
  }

  // ── Plan title ──────────────────────────────────────────────────────────────
  ws.mergeCells(`A${r}:F${r}`);
  const titleCell = ws.getCell(`A${r}`);
  titleCell.value = plan.name || 'Diet Plan';
  titleCell.font = { bold: true, size: 16, color: { argb: G.primary } };
  titleCell.fill = solid(G.white);
  titleCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  ws.getRow(r).height = 32;
  r++;

  // ── Plan info row ───────────────────────────────────────────────────────────
  ws.mergeCells(`A${r}:B${r}`);
  ws.getCell(`A${r}`).value = `Client: ${clientName || '—'}`;
  ws.getCell(`A${r}`).font = { size: 9, color: { argb: G.gray600 } };
  ws.mergeCells(`C${r}:D${r}`);
  ws.getCell(`C${r}`).value = `Goal: ${plan.goal || '—'}`;
  ws.getCell(`C${r}`).font = { size: 9, color: { argb: G.gray600 } };
  ws.mergeCells(`E${r}:F${r}`);
  ws.getCell(`E${r}`).value = `Start: ${fmtDate(plan.startDate)}  ·  ${plan.durationWeeks}w`;
  ws.getCell(`E${r}`).font = { size: 9, color: { argb: G.gray600 } };
  ws.getRow(r).height = 16;
  r++;

  // ── Targets row ─────────────────────────────────────────────────────────────
  if (plan.targetCalories || plan.targetProtein || plan.targetCarbs || plan.targetFat) {
    const labels = ['', 'Targets →', plan.targetCalories ? `${plan.targetCalories} kcal` : '—', plan.targetProtein ? `P ${plan.targetProtein}g` : '—', plan.targetCarbs ? `C ${plan.targetCarbs}g` : '—', plan.targetFat ? `F ${plan.targetFat}g` : '—'];
    setRow(ws, r, labels, { bg: G.light, bold: true, fg: G.primary, height: 18 });
    r++;
  }

  r++; // blank

  // ── Days ─────────────────────────────────────────────────────────────────────
  for (const day of plan.days) {
    const dayItems = day.meals.flatMap((m) => m.items);
    const dayMacroList = dayItems.map((it) => {
      const food = foodMap.get(it.foodItemId);
      return food ? calcItemMacros(it, food) : null;
    }).filter(Boolean) as ReturnType<typeof calcItemMacros>[];
    const dayTotals = sumMacros(dayMacroList);

    // Day header
    ws.mergeCells(`A${r}:B${r}`);
    ws.getCell(`A${r}`).value = day.label;
    ws.getCell(`A${r}`).font = { bold: true, size: 12, color: { argb: G.white } };
    ws.getCell(`A${r}`).fill = solid(G.primary);
    ws.getCell(`A${r}`).alignment = { vertical: 'middle', indent: 1 };
    ['C', 'D', 'E', 'F'].forEach((col) => {
      ws.getCell(`${col}${r}`).fill = solid(G.primary);
      ws.getCell(`${col}${r}`).border = border(G.primary);
    });
    ws.getRow(r).height = 22;
    r++;

    for (const meal of day.meals) {
      // Meal header
      mergeTitle(ws, r, meal.label, { bg: G.light, fg: G.primary, fontSize: 9, height: 18 });
      r++;

      if (meal.items.length === 0) {
        ws.mergeCells(`A${r}:F${r}`);
        ws.getCell(`A${r}`).value = 'No foods added.';
        ws.getCell(`A${r}`).font = { italic: true, size: 8.5, color: { argb: G.gray400 } };
        ws.getCell(`A${r}`).fill = solid(G.gray100);
        ws.getRow(r).height = 14;
        r++;
        continue;
      }

      // Column headers
      setRow(ws, r, ['Food', 'Serving', 'kcal', 'Protein', 'Carbs', 'Fat'], {
        bold: true, bg: G.gray100, fg: G.gray600, fontSize: 8, height: 16,
      });
      ws.getRow(r).getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
      ws.getRow(r).getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
      ws.getRow(r).getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };
      ws.getRow(r).getCell(6).alignment = { horizontal: 'right', vertical: 'middle' };
      r++;

      const mealMacroList: ReturnType<typeof calcItemMacros>[] = [];

      for (const item of meal.items) {
        const food = foodMap.get(item.foodItemId);
        const macros = food ? calcItemMacros(item, food) : null;
        if (macros) mealMacroList.push(macros);

        setRow(ws, r, [
          food?.name ?? '—',
          food ? servingLabel(item, food) : '—',
          macros ? fmt(macros.calories) : '—',
          macros ? `${fmt(macros.protein)}g` : '—',
          macros ? `${fmt(macros.carbs)}g` : '—',
          macros ? `${fmt(macros.fat)}g` : '—',
        ], { fontSize: 8.5, height: 16 });
        ws.getRow(r).getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
        ws.getRow(r).getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
        ws.getRow(r).getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };
        ws.getRow(r).getCell(6).alignment = { horizontal: 'right', vertical: 'middle' };
        r++;
      }

      // Meal total
      if (mealMacroList.length > 0) {
        const mt = sumMacros(mealMacroList);
        ws.mergeCells(`A${r}:B${r}`);
        ws.getCell(`A${r}`).value = `${meal.label} total`;
        ws.getCell(`A${r}`).font = { bold: true, size: 8.5, color: { argb: G.primary } };
        ws.getCell(`A${r}`).fill = solid(G.light);
        ws.getCell(`A${r}`).border = border();
        setRow(ws, r, ['', '', fmt(mt.calories), `${fmt(mt.protein)}g`, `${fmt(mt.carbs)}g`, `${fmt(mt.fat)}g`], {
          bold: true, bg: G.light, fg: G.primary, fontSize: 8.5, height: 16,
        });
        ['C', 'D', 'E', 'F'].forEach((col) => {
          ws.getCell(`${col}${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
        });
        r++;
      }
    }

    // Day total
    if (dayMacroList.length > 0) {
      ws.mergeCells(`A${r}:B${r}`);
      ws.getCell(`A${r}`).value = `${day.label} — Total`;
      ws.getCell(`A${r}`).font = { bold: true, size: 10, color: { argb: G.white } };
      ws.getCell(`A${r}`).fill = solid(G.secondary);
      ws.getCell(`A${r}`).border = border(G.secondary);
      ws.getCell(`A${r}`).alignment = { vertical: 'middle', indent: 1 };
      ['', '', fmt(dayTotals.calories), `${fmt(dayTotals.protein)}g`, `${fmt(dayTotals.carbs)}g`, `${fmt(dayTotals.fat)}g`].forEach((v, i) => {
        if (i < 2) return;
        const cell = ws.getCell(`${COLS[i]}${r}`);
        cell.value = v;
        cell.font = { bold: true, size: 10, color: { argb: G.white } };
        cell.fill = solid(G.secondary);
        cell.border = border(G.secondary);
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      });
      ws.getRow(r).height = 20;
      r++;
    }

    r++; // blank between days
  }

  // ── Download ─────────────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitize(clientName || 'client')}_${sanitize(plan.name || 'diet-plan')}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
