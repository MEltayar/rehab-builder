export type ShareChannel = 'email' | 'whatsapp';

export interface ShareOptions {
  channel: ShareChannel;
  blob: Blob;
  filename: string;
  title?: string;
  text: string;
  recipientPhone?: string;
}

export async function shareFile(options: ShareOptions): Promise<{ fallbackUsed: boolean }> {
  const { channel, blob, filename, title, text, recipientPhone } = options;
  const file = new File([blob], filename, { type: 'application/pdf' });

  // Primary path: Web Share API with file attachment
  if (
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file], title, text });
      return { fallbackUsed: false };
    } catch (err) {
      // User dismissed the share sheet — treat as success, not an error
      if (err instanceof Error && err.name === 'AbortError') {
        return { fallbackUsed: false };
      }
      // Other errors fall through to fallback
    }
  }

  // Fallback path: download file + open mailto / wa.me link
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(blobUrl);

  if (channel === 'email') {
    const mailtoUrl =
      `mailto:?subject=${encodeURIComponent(title ?? '')}&body=${encodeURIComponent(text)}`;
    window.open(mailtoUrl, '_blank');
  } else {
    // Strip everything except digits and a leading +
    const stripped = (recipientPhone ?? '').replace(/[^\d+]/g, '').replace(/(?<!^)\+/g, '');
    const waUrl =
      `https://wa.me/${stripped}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  }

  return { fallbackUsed: true };
}
