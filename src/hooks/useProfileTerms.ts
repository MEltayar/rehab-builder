import { useSettingsStore } from '../store/settingsStore';

export interface ProfileTerms {
  practiceLabel: string;       // 'Clinic' | 'Gym'
  practitionerLabel: string;   // 'Therapist' | 'Coach'
  clientLabel: string;         // 'Patient' | 'Client'
  conditionLabel: string;      // 'Condition' | 'Focus Area'
  conditionPlaceholder: string;
  programLabel: string;        // 'Program' | 'Training Plan'
  programNamePlaceholder: string;
  goalPlaceholder: string;
  defaultGoal: string;
  sessionLabel: string;        // 'Session' | 'Training Day'
}

const PHYSIO_TERMS: ProfileTerms = {
  practiceLabel: 'Clinic',
  practitionerLabel: 'Therapist',
  clientLabel: 'Patient',
  conditionLabel: 'Condition',
  conditionPlaceholder: 'e.g. ACL Tear',
  programLabel: 'Program',
  programNamePlaceholder: 'e.g. ACL Recovery Phase 1',
  goalPlaceholder: 'e.g. Return to full range of motion',
  defaultGoal: 'Reduce pain and restore normal movement.',
  sessionLabel: 'Session',
};

const GYM_TERMS: ProfileTerms = {
  practiceLabel: 'Gym',
  practitionerLabel: 'Coach',
  clientLabel: 'Client',
  conditionLabel: 'Focus Area',
  conditionPlaceholder: 'e.g. Upper Body Strength',
  programLabel: 'Training Plan',
  programNamePlaceholder: 'e.g. 12-Week Muscle Building',
  goalPlaceholder: 'e.g. Gain 5 kg of lean muscle mass',
  defaultGoal: 'Build strength and improve body composition.',
  sessionLabel: 'Training Day',
};

export function useProfileTerms(): ProfileTerms {
  const profileType = useSettingsStore((s) => s.profileType);
  return profileType === 'gym' ? GYM_TERMS : PHYSIO_TERMS;
}
