import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import ClinicDetailsSection from '../components/ClinicDetailsSection';
import WhatsAppTemplateSection from '../components/WhatsAppTemplateSection';
import EmailTemplateSection from '../components/EmailTemplateSection';
import ExportedSheetTemplateSection from '../components/ExportedSheetTemplateSection';

export default function ConfigPage() {
  const isLoaded = useSettingsStore((s) => s.isLoaded);
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Configuration</h1>

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
      />

      <WhatsAppTemplateSection
        value={whatsappTemplate}
        onChange={setWhatsappTemplate}
      />

      <EmailTemplateSection
        values={{ emailSubject, emailTemplate }}
        onChange={(patch) => {
          if ('emailSubject' in patch) setEmailSubject(patch.emailSubject ?? '');
          if ('emailTemplate' in patch) setEmailTemplate(patch.emailTemplate ?? '');
        }}
      />

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

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
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
  );
}
