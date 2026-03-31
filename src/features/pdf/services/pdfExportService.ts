import { pdf } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { createElement, type ReactElement, type ComponentType } from 'react';
import type { Exercise, ExportTemplate, Program } from '../../../types';
import ProgramPDF from '../components/ProgramPDF';

export interface ClinicInfo {
  clinicName: string;
  clinicLogo?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  clinicAddress?: string;
  clinicWebsite?: string;
  therapistName?: string;
  clinicInstagram?: string;
  clinicFacebook?: string;
  clinicGmail?: string;
  clinicWhatsApp?: string;
}

export interface PDFRenderContext {
  program: Program;
  clientName: string;
  exerciseMap: Map<string, { name: string; videoUrl?: string }>;
  qrCodeMap: Map<string, string>;
  clinic: ClinicInfo;
  template?: ExportTemplate;
}

function sanitizeFilename(clientName: string, programName: string): string {
  const part = (s: string) =>
    s.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
  return `${part(clientName)}_${part(programName)}.pdf`;
}

export async function generatePDFBlob(
  program: Program,
  clientName: string,
  exercises: Exercise[],
  clinic: ClinicInfo,
  template?: ExportTemplate,
): Promise<{ blob: Blob; filename: string }> {
  // Build exercise lookup map
  const exerciseMap = new Map<string, { name: string; videoUrl?: string }>();
  for (const ex of exercises) {
    exerciseMap.set(ex.id, { name: ex.name, videoUrl: ex.videoUrl });
  }

  // Pre-generate QR code data URLs for exercises with valid video URLs
  const qrCodeMap = new Map<string, string>();
  const seenUrls = new Map<string, string>();

  for (const session of program.sessions) {
    for (const pe of session.exercises) {
      const ex = exerciseMap.get(pe.exerciseId);
      if (ex?.videoUrl) {
        const url = ex.videoUrl.trim();
        if (!url) continue;
        try {
          let dataUrl: string;
          if (seenUrls.has(url)) {
            dataUrl = seenUrls.get(url)!;
          } else {
            dataUrl = await QRCode.toDataURL(url, { width: 80, margin: 1 });
            seenUrls.set(url, dataUrl);
          }
          qrCodeMap.set(pe.exerciseId, dataUrl);
        } catch {
          // Malformed URL — silently skip
        }
      }
    }
  }

  const context: PDFRenderContext = {
    program,
    clientName,
    exerciseMap,
    qrCodeMap,
    clinic,
    template,
  };

  // react-pdf/renderer's pdf() expects its own element type, not React.ReactElement.
  // We bridge via ComponentType cast to preserve prop-type checking on ProgramPDF.
  const element = createElement(ProgramPDF as ComponentType<PDFRenderContext>, context);
  const blob = await pdf(element as unknown as ReactElement<DocumentProps>).toBlob();

  return { blob, filename: sanitizeFilename(clientName, program.name) };
}

export async function generateAndDownload(
  program: Program,
  clientName: string,
  exercises: Exercise[],
  clinic: ClinicInfo,
  template?: ExportTemplate,
): Promise<void> {
  const { blob, filename } = await generatePDFBlob(program, clientName, exercises, clinic, template);

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
