import { Document, Page, View, Text, Image, Link, StyleSheet } from '@react-pdf/renderer';
import type { DietPlan, ExportTemplate, FoodItem, LayoutVariant } from '../../../types';
import type { ClinicInfo } from '../../pdf/services/pdfExportService';
import { calcItemMacros, sumMacros } from '../utils/macros';

// ── Palette ───────────────────────────────────────────────────────────────────

function buildPalette(template?: ExportTemplate) {
  const cs = template?.colorScheme;
  return {
    primary:      cs?.primary   ?? '#15803d',
    primaryDark:  cs?.darkText  ?? '#14532d',
    primaryLight: cs?.light     ?? '#dcfce7',
    secondary:    cs?.secondary ?? '#16a34a',
    white:   '#ffffff',
    gray50:  '#f8fafc',
    gray100: '#f3f4f6',
    gray200: '#e2e8f0',
    gray300: '#d1d5db',
    gray400: '#94a3b8',
    gray500: '#6b7280',
    gray600: '#475569',
    gray700: '#374151',
    gray800: '#1e293b',
    red500:    '#ef4444',
    yellow500: '#eab308',
    purple500: '#a855f7',
  };
}

type Palette = ReturnType<typeof buildPalette>;

// ── Variant mapping ───────────────────────────────────────────────────────────
// Maps all 30 layoutVariant IDs to one of our 5 diet variants

type DietVariant = 'professional' | 'patient' | 'compact' | 'modern' | 'coach';

function resolveDietVariant(layoutVariant?: LayoutVariant): DietVariant {
  switch (layoutVariant) {
    // ── Patient / athlete-friendly ──
    case 'patient':
    case 'handout':
    case 'card':
    case 'poster':
    case 'rounded':
    case 'plain':
      return 'patient';
    // ── Compact / dense ──
    case 'compact':
    case 'minimal':
    case 'twoColumn':
    case 'checklist':
    case 'compactCard':
    case 'columns':
      return 'compact';
    // ── Modern / bold ──
    case 'modern':
    case 'bold':
    case 'magazine':
    case 'striped':
    case 'highlight':
    case 'divider':
      return 'modern';
    // ── Coach / overview ──
    case 'clinical':
    case 'executive':
    case 'report':
    case 'timeline':
    case 'academic':
    case 'outline':
    case 'schedule':
    case 'ledger':
      return 'coach';
    // ── Professional (default) ──
    default:
      return 'professional';
  }
}

// ── Social links ──────────────────────────────────────────────────────────────

interface SocialLink { label: string; display: string; href: string }

function buildSocialLinks(clinic: ClinicInfo): SocialLink[] {
  const strip = (p: string) => p.replace(/[^\d+]/g, '').replace(/(?<!^)\+/g, '');
  return [
    clinic.clinicWhatsApp  ? { label: 'WhatsApp',  display: `WhatsApp: ${clinic.clinicWhatsApp}`,  href: `https://wa.me/${strip(clinic.clinicWhatsApp)}` } : null,
    clinic.clinicGmail     ? { label: 'Gmail',     display: `Gmail: ${clinic.clinicGmail}`,         href: `mailto:${clinic.clinicGmail}` } : null,
    clinic.clinicInstagram ? { label: 'Instagram', display: 'Instagram',                            href: clinic.clinicInstagram } : null,
    clinic.clinicFacebook  ? { label: 'Facebook',  display: 'Facebook',                             href: clinic.clinicFacebook } : null,
  ].filter(Boolean) as SocialLink[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) { return n % 1 === 0 ? String(n) : n.toFixed(1); }

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return iso; }
}

function macroLine(m: { calories: number; protein: number; carbs: number; fat: number }) {
  return `${fmt(m.calories)} kcal  ·  P ${fmt(m.protein)}g  ·  C ${fmt(m.carbs)}g  ·  F ${fmt(m.fat)}g`;
}

function servingLabel(item: { quantity: number; servingLabel?: string }, food: FoodItem) {
  const base = item.servingLabel ?? `${food.servingSize}${food.servingUnit}`;
  return item.quantity !== 1 ? `${item.quantity} × ${base}` : base;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  plan: DietPlan;
  clientName: string;
  foodMap: Map<string, FoodItem>;
  clinic?: ClinicInfo;
  template?: ExportTemplate;
}

// ══════════════════════════════════════════════════════════════════════════════
// VARIANT 1 — PROFESSIONAL
// Full table layout · dark clinic hero · report strip · fixed header
// ══════════════════════════════════════════════════════════════════════════════

function ProfessionalLayout({ plan, clientName, foodMap, clinic, C, exportDate, socialLinks, contactParts }: {
  plan: DietPlan; clientName: string; foodMap: Map<string, FoodItem>;
  clinic: ClinicInfo; C: Palette; exportDate: string;
  socialLinks: SocialLink[]; contactParts: string[];
}) {
  const s = StyleSheet.create({
    page:       { fontFamily: 'Helvetica', fontSize: 9, backgroundColor: C.white, padding: '0 0 48 0' },
    fixedHdr:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.primary, paddingHorizontal: 32, paddingVertical: 6 },
    fhLogo:     { width: 20, height: 20, objectFit: 'contain' },
    fhClinic:   { flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.white },
    fhPlan:     { fontSize: 7.5, color: C.primaryLight },
    footer:     { position: 'absolute', bottom: 16, left: 32, right: 32, flexDirection: 'row', justifyContent: 'space-between' },
    footerText: { fontSize: 7, color: C.gray400 },
    hero:       { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: C.primaryDark, padding: '20 32 16 32' },
    heroLogo:   { width: 52, height: 52, objectFit: 'contain', borderRadius: 4 },
    heroName:   { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 3 },
    heroMeta:   { fontSize: 8, color: C.primaryLight, marginBottom: 2 },
    strip:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.primary, paddingHorizontal: 32, paddingVertical: 6 },
    stripTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.white },
    stripDate:  { fontSize: 8, color: C.primaryLight },
    content:    { paddingHorizontal: 32, paddingTop: 16 },
    infoCard:   { backgroundColor: C.gray50, borderRadius: 4, marginBottom: 12, borderWidth: 1, borderStyle: 'solid', borderColor: C.gray200 },
    infoHead:   { backgroundColor: C.primary, padding: '6 10', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
    infoTitle:  { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.white },
    infoGrid:   { flexDirection: 'row', flexWrap: 'wrap', padding: '8 10', gap: 6 },
    infoItem:   { width: '30%' },
    infoLabel:  { fontSize: 7, color: C.gray500, marginBottom: 1 },
    infoVal:    { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray800 },
    targetsBar: { flexDirection: 'row', gap: 8, backgroundColor: C.primaryLight, padding: 8, borderRadius: 4, marginBottom: 12, borderLeftWidth: 3, borderLeftStyle: 'solid', borderLeftColor: C.secondary },
    tgtBox:     { flex: 1, alignItems: 'center' },
    tgtVal:     { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.primary },
    tgtLbl:     { fontSize: 7, color: C.gray500, marginTop: 1 },
    dayBlock:   { marginBottom: 14 },
    dayHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.primary, padding: '5 8', borderTopLeftRadius: 3, borderTopRightRadius: 3 },
    dayLabel:   { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.white },
    dayMacros:  { fontSize: 8, color: C.primaryLight },
    mealBlock:  { marginBottom: 2, marginLeft: 6 },
    mealHdr:    { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.primaryLight, padding: '3 6' },
    mealLabel:  { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.primary },
    mealMacros: { fontSize: 7.5, color: C.gray500 },
    tHead:      { flexDirection: 'row', backgroundColor: C.gray100, borderBottomWidth: 1, borderBottomColor: C.gray300, borderBottomStyle: 'solid' },
    tRow:       { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.gray200, borderBottomStyle: 'solid' },
    tRowAlt:    { flexDirection: 'row', backgroundColor: C.gray50, borderBottomWidth: 1, borderBottomColor: C.gray200, borderBottomStyle: 'solid' },
    th:         { padding: '3 4', fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.gray500 },
    td:         { padding: '3 4', fontSize: 8, color: C.gray700 },
    cFood:      { flex: 3 }, cServ: { flex: 2 },
    cNum:       { flex: 1, textAlign: 'right' },
    totRow:     { flexDirection: 'row', backgroundColor: C.primaryLight, borderTopWidth: 1, borderTopColor: C.secondary, borderTopStyle: 'solid', padding: '3 6' },
    totLabel:   { flex: 5, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.primary },
    totVal:     { flex: 1, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.primary, textAlign: 'right' },
    dayTotRow:  { flexDirection: 'row', backgroundColor: C.primary, padding: '4 8', borderBottomLeftRadius: 3, borderBottomRightRadius: 3 },
    dayTotLbl:  { flex: 5, fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.white },
    dayTotVal:  { flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.primaryLight, textAlign: 'right' },
    empty:      { padding: '4 8', fontSize: 8, color: C.gray400, fontStyle: 'italic' },
  });

  return (
    <Document title={plan.name} author={clinic.clinicName || 'Full Range Lab'}>
      <Page size="A4" style={s.page}>
        {/* Fixed header */}
        <View fixed style={s.fixedHdr}>
          {clinic.clinicLogo && <Image style={s.fhLogo} src={clinic.clinicLogo} />}
          <Text style={s.fhClinic}>{clinic.clinicName || 'Nutrition Plan'}</Text>
          <Text style={s.fhPlan}>{plan.name}</Text>
        </View>

        {/* Footer */}
        <View fixed style={s.footer}>
          <Text style={s.footerText}>{clinic.clinicName ? `${clinic.clinicName}  ·  ` : ''}{plan.name} · {clientName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

        {/* Hero */}
        <View style={s.hero}>
          {clinic.clinicLogo && <Image style={s.heroLogo} src={clinic.clinicLogo} />}
          <View style={{ flex: 1 }}>
            <Text style={s.heroName}>{clinic.clinicName || 'Nutrition Plan'}</Text>
            {contactParts.length > 0 && <Text style={s.heroMeta}>{contactParts.join('  ·  ')}</Text>}
            {socialLinks.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
                {socialLinks.map((l) => (
                  <Link key={l.label} src={l.href} style={{ fontSize: 8, color: C.primaryLight, textDecoration: 'underline' }}>{l.display}</Link>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Report strip */}
        <View style={s.strip}>
          <Text style={s.stripTitle}>Nutrition Plan Report</Text>
          <Text style={s.stripDate}>Exported {exportDate}</Text>
        </View>

        <View style={s.content}>
          {/* Plan info card */}
          <View style={s.infoCard} wrap={false}>
            <View style={s.infoHead}>
              <Text style={s.infoTitle}>{plan.name}</Text>
            </View>
            <View style={s.infoGrid}>
              {([
                ['Client',    clientName || '—'],
                ['Goal',      plan.goal || '—'],
                ['Start',     fmtDate(plan.startDate)],
                ['Duration',  `${plan.durationWeeks} weeks`],
                ...(clinic.therapistName ? [['Coach', clinic.therapistName]] : []),
                ['Days',      String(plan.days.length)],
              ] as [string, string][]).map(([label, value]) => (
                <View key={label} style={s.infoItem}>
                  <Text style={s.infoLabel}>{label}</Text>
                  <Text style={s.infoVal}>{value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Targets */}
          {(plan.targetCalories || plan.targetProtein || plan.targetCarbs || plan.targetFat) && (
            <View style={s.targetsBar} wrap={false}>
              {plan.targetCalories && <View style={s.tgtBox}><Text style={s.tgtVal}>{plan.targetCalories}</Text><Text style={s.tgtLbl}>Target kcal</Text></View>}
              {plan.targetProtein  && <View style={s.tgtBox}><Text style={[s.tgtVal, { color: C.red500 }]}>{plan.targetProtein}g</Text><Text style={s.tgtLbl}>Protein</Text></View>}
              {plan.targetCarbs    && <View style={s.tgtBox}><Text style={[s.tgtVal, { color: C.yellow500 }]}>{plan.targetCarbs}g</Text><Text style={s.tgtLbl}>Carbs</Text></View>}
              {plan.targetFat      && <View style={s.tgtBox}><Text style={[s.tgtVal, { color: C.purple500 }]}>{plan.targetFat}g</Text><Text style={s.tgtLbl}>Fat</Text></View>}
            </View>
          )}

          {/* Days */}
          {plan.days.map((day) => {
            const dayItems = day.meals.flatMap((m) => m.items);
            const dayMacros = sumMacros(dayItems.map((it) => { const f = foodMap.get(it.foodItemId); return f ? calcItemMacros(it, f) : null; }).filter(Boolean) as ReturnType<typeof calcItemMacros>[]);
            return (
              <View key={day.id} style={s.dayBlock}>
                <View style={s.dayHeader} wrap={false}>
                  <Text style={s.dayLabel}>{day.label}</Text>
                  <Text style={s.dayMacros}>{macroLine(dayMacros)}</Text>
                </View>
                {day.meals.map((meal) => {
                  const ml = meal.items.map((it) => { const f = foodMap.get(it.foodItemId); return f ? calcItemMacros(it, f) : null; }).filter(Boolean) as ReturnType<typeof calcItemMacros>[];
                  const mt = sumMacros(ml);
                  return (
                    <View key={meal.id} style={s.mealBlock} wrap={false}>
                      <View style={s.mealHdr}>
                        <Text style={s.mealLabel}>{meal.label}</Text>
                        {meal.items.length > 0 && <Text style={s.mealMacros}>{macroLine(mt)}</Text>}
                      </View>
                      {meal.items.length === 0 ? <Text style={s.empty}>No foods added.</Text> : (
                        <>
                          <View style={s.tHead}>
                            <Text style={[s.th, s.cFood]}>Food</Text>
                            <Text style={[s.th, s.cServ]}>Serving</Text>
                            <Text style={[s.th, s.cNum]}>kcal</Text>
                            <Text style={[s.th, s.cNum]}>P</Text>
                            <Text style={[s.th, s.cNum]}>C</Text>
                            <Text style={[s.th, s.cNum]}>F</Text>
                          </View>
                          {meal.items.map((item, i) => {
                            const food = foodMap.get(item.foodItemId);
                            const macros = food ? calcItemMacros(item, food) : null;
                            return (
                              <View key={item.id} style={i % 2 === 0 ? s.tRow : s.tRowAlt} wrap={false}>
                                <Text style={[s.td, s.cFood]}>{food?.name ?? '—'}</Text>
                                <Text style={[s.td, s.cServ]}>{food ? servingLabel(item, food) : '—'}</Text>
                                <Text style={[s.td, s.cNum]}>{macros ? fmt(macros.calories) : '—'}</Text>
                                <Text style={[s.td, s.cNum]}>{macros ? `${fmt(macros.protein)}g` : '—'}</Text>
                                <Text style={[s.td, s.cNum]}>{macros ? `${fmt(macros.carbs)}g` : '—'}</Text>
                                <Text style={[s.td, s.cNum]}>{macros ? `${fmt(macros.fat)}g` : '—'}</Text>
                              </View>
                            );
                          })}
                          {ml.length > 1 && (
                            <View style={s.totRow} wrap={false}>
                              <Text style={s.totLabel}>Meal total ({meal.items.length} items)</Text>
                              <Text style={s.totVal}>{fmt(mt.calories)}</Text>
                              <Text style={s.totVal}>{fmt(mt.protein)}g</Text>
                              <Text style={s.totVal}>{fmt(mt.carbs)}g</Text>
                              <Text style={s.totVal}>{fmt(mt.fat)}g</Text>
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  );
                })}
                {dayItems.length > 0 && (
                  <View style={s.dayTotRow} wrap={false}>
                    <Text style={s.dayTotLbl}>Day total</Text>
                    <Text style={s.dayTotVal}>{fmt(dayMacros.calories)}</Text>
                    <Text style={s.dayTotVal}>{fmt(dayMacros.protein)}g</Text>
                    <Text style={s.dayTotVal}>{fmt(dayMacros.carbs)}g</Text>
                    <Text style={s.dayTotVal}>{fmt(dayMacros.fat)}g</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VARIANT 2 — PATIENT
// Centered hero · large fonts · card-style meals · friendly for the athlete
// ══════════════════════════════════════════════════════════════════════════════

function PatientLayout({ plan, clientName, foodMap, clinic, C, exportDate, socialLinks, contactParts }: {
  plan: DietPlan; clientName: string; foodMap: Map<string, FoodItem>;
  clinic: ClinicInfo; C: Palette; exportDate: string;
  socialLinks: SocialLink[]; contactParts: string[];
}) {
  const s = StyleSheet.create({
    page:       { fontFamily: 'Helvetica', fontSize: 10, backgroundColor: C.white, padding: '0 0 48 0' },
    fixedHdr:   { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottom: `2 solid ${C.primary}`, paddingHorizontal: 32, paddingVertical: 6, backgroundColor: C.white },
    fhLogo:     { width: 22, height: 22, objectFit: 'contain' },
    fhClinic:   { flex: 1, fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.primary },
    fhPlan:     { fontSize: 7.5, color: C.gray500 },
    footer:     { position: 'absolute', bottom: 16, left: 32, right: 32, flexDirection: 'row', justifyContent: 'space-between' },
    footerText: { fontSize: 7, color: C.gray400 },
    hero:       { alignItems: 'center', paddingTop: 24, paddingBottom: 12 },
    heroLogo:   { width: 60, height: 60, objectFit: 'contain', marginBottom: 8 },
    heroName:   { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.primary, marginBottom: 3, textAlign: 'center' },
    heroSub:    { fontSize: 9, color: C.gray500, textAlign: 'center', marginBottom: 2 },
    strip:      { backgroundColor: C.primaryLight, padding: '8 32', marginBottom: 16, borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: C.secondary, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: C.secondary },
    stripTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.primary, textAlign: 'center' },
    stripSub:   { fontSize: 8, color: C.gray600, textAlign: 'center', marginTop: 2 },
    content:    { paddingHorizontal: 32 },
    targets:    { flexDirection: 'row', gap: 10, marginBottom: 16, justifyContent: 'center' },
    tgtBox:     { alignItems: 'center', backgroundColor: C.primaryLight, borderRadius: 6, padding: '6 12', borderWidth: 1, borderStyle: 'solid', borderColor: C.secondary },
    tgtVal:     { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.primary },
    tgtLbl:     { fontSize: 7.5, color: C.gray500, marginTop: 2 },
    dayBlock:   { marginBottom: 18 },
    dayHdr:     { backgroundColor: C.primary, padding: '7 12', borderTopLeftRadius: 4, borderTopRightRadius: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dayLabel:   { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.white },
    dayMacros:  { fontSize: 8, color: C.primaryLight },
    mealCard:   { borderWidth: 1, borderStyle: 'solid', borderColor: C.gray200, borderRadius: 3, marginBottom: 6, marginTop: 4, marginHorizontal: 4 },
    mealHdr:    { backgroundColor: C.gray50, padding: '5 10', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: C.gray200, flexDirection: 'row', justifyContent: 'space-between' },
    mealLabel:  { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.primary },
    mealMacros: { fontSize: 8, color: C.gray500 },
    itemRow:    { flexDirection: 'row', padding: '4 10', borderBottom: `0.5 solid ${C.gray100}`, alignItems: 'center' },
    itemRowAlt: { flexDirection: 'row', padding: '4 10', borderBottom: `0.5 solid ${C.gray100}`, backgroundColor: C.gray50, alignItems: 'center' },
    itemName:   { flex: 3, fontSize: 9, color: C.gray700 },
    itemServ:   { flex: 2, fontSize: 8.5, color: C.gray500 },
    itemMacro:  { flex: 1, fontSize: 8, color: C.gray600, textAlign: 'right' },
    dayTotal:   { flexDirection: 'row', backgroundColor: C.primaryLight, padding: '5 12', borderBottomLeftRadius: 4, borderBottomRightRadius: 4, borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: C.secondary },
    dayTotLbl:  { flex: 5, fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.primary },
    dayTotVal:  { flex: 1, fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.primary, textAlign: 'right' },
    empty:      { padding: '6 10', fontSize: 9, color: C.gray400, fontStyle: 'italic' },
  });

  return (
    <Document title={plan.name} author={clinic.clinicName || 'Full Range Lab'}>
      <Page size="A4" style={s.page}>
        <View fixed style={s.fixedHdr}>
          {clinic.clinicLogo && <Image style={s.fhLogo} src={clinic.clinicLogo} />}
          <Text style={s.fhClinic}>{clinic.clinicName || 'Nutrition Plan'}</Text>
          <Text style={s.fhPlan}>{plan.name}</Text>
        </View>
        <View fixed style={s.footer}>
          <Text style={s.footerText}>{clinic.clinicName ? `${clinic.clinicName}  ·  ` : ''}{plan.name} · {clientName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

        <View style={s.hero}>
          {clinic.clinicLogo && <Image style={s.heroLogo} src={clinic.clinicLogo} />}
          <Text style={s.heroName}>{clinic.clinicName || 'Your Nutrition Plan'}</Text>
          {contactParts.length > 0 && <Text style={s.heroSub}>{contactParts.slice(0, 2).join('  ·  ')}</Text>}
          {socialLinks.length > 0 && (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
              {socialLinks.map((l) => (
                <Link key={l.label} src={l.href} style={{ fontSize: 8, color: C.primary, textDecoration: 'underline' }}>{l.display}</Link>
              ))}
            </View>
          )}
        </View>

        <View style={s.strip}>
          <Text style={s.stripTitle}>{plan.name}</Text>
          <Text style={s.stripSub}>Client: {clientName || '—'}  ·  Goal: {plan.goal || '—'}  ·  Start: {fmtDate(plan.startDate)}  ·  {plan.durationWeeks} weeks  ·  Exported {exportDate}</Text>
        </View>

        <View style={s.content}>
          {(plan.targetCalories || plan.targetProtein || plan.targetCarbs || plan.targetFat) && (
            <View style={s.targets} wrap={false}>
              {plan.targetCalories && <View style={s.tgtBox}><Text style={s.tgtVal}>{plan.targetCalories}</Text><Text style={s.tgtLbl}>kcal / day</Text></View>}
              {plan.targetProtein  && <View style={s.tgtBox}><Text style={[s.tgtVal, { color: C.red500 }]}>{plan.targetProtein}g</Text><Text style={s.tgtLbl}>Protein</Text></View>}
              {plan.targetCarbs    && <View style={s.tgtBox}><Text style={[s.tgtVal, { color: C.yellow500 }]}>{plan.targetCarbs}g</Text><Text style={s.tgtLbl}>Carbs</Text></View>}
              {plan.targetFat      && <View style={s.tgtBox}><Text style={[s.tgtVal, { color: C.purple500 }]}>{plan.targetFat}g</Text><Text style={s.tgtLbl}>Fat</Text></View>}
            </View>
          )}

          {plan.days.map((day) => {
            const dayItems = day.meals.flatMap((m) => m.items);
            const dayMacros = sumMacros(dayItems.map((it) => { const f = foodMap.get(it.foodItemId); return f ? calcItemMacros(it, f) : null; }).filter(Boolean) as ReturnType<typeof calcItemMacros>[]);
            return (
              <View key={day.id} style={s.dayBlock}>
                <View style={s.dayHdr} wrap={false}>
                  <Text style={s.dayLabel}>{day.label}</Text>
                  <Text style={s.dayMacros}>{fmt(dayMacros.calories)} kcal</Text>
                </View>
                {day.meals.map((meal) => {
                  const ml = meal.items.map((it) => { const f = foodMap.get(it.foodItemId); return f ? calcItemMacros(it, f) : null; }).filter(Boolean) as ReturnType<typeof calcItemMacros>[];
                  const mt = sumMacros(ml);
                  return (
                    <View key={meal.id} style={s.mealCard} wrap={false}>
                      <View style={s.mealHdr}>
                        <Text style={s.mealLabel}>{meal.label}</Text>
                        {meal.items.length > 0 && <Text style={s.mealMacros}>{macroLine(mt)}</Text>}
                      </View>
                      {meal.items.length === 0 ? <Text style={s.empty}>No foods added.</Text> : (
                        meal.items.map((item, i) => {
                          const food = foodMap.get(item.foodItemId);
                          const macros = food ? calcItemMacros(item, food) : null;
                          return (
                            <View key={item.id} style={i % 2 === 0 ? s.itemRow : s.itemRowAlt} wrap={false}>
                              <Text style={s.itemName}>{food?.name ?? '—'}</Text>
                              <Text style={s.itemServ}>{food ? servingLabel(item, food) : '—'}</Text>
                              <Text style={s.itemMacro}>{macros ? `${fmt(macros.calories)} kcal` : '—'}</Text>
                              <Text style={s.itemMacro}>{macros ? `P ${fmt(macros.protein)}g` : ''}</Text>
                            </View>
                          );
                        })
                      )}
                    </View>
                  );
                })}
                {dayItems.length > 0 && (
                  <View style={s.dayTotal} wrap={false}>
                    <Text style={s.dayTotLbl}>Day total</Text>
                    <Text style={s.dayTotVal}>{fmt(dayMacros.calories)}</Text>
                    <Text style={s.dayTotVal}>{fmt(dayMacros.protein)}g</Text>
                    <Text style={s.dayTotVal}>{fmt(dayMacros.carbs)}g</Text>
                    <Text style={s.dayTotVal}>{fmt(dayMacros.fat)}g</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VARIANT 3 — COMPACT
// Maximum density · inline clinic name · all days flowing · small fonts
// ══════════════════════════════════════════════════════════════════════════════

function CompactLayout({ plan, clientName, foodMap, clinic, C, exportDate }: {
  plan: DietPlan; clientName: string; foodMap: Map<string, FoodItem>;
  clinic: ClinicInfo; C: Palette; exportDate: string;
}) {
  const s = StyleSheet.create({
    page:       { fontFamily: 'Helvetica', fontSize: 8, backgroundColor: C.white, padding: '24 28 44 28' },
    footer:     { position: 'absolute', bottom: 12, left: 28, right: 28, flexDirection: 'row', justifyContent: 'space-between' },
    footerText: { fontSize: 6.5, color: C.gray400 },
    topBar:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1.5 solid ${C.primary}`, paddingBottom: 6, marginBottom: 8 },
    topLeft:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
    topLogo:    { width: 24, height: 24, objectFit: 'contain' },
    topClinic:  { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.primary },
    topRight:   { alignItems: 'flex-end' },
    topPlan:    { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.gray700 },
    topMeta:    { fontSize: 7, color: C.gray500 },
    targetsRow: { flexDirection: 'row', gap: 6, marginBottom: 8, backgroundColor: C.primaryLight, padding: '4 8', borderRadius: 3 },
    tgtItem:    { flexDirection: 'row', gap: 3, alignItems: 'center' },
    tgtLabel:   { fontSize: 7, color: C.gray600 },
    tgtVal:     { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.primary },
    dayHdr:     { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.primary, padding: '3 6', marginBottom: 2, marginTop: 6 },
    dayLabel:   { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.white },
    dayMacros:  { fontSize: 7, color: C.primaryLight },
    mealLabel:  { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.primary, backgroundColor: C.primaryLight, padding: '2 6', marginBottom: 1 },
    tHead:      { flexDirection: 'row', backgroundColor: C.gray100 },
    tRow:       { flexDirection: 'row' },
    tRowAlt:    { flexDirection: 'row', backgroundColor: C.gray50 },
    th:         { padding: '2 3', fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.gray500 },
    td:         { padding: '2 3', fontSize: 7.5, color: C.gray700 },
    cFood:      { flex: 3 }, cServ: { flex: 2 },
    cNum:       { flex: 1, textAlign: 'right' },
    totRow:     { flexDirection: 'row', backgroundColor: C.primaryLight, padding: '2 6', marginBottom: 2 },
    totLabel:   { flex: 5, fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.primary },
    totVal:     { flex: 1, fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.primary, textAlign: 'right' },
    empty:      { padding: '2 6', fontSize: 7, color: C.gray400, fontStyle: 'italic' },
  });

  return (
    <Document title={plan.name} author={clinic.clinicName || 'Full Range Lab'}>
      <Page size="A4" style={s.page}>
        <View fixed style={s.footer}>
          <Text style={s.footerText}>{clinic.clinicName ? `${clinic.clinicName}  ·  ` : ''}{plan.name} · {clientName}  ·  {exportDate}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

        <View style={s.topBar} fixed>
          <View style={s.topLeft}>
            {clinic.clinicLogo && <Image style={s.topLogo} src={clinic.clinicLogo} />}
            <Text style={s.topClinic}>{clinic.clinicName || 'Nutrition Plan'}</Text>
          </View>
          <View style={s.topRight}>
            <Text style={s.topPlan}>{plan.name}</Text>
            <Text style={s.topMeta}>Client: {clientName || '—'}  ·  {fmtDate(plan.startDate)}  ·  {plan.durationWeeks}w{clinic.therapistName ? `  ·  Coach: ${clinic.therapistName}` : ''}</Text>
          </View>
        </View>

        {(plan.targetCalories || plan.targetProtein || plan.targetCarbs || plan.targetFat) && (
          <View style={s.targetsRow} wrap={false}>
            <Text style={[s.tgtLabel, { fontFamily: 'Helvetica-Bold' }]}>Targets: </Text>
            {plan.targetCalories && <><Text style={s.tgtLabel}>kcal </Text><Text style={s.tgtVal}>{plan.targetCalories}</Text><Text style={s.tgtLabel}>  · </Text></>}
            {plan.targetProtein  && <><Text style={s.tgtLabel}>P </Text><Text style={[s.tgtVal, { color: C.red500 }]}>{plan.targetProtein}g</Text><Text style={s.tgtLabel}>  · </Text></>}
            {plan.targetCarbs    && <><Text style={s.tgtLabel}>C </Text><Text style={[s.tgtVal, { color: C.yellow500 }]}>{plan.targetCarbs}g</Text><Text style={s.tgtLabel}>  · </Text></>}
            {plan.targetFat      && <><Text style={s.tgtLabel}>F </Text><Text style={[s.tgtVal, { color: C.purple500 }]}>{plan.targetFat}g</Text></>}
          </View>
        )}

        {plan.days.map((day) => {
          const dayItems = day.meals.flatMap((m) => m.items);
          const dayMacros = sumMacros(dayItems.map((it) => { const f = foodMap.get(it.foodItemId); return f ? calcItemMacros(it, f) : null; }).filter(Boolean) as ReturnType<typeof calcItemMacros>[]);
          return (
            <View key={day.id}>
              <View style={s.dayHdr} wrap={false}>
                <Text style={s.dayLabel}>{day.label}</Text>
                <Text style={s.dayMacros}>{macroLine(dayMacros)}</Text>
              </View>
              {day.meals.map((meal) => {
                const ml = meal.items.map((it) => { const f = foodMap.get(it.foodItemId); return f ? calcItemMacros(it, f) : null; }).filter(Boolean) as ReturnType<typeof calcItemMacros>[];
                const mt = sumMacros(ml);
                return (
                  <View key={meal.id} wrap={false}>
                    <Text style={s.mealLabel}>{meal.label}{meal.items.length > 0 ? `  —  ${macroLine(mt)}` : ''}</Text>
                    {meal.items.length === 0 ? <Text style={s.empty}>No foods added.</Text> : (
                      <>
                        <View style={s.tHead}>
                          <Text style={[s.th, s.cFood]}>Food</Text><Text style={[s.th, s.cServ]}>Serving</Text>
                          <Text style={[s.th, s.cNum]}>kcal</Text><Text style={[s.th, s.cNum]}>P</Text>
                          <Text style={[s.th, s.cNum]}>C</Text><Text style={[s.th, s.cNum]}>F</Text>
                        </View>
                        {meal.items.map((item, i) => {
                          const food = foodMap.get(item.foodItemId);
                          const macros = food ? calcItemMacros(item, food) : null;
                          return (
                            <View key={item.id} style={i % 2 === 0 ? s.tRow : s.tRowAlt} wrap={false}>
                              <Text style={[s.td, s.cFood]}>{food?.name ?? '—'}</Text>
                              <Text style={[s.td, s.cServ]}>{food ? servingLabel(item, food) : '—'}</Text>
                              <Text style={[s.td, s.cNum]}>{macros ? fmt(macros.calories) : '—'}</Text>
                              <Text style={[s.td, s.cNum]}>{macros ? `${fmt(macros.protein)}g` : '—'}</Text>
                              <Text style={[s.td, s.cNum]}>{macros ? `${fmt(macros.carbs)}g` : '—'}</Text>
                              <Text style={[s.td, s.cNum]}>{macros ? `${fmt(macros.fat)}g` : '—'}</Text>
                            </View>
                          );
                        })}
                      </>
                    )}
                  </View>
                );
              })}
              {dayItems.length > 0 && (
                <View style={s.totRow} wrap={false}>
                  <Text style={s.totLabel}>Day total</Text>
                  <Text style={s.totVal}>{fmt(dayMacros.calories)}</Text>
                  <Text style={s.totVal}>{fmt(dayMacros.protein)}g</Text>
                  <Text style={s.totVal}>{fmt(dayMacros.carbs)}g</Text>
                  <Text style={s.totVal}>{fmt(dayMacros.fat)}g</Text>
                </View>
              )}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VARIANT 4 — MODERN
// Bold colored accent bar per day · large macro pills · clean lines
// ══════════════════════════════════════════════════════════════════════════════

function ModernLayout({ plan, clientName, foodMap, clinic, C, exportDate, socialLinks, contactParts }: {
  plan: DietPlan; clientName: string; foodMap: Map<string, FoodItem>;
  clinic: ClinicInfo; C: Palette; exportDate: string;
  socialLinks: SocialLink[]; contactParts: string[];
}) {
  const s = StyleSheet.create({
    page:       { fontFamily: 'Helvetica', fontSize: 9, backgroundColor: C.white, padding: '0 0 48 0' },
    fixedHdr:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.white, borderBottom: `2 solid ${C.primary}`, paddingHorizontal: 32, paddingVertical: 7 },
    fhLogo:     { width: 22, height: 22, objectFit: 'contain' },
    fhClinic:   { flex: 1, fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.primary },
    fhPlan:     { fontSize: 8, color: C.gray500 },
    footer:     { position: 'absolute', bottom: 16, left: 32, right: 32, flexDirection: 'row', justifyContent: 'space-between' },
    footerText: { fontSize: 7, color: C.gray400 },
    banner:     { backgroundColor: C.primaryDark, flexDirection: 'row', alignItems: 'center', padding: '16 32', gap: 16 },
    bannerLogo: { width: 48, height: 48, objectFit: 'contain', borderRadius: 4 },
    bannerName: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: C.white },
    bannerSub:  { fontSize: 8.5, color: C.primaryLight, marginTop: 3 },
    metaRow:    { flexDirection: 'row', backgroundColor: C.primary, padding: '6 32', gap: 20 },
    metaItem:   { flexDirection: 'row', gap: 4, alignItems: 'center' },
    metaLabel:  { fontSize: 7.5, color: C.primaryLight },
    metaVal:    { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.white },
    content:    { padding: '12 32' },
    targets:    { flexDirection: 'row', gap: 10, marginBottom: 16 },
    tgtPill:    { flex: 1, alignItems: 'center', backgroundColor: C.primaryLight, borderRadius: 6, padding: '8 4', borderWidth: 1, borderStyle: 'solid', borderColor: C.secondary },
    tgtVal:     { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.primary },
    tgtLbl:     { fontSize: 7, color: C.gray500, marginTop: 2 },
    dayBlock:   { marginBottom: 16 },
    dayAccent:  { width: 4, backgroundColor: C.primary, borderRadius: 2, marginRight: 8 },
    dayRow:     { flexDirection: 'row', alignItems: 'stretch', marginBottom: 6 },
    dayInfo:    { flex: 1 },
    dayLabel:   { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.primary, marginBottom: 2 },
    dayMacros:  { fontSize: 8, color: C.gray500 },
    mealBlock:  { marginBottom: 4, borderLeftWidth: 2, borderLeftStyle: 'solid', borderLeftColor: C.gray200, paddingLeft: 8 },
    mealHdr:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    mealLabel:  { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.gray700 },
    mealMacros: { fontSize: 7.5, color: C.gray400 },
    tHead:      { flexDirection: 'row', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: C.primary },
    tRow:       { flexDirection: 'row', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: C.gray100 },
    tRowAlt:    { flexDirection: 'row', backgroundColor: C.gray50, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: C.gray100 },
    th:         { padding: '2 4', fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.primary },
    td:         { padding: '3 4', fontSize: 8, color: C.gray700 },
    cFood:      { flex: 3 }, cServ: { flex: 2 },
    cNum:       { flex: 1, textAlign: 'right' },
    dayTotRow:  { flexDirection: 'row', gap: 8, marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: C.gray200 },
    dayTotPill: { backgroundColor: C.primaryLight, borderRadius: 3, padding: '2 8', flexDirection: 'row', gap: 4, alignItems: 'center' },
    dayTotLbl:  { fontSize: 7, color: C.gray500 },
    dayTotVal:  { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.primary },
    empty:      { fontSize: 8, color: C.gray400, fontStyle: 'italic', padding: '3 0' },
  });

  return (
    <Document title={plan.name} author={clinic.clinicName || 'Full Range Lab'}>
      <Page size="A4" style={s.page}>
        <View fixed style={s.fixedHdr}>
          {clinic.clinicLogo && <Image style={s.fhLogo} src={clinic.clinicLogo} />}
          <Text style={s.fhClinic}>{clinic.clinicName || 'Nutrition Plan'}</Text>
          <Text style={s.fhPlan}>{plan.name}  ·  {exportDate}</Text>
        </View>
        <View fixed style={s.footer}>
          <Text style={s.footerText}>{clinic.clinicName ? `${clinic.clinicName}  ·  ` : ''}{plan.name} · {clientName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

        <View style={s.banner}>
          {clinic.clinicLogo && <Image style={s.bannerLogo} src={clinic.clinicLogo} />}
          <View style={{ flex: 1 }}>
            <Text style={s.bannerName}>{clinic.clinicName || 'Nutrition Plan'}</Text>
            <Text style={s.bannerSub}>
              {contactParts.length > 0 ? contactParts.join('  ·  ') : plan.name}
            </Text>
            {socialLinks.length > 0 && (
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                {socialLinks.map((l) => (
                  <Link key={l.label} src={l.href} style={{ fontSize: 7.5, color: C.primaryLight, textDecoration: 'underline' }}>{l.display}</Link>
                ))}
              </View>
            )}
          </View>
        </View>
        <View style={s.metaRow}>
          {([
            ['Plan',     plan.name],
            ['Client',   clientName || '—'],
            ['Goal',     plan.goal || '—'],
            ['Start',    fmtDate(plan.startDate)],
            ['Duration', `${plan.durationWeeks}w`],
            ...(clinic.therapistName ? [['Coach', clinic.therapistName]] : []),
          ] as [string, string][]).map(([label, value]) => (
            <View key={label} style={s.metaItem}>
              <Text style={s.metaLabel}>{label}:</Text>
              <Text style={s.metaVal}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={s.content}>
          {(plan.targetCalories || plan.targetProtein || plan.targetCarbs || plan.targetFat) && (
            <View style={s.targets} wrap={false}>
              {plan.targetCalories && <View style={s.tgtPill}><Text style={s.tgtVal}>{plan.targetCalories}</Text><Text style={s.tgtLbl}>Target kcal</Text></View>}
              {plan.targetProtein  && <View style={s.tgtPill}><Text style={[s.tgtVal, { color: C.red500 }]}>{plan.targetProtein}g</Text><Text style={s.tgtLbl}>Protein</Text></View>}
              {plan.targetCarbs    && <View style={s.tgtPill}><Text style={[s.tgtVal, { color: C.yellow500 }]}>{plan.targetCarbs}g</Text><Text style={s.tgtLbl}>Carbs</Text></View>}
              {plan.targetFat      && <View style={s.tgtPill}><Text style={[s.tgtVal, { color: C.purple500 }]}>{plan.targetFat}g</Text><Text style={s.tgtLbl}>Fat</Text></View>}
            </View>
          )}

          {plan.days.map((day) => {
            const dayItems = day.meals.flatMap((m) => m.items);
            const dayMacros = sumMacros(dayItems.map((it) => { const f = foodMap.get(it.foodItemId); return f ? calcItemMacros(it, f) : null; }).filter(Boolean) as ReturnType<typeof calcItemMacros>[]);
            return (
              <View key={day.id} style={s.dayBlock}>
                <View style={s.dayRow} wrap={false}>
                  <View style={s.dayAccent} />
                  <View style={s.dayInfo}>
                    <Text style={s.dayLabel}>{day.label}</Text>
                    <Text style={s.dayMacros}>{macroLine(dayMacros)}</Text>
                  </View>
                </View>
                {day.meals.map((meal) => {
                  const ml = meal.items.map((it) => { const f = foodMap.get(it.foodItemId); return f ? calcItemMacros(it, f) : null; }).filter(Boolean) as ReturnType<typeof calcItemMacros>[];
                  const mt = sumMacros(ml);
                  return (
                    <View key={meal.id} style={s.mealBlock} wrap={false}>
                      <View style={s.mealHdr}>
                        <Text style={s.mealLabel}>{meal.label}</Text>
                        {meal.items.length > 0 && <Text style={s.mealMacros}>{macroLine(mt)}</Text>}
                      </View>
                      {meal.items.length === 0 ? <Text style={s.empty}>No foods added.</Text> : (
                        <>
                          <View style={s.tHead}>
                            <Text style={[s.th, s.cFood]}>Food</Text><Text style={[s.th, s.cServ]}>Serving</Text>
                            <Text style={[s.th, s.cNum]}>kcal</Text><Text style={[s.th, s.cNum]}>P</Text>
                            <Text style={[s.th, s.cNum]}>C</Text><Text style={[s.th, s.cNum]}>F</Text>
                          </View>
                          {meal.items.map((item, i) => {
                            const food = foodMap.get(item.foodItemId);
                            const macros = food ? calcItemMacros(item, food) : null;
                            return (
                              <View key={item.id} style={i % 2 === 0 ? s.tRow : s.tRowAlt} wrap={false}>
                                <Text style={[s.td, s.cFood]}>{food?.name ?? '—'}</Text>
                                <Text style={[s.td, s.cServ]}>{food ? servingLabel(item, food) : '—'}</Text>
                                <Text style={[s.td, s.cNum]}>{macros ? fmt(macros.calories) : '—'}</Text>
                                <Text style={[s.td, s.cNum]}>{macros ? `${fmt(macros.protein)}g` : '—'}</Text>
                                <Text style={[s.td, s.cNum]}>{macros ? `${fmt(macros.carbs)}g` : '—'}</Text>
                                <Text style={[s.td, s.cNum]}>{macros ? `${fmt(macros.fat)}g` : '—'}</Text>
                              </View>
                            );
                          })}
                        </>
                      )}
                    </View>
                  );
                })}
                {dayItems.length > 0 && (
                  <View style={s.dayTotRow} wrap={false}>
                    <View style={s.dayTotPill}><Text style={s.dayTotLbl}>Total</Text><Text style={s.dayTotVal}>{fmt(dayMacros.calories)} kcal</Text></View>
                    <View style={s.dayTotPill}><Text style={s.dayTotLbl}>P</Text><Text style={[s.dayTotVal, { color: C.red500 }]}>{fmt(dayMacros.protein)}g</Text></View>
                    <View style={s.dayTotPill}><Text style={s.dayTotLbl}>C</Text><Text style={[s.dayTotVal, { color: C.yellow500 }]}>{fmt(dayMacros.carbs)}g</Text></View>
                    <View style={s.dayTotPill}><Text style={s.dayTotLbl}>F</Text><Text style={[s.dayTotVal, { color: C.purple500 }]}>{fmt(dayMacros.fat)}g</Text></View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VARIANT 5 — COACH
// Summary overview table (all days + targets vs actual) · per-day detail below
// ══════════════════════════════════════════════════════════════════════════════

function CoachLayout({ plan, clientName, foodMap, clinic, C, exportDate, socialLinks, contactParts }: {
  plan: DietPlan; clientName: string; foodMap: Map<string, FoodItem>;
  clinic: ClinicInfo; C: Palette; exportDate: string;
  socialLinks: SocialLink[]; contactParts: string[];
}) {
  const s = StyleSheet.create({
    page:       { fontFamily: 'Helvetica', fontSize: 9, backgroundColor: C.white, padding: '0 0 48 0' },
    fixedHdr:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.primaryDark, paddingHorizontal: 32, paddingVertical: 7 },
    fhLogo:     { width: 20, height: 20, objectFit: 'contain' },
    fhClinic:   { flex: 1, fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.white },
    fhPlan:     { fontSize: 7.5, color: C.primaryLight },
    footer:     { position: 'absolute', bottom: 16, left: 32, right: 32, flexDirection: 'row', justifyContent: 'space-between' },
    footerText: { fontSize: 7, color: C.gray400 },
    hero:       { flexDirection: 'row', backgroundColor: C.primaryDark, padding: '16 32', gap: 16, alignItems: 'center' },
    heroLogo:   { width: 50, height: 50, objectFit: 'contain', borderRadius: 4 },
    heroName:   { fontSize: 15, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 3 },
    heroMeta:   { fontSize: 8, color: C.primaryLight },
    content:    { padding: '14 32' },
    sectionTitle:{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.primaryDark, marginBottom: 6, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: C.primary, paddingBottom: 3 },
    // Summary table
    summaryTbl: { marginBottom: 14 },
    sTHead:     { flexDirection: 'row', backgroundColor: C.primaryDark },
    sTRow:      { flexDirection: 'row', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: C.gray200 },
    sTRowAlt:   { flexDirection: 'row', backgroundColor: C.gray50, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: C.gray200 },
    sTRowTgt:   { flexDirection: 'row', backgroundColor: C.primaryLight, borderTopWidth: 2, borderTopStyle: 'solid', borderTopColor: C.primary },
    sTh:        { padding: '3 5', fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.white },
    sTd:        { padding: '3 5', fontSize: 8, color: C.gray700 },
    sTdBold:    { padding: '3 5', fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.primary },
    cDay:       { flex: 2 }, cKcal: { flex: 1, textAlign: 'right' },
    cP: { flex: 1, textAlign: 'right' }, cC: { flex: 1, textAlign: 'right' }, cF: { flex: 1, textAlign: 'right' },
    // Detail
    dayBlock:   { marginBottom: 14 },
    dayHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.primary, padding: '5 8', borderTopLeftRadius: 3, borderTopRightRadius: 3 },
    dayLabel:   { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.white },
    dayMacros:  { fontSize: 8, color: C.primaryLight },
    mealBlock:  { marginLeft: 6, marginBottom: 3 },
    mealHdr:    { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.primaryLight, padding: '3 6' },
    mealLabel:  { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.primary },
    mealMacros: { fontSize: 7.5, color: C.gray500 },
    tHead:      { flexDirection: 'row', backgroundColor: C.gray100, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: C.gray300 },
    tRow:       { flexDirection: 'row', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: C.gray200 },
    tRowAlt:    { flexDirection: 'row', backgroundColor: C.gray50, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: C.gray200 },
    th:         { padding: '3 4', fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.gray500 },
    td:         { padding: '3 4', fontSize: 8, color: C.gray700 },
    cFood:      { flex: 3 }, cServ: { flex: 2 },
    cNum:       { flex: 1, textAlign: 'right' },
    totRow:     { flexDirection: 'row', backgroundColor: C.primaryLight, borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: C.secondary, padding: '3 6' },
    totLabel:   { flex: 5, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.primary },
    totVal:     { flex: 1, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.primary, textAlign: 'right' },
    dayTotRow:  { flexDirection: 'row', backgroundColor: C.primaryDark, padding: '4 8', borderBottomLeftRadius: 3, borderBottomRightRadius: 3 },
    dayTotLbl:  { flex: 5, fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.white },
    dayTotVal:  { flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.primaryLight, textAlign: 'right' },
    empty:      { padding: '3 8', fontSize: 8, color: C.gray400, fontStyle: 'italic' },
  });

  // Compute per-day totals for summary table
  const dayTotals = plan.days.map((day) => {
    const items = day.meals.flatMap((m) => m.items);
    return sumMacros(items.map((it) => { const f = foodMap.get(it.foodItemId); return f ? calcItemMacros(it, f) : null; }).filter(Boolean) as ReturnType<typeof calcItemMacros>[]);
  });

  return (
    <Document title={plan.name} author={clinic.clinicName || 'Full Range Lab'}>
      <Page size="A4" style={s.page}>
        <View fixed style={s.fixedHdr}>
          {clinic.clinicLogo && <Image style={s.fhLogo} src={clinic.clinicLogo} />}
          <Text style={s.fhClinic}>{clinic.clinicName || 'Nutrition Plan'}</Text>
          <Text style={s.fhPlan}>{plan.name}</Text>
        </View>
        <View fixed style={s.footer}>
          <Text style={s.footerText}>{clinic.clinicName ? `${clinic.clinicName}  ·  ` : ''}{plan.name} · {clientName}  ·  {exportDate}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

        <View style={s.hero}>
          {clinic.clinicLogo && <Image style={s.heroLogo} src={clinic.clinicLogo} />}
          <View style={{ flex: 1 }}>
            <Text style={s.heroName}>{clinic.clinicName || 'Nutrition Plan'}</Text>
            <Text style={s.heroMeta}>{contactParts.join('  ·  ')}</Text>
            {socialLinks.length > 0 && (
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                {socialLinks.map((l) => (
                  <Link key={l.label} src={l.href} style={{ fontSize: 7.5, color: C.primaryLight, textDecoration: 'underline' }}>{l.display}</Link>
                ))}
              </View>
            )}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 8, color: C.primaryLight }}>Client: {clientName || '—'}</Text>
            <Text style={{ fontSize: 8, color: C.primaryLight }}>Goal: {plan.goal || '—'}</Text>
            <Text style={{ fontSize: 8, color: C.primaryLight }}>Start: {fmtDate(plan.startDate)}  ·  {plan.durationWeeks}w</Text>
            {clinic.therapistName && <Text style={{ fontSize: 8, color: C.primaryLight, marginTop: 2 }}>Coach: {clinic.therapistName}</Text>}
          </View>
        </View>

        <View style={s.content}>
          {/* Summary table */}
          <Text style={s.sectionTitle}>Weekly Overview</Text>
          <View style={s.summaryTbl} wrap={false}>
            <View style={s.sTHead}>
              <Text style={[s.sTh, s.cDay]}>Day</Text>
              <Text style={[s.sTh, s.cKcal]}>kcal</Text>
              <Text style={[s.sTh, s.cP]}>Protein</Text>
              <Text style={[s.sTh, s.cC]}>Carbs</Text>
              <Text style={[s.sTh, s.cF]}>Fat</Text>
            </View>
            {plan.days.map((day, i) => {
              const t = dayTotals[i];
              return (
                <View key={day.id} style={i % 2 === 0 ? s.sTRow : s.sTRowAlt}>
                  <Text style={[s.sTd, s.cDay]}>{day.label}</Text>
                  <Text style={[s.sTd, s.cKcal]}>{fmt(t.calories)}</Text>
                  <Text style={[s.sTd, s.cP]}>{fmt(t.protein)}g</Text>
                  <Text style={[s.sTd, s.cC]}>{fmt(t.carbs)}g</Text>
                  <Text style={[s.sTd, s.cF]}>{fmt(t.fat)}g</Text>
                </View>
              );
            })}
            {(plan.targetCalories || plan.targetProtein || plan.targetCarbs || plan.targetFat) && (
              <View style={s.sTRowTgt}>
                <Text style={[s.sTdBold, s.cDay]}>Target / day</Text>
                <Text style={[s.sTdBold, s.cKcal]}>{plan.targetCalories ?? '—'}</Text>
                <Text style={[s.sTdBold, s.cP]}>{plan.targetProtein ? `${plan.targetProtein}g` : '—'}</Text>
                <Text style={[s.sTdBold, s.cC]}>{plan.targetCarbs ? `${plan.targetCarbs}g` : '—'}</Text>
                <Text style={[s.sTdBold, s.cF]}>{plan.targetFat ? `${plan.targetFat}g` : '—'}</Text>
              </View>
            )}
          </View>

          {/* Per-day detail */}
          <Text style={s.sectionTitle}>Daily Detail</Text>
          {plan.days.map((day, di) => {
            const dayItems = day.meals.flatMap((m) => m.items);
            const dayMacros = dayTotals[di];
            return (
              <View key={day.id} style={s.dayBlock}>
                <View style={s.dayHeader} wrap={false}>
                  <Text style={s.dayLabel}>{day.label}</Text>
                  <Text style={s.dayMacros}>{macroLine(dayMacros)}</Text>
                </View>
                {day.meals.map((meal) => {
                  const ml = meal.items.map((it) => { const f = foodMap.get(it.foodItemId); return f ? calcItemMacros(it, f) : null; }).filter(Boolean) as ReturnType<typeof calcItemMacros>[];
                  const mt = sumMacros(ml);
                  return (
                    <View key={meal.id} style={s.mealBlock} wrap={false}>
                      <View style={s.mealHdr}>
                        <Text style={s.mealLabel}>{meal.label}</Text>
                        {meal.items.length > 0 && <Text style={s.mealMacros}>{macroLine(mt)}</Text>}
                      </View>
                      {meal.items.length === 0 ? <Text style={s.empty}>No foods added.</Text> : (
                        <>
                          <View style={s.tHead}>
                            <Text style={[s.th, s.cFood]}>Food</Text><Text style={[s.th, s.cServ]}>Serving</Text>
                            <Text style={[s.th, s.cNum]}>kcal</Text><Text style={[s.th, s.cNum]}>P</Text>
                            <Text style={[s.th, s.cNum]}>C</Text><Text style={[s.th, s.cNum]}>F</Text>
                          </View>
                          {meal.items.map((item, i) => {
                            const food = foodMap.get(item.foodItemId);
                            const macros = food ? calcItemMacros(item, food) : null;
                            return (
                              <View key={item.id} style={i % 2 === 0 ? s.tRow : s.tRowAlt} wrap={false}>
                                <Text style={[s.td, s.cFood]}>{food?.name ?? '—'}</Text>
                                <Text style={[s.td, s.cServ]}>{food ? servingLabel(item, food) : '—'}</Text>
                                <Text style={[s.td, s.cNum]}>{macros ? fmt(macros.calories) : '—'}</Text>
                                <Text style={[s.td, s.cNum]}>{macros ? `${fmt(macros.protein)}g` : '—'}</Text>
                                <Text style={[s.td, s.cNum]}>{macros ? `${fmt(macros.carbs)}g` : '—'}</Text>
                                <Text style={[s.td, s.cNum]}>{macros ? `${fmt(macros.fat)}g` : '—'}</Text>
                              </View>
                            );
                          })}
                          {ml.length > 1 && (
                            <View style={s.totRow} wrap={false}>
                              <Text style={s.totLabel}>Meal total ({meal.items.length} items)</Text>
                              <Text style={s.totVal}>{fmt(mt.calories)}</Text>
                              <Text style={s.totVal}>{fmt(mt.protein)}g</Text>
                              <Text style={s.totVal}>{fmt(mt.carbs)}g</Text>
                              <Text style={s.totVal}>{fmt(mt.fat)}g</Text>
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  );
                })}
                {dayItems.length > 0 && (
                  <View style={s.dayTotRow} wrap={false}>
                    <Text style={s.dayTotLbl}>Day total</Text>
                    <Text style={s.dayTotVal}>{fmt(dayMacros.calories)}</Text>
                    <Text style={s.dayTotVal}>{fmt(dayMacros.protein)}g</Text>
                    <Text style={s.dayTotVal}>{fmt(dayMacros.carbs)}g</Text>
                    <Text style={s.dayTotVal}>{fmt(dayMacros.fat)}g</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
}

// ── Root component ────────────────────────────────────────────────────────────

export default function DietPlanPDF({ plan, clientName, foodMap, clinic = {} as ClinicInfo, template }: Props) {
  const C = buildPalette(template);
  const variant = resolveDietVariant(template?.layoutVariant);
  const exportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const socialLinks = buildSocialLinks(clinic);
  const contactParts: string[] = [
    clinic.therapistName ? `Coach: ${clinic.therapistName}` : null,
    clinic.clinicPhone   ? clinic.clinicPhone   : null,
    clinic.clinicEmail   ? clinic.clinicEmail   : null,
    clinic.clinicAddress ? clinic.clinicAddress : null,
    clinic.clinicWebsite ? clinic.clinicWebsite : null,
  ].filter(Boolean) as string[];

  const shared = { plan, clientName, foodMap, clinic, C, exportDate, socialLinks, contactParts };

  if (variant === 'patient')      return <PatientLayout      {...shared} />;
  if (variant === 'compact')      return <CompactLayout      {...shared} />;
  if (variant === 'modern')       return <ModernLayout       {...shared} />;
  if (variant === 'coach')        return <CoachLayout        {...shared} />;
  return                                 <ProfessionalLayout {...shared} />;
}
