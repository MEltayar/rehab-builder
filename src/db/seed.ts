import { db } from './schema';
import type { Exercise, Template } from '../types';

const SEED_EXERCISES: Exercise[] = [
  // ── MOBILITY ─────────────────────────────────────────────────────────────
  {
    id: 'ex-mob-001', name: 'Shoulder Pendulum', category: 'mobility',
    description: 'Lean forward with arm hanging, gently swing arm in small circles to decompress the shoulder joint.',
    videoUrl: '', tags: ['shoulder'], progressionLevel: 'beginner',
    createdAt: new Date().toISOString(), isCustom: false, notes: 'Keep neck relaxed',
  },
  {
    id: 'ex-mob-002', name: 'Shoulder Circles (Active)', category: 'mobility',
    description: 'Stand tall, raise arms and perform large controlled circles forward and backward.',
    videoUrl: '', tags: ['shoulder'], progressionLevel: 'intermediate',
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-mob-003', name: 'Thoracic Rotation (Seated)', category: 'mobility',
    description: 'Sit upright, hands behind head, rotate upper trunk left and right while keeping hips stable.',
    videoUrl: '', tags: ['posture', 'back'], progressionLevel: 'beginner',
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-mob-004', name: 'Cat-Camel', category: 'mobility',
    description: 'On all fours, alternate between arching back up (cat) and letting it sag (camel) rhythmically.',
    videoUrl: '', tags: ['back', 'posture'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-mob-005', name: 'Cervical AROM', category: 'mobility',
    description: 'Gently move head through full range: flexion, extension, lateral bend, and rotation.',
    videoUrl: '', tags: ['neck', 'cervical'],
    createdAt: new Date().toISOString(), isCustom: false, notes: 'Slow and controlled movements only',
  },
  {
    id: 'ex-mob-006', name: 'Hip 90/90 Stretch', category: 'mobility',
    description: 'Sit with front and back legs at 90°, gently lean forward over front shin for hip mobility.',
    videoUrl: '', tags: ['hip', 'knee'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-mob-007', name: 'Ankle Circles', category: 'mobility',
    description: 'Seated or lying, perform large controlled circles with the ankle in both directions.',
    videoUrl: '', tags: ['ankle', 'knee'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-mob-008', name: 'Wrist Flexion/Extension', category: 'mobility',
    description: 'Extend arm forward, gently pull fingers back (extension) then down (flexion) with other hand.',
    videoUrl: '', tags: ['wrist', 'elbow'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-mob-009', name: 'Thoracic Extension Over Roll', category: 'mobility',
    description: 'Place foam roller under mid-back, support head, and extend over the roller to open thoracic spine.',
    videoUrl: '', tags: ['back', 'posture', 'shoulder'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-mob-010', name: 'Cervical Retraction (Chin Tuck)', category: 'mobility',
    description: 'Draw chin straight back to create a "double chin" — corrects forward head posture.',
    videoUrl: '', tags: ['neck', 'cervical', 'posture'],
    createdAt: new Date().toISOString(), isCustom: false,
  },

  // ── STABILITY ─────────────────────────────────────────────────────────────
  {
    id: 'ex-stab-001', name: 'Dead Bug', category: 'stability',
    description: 'Lying on back, arms up and knees at 90°. Slowly lower opposite arm and leg while keeping lower back flat.',
    videoUrl: '', tags: ['back', 'posture'], progressionLevel: 'intermediate',
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-stab-002', name: 'Bird Dog', category: 'stability',
    description: 'On all fours, extend opposite arm and leg simultaneously, hold briefly, then return.',
    videoUrl: '', tags: ['back', 'posture'], progressionLevel: 'beginner',
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-stab-003', name: 'Scapular Wall Slides', category: 'stability',
    description: 'Stand with back to wall, arms at 90°, slowly slide arms up overhead keeping contact with wall.',
    videoUrl: '', tags: ['shoulder', 'posture'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-stab-004', name: 'Single Leg Stance', category: 'stability',
    description: 'Stand on one leg, maintain balance for set time. Progress by closing eyes or standing on foam.',
    videoUrl: '', tags: ['knee', 'ankle', 'athlete'], progressionLevel: 'beginner',
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-stab-005', name: 'Pallof Press', category: 'stability',
    description: 'Standing sideways to resistance band anchor, press band straight out from chest, resist rotation.',
    videoUrl: '', tags: ['back', 'athlete'], progressionLevel: 'intermediate',
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-stab-006', name: 'Prone Plank', category: 'stability',
    description: 'Forearm plank, maintain neutral spine, activate core and glutes throughout hold.',
    videoUrl: '', tags: ['back', 'posture'], progressionLevel: 'beginner',
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-stab-007', name: 'Side Plank', category: 'stability',
    description: 'Lie on side, raise body onto forearm and feet edge, maintain straight line from head to heels.',
    videoUrl: '', tags: ['back', 'hip'], progressionLevel: 'intermediate',
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-stab-008', name: 'Scapular Push-Up', category: 'stability',
    description: 'In push-up position, protract and retract scapulae without bending elbows — "serratus push-up".',
    videoUrl: '', tags: ['shoulder'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-stab-009', name: 'Clamshell', category: 'stability',
    description: 'Lie on side with knees bent, keep feet together and rotate top knee upward like a clamshell.',
    videoUrl: '', tags: ['hip', 'knee'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-stab-010', name: 'Y Balance Reach', category: 'stability',
    description: 'Single leg stance, reach other foot in anterior, posteromedial, and posterolateral directions.',
    videoUrl: '', tags: ['knee', 'ankle', 'athlete'], progressionLevel: 'advanced',
    createdAt: new Date().toISOString(), isCustom: false,
  },

  // ── STRENGTH ─────────────────────────────────────────────────────────────
  {
    id: 'ex-str-001', name: 'Side-Lying External Rotation', category: 'strength',
    description: 'Lie on side with elbow at 90°, rotate forearm upward against gravity or resistance band.',
    videoUrl: '', tags: ['shoulder'], progressionLevel: 'beginner',
    createdAt: new Date().toISOString(), isCustom: false, notes: 'Keep elbow tucked to side',
  },
  {
    id: 'ex-str-002', name: 'Prone Y/T/W', category: 'strength',
    description: 'Lying face down, raise arms into Y, T, and W positions to activate lower trap and rhomboids.',
    videoUrl: '', tags: ['shoulder', 'posture'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-str-003', name: 'Glute Bridge', category: 'strength',
    description: 'Lying on back, feet flat, push hips upward by squeezing glutes, hold at top.',
    videoUrl: '', tags: ['hip', 'back', 'knee'], progressionLevel: 'beginner',
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-str-004', name: 'Terminal Knee Extension (TKE)', category: 'strength',
    description: 'Band around back of knee, stand with slight bend, straighten knee against band resistance.',
    videoUrl: '', tags: ['knee'], progressionLevel: 'beginner',
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-str-005', name: 'Shoulder External Rotation (Band)', category: 'strength',
    description: 'Elbow at 90°, band attached laterally, rotate forearm outward away from body.',
    videoUrl: '', tags: ['shoulder'], progressionLevel: 'intermediate',
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-str-006', name: 'Prone Hip Extension', category: 'strength',
    description: 'Lying face down, squeeze glute and lift one leg keeping knee straight.',
    videoUrl: '', tags: ['hip', 'back'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-str-007', name: 'Wall Push-Up', category: 'strength',
    description: 'Hands on wall at shoulder height, perform push-up motion — early-stage shoulder strengthening.',
    videoUrl: '', tags: ['shoulder'], progressionLevel: 'beginner',
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-str-008', name: 'Sidelying Hip Abduction', category: 'strength',
    description: 'Lie on side, raise top leg straight upward, slow and controlled, squeeze glute med.',
    videoUrl: '', tags: ['hip', 'knee'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-str-009', name: 'Quadruped Hip Extension', category: 'strength',
    description: 'On all fours, extend one hip straight back keeping knee bent at 90°.',
    videoUrl: '', tags: ['hip', 'back'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-str-010', name: 'Serratus Anterior Activation', category: 'strength',
    description: 'Supine, arm at 90°, punch fist toward ceiling — activates serratus anterior for scapular control.',
    videoUrl: '', tags: ['shoulder'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-str-011', name: 'Step-Up', category: 'strength',
    description: 'Step onto a box or step with one foot, drive through heel to stand up, control descent.',
    videoUrl: '', tags: ['knee', 'hip', 'athlete'], progressionLevel: 'intermediate',
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-str-012', name: 'Romanian Deadlift (Single Leg)', category: 'strength',
    description: 'Balance on one leg, hinge at hip to lower torso while extending other leg behind.',
    videoUrl: '', tags: ['hip', 'back', 'athlete'], progressionLevel: 'advanced',
    createdAt: new Date().toISOString(), isCustom: false,
  },

  // ── STRETCHING ─────────────────────────────────────────────────────────────
  {
    id: 'ex-str-s001', name: 'Pec Stretch (Doorway)', category: 'stretching',
    description: 'Stand in doorway, arms at 90°, lean gently forward to stretch chest and anterior shoulder.',
    videoUrl: '', tags: ['shoulder', 'posture'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-str-s002', name: 'Sleeper Stretch', category: 'stretching',
    description: 'Lie on side on affected shoulder, use other hand to gently push forearm toward bed.',
    videoUrl: '', tags: ['shoulder'], notes: 'Stop if sharp pain',
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-str-s003', name: 'Piriformis Stretch', category: 'stretching',
    description: 'Lying on back, cross affected ankle over opposite knee, gently pull both toward chest.',
    videoUrl: '', tags: ['hip', 'back'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-str-s004', name: 'Hip Flexor Stretch (Kneeling)', category: 'stretching',
    description: 'Half-kneeling, push hips forward gently until stretch is felt in front of back hip.',
    videoUrl: '', tags: ['hip', 'back', 'posture'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-str-s005', name: 'Suboccipital Release', category: 'stretching',
    description: 'Lie on back, gently nod chin toward chest to stretch muscles at base of skull.',
    videoUrl: '', tags: ['neck', 'cervical', 'posture'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-str-s006', name: 'Hamstring Stretch (Supine)', category: 'stretching',
    description: 'Lying on back, raise one leg straight using a strap or towel around foot.',
    videoUrl: '', tags: ['knee', 'back'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-str-s007', name: 'Cross-Body Shoulder Stretch', category: 'stretching',
    description: 'Pull one arm across chest with other arm to stretch posterior shoulder capsule.',
    videoUrl: '', tags: ['shoulder'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-str-s008', name: 'Calf Stretch (Wall)', category: 'stretching',
    description: 'Hands on wall, step one foot back, press heel to floor — stretch calf and Achilles.',
    videoUrl: '', tags: ['ankle', 'knee'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-str-s009', name: 'Upper Trapezius Stretch', category: 'stretching',
    description: 'Tilt ear to shoulder, gently apply light pressure with same-side hand, hold.',
    videoUrl: '', tags: ['neck', 'cervical', 'shoulder'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-str-s010', name: 'Lumbar Rotation Stretch', category: 'stretching',
    description: 'Lie on back, bring knees to chest then drop both knees to one side — gentle spinal rotation.',
    videoUrl: '', tags: ['back'],
    createdAt: new Date().toISOString(), isCustom: false,
  },

  // ── BALANCE ─────────────────────────────────────────────────────────────
  {
    id: 'ex-bal-001', name: 'Tandem Stance', category: 'balance',
    description: 'Stand with one foot directly in front of the other (heel-to-toe), hold for set time.',
    videoUrl: '', tags: ['ankle', 'knee'], progressionLevel: 'beginner',
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-bal-002', name: 'Single Leg Stance (Eyes Closed)', category: 'balance',
    description: 'Stand on one leg with eyes closed to increase proprioceptive challenge.',
    videoUrl: '', tags: ['knee', 'ankle', 'athlete'], progressionLevel: 'intermediate',
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-bal-003', name: 'Bosu Balance', category: 'balance',
    description: 'Stand on BOSU ball dome-side up, maintain balance, progress to eyes closed.',
    videoUrl: '', tags: ['knee', 'ankle', 'athlete'], progressionLevel: 'advanced',
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-bal-004', name: 'Weight Shifting', category: 'balance',
    description: 'Stand with feet shoulder-width, slowly shift weight side-to-side and front-to-back.',
    videoUrl: '', tags: ['knee', 'hip', 'ankle'], progressionLevel: 'beginner',
    createdAt: new Date().toISOString(), isCustom: false,
  },

  // ── FUNCTIONAL ─────────────────────────────────────────────────────────────
  {
    id: 'ex-func-001', name: 'Sit to Stand', category: 'functional',
    description: 'Rise from chair to standing using proper mechanics — push through heels, no arm assist.',
    videoUrl: '', tags: ['knee', 'hip'], progressionLevel: 'beginner',
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-func-002', name: 'Mini Squat', category: 'functional',
    description: 'Partial squat to ~30-40°, maintain neutral spine and knee tracking over toes.',
    videoUrl: '', tags: ['knee', 'hip', 'athlete'], progressionLevel: 'beginner',
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-func-003', name: 'Overhead Reach', category: 'functional',
    description: 'Reach both arms overhead in a controlled arc, maintain lumbar neutral.',
    videoUrl: '', tags: ['shoulder', 'back'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-func-004', name: 'Lateral Step', category: 'functional',
    description: 'Step sideways with one foot, follow with other, maintain slight hip/knee bend throughout.',
    videoUrl: '', tags: ['hip', 'knee', 'athlete'],
    createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'ex-func-005', name: 'Stair Climbing', category: 'functional',
    description: 'Step up and down stairs with controlled movement, focusing on quad control on descent.',
    videoUrl: '', tags: ['knee', 'hip', 'athlete'], progressionLevel: 'intermediate',
    createdAt: new Date().toISOString(), isCustom: false,
  },
];

// Helper: build a session from exercise IDs
function makeSession(id: string, label: string, exerciseIds: string[]) {
  return {
    id,
    label,
    exercises: exerciseIds.map((exId, index) => ({
      id: `${id}-pe-${index}`,
      exerciseId: exId,
      sets: 3,
      reps: '10',
      order: index,
    })),
  };
}

const SEED_TEMPLATES: Template[] = [
  {
    id: 'tmpl-001',
    name: 'Shoulder Impingement',
    condition: 'Shoulder Impingement Syndrome',
    tags: ['shoulder'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-001-s1', 'Day 1 — Mobility', ['ex-mob-001', 'ex-mob-002', 'ex-str-s001', 'ex-mob-009']),
      makeSession('tmpl-001-s2', 'Day 2 — Stability', ['ex-stab-003', 'ex-stab-008', 'ex-stab-006', 'ex-str-010']),
      makeSession('tmpl-001-s3', 'Day 3 — Strengthening', ['ex-str-001', 'ex-str-002', 'ex-str-005', 'ex-str-007']),
    ],
  },
  {
    id: 'tmpl-002',
    name: 'Rotator Cuff Rehabilitation',
    condition: 'Rotator Cuff Tear / Post-op',
    tags: ['shoulder'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-002-s1', 'Phase 1 — Early', ['ex-mob-001', 'ex-str-s001', 'ex-str-s002', 'ex-str-s007']),
      makeSession('tmpl-002-s2', 'Phase 2 — Mid', ['ex-stab-003', 'ex-str-001', 'ex-str-005', 'ex-str-010']),
      makeSession('tmpl-002-s3', 'Phase 3 — Late', ['ex-str-002', 'ex-stab-008', 'ex-func-003', 'ex-str-007']),
    ],
  },
  {
    id: 'tmpl-003',
    name: 'Lower Back Pain',
    condition: 'Non-specific Lower Back Pain',
    tags: ['back', 'posture'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-003-s1', 'Day 1 — Mobility & Flexibility', ['ex-mob-004', 'ex-mob-003', 'ex-str-s004', 'ex-str-s010']),
      makeSession('tmpl-003-s2', 'Day 2 — Core & Stability', ['ex-stab-001', 'ex-stab-002', 'ex-stab-006', 'ex-stab-007']),
      makeSession('tmpl-003-s3', 'Day 3 — Strengthening', ['ex-str-003', 'ex-str-006', 'ex-str-009', 'ex-stab-005']),
    ],
  },
  {
    id: 'tmpl-004',
    name: 'Knee Rehabilitation',
    condition: 'Knee Pain / Post-op / Patellofemoral',
    tags: ['knee', 'athlete'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-004-s1', 'Day 1 — ROM & Quad', ['ex-mob-007', 'ex-str-004', 'ex-str-s006', 'ex-bal-004']),
      makeSession('tmpl-004-s2', 'Day 2 — Strength', ['ex-str-003', 'ex-str-008', 'ex-str-011', 'ex-func-002']),
      makeSession('tmpl-004-s3', 'Day 3 — Proprioception', ['ex-stab-004', 'ex-bal-001', 'ex-bal-002', 'ex-func-005']),
    ],
  },
  {
    id: 'tmpl-005',
    name: 'Cervical Spine Program',
    condition: 'Cervical Spondylosis / Neck Pain',
    tags: ['neck', 'cervical', 'posture'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-005-s1', 'Day 1 — Mobility', ['ex-mob-005', 'ex-mob-010', 'ex-str-s005', 'ex-str-s009']),
      makeSession('tmpl-005-s2', 'Day 2 — Stabilization', ['ex-stab-003', 'ex-str-002', 'ex-mob-003', 'ex-stab-006']),
    ],
  },

  // ── SHOULDER (additional) ─────────────────────────────────────────────────
  {
    id: 'tmpl-006',
    name: 'Frozen Shoulder',
    condition: 'Adhesive Capsulitis',
    tags: ['shoulder'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-006-s1', 'Phase 1 — Mobility', ['ex-mob-001', 'ex-mob-002', 'ex-str-s002', 'ex-str-s007']),
      makeSession('tmpl-006-s2', 'Phase 2 — Strengthening', ['ex-str-001', 'ex-str-005', 'ex-stab-003', 'ex-func-003']),
    ],
  },
  {
    id: 'tmpl-007',
    name: 'AC Joint Sprain',
    condition: 'Acromioclavicular Joint Injury',
    tags: ['shoulder'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-007-s1', 'Early Phase — Gentle Mobility', ['ex-mob-001', 'ex-str-s001', 'ex-str-s007', 'ex-mob-009']),
      makeSession('tmpl-007-s2', 'Late Phase — Strengthening', ['ex-stab-003', 'ex-str-001', 'ex-str-007', 'ex-stab-008']),
    ],
  },
  {
    id: 'tmpl-008',
    name: 'Shoulder Instability',
    condition: 'Glenohumeral Instability',
    tags: ['shoulder'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-008-s1', 'Day 1 — Scapular Control', ['ex-stab-003', 'ex-stab-008', 'ex-str-010', 'ex-str-002']),
      makeSession('tmpl-008-s2', 'Day 2 — Rotator Cuff', ['ex-str-001', 'ex-str-005', 'ex-str-s001', 'ex-str-s002']),
      makeSession('tmpl-008-s3', 'Day 3 — Functional', ['ex-func-003', 'ex-stab-005', 'ex-mob-002', 'ex-mob-009']),
    ],
  },
  {
    id: 'tmpl-009',
    name: 'Bicep Tendinopathy',
    condition: 'Proximal Bicep Tendinopathy',
    tags: ['shoulder'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-009-s1', 'Day 1 — Mobility & Stretching', ['ex-mob-001', 'ex-str-s001', 'ex-str-s002', 'ex-mob-008']),
      makeSession('tmpl-009-s2', 'Day 2 — Strengthening', ['ex-str-001', 'ex-str-005', 'ex-stab-003', 'ex-str-007']),
    ],
  },
  {
    id: 'tmpl-010',
    name: 'Overhead Athlete Shoulder',
    condition: 'Overhead Athlete Shoulder',
    tags: ['shoulder', 'athlete'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-010-s1', 'Day 1 — Mobility', ['ex-mob-001', 'ex-mob-002', 'ex-str-s002', 'ex-mob-009']),
      makeSession('tmpl-010-s2', 'Day 2 — Stability', ['ex-stab-003', 'ex-stab-008', 'ex-str-010', 'ex-stab-005']),
      makeSession('tmpl-010-s3', 'Day 3 — Strength & Power', ['ex-str-001', 'ex-str-002', 'ex-str-005', 'ex-func-003']),
    ],
  },

  // ── BACK (additional) ─────────────────────────────────────────────────────
  {
    id: 'tmpl-011',
    name: 'Lumbar Disc Herniation',
    condition: 'Lumbar Disc Herniation / Sciatica',
    tags: ['back'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-011-s1', 'Phase 1 — Mobility & Neural', ['ex-mob-004', 'ex-str-s010', 'ex-str-s006', 'ex-mob-003']),
      makeSession('tmpl-011-s2', 'Phase 2 — Core', ['ex-stab-001', 'ex-stab-002', 'ex-stab-006', 'ex-str-s004']),
      makeSession('tmpl-011-s3', 'Phase 3 — Strengthening', ['ex-str-003', 'ex-str-006', 'ex-str-009', 'ex-stab-007']),
    ],
  },
  {
    id: 'tmpl-012',
    name: 'Sacroiliac Joint Dysfunction',
    condition: 'Sacroiliac Joint Pain',
    tags: ['back', 'hip'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-012-s1', 'Day 1 — Mobility & Stretching', ['ex-mob-006', 'ex-str-s003', 'ex-str-s004', 'ex-str-s010']),
      makeSession('tmpl-012-s2', 'Day 2 — Stability', ['ex-stab-001', 'ex-stab-002', 'ex-stab-009', 'ex-str-003']),
    ],
  },
  {
    id: 'tmpl-013',
    name: 'Thoracic Kyphosis',
    condition: 'Thoracic Kyphosis / Posture',
    tags: ['back', 'posture'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-013-s1', 'Day 1 — Mobility', ['ex-mob-009', 'ex-mob-003', 'ex-str-s001', 'ex-mob-004']),
      makeSession('tmpl-013-s2', 'Day 2 — Strengthening', ['ex-str-002', 'ex-stab-003', 'ex-stab-006', 'ex-stab-008']),
    ],
  },
  {
    id: 'tmpl-014',
    name: 'Facet Joint Syndrome',
    condition: 'Lumbar Facet Joint Syndrome',
    tags: ['back'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-014-s1', 'Day 1 — Mobility', ['ex-mob-004', 'ex-mob-003', 'ex-str-s010', 'ex-str-s004']),
      makeSession('tmpl-014-s2', 'Day 2 — Core Stability', ['ex-stab-001', 'ex-stab-002', 'ex-stab-006', 'ex-stab-005']),
    ],
  },
  {
    id: 'tmpl-015',
    name: 'Spinal Stenosis',
    condition: 'Lumbar Spinal Stenosis',
    tags: ['back'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-015-s1', 'Day 1 — Flexion & Core', ['ex-mob-004', 'ex-stab-001', 'ex-stab-002', 'ex-str-s010']),
      makeSession('tmpl-015-s2', 'Day 2 — Strength & Function', ['ex-str-003', 'ex-func-001', 'ex-bal-004', 'ex-stab-006']),
    ],
  },
  {
    id: 'tmpl-016',
    name: 'Scoliosis Postural Program',
    condition: 'Scoliosis (Mild / Postural)',
    tags: ['back', 'posture'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-016-s1', 'Day 1 — Mobility', ['ex-mob-003', 'ex-mob-009', 'ex-str-s010', 'ex-mob-004']),
      makeSession('tmpl-016-s2', 'Day 2 — Stability', ['ex-stab-001', 'ex-stab-006', 'ex-stab-007', 'ex-str-002']),
    ],
  },
  {
    id: 'tmpl-017',
    name: 'Thoracic Spine Mobility',
    condition: 'Thoracic Mobility Program',
    tags: ['back', 'posture'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-017-s1', 'Mobility Session', ['ex-mob-009', 'ex-mob-003', 'ex-mob-004', 'ex-str-s010']),
      makeSession('tmpl-017-s2', 'Stability Session', ['ex-stab-003', 'ex-str-002', 'ex-stab-006', 'ex-stab-008']),
    ],
  },

  // ── NECK (additional) ────────────────────────────────────────────────────
  {
    id: 'tmpl-018',
    name: 'Whiplash Rehabilitation',
    condition: 'Cervical Whiplash (WAD II)',
    tags: ['neck', 'cervical'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-018-s1', 'Phase 1 — Gentle Mobility', ['ex-mob-005', 'ex-mob-010', 'ex-str-s005', 'ex-str-s009']),
      makeSession('tmpl-018-s2', 'Phase 2 — Stabilization', ['ex-stab-003', 'ex-mob-003', 'ex-str-002', 'ex-stab-006']),
      makeSession('tmpl-018-s3', 'Phase 3 — Strengthening', ['ex-stab-001', 'ex-stab-002', 'ex-str-s001', 'ex-func-003']),
    ],
  },
  {
    id: 'tmpl-019',
    name: 'Cervicogenic Headache',
    condition: 'Cervicogenic Headache',
    tags: ['neck', 'cervical', 'posture'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-019-s1', 'Day 1 — Suboccipital & Mobility', ['ex-str-s005', 'ex-mob-010', 'ex-mob-005', 'ex-str-s009']),
      makeSession('tmpl-019-s2', 'Day 2 — Posture & Stability', ['ex-mob-003', 'ex-stab-003', 'ex-str-002', 'ex-stab-006']),
    ],
  },
  {
    id: 'tmpl-020',
    name: 'Cervical Radiculopathy',
    condition: 'Cervical Radiculopathy (Arm Pain)',
    tags: ['neck', 'cervical'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-020-s1', 'Day 1 — Neural Mobility', ['ex-mob-005', 'ex-mob-008', 'ex-str-s009', 'ex-mob-010']),
      makeSession('tmpl-020-s2', 'Day 2 — Stabilization', ['ex-stab-003', 'ex-str-002', 'ex-stab-006', 'ex-mob-003']),
    ],
  },

  // ── HIP ───────────────────────────────────────────────────────────────────
  {
    id: 'tmpl-021',
    name: 'Hip Osteoarthritis',
    condition: 'Hip Osteoarthritis',
    tags: ['hip'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-021-s1', 'Day 1 — Mobility', ['ex-mob-006', 'ex-str-s003', 'ex-str-s004', 'ex-mob-007']),
      makeSession('tmpl-021-s2', 'Day 2 — Strengthening', ['ex-str-003', 'ex-str-008', 'ex-str-006', 'ex-str-009']),
      makeSession('tmpl-021-s3', 'Day 3 — Balance & Function', ['ex-bal-004', 'ex-stab-004', 'ex-func-001', 'ex-func-002']),
    ],
  },
  {
    id: 'tmpl-022',
    name: 'Hip Labral Tear',
    condition: 'Hip Labral Tear / FAI',
    tags: ['hip'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-022-s1', 'Phase 1 — Mobility', ['ex-mob-006', 'ex-str-s003', 'ex-str-s004', 'ex-str-s010']),
      makeSession('tmpl-022-s2', 'Phase 2 — Stability & Strength', ['ex-stab-009', 'ex-str-008', 'ex-str-003', 'ex-stab-004']),
    ],
  },
  {
    id: 'tmpl-023',
    name: 'Post Hip Replacement',
    condition: 'Total Hip Replacement Post-op',
    tags: ['hip'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-023-s1', 'Week 1–2 — Early Mobility', ['ex-mob-006', 'ex-mob-007', 'ex-str-s003', 'ex-bal-004']),
      makeSession('tmpl-023-s2', 'Week 3–4 — Strengthening', ['ex-str-003', 'ex-str-006', 'ex-str-008', 'ex-str-009']),
      makeSession('tmpl-023-s3', 'Week 5–6 — Function', ['ex-func-001', 'ex-stab-004', 'ex-bal-001', 'ex-func-002']),
    ],
  },
  {
    id: 'tmpl-024',
    name: 'Greater Trochanteric Pain',
    condition: 'Greater Trochanteric Pain Syndrome',
    tags: ['hip'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-024-s1', 'Day 1 — Load Management', ['ex-stab-009', 'ex-str-008', 'ex-str-003', 'ex-str-s003']),
      makeSession('tmpl-024-s2', 'Day 2 — Progressive Strength', ['ex-str-006', 'ex-stab-004', 'ex-str-012', 'ex-func-001']),
    ],
  },
  {
    id: 'tmpl-025',
    name: 'Hip Flexor Strain',
    condition: 'Hip Flexor / Iliopsoas Strain',
    tags: ['hip'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-025-s1', 'Day 1 — Stretching', ['ex-str-s004', 'ex-mob-006', 'ex-str-s003', 'ex-str-s010']),
      makeSession('tmpl-025-s2', 'Day 2 — Strengthening', ['ex-str-003', 'ex-str-006', 'ex-str-009', 'ex-stab-002']),
    ],
  },

  // ── KNEE (additional) ─────────────────────────────────────────────────────
  {
    id: 'tmpl-026',
    name: 'ACL Rehabilitation Phase 1',
    condition: 'ACL Reconstruction — Early Phase',
    tags: ['knee', 'athlete'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-026-s1', 'Week 1–2 — Swelling & ROM', ['ex-mob-007', 'ex-str-004', 'ex-str-s006', 'ex-bal-004']),
      makeSession('tmpl-026-s2', 'Week 3–4 — Quad Activation', ['ex-str-003', 'ex-str-004', 'ex-func-001', 'ex-stab-006']),
      makeSession('tmpl-026-s3', 'Week 5–6 — Strength', ['ex-str-011', 'ex-func-002', 'ex-stab-004', 'ex-bal-001']),
    ],
  },
  {
    id: 'tmpl-027',
    name: 'ACL Rehabilitation Phase 2',
    condition: 'ACL Reconstruction — Late Phase',
    tags: ['knee', 'athlete'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-027-s1', 'Strength Phase', ['ex-str-011', 'ex-str-012', 'ex-func-002', 'ex-stab-004']),
      makeSession('tmpl-027-s2', 'Proprioception Phase', ['ex-bal-002', 'ex-bal-003', 'ex-stab-010', 'ex-func-005']),
      makeSession('tmpl-027-s3', 'Return to Sport Phase', ['ex-func-004', 'ex-func-005', 'ex-bal-003', 'ex-stab-010']),
    ],
  },
  {
    id: 'tmpl-028',
    name: 'Meniscus Rehabilitation',
    condition: 'Meniscus Repair / Conservative Mgmt',
    tags: ['knee'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-028-s1', 'Phase 1 — ROM & Quad', ['ex-mob-007', 'ex-str-004', 'ex-str-003', 'ex-str-s006']),
      makeSession('tmpl-028-s2', 'Phase 2 — Strength & Balance', ['ex-str-011', 'ex-stab-004', 'ex-bal-001', 'ex-func-002']),
    ],
  },
  {
    id: 'tmpl-029',
    name: 'Total Knee Replacement Post-op',
    condition: 'TKR Post-operative Rehabilitation',
    tags: ['knee'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-029-s1', 'Week 1–2 — Early ROM', ['ex-mob-007', 'ex-str-004', 'ex-str-s006', 'ex-bal-004']),
      makeSession('tmpl-029-s2', 'Week 3–4 — Strengthening', ['ex-str-003', 'ex-str-008', 'ex-func-001', 'ex-str-011']),
      makeSession('tmpl-029-s3', 'Week 5–6 — Function', ['ex-func-002', 'ex-func-005', 'ex-bal-001', 'ex-stab-004']),
    ],
  },
  {
    id: 'tmpl-030',
    name: 'IT Band Syndrome',
    condition: 'Iliotibial Band Syndrome',
    tags: ['knee', 'athlete'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-030-s1', 'Day 1 — Stretching & Mobility', ['ex-str-s003', 'ex-mob-006', 'ex-str-s006', 'ex-str-s004']),
      makeSession('tmpl-030-s2', 'Day 2 — Hip Strengthening', ['ex-str-008', 'ex-stab-009', 'ex-str-006', 'ex-stab-004']),
    ],
  },
  {
    id: 'tmpl-031',
    name: 'Patellar Tendinopathy',
    condition: 'Patellar Tendinopathy / Jumper\'s Knee',
    tags: ['knee', 'athlete'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-031-s1', 'Day 1 — Isometric Load', ['ex-str-004', 'ex-str-003', 'ex-str-s006', 'ex-bal-004']),
      makeSession('tmpl-031-s2', 'Day 2 — Isotonic Progression', ['ex-str-011', 'ex-func-002', 'ex-stab-004', 'ex-func-005']),
    ],
  },

  // ── ANKLE / FOOT ──────────────────────────────────────────────────────────
  {
    id: 'tmpl-032',
    name: 'Ankle Sprain',
    condition: 'Lateral Ankle Sprain (Grade 1–2)',
    tags: ['ankle'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-032-s1', 'Phase 1 — ROM & Mobility', ['ex-mob-007', 'ex-str-s008', 'ex-bal-004', 'ex-str-s006']),
      makeSession('tmpl-032-s2', 'Phase 2 — Strength', ['ex-str-003', 'ex-str-008', 'ex-func-001', 'ex-stab-004']),
      makeSession('tmpl-032-s3', 'Phase 3 — Proprioception', ['ex-bal-001', 'ex-bal-002', 'ex-stab-010', 'ex-func-004']),
    ],
  },
  {
    id: 'tmpl-033',
    name: 'Achilles Tendinopathy',
    condition: 'Achilles Tendinopathy',
    tags: ['ankle'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-033-s1', 'Day 1 — Stretching & Load', ['ex-str-s008', 'ex-mob-007', 'ex-str-004', 'ex-bal-004']),
      makeSession('tmpl-033-s2', 'Day 2 — Progressive Strength', ['ex-str-003', 'ex-stab-004', 'ex-func-001', 'ex-func-005']),
    ],
  },
  {
    id: 'tmpl-034',
    name: 'Plantar Fasciitis',
    condition: 'Plantar Fasciitis',
    tags: ['ankle'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-034-s1', 'Day 1 — Stretching', ['ex-str-s008', 'ex-str-s006', 'ex-mob-007', 'ex-str-s003']),
      makeSession('tmpl-034-s2', 'Day 2 — Strengthening', ['ex-str-003', 'ex-stab-004', 'ex-func-001', 'ex-bal-001']),
    ],
  },
  {
    id: 'tmpl-035',
    name: 'Post Ankle Surgery',
    condition: 'Ankle Surgery Post-op (ATFL/OCD)',
    tags: ['ankle'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-035-s1', 'Week 1–2 — Early ROM', ['ex-mob-007', 'ex-bal-004', 'ex-str-s008', 'ex-str-004']),
      makeSession('tmpl-035-s2', 'Week 3–4 — Strength', ['ex-str-003', 'ex-str-008', 'ex-stab-004', 'ex-func-001']),
      makeSession('tmpl-035-s3', 'Week 5–6 — Balance & Function', ['ex-bal-001', 'ex-bal-002', 'ex-func-004', 'ex-func-005']),
    ],
  },

  // ── POSTURE / GENERAL ─────────────────────────────────────────────────────
  {
    id: 'tmpl-036',
    name: 'Postural Correction',
    condition: 'General Postural Correction',
    tags: ['posture'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-036-s1', 'Day 1 — Mobility', ['ex-mob-009', 'ex-mob-003', 'ex-mob-010', 'ex-str-s001']),
      makeSession('tmpl-036-s2', 'Day 2 — Strengthening', ['ex-str-002', 'ex-stab-003', 'ex-stab-006', 'ex-stab-008']),
    ],
  },
  {
    id: 'tmpl-037',
    name: 'Forward Head Posture',
    condition: 'Forward Head Posture',
    tags: ['neck', 'posture'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-037-s1', 'Day 1 — Mobility', ['ex-mob-010', 'ex-mob-005', 'ex-str-s005', 'ex-mob-003']),
      makeSession('tmpl-037-s2', 'Day 2 — Strengthening', ['ex-stab-003', 'ex-str-002', 'ex-stab-006', 'ex-mob-009']),
    ],
  },
  {
    id: 'tmpl-038',
    name: 'Rounded Shoulders',
    condition: 'Rounded Shoulders / Pec Tightness',
    tags: ['shoulder', 'posture'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-038-s1', 'Day 1 — Stretching', ['ex-str-s001', 'ex-mob-009', 'ex-str-s002', 'ex-mob-003']),
      makeSession('tmpl-038-s2', 'Day 2 — Strengthening', ['ex-stab-003', 'ex-str-002', 'ex-stab-008', 'ex-str-010']),
    ],
  },
  {
    id: 'tmpl-039',
    name: 'Office Worker Program',
    condition: 'Sedentary / Office Worker Syndrome',
    tags: ['posture', 'back', 'neck'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-039-s1', 'Daily Mobility Routine', ['ex-mob-010', 'ex-mob-003', 'ex-mob-004', 'ex-mob-008']),
      makeSession('tmpl-039-s2', 'Strengthening Routine', ['ex-str-002', 'ex-stab-003', 'ex-stab-006', 'ex-stab-001']),
    ],
  },
  {
    id: 'tmpl-040',
    name: 'Thoracic Outlet Syndrome',
    condition: 'Thoracic Outlet Syndrome',
    tags: ['shoulder', 'neck', 'posture'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-040-s1', 'Day 1 — Mobility', ['ex-mob-009', 'ex-str-s001', 'ex-mob-005', 'ex-str-s009']),
      makeSession('tmpl-040-s2', 'Day 2 — Posture & Strength', ['ex-stab-003', 'ex-str-002', 'ex-mob-010', 'ex-stab-008']),
    ],
  },
  {
    id: 'tmpl-041',
    name: 'General Mobility & Flexibility',
    condition: 'General Mobility Maintenance',
    tags: ['posture'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-041-s1', 'Full Body Mobility', ['ex-mob-004', 'ex-mob-006', 'ex-mob-009', 'ex-mob-003']),
      makeSession('tmpl-041-s2', 'Full Body Stretching', ['ex-str-s004', 'ex-str-s003', 'ex-str-s010', 'ex-str-s008']),
    ],
  },

  // ── BALANCE / ELDERLY ─────────────────────────────────────────────────────
  {
    id: 'tmpl-042',
    name: 'Fall Prevention',
    condition: 'Fall Prevention (Elderly)',
    tags: ['balance'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-042-s1', 'Day 1 — Balance & Stability', ['ex-bal-001', 'ex-bal-004', 'ex-stab-004', 'ex-func-001']),
      makeSession('tmpl-042-s2', 'Day 2 — Strength', ['ex-str-003', 'ex-str-011', 'ex-func-001', 'ex-func-002']),
    ],
  },
  {
    id: 'tmpl-043',
    name: 'Balance & Coordination',
    condition: 'Balance & Coordination Program',
    tags: ['balance'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-043-s1', 'Day 1 — Static Balance', ['ex-bal-001', 'ex-bal-004', 'ex-stab-004', 'ex-stab-010']),
      makeSession('tmpl-043-s2', 'Day 2 — Dynamic Balance', ['ex-bal-002', 'ex-bal-003', 'ex-func-004', 'ex-func-005']),
    ],
  },
  {
    id: 'tmpl-044',
    name: 'Elderly Strength & Stability',
    condition: 'Elderly Strength & Stability',
    tags: ['balance'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-044-s1', 'Day 1 — Lower Body', ['ex-func-001', 'ex-str-003', 'ex-str-011', 'ex-bal-004']),
      makeSession('tmpl-044-s2', 'Day 2 — Upper Body & Core', ['ex-str-007', 'ex-stab-006', 'ex-stab-001', 'ex-func-003']),
    ],
  },
  {
    id: 'tmpl-045',
    name: 'Return to Activity',
    condition: 'Return to Activity (Post Immobilisation)',
    tags: ['balance'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-045-s1', 'Mobility Restoration', ['ex-mob-007', 'ex-mob-006', 'ex-str-s008', 'ex-str-s006']),
      makeSession('tmpl-045-s2', 'Strength Restoration', ['ex-str-003', 'ex-str-011', 'ex-func-001', 'ex-func-002']),
    ],
  },

  // ── ATHLETIC ──────────────────────────────────────────────────────────────
  {
    id: 'tmpl-046',
    name: 'Return to Sport Phase 1',
    condition: 'Return to Sport — Early Phase',
    tags: ['athlete', 'knee', 'hip'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-046-s1', 'Strength Foundation', ['ex-str-003', 'ex-str-011', 'ex-str-012', 'ex-func-002']),
      makeSession('tmpl-046-s2', 'Balance & Proprioception', ['ex-bal-002', 'ex-stab-010', 'ex-stab-004', 'ex-func-004']),
    ],
  },
  {
    id: 'tmpl-047',
    name: 'Return to Sport Phase 2',
    condition: 'Return to Sport — Late Phase',
    tags: ['athlete', 'knee', 'hip'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-047-s1', 'Power & Agility', ['ex-str-012', 'ex-func-004', 'ex-func-005', 'ex-bal-003']),
      makeSession('tmpl-047-s2', 'Sport-Specific Prep', ['ex-stab-010', 'ex-bal-003', 'ex-func-004', 'ex-str-011']),
    ],
  },
  {
    id: 'tmpl-048',
    name: 'Runner\'s Knee',
    condition: 'Patellofemoral Pain (Runner\'s Knee)',
    tags: ['knee', 'athlete'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-048-s1', 'Day 1 — Hip & Quad Strength', ['ex-str-008', 'ex-stab-009', 'ex-str-003', 'ex-str-s003']),
      makeSession('tmpl-048-s2', 'Day 2 — Biomechanics', ['ex-str-011', 'ex-stab-004', 'ex-func-002', 'ex-func-004']),
    ],
  },
  {
    id: 'tmpl-049',
    name: 'Swimmer\'s Shoulder',
    condition: 'Swimmer\'s Shoulder (Overuse)',
    tags: ['shoulder', 'athlete'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-049-s1', 'Day 1 — Mobility & Flexibility', ['ex-mob-001', 'ex-str-s002', 'ex-str-s007', 'ex-mob-009']),
      makeSession('tmpl-049-s2', 'Day 2 — Stability & Strength', ['ex-stab-003', 'ex-str-001', 'ex-str-005', 'ex-str-010']),
    ],
  },

  // ── SPECIAL CONDITIONS ────────────────────────────────────────────────────
  {
    id: 'tmpl-050',
    name: 'Fibromyalgia Program',
    condition: 'Fibromyalgia — Gentle Rehab',
    tags: ['posture'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-050-s1', 'Gentle Mobility', ['ex-mob-004', 'ex-mob-006', 'ex-str-s010', 'ex-str-s004']),
      makeSession('tmpl-050-s2', 'Gentle Strengthening', ['ex-stab-002', 'ex-stab-006', 'ex-str-003', 'ex-func-001']),
    ],
  },
  {
    id: 'tmpl-051',
    name: 'Pregnancy-Related Back Pain',
    condition: 'Pregnancy-Related Low Back Pain',
    tags: ['back'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-051-s1', 'Day 1 — Mobility', ['ex-mob-004', 'ex-str-s004', 'ex-str-s003', 'ex-mob-006']),
      makeSession('tmpl-051-s2', 'Day 2 — Core & Pelvic Stability', ['ex-stab-001', 'ex-stab-002', 'ex-stab-009', 'ex-stab-006']),
    ],
  },
  {
    id: 'tmpl-052',
    name: 'Post Mastectomy Shoulder',
    condition: 'Post Mastectomy Shoulder Rehab',
    tags: ['shoulder'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-052-s1', 'Phase 1 — Gentle Mobility', ['ex-mob-001', 'ex-str-s001', 'ex-str-s007', 'ex-mob-002']),
      makeSession('tmpl-052-s2', 'Phase 2 — Strengthening', ['ex-stab-003', 'ex-str-001', 'ex-str-007', 'ex-stab-008']),
    ],
  },
  {
    id: 'tmpl-053',
    name: 'Neurological Rehab (Mild)',
    condition: 'Mild Neurological Deficit Rehab',
    tags: ['balance'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-053-s1', 'Day 1 — Balance & Coordination', ['ex-bal-001', 'ex-bal-004', 'ex-func-001', 'ex-stab-004']),
      makeSession('tmpl-053-s2', 'Day 2 — Strength & Function', ['ex-str-003', 'ex-func-002', 'ex-stab-006', 'ex-func-004']),
    ],
  },
  {
    id: 'tmpl-054',
    name: 'Post-COVID Recovery',
    condition: 'Post-COVID Fatigue & Deconditioning',
    tags: ['posture'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-054-s1', 'Phase 1 — Gentle Mobility', ['ex-mob-004', 'ex-mob-003', 'ex-str-s010', 'ex-mob-006']),
      makeSession('tmpl-054-s2', 'Phase 2 — Graduated Strength', ['ex-stab-002', 'ex-stab-006', 'ex-str-003', 'ex-func-001']),
    ],
  },
  {
    id: 'tmpl-055',
    name: 'Wrist & Elbow Program',
    condition: 'Wrist / Elbow Pain (General)',
    tags: ['posture'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    sessions: [
      makeSession('tmpl-055-s1', 'Day 1 — Mobility', ['ex-mob-008', 'ex-str-s009', 'ex-mob-005', 'ex-str-s005']),
      makeSession('tmpl-055-s2', 'Day 2 — Strengthening', ['ex-str-007', 'ex-stab-003', 'ex-str-010', 'ex-str-001']),
    ],
  },
];

export async function seedDatabase() {
  const exerciseCount = await db.exercises.count();
  if (exerciseCount === 0) {
    await db.exercises.bulkAdd(SEED_EXERCISES);
  }

  const seedTemplateExists = await db.templates.get('tmpl-001');
  if (!seedTemplateExists) {
    await db.templates.bulkAdd(SEED_TEMPLATES);
  }

  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({ id: 1, clinicName: 'Rehab Clinic', darkMode: true });
  }
}

export { SEED_EXERCISES, SEED_TEMPLATES };
