import type { Exercise } from '../types/rehab';

type ExerciseDisplayFields = Pick<
  Exercise,
  | 'title'
  | 'description'
  | 'detail'
  | 'steps'
  | 'durationText'
  | 'benefits'
  | 'cautions'
  | 'stopRules'
  | 'regressions'
  | 'progressions'
>;

const sharedCautions = {
  shoulder: ['Keep the movement slow and controlled.', 'Stay below sharp pain or numbness.'],
  hip: ['Keep the pelvis steady.', 'Use support if balance feels uncertain.'],
  shoulder_neck: ['Move gently and avoid forcing the neck.', 'Stop if symptoms travel into the arm.'],
  knee: ['Keep the knee comfortable and controlled.', 'Avoid deep bending or impact.'],
  ankle: ['Use a chair or wall for support.', 'Stop if balance feels unsafe.'],
};

const sharedStopRules = [
  'Stop for sharp pain, numbness, dizziness, or symptoms that clearly worsen.',
  'Stop if pain rises above a comfortable level or movement quality drops.',
];

const sharedRegressions = ['Use a smaller range of motion.', 'Reduce repetitions or use extra support.'];
const sharedProgressions = ['Add repetitions only if pain stays below 3/10.', 'Move more slowly before adding load.'];

const exerciseEnglishContent: Record<string, Partial<ExerciseDisplayFields>> = {
  'shoulder-flexion': {
    title: 'Shoulder flexion raise',
    description: 'Slowly raise the arm forward while seated or standing.',
    detail: 'Use a comfortable, pain-free range to restore shoulder motion gently.',
    steps: ['Sit or stand tall.', 'Raise the arm forward slowly.', 'Pause for 2 to 3 seconds.', 'Lower with control and avoid shrugging.'],
    benefits: 'Supports shoulder mobility and gentle front-shoulder activation.',
    durationText: 'About 5 min',
  },
  'shoulder-scapular-squeeze': {
    title: 'Scapular squeeze',
    description: 'Gently draw the shoulder blades back and down while seated.',
    detail: 'Builds shoulder blade control for steadier shoulder movement.',
    steps: ['Sit tall with hands relaxed.', 'Draw shoulder blades back and down.', 'Hold for 5 seconds.', 'Relax without shrugging.'],
    benefits: 'Builds upper-back strength and posture control.',
    durationText: 'About 5 min',
  },
  'shoulder-external-rotation-band': {
    title: 'Band shoulder external rotation',
    description: 'Use a resistance band for controlled shoulder external rotation.',
    detail: 'Strengthens the rotator cuff when basic shoulder control is comfortable.',
    steps: ['Keep the elbow bent at 90 degrees near the body.', 'Hold a light band.', 'Rotate the forearm outward slowly.', 'Return with control.'],
    benefits: 'Improves rotator cuff strength and shoulder stability.',
    durationText: 'About 6 min',
  },
  'shoulder-standing-arm-swings': {
    title: 'Standing arm swings',
    description: 'Gently swing both arms as a warm-up.',
    detail: 'Uses easy motion to increase shoulder and upper-back readiness.',
    steps: ['Stand tall with arms relaxed.', 'Swing arms forward to a comfortable height.', 'Let them return and swing slightly back.', 'Continue for 30 to 60 seconds.'],
    benefits: 'Warms the shoulder before more focused movement.',
    durationText: '30 to 60 sec',
  },
  'shoulder-internal-rotation-band': {
    title: 'Band shoulder internal rotation',
    description: 'Use a light band to train shoulder internal rotation.',
    detail: 'Builds shoulder control with slow, low-resistance movement.',
    steps: ['Stand sideways with elbow bent at 90 degrees.', 'Keep the elbow near the body.', 'Pull the hand inward slowly.', 'Return with control.'],
    benefits: 'Supports shoulder stability and rotator cuff control.',
    durationText: '2 sets of 10 to 15 reps',
  },
  'hip-flexion-seated': {
    title: 'Seated hip flexion',
    description: 'Lift one knee gently while seated.',
    detail: 'Trains hip flexion for walking, stairs, and daily movement.',
    steps: ['Sit near the front of a chair.', 'Lift one knee toward the chest slowly.', 'Pause for 2 to 3 seconds.', 'Lower and alternate sides.'],
    benefits: 'Improves hip flexor control and leg lifting ability.',
    durationText: 'About 5 min',
  },
  'hip-abduction': {
    title: 'Hip abduction',
    description: 'Raise the leg to the side while lying down or holding a chair.',
    detail: 'Strengthens the side hip muscles for gait and standing stability.',
    steps: ['Lie on your side or hold a chair.', 'Raise the leg to the side slowly.', 'Pause for 2 seconds.', 'Lower while keeping the pelvis steady.'],
    benefits: 'Builds glute strength for steadier walking.',
    durationText: 'About 6 min',
  },
  'glute-bridge': {
    title: 'Glute bridge',
    description: 'Lift the hips from a lying position to strengthen the glutes.',
    detail: 'Trains hip and trunk control for standing and walking.',
    steps: ['Lie on your back with knees bent.', 'Lift the hips into a bridge.', 'Hold for 3 to 5 seconds.', 'Lower slowly.'],
    benefits: 'Strengthens glutes and trunk support.',
    durationText: 'About 6 min',
  },
  'hip-clamshell': {
    title: 'Clamshell',
    description: 'Open the top knee while lying on your side.',
    detail: 'Targets side-hip control with a small, supported movement.',
    steps: ['Lie on your side with knees bent.', 'Keep feet together.', 'Open the top knee slowly.', 'Lower with control.'],
    benefits: 'Improves hip stability for walking and standing.',
    durationText: '3 sets per side',
  },
  'hip-sit-to-stand': {
    title: 'Sit to stand',
    description: 'Practice standing up from a chair with control.',
    detail: 'Builds practical leg and hip strength for daily activity.',
    steps: ['Sit near the front of a sturdy chair.', 'Place feet under the knees.', 'Lean forward slightly and stand.', 'Sit back down slowly.'],
    benefits: 'Strengthens the legs and improves transfer confidence.',
    durationText: '2 to 3 sets of 8 to 10 reps',
  },
  'shoulder-wall-slide': {
    title: 'Wall slide',
    description: 'Slide the arms along a wall within a comfortable range.',
    detail: 'Trains shoulder motion and posture with wall feedback.',
    steps: ['Stand with back near a wall.', 'Place forearms or hands on the wall.', 'Slide upward slowly.', 'Return without forcing range.'],
    benefits: 'Improves shoulder mobility and posture control.',
    durationText: '2 to 3 sets of 10 reps',
  },
  'shoulder-neck-chin-tuck': {
    title: 'Chin tuck',
    description: 'Gently draw the chin backward to align the neck.',
    detail: 'Supports neck posture and deep neck muscle control.',
    steps: ['Sit or stand tall.', 'Look forward.', 'Gently glide the chin backward.', 'Hold briefly and relax.'],
    benefits: 'Helps reduce forward-head posture strain.',
    durationText: '3 to 5 min',
  },
  'neck-isometric': {
    title: 'Neck isometric hold',
    description: 'Use gentle hand pressure while the neck stays still.',
    detail: 'Builds neck stability without large movement.',
    steps: ['Sit tall.', 'Place a hand on the head.', 'Press gently without moving the neck.', 'Hold briefly and relax.'],
    benefits: 'Improves gentle neck strength and control.',
    durationText: '1 to 3 rounds daily',
  },
  'upper-trap-stretch': {
    title: 'Upper trapezius stretch',
    description: 'Gently stretch the side of the neck.',
    detail: 'Uses a mild stretch to ease shoulder-neck tension.',
    steps: ['Sit tall.', 'Tilt the head gently to one side.', 'Keep the shoulder relaxed.', 'Hold without pulling hard.'],
    benefits: 'May ease neck and upper-shoulder tightness.',
    durationText: '3 reps per side',
  },
  'pec-doorway-stretch': {
    title: 'Doorway chest stretch',
    description: 'Use a doorway or wall to gently stretch the chest.',
    detail: 'Helps open the front of the chest without aggressive shoulder loading.',
    steps: ['Place the forearm on a doorway or wall.', 'Step forward gently.', 'Keep the shoulder relaxed.', 'Hold a mild stretch.'],
    benefits: 'Supports posture and shoulder comfort.',
    durationText: '30 sec per side',
  },
  'neck-heat-relax': {
    title: 'Heat and relaxation position',
    description: 'Use comfortable positioning and gentle heat for relaxation.',
    detail: 'A low-intensity recovery option for shoulder-neck tension.',
    steps: ['Find a comfortable supported position.', 'Apply gentle heat if appropriate.', 'Keep breathing slow.', 'Stop if heat feels uncomfortable.'],
    benefits: 'Supports relaxation before or after gentle movement.',
    durationText: '15 min',
  },
  'neck-rotation-stretch': {
    title: 'Neck rotation stretch',
    description: 'Turn the head gently side to side.',
    detail: 'Maintains comfortable neck rotation without forcing range.',
    steps: ['Sit tall.', 'Turn the head slowly to one side.', 'Pause briefly.', 'Return and repeat on the other side.'],
    benefits: 'Supports neck mobility and comfort.',
    durationText: '5 reps per side',
  },
  'neck-wall-posture': {
    title: 'Wall posture reset',
    description: 'Stand near a wall to practice relaxed alignment.',
    detail: 'Uses wall feedback for posture awareness without strain.',
    steps: ['Stand with back near a wall.', 'Relax shoulders down.', 'Gently lengthen the neck.', 'Breathe slowly for several breaths.'],
    benefits: 'Builds posture awareness and relaxation.',
    durationText: '3 min',
  },
  'knee-rice-care': {
    title: 'Knee RICE care',
    description: 'Use rest, ice, light compression, and elevation for short-term knee comfort.',
    detail: 'A recovery option for acute knee irritation; it is not a diagnosis or cure.',
    steps: ['Rest from painful activity.', 'Use ice if appropriate.', 'Use light compression if comfortable.', 'Elevate the leg and monitor symptoms.'],
    benefits: 'Supports short-term comfort while avoiding painful loading.',
    durationText: '15 to 20 min',
  },
  'knee-straight-leg-raise': {
    title: 'Straight leg raise',
    description: 'Lift a straight leg while lying down.',
    detail: 'Strengthens the thigh while keeping the knee relatively still.',
    steps: ['Lie down with one knee bent and the other leg straight.', 'Tighten the thigh gently.', 'Lift the straight leg slowly.', 'Lower with control.'],
    benefits: 'Builds quadriceps strength with low knee motion.',
    durationText: 'About 6 min',
  },
  'knee-wall-squat': {
    title: 'Wall mini squat',
    description: 'Do a shallow wall-supported squat.',
    detail: 'Trains leg strength with support and limited knee bend.',
    steps: ['Stand with back against a wall.', 'Keep feet slightly forward.', 'Bend the knees only a little.', 'Return to standing with control.'],
    benefits: 'Builds controlled leg strength without deep knee flexion.',
    durationText: 'About 6 min',
  },
  'knee-hamstring-curl': {
    title: 'Standing hamstring curl',
    description: 'Bend the knee while holding a chair for support.',
    detail: 'Strengthens the back of the thigh with a controlled standing movement.',
    steps: ['Hold a sturdy chair.', 'Stand tall.', 'Bend one knee to bring the heel back.', 'Lower slowly and switch sides.'],
    benefits: 'Supports knee control and hamstring strength.',
    durationText: 'About 5 min',
  },
  'knee-calf-raise': {
    title: 'Knee-friendly calf raise',
    description: 'Rise onto the toes while holding support.',
    detail: 'Builds calf and lower-leg strength with a stable setup.',
    steps: ['Hold a chair or wall.', 'Stand tall.', 'Rise slowly onto the toes.', 'Lower with control.'],
    benefits: 'Supports lower-leg strength and walking tolerance.',
    durationText: '2 sets of 12 reps',
  },
  'ankle-circles': {
    title: 'Seated ankle circles',
    description: 'Move the ankle in slow circles while seated.',
    detail: 'A gentle mobility drill for ankle range of motion.',
    steps: ['Sit with support.', 'Lift one foot slightly.', 'Circle the ankle slowly.', 'Repeat both directions.'],
    benefits: 'Improves ankle mobility with low load.',
    durationText: '3 sets per side',
  },
  'ankle-alphabet': {
    title: 'Seated ankle alphabet',
    description: 'Draw letters with the foot while seated.',
    detail: 'Uses varied gentle motion to improve ankle control.',
    steps: ['Sit with the foot lifted slightly.', 'Draw letters with the toes.', 'Move slowly and comfortably.', 'Rest if the ankle feels tired.'],
    benefits: 'Improves ankle mobility and control.',
    durationText: '1 to 2 sets per side',
  },
  'ankle-band-inversion-eversion': {
    title: 'Band ankle inversion and eversion',
    description: 'Use a band to gently strengthen side-to-side ankle motion.',
    detail: 'Trains ankle control with light resistance.',
    steps: ['Sit with the leg supported.', 'Place a light band around the foot.', 'Move the foot inward and outward slowly.', 'Return with control.'],
    benefits: 'Builds ankle strength and control.',
    durationText: '3 sets per side',
  },
  'ankle-single-leg-stand': {
    title: 'Supported single-leg stand',
    description: 'Practice standing on one leg while holding support.',
    detail: 'Builds balance while keeping a chair or wall available.',
    steps: ['Stand near a chair or wall.', 'Hold support lightly.', 'Lift one foot.', 'Hold briefly, then switch sides.'],
    benefits: 'Improves supported balance and ankle stability.',
    durationText: '3 rounds per side',
  },
  'ankle-calf-raise': {
    title: 'Standing calf raise',
    description: 'Raise the heels while standing with support.',
    detail: 'Strengthens the calf and ankle with a stable setup.',
    steps: ['Hold a chair or wall.', 'Rise onto the toes.', 'Pause briefly.', 'Lower slowly.'],
    benefits: 'Builds calf strength for walking and balance.',
    durationText: '3 sets of 20 reps',
  },
  'ankle-single-leg-reach': {
    title: 'Supported single-leg reach',
    description: 'Reach with one leg while staying supported.',
    detail: 'A more advanced ankle control drill that should stay supported.',
    steps: ['Stand near a chair or wall.', 'Shift weight onto one leg.', 'Reach the other foot lightly in different directions.', 'Return to center with control.'],
    benefits: 'Challenges ankle proprioception and balance control.',
    durationText: '3 sets per side',
  },
};

function getFallbackContent(exercise: Exercise): ExerciseDisplayFields {
  return {
    title: exercise.id.replace(/-/g, ' '),
    description: `A ${exercise.type} exercise for ${exercise.bodyArea.replace('_', ' ')} training.`,
    detail: 'Move slowly, keep the range comfortable, and use support when needed.',
    steps: ['Set up in a stable position.', 'Move slowly through a comfortable range.', 'Keep breathing and stay in control.', 'Stop if symptoms worsen.'],
    durationText: `${exercise.sets} sets of ${exercise.reps} reps`,
    benefits: 'Supports gradual movement confidence and control.',
    cautions: sharedCautions[exercise.bodyArea],
    stopRules: sharedStopRules,
    regressions: sharedRegressions,
    progressions: sharedProgressions,
  };
}

export function getEnglishExerciseContent(exercise: Exercise): ExerciseDisplayFields {
  const fallback = getFallbackContent(exercise);
  const content = exerciseEnglishContent[exercise.id] ?? {};

  return {
    ...fallback,
    ...content,
    cautions: content.cautions ?? sharedCautions[exercise.bodyArea],
    stopRules: content.stopRules ?? sharedStopRules,
    regressions: content.regressions ?? sharedRegressions,
    progressions: content.progressions ?? sharedProgressions,
  };
}
