import { useState } from 'react';
import { Loader2, Mail, MessageCircle, X } from 'lucide-react';

interface SendPanelProps {
  option: 'email' | 'whatsapp';
  clientEmail?: string;
  clientPhone?: string;
  defaultEmailSubject: string;
  defaultEmailBody: string;
  defaultWhatsAppBody: string;
  isSending: boolean;
  onSendEmail: (subject: string, body: string) => void;
  onSendWhatsApp: (body: string) => void;
  onClose: () => void;
}

export default function SendPanel({
  option,
  clientEmail,
  clientPhone,
  defaultEmailSubject,
  defaultEmailBody,
  defaultWhatsAppBody,
  isSending,
  onSendEmail,
  onSendWhatsApp,
  onClose,
}: SendPanelProps) {
  const [emailSubjectDraft, setEmailSubjectDraft] = useState(defaultEmailSubject);
  const [emailBodyDraft, setEmailBodyDraft]       = useState(defaultEmailBody);
  const [whatsappBodyDraft, setWhatsappBodyDraft] = useState(defaultWhatsAppBody);

  const showEmail    = option === 'email';
  const showWhatsApp = option === 'whatsapp';
  const emailMissing    = showEmail    && !clientEmail;
  const whatsappMissing = showWhatsApp && !clientPhone;

  const inputCls =
    'w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 ' +
    'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500';

  const primaryBtnCls = (disabled: boolean) =>
    `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white transition-colors shadow-sm ` +
    (disabled ? 'bg-blue-400 cursor-not-allowed opacity-60' : 'bg-blue-600 hover:bg-blue-700');

  const spinnerEl = <Loader2 size={14} className="animate-spin" />;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {option === 'email'    ? 'Send via Email' : 'Send via WhatsApp'}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 transition-colors"
          aria-label="Close send panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Email section */}
      {showEmail && (
        <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Subject</label>
            <input
              type="text"
              value={emailSubjectDraft}
              onChange={(e) => setEmailSubjectDraft(e.target.value)}
              className={inputCls}
              placeholder="Email subject"
            />
            {emailMissing && (
              <p className="text-xs text-red-500 mt-0.5">
                This client has no email address — add one in their profile.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Message</label>
            <textarea
              value={emailBodyDraft}
              onChange={(e) => setEmailBodyDraft(e.target.value)}
              rows={4}
              className={`${inputCls} resize-y`}
              placeholder="Email message body…"
            />
          </div>
        </div>
      )}

      {/* WhatsApp section */}
      {showWhatsApp && (
        <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Message</label>
            <textarea
              value={whatsappBodyDraft}
              onChange={(e) => setWhatsappBodyDraft(e.target.value)}
              rows={4}
              className={`${inputCls} resize-y`}
              placeholder="WhatsApp message…"
            />
            {whatsappMissing && (
              <p className="text-xs text-red-500 mt-0.5">
                This client has no phone number — add one in their profile.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-1">
        {option === 'email' && (
          <button
            type="button"
            onClick={() => onSendEmail(emailSubjectDraft, emailBodyDraft)}
            disabled={isSending || emailMissing}
            className={primaryBtnCls(isSending || emailMissing)}
          >
            {isSending ? spinnerEl : <Mail size={14} />}
            Send Email
          </button>
        )}

        {option === 'whatsapp' && (
          <button
            type="button"
            onClick={() => onSendWhatsApp(whatsappBodyDraft)}
            disabled={isSending || whatsappMissing}
            className={primaryBtnCls(isSending || whatsappMissing)}
          >
            {isSending ? spinnerEl : <MessageCircle size={14} />}
            Send WhatsApp
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
