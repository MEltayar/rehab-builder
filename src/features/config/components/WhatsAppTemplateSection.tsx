import SectionHeader from './SectionHeader';

const INFO_TEXT =
  'This message is pre-filled whenever you send a rehab sheet via WhatsApp. You can edit it before sending.';

interface WhatsAppTemplateSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export default function WhatsAppTemplateSection({ value, onChange }: WhatsAppTemplateSectionProps) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <SectionHeader title="WhatsApp Message Template" infoText={INFO_TEXT} />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Default Message <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder="e.g. Hi [Name], please find your rehab program attached. Let me know if you have any questions."
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>
    </section>
  );
}
