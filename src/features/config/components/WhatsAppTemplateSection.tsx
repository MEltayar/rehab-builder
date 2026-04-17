import SectionHeader from './SectionHeader';
import type { ProfileType } from '../../../types';

interface WhatsAppTemplateSectionProps {
  value: string;
  onChange: (value: string) => void;
  profileType?: ProfileType;
}

export default function WhatsAppTemplateSection({ value, onChange, profileType = 'physio' }: WhatsAppTemplateSectionProps) {
  const isGym = profileType === 'gym';

  const infoText = isGym
    ? 'This message is pre-filled whenever you send a training plan via WhatsApp. You can edit it before sending.'
    : 'This message is pre-filled whenever you send a rehab sheet via WhatsApp. You can edit it before sending.';

  const placeholder = isGym
    ? 'e.g. Hi [Name], your training plan is ready! Let me know if you need any adjustments.'
    : 'e.g. Hi [Name], please find your rehab program attached. Let me know if you have any questions.';

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <SectionHeader title="WhatsApp Message Template" infoText={infoText} />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Default Message <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>
    </section>
  );
}
