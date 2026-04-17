import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Settings } from 'lucide-react';
import { LockedSection } from '../../../components/UpgradeLock';
import { useSettingsStore } from '../../../store/settingsStore';
import { usePlanStore } from '../../../store/planStore';
import type { ProfileType } from '../../../types';
import ProfileTypeSection from '../components/ProfileTypeSection';
import ClinicDetailsSection from '../components/ClinicDetailsSection';
import WhatsAppTemplateSection from '../components/WhatsAppTemplateSection';
import EmailTemplateSection from '../components/EmailTemplateSection';
import ExportedSheetTemplateSection from '../components/ExportedSheetTemplateSection';

export default function ConfigPage() {
  const isLoaded = useSettingsStore((s) => s.isLoaded);
  const canAccessConfig       = usePlanStore((s) => s.limits().canAccessConfig);
  const canUseExportTemplates = usePlanStore((s) => s.limits().canUseExportTemplates);
  const navigate = useNavigate();
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const [clinicName, setClinicName] = useState('');
  const [clinicLogo, setClinicLogo] = useState<string | undefined>(undefined);
  const [clinicInstagram, setClinicInstagram] = useState('');
  const [clinicFacebook, setClinicFacebook] = useState('');
  const [clinicGmail, setClinicGmail] = useState('');
  const [clinicWhatsApp, setClinicWhatsApp] = useState('');
  const [whatsappTemplate, setWhatsappTemplate] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [logoError, setLogoError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [exportTemplateId, setExportTemplateId] = useState<string | undefined>(undefined);
  const [exportTemplateFavorites, setExportTemplateFavorites] = useState<string[]>([]);
  const [exportPaletteId, setExportPaletteId] = useState<string | undefined>(undefined);
  const [profileType, setProfileType] = useState<ProfileType>('physio');

  // Sync local form state from store once settings are loaded from DB
  useEffect(() => {
    if (!isLoaded) return;
    const s = useSettingsStore.getState();
    setClinicName(s.clinicName ?? '');
    setClinicLogo(s.clinicLogo);
    setClinicInstagram(s.clinicInstagram ?? '');
    setClinicFacebook(s.clinicFacebook ?? '');
    setClinicGmail(s.clinicGmail ?? '');
    setClinicWhatsApp(s.clinicWhatsApp ?? '');
    setWhatsappTemplate(s.whatsappTemplate ?? '');
    setEmailSubject(s.emailSubject ?? '');
    setEmailTemplate(s.emailTemplate ?? '');
    setExportTemplateId(s.exportTemplateId);
    setExportTemplateFavorites(s.exportTemplateFavorites ?? []);
    setExportPaletteId(s.exportPaletteId);
    setProfileType(s.profileType ?? 'physio');
  }, [isLoaded]);

  async function handleSave() {
    setSaveStatus('idle');
    try {
      await updateSettings({
        clinicName,
        clinicLogo,
        clinicInstagram: clinicInstagram || undefined,
        clinicFacebook: clinicFacebook || undefined,
        clinicGmail: clinicGmail || undefined,
        clinicWhatsApp: clinicWhatsApp || undefined,
        whatsappTemplate: whatsappTemplate || undefined,
        emailSubject: emailSubject || undefined,
        emailTemplate: emailTemplate || undefined,
        exportTemplateId: exportTemplateId || undefined,
        exportTemplateFavorites,
        exportPaletteId: exportPaletteId || undefined,
        profileType,
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    }
  }

  if (!isLoaded) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading configuration...</p>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Page header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center shrink-0">
          <Settings size={20} className="text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Configuration</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your clinic details, templates, and preferences.</p>
        </div>
      </div>

      {!canAccessConfig && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg">
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Configuration is available on Pro. Upgrade to save your {profileType === 'gym' ? 'gym' : 'clinic'} details and templates.
            </p>
          </div>
          <button
            onClick={() => navigate('/pricing')}
            className="shrink-0 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-md transition-colors"
          >
            Upgrade
          </button>
        </div>
      )}

      <ProfileTypeSection
        value={profileType}
        onChange={(v) => {
          setProfileType(v);
          updateSettings({ profileType: v });
        }}
      />

      <div className={!canAccessConfig ? 'opacity-50 pointer-events-none select-none' : ''}>
        <div className="flex flex-col gap-6">
          <ClinicDetailsSection
            values={{ clinicName, clinicLogo, clinicInstagram, clinicFacebook, clinicGmail, clinicWhatsApp }}
            onChange={(patch) => {
              if ('clinicName' in patch) setClinicName(patch.clinicName ?? '');
              if ('clinicLogo' in patch) setClinicLogo(patch.clinicLogo);
              if ('clinicInstagram' in patch) setClinicInstagram(patch.clinicInstagram ?? '');
              if ('clinicFacebook' in patch) setClinicFacebook(patch.clinicFacebook ?? '');
              if ('clinicGmail' in patch) setClinicGmail(patch.clinicGmail ?? '');
              if ('clinicWhatsApp' in patch) setClinicWhatsApp(patch.clinicWhatsApp ?? '');
            }}
            logoError={logoError}
            onLogoError={setLogoError}
            profileType={profileType}
          />

          <WhatsAppTemplateSection
            value={whatsappTemplate}
            onChange={setWhatsappTemplate}
            profileType={profileType}
          />

          <EmailTemplateSection
            values={{ emailSubject, emailTemplate }}
            onChange={(patch) => {
              if ('emailSubject' in patch) setEmailSubject(patch.emailSubject ?? '');
              if ('emailTemplate' in patch) setEmailTemplate(patch.emailTemplate ?? '');
            }}
            profileType={profileType}
          />

          <LockedSection locked={!canUseExportTemplates} feature="Export Sheet Templates" tier="yearly">
            <ExportedSheetTemplateSection
              selectedTemplateId={exportTemplateId}
              favoriteIds={exportTemplateFavorites}
              selectedPaletteId={exportPaletteId}
              onSelectTemplate={setExportTemplateId}
              onSelectPalette={setExportPaletteId}
              onToggleFavorite={(id) =>
                setExportTemplateFavorites((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                )
              }
            />
          </LockedSection>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md transition-colors"
            >
              Save
            </button>
            {saveStatus === 'success' && (
              <span className="text-sm text-green-600 dark:text-green-400">Configuration saved.</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-sm text-red-600 dark:text-red-400">
                Failed to save. Storage may be full.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
