export type ExerciseCategory =
  | 'mobility'
  | 'stability'
  | 'strength'
  | 'stretching'
  | 'balance'
  | 'functional';

export type ProgressionLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  tags: string[];
  progressionLevel?: ProgressionLevel;
  progressionGroupId?: string;
  notes?: string;
  createdAt: string;
  isCustom: boolean;
}

export interface Client {
  id: string;
  name: string;
  age?: number;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface ProgramExercise {
  id: string;
  exerciseId: string;
  sets?: number;
  reps?: string;
  holdTime?: number;
  restSeconds?: number;
  notes?: string;
  order: number;
}

export interface Session {
  id: string;
  label: string;
  exercises: ProgramExercise[];
}

export interface Program {
  id: string;
  clientId: string;
  name: string;
  condition: string;
  goal: string;
  durationWeeks: number;
  startDate: string;
  sessions: Session[];
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  condition: string;
  description?: string;
  tags: string[];
  sessions: Session[];
  isBuiltIn: boolean;
  createdAt: string;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  light: string;
  text: string;
  darkText: string;
}

export type LayoutVariant =
  | 'professional' | 'patient'    | 'checklist' | 'clinical'  | 'modern'
  | 'minimal'      | 'bold'       | 'executive' | 'compact'   | 'twoColumn'
  | 'ledger'       | 'timeline'   | 'handout'   | 'report'    | 'card'
  | 'striped'      | 'magazine'   | 'sidebar'   | 'academic'  | 'outline'
  | 'receipt'      | 'notebook'   | 'poster'    | 'plain'     | 'rounded'
  | 'highlight'    | 'columns'    | 'divider'   | 'schedule'  | 'compactCard';
export type HeaderStyle = 'logo-left' | 'centered';

export interface ExportTemplate {
  id: string;
  name: string;
  colorScheme: ColorScheme;
  layoutVariant: LayoutVariant;
  headerStyle: HeaderStyle;
}

export interface ColorPalette {
  id: string;
  name: string;
  colorScheme: ColorScheme;
}

export interface AppSettings {
  clinicName: string;
  clinicLogo?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  clinicAddress?: string;
  clinicWebsite?: string;
  therapistName?: string;
  darkMode: boolean;
  whatsappTemplate?: string;
  emailTemplate?: string;
  emailSubject?: string;
  favouriteTemplateIds?: string[];
  clinicInstagram?: string;
  clinicFacebook?: string;
  clinicGmail?: string;
  clinicWhatsApp?: string;
  exportTemplateId?: string;
  exportTemplateFavorites?: string[];
  exportPaletteId?: string;
}
