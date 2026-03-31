import { QRCodeSVG } from 'qrcode.react';

interface QRPreviewProps {
  url: string;
}

export default function QRPreview({ url }: QRPreviewProps) {
  if (!url) return null;
  try {
    new URL(url);
  } catch {
    return null;
  }
  return (
    <div className="flex flex-col items-center gap-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">QR Preview</p>
      <QRCodeSVG value={url} size={120} level="M" />
    </div>
  );
}
