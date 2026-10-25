/** 使用者確認的尋找用途。不得用於推薦、安全放行、處方或歷史回寫。 */
export const EXERCISE_PURPOSES = ['rehab', 'strength'] as const;
export type ExercisePurpose = typeof EXERCISE_PURPOSES[number];
export type ExercisePurposeFilter = 'all' | ExercisePurpose;
export const REHAB_DISCOVERY_GROUPS = ['control', 'mobility', 'care'] as const;
export type RehabDiscoveryGroup = typeof REHAB_DISCOVERY_GROUPS[number];

export interface ExercisePurposeInfo {
  primaryPurpose: ExercisePurpose;
  secondaryPurposes?: readonly ExercisePurpose[];
  rehabGroup?: RehabDiscoveryGroup;
}

export const exercisePurposes: Readonly<Record<string, ExercisePurposeInfo>> = {
  'shoulder-flexion': { primaryPurpose: 'rehab', rehabGroup: 'mobility' },
  'shoulder-scapular-squeeze': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control' },
  'shoulder-external-rotation-band': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control' },
  'shoulder-standing-arm-swings': { primaryPurpose: 'rehab', rehabGroup: 'mobility' },
  'shoulder-internal-rotation-band': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control' },
  'hip-flexion-seated': { primaryPurpose: 'rehab', rehabGroup: 'mobility' },
  'hip-abduction': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control' },
  'glute-bridge': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control' },
  'hip-clamshell': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control' },
  'hip-sit-to-stand': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control' },
  'shoulder-wall-slide': { primaryPurpose: 'rehab', rehabGroup: 'mobility' },
  'shoulder-neck-chin-tuck': { primaryPurpose: 'rehab', rehabGroup: 'mobility' },
  'neck-isometric': { primaryPurpose: 'rehab', rehabGroup: 'control' },
  'upper-trap-stretch': { primaryPurpose: 'rehab', rehabGroup: 'mobility' },
  'pec-doorway-stretch': { primaryPurpose: 'rehab', rehabGroup: 'mobility' },
  'neck-heat-relax': { primaryPurpose: 'rehab', rehabGroup: 'care' },
  'neck-rotation-stretch': { primaryPurpose: 'rehab', rehabGroup: 'mobility' },
  'neck-wall-posture': { primaryPurpose: 'rehab', rehabGroup: 'control' },
  'shoulder-neck-thoracic-extension-chair': { primaryPurpose: 'rehab', rehabGroup: 'mobility' },
  'shoulder-neck-band-row-low': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control' },
  'shoulder-neck-serratus-wall-push': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control' },
  'knee-rice-care': { primaryPurpose: 'rehab', rehabGroup: 'care' },
  'knee-straight-leg-raise': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control' },
  'knee-wall-squat': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control' },
  'knee-hamstring-curl': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control' },
  'knee-calf-raise': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control' },
  'ankle-circles': { primaryPurpose: 'rehab', rehabGroup: 'mobility' },
  'ankle-alphabet': { primaryPurpose: 'rehab', rehabGroup: 'mobility' },
  'ankle-band-inversion-eversion': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control' },
  'ankle-single-leg-stand': { primaryPurpose: 'rehab', rehabGroup: 'control' },
  'ankle-calf-raise': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control' },
  'ankle-gastrocnemius-stretch': { primaryPurpose: 'rehab', rehabGroup: 'mobility' },
  'ankle-soleus-stretch': { primaryPurpose: 'rehab', rehabGroup: 'mobility' },
  'ankle-seated-soleus-raise': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control' },
  'ankle-single-leg-reach': { primaryPurpose: 'rehab', rehabGroup: 'control' },
  'catalog-prone-ytw': { primaryPurpose: 'rehab', secondaryPurposes: ['strength'], rehabGroup: 'control' },
  'catalog-bench-press': { primaryPurpose: 'strength' },
  'catalog-shoulder-press': { primaryPurpose: 'strength' },
  'catalog-side-squat': { primaryPurpose: 'strength' },
  'catalog-rear-foot-elevated-split-squat': { primaryPurpose: 'strength' },
  'catalog-squat': { primaryPurpose: 'strength' },
  'catalog-pull-up': { primaryPurpose: 'strength' },
  'catalog-dip': { primaryPurpose: 'strength' },
  'catalog-lat-pulldown': { primaryPurpose: 'strength' },
  'catalog-seated-row': { primaryPurpose: 'strength' },
  'catalog-leg-extension': { primaryPurpose: 'strength' },
  'catalog-worlds-greatest-stretch': { primaryPurpose: 'rehab', rehabGroup: 'mobility' },
};
