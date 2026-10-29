/** 使用者確認的尋找用途。不得用於推薦、安全放行、處方或歷史回寫。 */
export const EXERCISE_PURPOSES = ['rehab', 'strength'] as const;
export type ExercisePurpose = typeof EXERCISE_PURPOSES[number];
export type ExercisePurposeFilter = 'all' | ExercisePurpose;
export const REHAB_DISCOVERY_GROUPS = ['control', 'mobility', 'care'] as const;
export type RehabDiscoveryGroup = typeof REHAB_DISCOVERY_GROUPS[number];

export const STRENGTH_GROUPS = ['push', 'pull', 'legs', 'core', 'other'] as const;
export type StrengthGroup = typeof STRENGTH_GROUPS[number];
export const LEG_PATTERNS = ['squat', 'hinge', 'lunge', 'isolation', 'other'] as const;
export type LegPattern = typeof LEG_PATTERNS[number];
export const REHAB_FUNCTIONS = ['mobility', 'control', 'strength', 'stretch', 'balance', 'care', 'other'] as const;
export type RehabFunction = typeof REHAB_FUNCTIONS[number];

export interface ExercisePurposeInfo {
  primaryPurpose: ExercisePurpose;
  secondaryPurposes?: readonly ExercisePurpose[];
  rehabGroup?: RehabDiscoveryGroup;
  strengthGroups?: readonly StrengthGroup[];
  legPatterns?: readonly LegPattern[];
  rehabFunctions?: readonly RehabFunction[];
}

export const exercisePurposes: Readonly<Record<string, ExercisePurposeInfo>> = {
  'shoulder-flexion': { primaryPurpose: 'rehab', rehabGroup: 'mobility', rehabFunctions: ['mobility'] },
  'shoulder-scapular-squeeze': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control', strengthGroups: ['pull'], rehabFunctions: ['control', 'strength'] },
  'shoulder-external-rotation-band': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control', strengthGroups: ['other'], rehabFunctions: ['control', 'strength'] },
  'shoulder-standing-arm-swings': { primaryPurpose: 'rehab', rehabGroup: 'mobility', rehabFunctions: ['mobility'] },
  'shoulder-internal-rotation-band': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control', strengthGroups: ['other'], rehabFunctions: ['control', 'strength'] },
  'hip-flexion-seated': { primaryPurpose: 'rehab', rehabGroup: 'mobility', rehabFunctions: ['mobility', 'control'] },
  'hip-abduction': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control', strengthGroups: ['legs'], legPatterns: ['isolation'], rehabFunctions: ['control', 'strength'] },
  'glute-bridge': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control', strengthGroups: ['legs', 'core'], legPatterns: ['other'], rehabFunctions: ['control', 'strength'] },
  'hip-clamshell': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control', strengthGroups: ['legs'], legPatterns: ['isolation'], rehabFunctions: ['control', 'strength'] },
  'hip-sit-to-stand': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control', strengthGroups: ['legs'], legPatterns: ['squat'], rehabFunctions: ['control', 'strength'] },
  'shoulder-wall-slide': { primaryPurpose: 'rehab', rehabGroup: 'mobility', rehabFunctions: ['mobility', 'control'] },
  'shoulder-neck-chin-tuck': { primaryPurpose: 'rehab', rehabGroup: 'mobility', rehabFunctions: ['control'] },
  'neck-isometric': { primaryPurpose: 'rehab', rehabGroup: 'control', rehabFunctions: ['control', 'strength'] },
  'upper-trap-stretch': { primaryPurpose: 'rehab', rehabGroup: 'mobility', rehabFunctions: ['mobility', 'stretch'] },
  'pec-doorway-stretch': { primaryPurpose: 'rehab', rehabGroup: 'mobility', rehabFunctions: ['mobility', 'stretch'] },
  'neck-heat-relax': { primaryPurpose: 'rehab', rehabGroup: 'care', rehabFunctions: ['care'] },
  'neck-rotation-stretch': { primaryPurpose: 'rehab', rehabGroup: 'mobility', rehabFunctions: ['mobility', 'stretch'] },
  'neck-wall-posture': { primaryPurpose: 'rehab', rehabGroup: 'control', rehabFunctions: ['control'] },
  'shoulder-neck-thoracic-extension-chair': { primaryPurpose: 'rehab', rehabGroup: 'mobility', rehabFunctions: ['mobility', 'stretch'] },
  'shoulder-neck-band-row-low': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control', strengthGroups: ['pull'], rehabFunctions: ['control', 'strength'] },
  'shoulder-neck-serratus-wall-push': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control', strengthGroups: ['push'], rehabFunctions: ['control', 'strength'] },
  'knee-rice-care': { primaryPurpose: 'rehab', rehabGroup: 'care', rehabFunctions: ['care'] },
  'knee-straight-leg-raise': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control', strengthGroups: ['legs'], legPatterns: ['isolation'], rehabFunctions: ['control', 'strength'] },
  'knee-wall-squat': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control', strengthGroups: ['legs'], legPatterns: ['squat'], rehabFunctions: ['control', 'strength'] },
  'knee-hamstring-curl': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control', strengthGroups: ['legs'], legPatterns: ['isolation'], rehabFunctions: ['strength'] },
  'knee-calf-raise': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control', strengthGroups: ['legs'], legPatterns: ['isolation'], rehabFunctions: ['control', 'strength'] },
  'ankle-circles': { primaryPurpose: 'rehab', rehabGroup: 'mobility', rehabFunctions: ['mobility'] },
  'ankle-alphabet': { primaryPurpose: 'rehab', rehabGroup: 'mobility', rehabFunctions: ['mobility', 'control'] },
  'ankle-band-inversion-eversion': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control', strengthGroups: ['legs'], legPatterns: ['isolation'], rehabFunctions: ['control', 'strength'] },
  'ankle-single-leg-stand': { primaryPurpose: 'rehab', rehabGroup: 'control', rehabFunctions: ['control', 'balance'] },
  'ankle-calf-raise': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control', strengthGroups: ['legs'], legPatterns: ['isolation'], rehabFunctions: ['control', 'strength'] },
  'ankle-gastrocnemius-stretch': { primaryPurpose: 'rehab', rehabGroup: 'mobility', rehabFunctions: ['mobility', 'stretch'] },
  'ankle-soleus-stretch': { primaryPurpose: 'rehab', rehabGroup: 'mobility', rehabFunctions: ['mobility', 'stretch'] },
  'ankle-seated-soleus-raise': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control', strengthGroups: ['legs'], legPatterns: ['isolation'], rehabFunctions: ['strength'] },
  'ankle-single-leg-reach': { primaryPurpose: 'rehab', rehabGroup: 'control', rehabFunctions: ['control', 'balance'] },
  'catalog-prone-ytw': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control', strengthGroups: ['other'], rehabFunctions: ['control', 'strength'] },
  'catalog-bench-press': { primaryPurpose: 'strength', strengthGroups: ['push'] },
  'catalog-shoulder-press': { primaryPurpose: 'strength', strengthGroups: ['push'] },
  'catalog-side-squat': { primaryPurpose: 'strength', strengthGroups: ['legs'], legPatterns: ['squat'] },
  'catalog-rear-foot-elevated-split-squat': { primaryPurpose: 'strength', strengthGroups: ['legs'], legPatterns: ['lunge'] },
  'catalog-squat': { primaryPurpose: 'strength', strengthGroups: ['legs'], legPatterns: ['squat'] },
  'catalog-pull-up': { primaryPurpose: 'strength', strengthGroups: ['pull'] },
  'catalog-dip': { primaryPurpose: 'strength', strengthGroups: ['push'] },
  'catalog-lat-pulldown': { primaryPurpose: 'strength', strengthGroups: ['pull'] },
  'catalog-seated-row': { primaryPurpose: 'strength', strengthGroups: ['pull'] },
  'catalog-leg-extension': { primaryPurpose: 'strength', strengthGroups: ['legs'], legPatterns: ['isolation'] },
  'catalog-worlds-greatest-stretch': { primaryPurpose: 'rehab', rehabGroup: 'mobility', rehabFunctions: ['mobility', 'stretch'] },
};
