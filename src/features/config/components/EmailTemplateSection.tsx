import SectionHeader from './SectionHeader';

const INFO_TEXT =
  'This subject and body are pre-filled whenever you send a rehab sheet via email. You can edit them before sending.';

interface EmailTemplateValues {
  emailSubject: string;
  emailTemplate: string;
}

interface EmailTemplateSectionProps {
  values: EmailTemplateValues;
  onChange: (patch: Partial<EmailTemplateValues>) => void;
}

export default function EmailTemplateSection({ values, onChange }: EmailTemplateSectionProps) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <SectionHeader title="Email Message Template & Subject" infoText={INFO_TEXT} />
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Subject <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={values.emailSubject}
            onChange={(e) => onChange({ emailSubject: e.target.value })}
            placeholder="e.g. Your Rehab Program from City Physio"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Body <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={values.emailTemplate}
            onChange={(e) => onChange({ emailTemplate: e.target.value })}
            rows={5}
            placeholder="e.g. Hi [Name], please find your personalised rehab program attached. Follow the exercises as prescribed and don't hesitate to reach out with any questions."
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>
      </div>
    </section>
  );
}
