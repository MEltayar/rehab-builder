import { supabase } from '../lib/supabase';
import { exerciseToDbRow, templateToDbRow } from '../lib/mappers';
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Run all existence checks in parallel to avoid sequential round-trips
  const [
    { count: exerciseCount },
    { data: existingTemplate },
    { count: subCount },
    { count: settingsCount },
  ] = await Promise.all([
    supabase.from('exercises').select('*', { count: 'exact', head: true }).eq('is_custom', false),
    supabase.from('templates').select('id').eq('id', 'tmpl-001').maybeSingle(),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }),
    supabase.from('settings').select('*', { count: 'exact', head: true }),
  ]);

  // Seed exercises
  if ((exerciseCount ?? 0) === 0) {
    const rows = SEED_EXERCISES.map((ex) => ({ ...exerciseToDbRow(ex), user_id: user.id }));
    for (let i = 0; i < rows.length; i += 100) {
      const { error } = await supabase
        .from('exercises')
        .upsert(rows.slice(i, i + 100), { onConflict: 'id', ignoreDuplicates: true });
      if (error) console.error('Failed to seed exercises:', error);
    }
  }

  // Seed built-in templates
  if (!existingTemplate) {
    const rows = SEED_TEMPLATES.map(templateToDbRow);
    for (let i = 0; i < rows.length; i += 100) {
      const { error } = await supabase
        .from('templates')
        .upsert(rows.slice(i, i + 100), { onConflict: 'id', ignoreDuplicates: true });
      if (error) console.error('Failed to seed templates:', error);
    }
  }

  // Seed subscription (trial)
  if ((subCount ?? 0) === 0) {
    const { error } = await supabase
      .from('subscriptions')
      .upsert({ user_id: user.id }, { onConflict: 'user_id', ignoreDuplicates: true });
    if (error) console.error('Failed to seed subscription:', error);
  }

  // Seed default settings
  if ((settingsCount ?? 0) === 0) {
    const { error } = await supabase
      .from('settings')
      .upsert({ user_id: user.id, clinic_name: 'Rehab Clinic', dark_mode: false }, { onConflict: 'user_id', ignoreDuplicates: true });
    if (error) console.error('Failed to seed settings:', error);
  }
}

// ── GYM / RESISTANCE EXERCISES ────────────────────────────────────────────────

export const GYM_SEED_EXERCISES: Exercise[] = [
  // ── CHEST ──────────────────────────────────────────────────────────────────
  {
    id: 'gym-chest-001', name: 'Barbell Bench Press', category: 'chest',
    description: 'Lie on bench, grip bar just outside shoulder width, lower to chest and press up explosively.',
    videoUrl: 'https://www.youtube.com/watch?v=vcBig73ojpE',
    tags: ['chest', 'compound', 'pushing'], muscleGroup: 'Pectorals', equipment: 'barbell',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-chest-002', name: 'Incline Dumbbell Press', category: 'chest',
    description: 'Set bench to 30–45°, press dumbbells from chest level to full extension targeting upper chest.',
    videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
    tags: ['chest', 'upper chest', 'compound'], muscleGroup: 'Upper Pectorals', equipment: 'dumbbell',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-chest-003', name: 'Push-Up', category: 'chest',
    description: 'Hands shoulder-width apart, lower chest to floor and push back up, keeping body straight.',
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    tags: ['chest', 'bodyweight', 'compound'], muscleGroup: 'Pectorals', equipment: 'bodyweight',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-chest-004', name: 'Cable Chest Fly', category: 'chest',
    description: 'Stand between cables set at mid height, bring hands together in an arc at chest height, squeeze at centre.',
    videoUrl: 'https://www.youtube.com/watch?v=Iwe6AmxVf7o',
    tags: ['chest', 'isolation', 'cable'],
    muscleGroup: 'Pectorals', equipment: 'cable',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-chest-005', name: 'Dips (Chest Focus)', category: 'chest',
    description: 'Lean forward slightly on parallel bars, lower until elbows reach 90°, push back up.',
    videoUrl: 'https://www.youtube.com/watch?v=2z8JmcrW-As',
    tags: ['chest', 'triceps', 'compound', 'bodyweight'],
    muscleGroup: 'Lower Pectorals', equipment: 'bodyweight',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-chest-006', name: 'Dumbbell Flat Bench Press', category: 'chest',
    description: 'Press dumbbells from chest height to full extension on a flat bench, greater range than barbell.',
    videoUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94',
    tags: ['chest', 'compound', 'dumbbell'],
    muscleGroup: 'Pectorals', equipment: 'dumbbell',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-chest-007', name: 'Pec Deck Machine', category: 'chest',
    description: 'Sit at machine, bring arms together in front of chest in a controlled arc.',
    videoUrl: 'https://www.youtube.com/watch?v=Z57CtFmRMxA',
    tags: ['chest', 'isolation', 'machine'],
    muscleGroup: 'Pectorals', equipment: 'machine',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-chest-008', name: 'Decline Barbell Press', category: 'chest',
    description: 'Set bench to −15°, press bar to lower chest, targets lower pec fibres.',
    videoUrl: '',
    tags: ['chest', 'lower chest', 'compound'],
    muscleGroup: 'Lower Pectorals', equipment: 'barbell',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-chest-009', name: 'High-to-Low Cable Fly', category: 'chest',
    description: 'Set cables high, bring hands down and together in front of hips — targets lower pec fibres.',
    videoUrl: 'https://www.youtube.com/watch?v=hhruLxo9yZU',
    tags: ['chest', 'lower chest', 'isolation', 'cable'],
    muscleGroup: 'Lower Pectorals', equipment: 'cable',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-chest-010', name: 'Low-to-High Cable Fly', category: 'chest',
    description: 'Set cables low, bring hands upward and together at chin height — targets upper pec fibres.',
    videoUrl: '',
    tags: ['chest', 'upper chest', 'isolation', 'cable'],
    muscleGroup: 'Upper Pectorals', equipment: 'cable',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-chest-011', name: 'Chest Press Machine', category: 'chest',
    description: 'Sit with back flat against pad, press handles forward until arms are extended, return under control.',
    videoUrl: '',
    tags: ['chest', 'compound', 'machine'],
    muscleGroup: 'Pectorals', equipment: 'machine',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-chest-012', name: 'Smith Machine Bench Press', category: 'chest',
    description: 'Use Smith machine for a guided bench press — good for safety when training alone.',
    videoUrl: '',
    tags: ['chest', 'compound', 'machine'],
    muscleGroup: 'Pectorals', equipment: 'machine',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },

  // ── BACK ───────────────────────────────────────────────────────────────────
  {
    id: 'gym-back-001', name: 'Pull-Up', category: 'back',
    description: 'Hang from bar with overhand grip, pull chest to bar keeping core tight, lower under control.',
    videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    tags: ['back', 'lats', 'compound', 'bodyweight'], muscleGroup: 'Latissimus Dorsi', equipment: 'bodyweight',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-back-002', name: 'Barbell Bent-Over Row', category: 'back',
    description: 'Hinge at hips, pull bar to lower ribcage squeezing shoulder blades, keep back flat.',
    videoUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ',
    tags: ['back', 'compound', 'rowing'], muscleGroup: 'Latissimus Dorsi', equipment: 'barbell',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-back-003', name: 'Lat Pulldown', category: 'back',
    description: 'Grip bar wide, pull to upper chest keeping chest tall, elbows drive down and back.',
    videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
    tags: ['back', 'lats', 'cable'], muscleGroup: 'Latissimus Dorsi', equipment: 'cable',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-back-004', name: 'Seated Cable Row', category: 'back',
    description: 'Pull handle to lower abdomen, squeeze shoulder blades at end, return under control.',
    videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74',
    tags: ['back', 'rowing', 'cable'],
    muscleGroup: 'Rhomboids', equipment: 'cable',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-back-005', name: 'Face Pull', category: 'back',
    description: 'Pull rope attachment toward face with elbows high and wide, externally rotate at end.',
    videoUrl: 'https://www.youtube.com/watch?v=rep-qVOkqgk',
    tags: ['back', 'shoulders', 'rear delt', 'cable'], muscleGroup: 'Rear Deltoids', equipment: 'cable',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-back-006', name: 'Single-Arm Dumbbell Row', category: 'back',
    description: 'Brace one hand on bench, row dumbbell to hip, elbow close to body.',
    videoUrl: 'https://www.youtube.com/watch?v=roCP6wCXPqo',
    tags: ['back', 'rowing', 'unilateral'],
    muscleGroup: 'Latissimus Dorsi', equipment: 'dumbbell',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-back-007', name: 'T-Bar Row', category: 'back',
    description: 'Straddle bar, grip attachment, row to chest keeping back flat and knees soft.',
    videoUrl: 'https://www.youtube.com/watch?v=hYo72r8Ivso',
    tags: ['back', 'compound', 'rowing'],
    muscleGroup: 'Mid Back', equipment: 'barbell',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-back-008', name: 'Straight-Arm Pulldown', category: 'back',
    description: 'Keep arms straight, pull bar from overhead to hips in an arc, isolates lats.',
    videoUrl: 'https://www.youtube.com/watch?v=ey9Fv3FGrRg',
    tags: ['back', 'lats', 'isolation', 'cable'],
    muscleGroup: 'Latissimus Dorsi', equipment: 'cable',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-back-009', name: 'Close-Grip Lat Pulldown', category: 'back',
    description: 'Use V-bar attachment, pull to upper chest with elbows driving straight down, targets lower lats.',
    videoUrl: '',
    tags: ['back', 'lats', 'cable'],
    muscleGroup: 'Latissimus Dorsi', equipment: 'cable',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-back-010', name: 'Cable Pull-Over', category: 'back',
    description: 'Face away from high cable, pull bar overhead and down to hips in a sweeping arc.',
    videoUrl: '',
    tags: ['back', 'lats', 'isolation', 'cable'],
    muscleGroup: 'Latissimus Dorsi', equipment: 'cable',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-back-011', name: 'Machine Chest-Supported Row', category: 'back',
    description: 'Lie chest-down on incline pad, row handles toward chest — removes lower back from the equation.',
    videoUrl: '',
    tags: ['back', 'rowing', 'machine'],
    muscleGroup: 'Rhomboids', equipment: 'machine',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-back-012', name: 'Reverse-Grip Lat Pulldown', category: 'back',
    description: 'Use underhand shoulder-width grip, pull bar to upper chest — emphasises lower lats and biceps.',
    videoUrl: '',
    tags: ['back', 'lats', 'biceps', 'cable'],
    muscleGroup: 'Latissimus Dorsi', equipment: 'cable',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },

  // ── SHOULDERS ──────────────────────────────────────────────────────────────
  {
    id: 'gym-sh-001', name: 'Barbell Overhead Press', category: 'shoulders',
    description: 'Press barbell from shoulder height to full overhead extension, core braced throughout.',
    videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
    tags: ['shoulders', 'compound', 'pressing'], muscleGroup: 'Deltoids', equipment: 'barbell',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-sh-002', name: 'Dumbbell Lateral Raise', category: 'shoulders',
    description: 'Raise dumbbells to the side until parallel with floor, slight bend in elbows.',
    videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
    tags: ['shoulders', 'side delt', 'isolation'], muscleGroup: 'Lateral Deltoids', equipment: 'dumbbell',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-sh-003', name: 'Arnold Press', category: 'shoulders',
    description: 'Start with palms facing you at chin height, rotate palms outward as you press overhead.',
    videoUrl: 'https://www.youtube.com/watch?v=6Z15_WdXmVw',
    tags: ['shoulders', 'compound', 'dumbbell'],
    muscleGroup: 'Deltoids', equipment: 'dumbbell',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-sh-004', name: 'Rear Delt Dumbbell Fly', category: 'shoulders',
    description: 'Hinge forward 45°, raise dumbbells to the side with a slight elbow bend.',
    videoUrl: 'https://www.youtube.com/watch?v=nlkF7_2O_Lw',
    tags: ['shoulders', 'rear delt', 'isolation'],
    muscleGroup: 'Posterior Deltoids', equipment: 'dumbbell',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-sh-005', name: 'Cable Lateral Raise', category: 'shoulders',
    description: 'Set cable low, raise arm across body to shoulder height in a controlled arc.',
    videoUrl: '',
    tags: ['shoulders', 'side delt', 'isolation', 'cable'],
    muscleGroup: 'Lateral Deltoids', equipment: 'cable',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-sh-006', name: 'Dumbbell Front Raise', category: 'shoulders',
    description: 'Raise dumbbells forward to shoulder height with slight elbow bend, lower under control.',
    videoUrl: '',
    tags: ['shoulders', 'front delt', 'isolation'],
    muscleGroup: 'Anterior Deltoids', equipment: 'dumbbell',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },

  // ── BICEPS ─────────────────────────────────────────────────────────────────
  {
    id: 'gym-bi-001', name: 'Barbell Curl', category: 'biceps',
    description: 'Curl bar from arms fully extended to shoulder height, keep elbows pinned at sides.',
    videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
    tags: ['biceps', 'isolation'], muscleGroup: 'Biceps Brachii', equipment: 'barbell',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-bi-002', name: 'Dumbbell Hammer Curl', category: 'biceps',
    description: 'Curl with neutral grip (thumbs up), targets brachialis and brachioradialis for arm thickness.',
    videoUrl: 'https://www.youtube.com/watch?v=TwD-YGVP4Bk',
    tags: ['biceps', 'forearms', 'isolation'],
    muscleGroup: 'Brachialis', equipment: 'dumbbell',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-bi-003', name: 'Incline Dumbbell Curl', category: 'biceps',
    description: 'Set bench to 45°, arms hang back, curl for a full stretch on the long head.',
    videoUrl: 'https://www.youtube.com/watch?v=soxrZlIl35U',
    tags: ['biceps', 'isolation', 'stretch'],
    muscleGroup: 'Biceps Brachii', equipment: 'dumbbell',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-bi-004', name: 'Cable Curl', category: 'biceps',
    description: 'Curl cable bar from hip height to chin, constant tension throughout the movement.',
    videoUrl: '',
    tags: ['biceps', 'isolation', 'cable'],
    muscleGroup: 'Biceps Brachii', equipment: 'cable',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-bi-005', name: 'Concentration Curl', category: 'biceps',
    description: 'Seated, brace elbow on inner thigh, curl dumbbell up with full supination at top.',
    videoUrl: 'https://www.youtube.com/watch?v=llD6MImgqe8',
    tags: ['biceps', 'isolation', 'peak'],
    muscleGroup: 'Biceps Brachii', equipment: 'dumbbell',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-bi-006', name: 'EZ Bar Preacher Curl', category: 'biceps',
    description: 'Rest upper arms on preacher pad, curl EZ bar up, lower under control for full stretch.',
    videoUrl: 'https://www.youtube.com/watch?v=fIWP-FRFNU0',
    tags: ['biceps', 'isolation', 'preacher'],
    muscleGroup: 'Biceps Brachii', equipment: 'ez_bar',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },

  // ── TRICEPS ────────────────────────────────────────────────────────────────
  {
    id: 'gym-tri-001', name: 'Tricep Rope Pushdown', category: 'triceps',
    description: 'Pull rope down until arms fully extended, flare ends apart at bottom to maximise contraction.',
    videoUrl: 'https://www.youtube.com/watch?v=vB5OHsJ3EME',
    tags: ['triceps', 'isolation', 'cable'], muscleGroup: 'Triceps Brachii', equipment: 'cable',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-tri-002', name: 'Skull Crusher', category: 'triceps',
    description: 'Lie on bench, lower EZ-bar to forehead keeping elbows pointing up, extend back to start.',
    videoUrl: 'https://www.youtube.com/watch?v=kOXVmFFTcio',
    tags: ['triceps', 'isolation'],
    muscleGroup: 'Triceps Brachii', equipment: 'ez_bar',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-tri-003', name: 'Overhead Tricep Extension', category: 'triceps',
    description: 'Hold dumbbell overhead with both hands, lower behind head, extend back up for long head stretch.',
    videoUrl: 'https://www.youtube.com/watch?v=YbX7Wd8jQ-U',
    tags: ['triceps', 'isolation', 'long head'],
    muscleGroup: 'Triceps Brachii (Long Head)', equipment: 'dumbbell',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-tri-004', name: 'Close-Grip Bench Press', category: 'triceps',
    description: 'Grip bar shoulder-width, lower to lower chest, press up focusing on tricep extension.',
    videoUrl: 'https://www.youtube.com/watch?v=nEF0bv2FW54',
    tags: ['triceps', 'compound', 'pressing'],
    muscleGroup: 'Triceps Brachii', equipment: 'barbell',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-tri-005', name: 'Tricep Kickback', category: 'triceps',
    description: 'Hinge forward, upper arm parallel to floor, extend forearm back until arm is straight.',
    videoUrl: '',
    tags: ['triceps', 'isolation'],
    muscleGroup: 'Triceps Brachii', equipment: 'dumbbell',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-tri-006', name: 'Diamond Push-Up', category: 'triceps',
    description: 'Form diamond shape with hands under chest, lower and push up, elbows close to body.',
    videoUrl: '',
    tags: ['triceps', 'bodyweight', 'compound'],
    muscleGroup: 'Triceps Brachii', equipment: 'bodyweight',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },

  // ── LEGS ───────────────────────────────────────────────────────────────────
  {
    id: 'gym-leg-001', name: 'Barbell Back Squat', category: 'legs',
    description: 'Bar across upper back, squat until thighs parallel to floor, drive through heels to stand.',
    videoUrl: 'https://www.youtube.com/watch?v=Dy28eq2PjcM',
    tags: ['legs', 'quads', 'compound', 'glutes'], muscleGroup: 'Quadriceps', equipment: 'barbell',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-leg-002', name: 'Romanian Deadlift', category: 'legs',
    description: 'Hinge at hips with soft knees, lower bar along legs until hamstring stretch, drive hips forward.',
    videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzwNrM',
    tags: ['legs', 'hamstrings', 'compound', 'glutes'], muscleGroup: 'Hamstrings', equipment: 'barbell',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-leg-003', name: 'Leg Press', category: 'legs',
    description: 'Push platform away until legs nearly straight, lower under full control.',
    videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
    tags: ['legs', 'quads', 'compound'],
    muscleGroup: 'Quadriceps', equipment: 'machine',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-leg-004', name: 'Leg Curl (Machine)', category: 'legs',
    description: 'Lying face down, curl heels toward glutes against resistance, lower under control.',
    videoUrl: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs',
    tags: ['legs', 'hamstrings', 'isolation'],
    muscleGroup: 'Hamstrings', equipment: 'machine',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-leg-005', name: 'Bulgarian Split Squat', category: 'legs',
    description: 'Rear foot elevated on bench, lower front knee toward floor, drive back up through heel.',
    videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE',
    tags: ['legs', 'quads', 'unilateral'],
    muscleGroup: 'Quadriceps', equipment: 'dumbbell',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-leg-006', name: 'Goblet Squat', category: 'legs',
    description: 'Hold dumbbell at chest, squat deep with elbows between knees, great for beginners.',
    videoUrl: 'https://www.youtube.com/watch?v=MxsFDhcyFyE',
    tags: ['legs', 'quads', 'compound'],
    muscleGroup: 'Quadriceps', equipment: 'dumbbell',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-leg-007', name: 'Walking Lunge', category: 'legs',
    description: 'Step forward into a lunge, alternate legs while walking, keep torso upright.',
    videoUrl: 'https://www.youtube.com/watch?v=L8fvypPrzzs',
    tags: ['legs', 'quads', 'unilateral', 'balance'],
    muscleGroup: 'Quadriceps', equipment: 'dumbbell',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-leg-008', name: 'Leg Extension (Machine)', category: 'legs',
    description: 'Extend legs against resistance until straight, lower under control, isolates quads.',
    videoUrl: 'https://www.youtube.com/watch?v=YyvSfVjQeL0',
    tags: ['legs', 'quads', 'isolation'],
    muscleGroup: 'Quadriceps', equipment: 'machine',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-leg-009', name: 'Standing Calf Raise', category: 'legs',
    description: 'Rise onto toes holding dumbbells or at calf raise machine, lower heel below platform.',
    videoUrl: '',
    tags: ['legs', 'calves', 'isolation'],
    muscleGroup: 'Gastrocnemius', equipment: 'machine',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },

  // ── GLUTES ─────────────────────────────────────────────────────────────────
  {
    id: 'gym-glt-001', name: 'Barbell Hip Thrust', category: 'glutes',
    description: 'Shoulders on bench, bar across hips, drive hips up until body is parallel to floor.',
    videoUrl: 'https://www.youtube.com/watch?v=SEdqd1n0cvg',
    tags: ['glutes', 'compound', 'hip extension'], muscleGroup: 'Gluteus Maximus', equipment: 'barbell',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-glt-002', name: 'Cable Kickback', category: 'glutes',
    description: 'Attach ankle strap, hinge forward slightly, kick leg straight back squeezing the glute.',
    videoUrl: '',
    tags: ['glutes', 'isolation', 'cable'],
    muscleGroup: 'Gluteus Maximus', equipment: 'cable',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-glt-003', name: 'Sumo Squat', category: 'glutes',
    description: 'Wide stance, toes pointed out, squat deep while keeping chest tall to emphasise glutes.',
    videoUrl: '',
    tags: ['glutes', 'inner thighs', 'compound'],
    muscleGroup: 'Gluteus Medius', equipment: 'dumbbell',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-glt-004', name: 'Glute Bridge', category: 'glutes',
    description: 'Lie on back, feet flat, drive hips up squeezing glutes, hold at top for 1–2 seconds.',
    videoUrl: 'https://www.youtube.com/watch?v=wPM8icPu6H8',
    tags: ['glutes', 'bodyweight', 'hip extension'],
    muscleGroup: 'Gluteus Maximus', equipment: 'bodyweight',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-glt-005', name: 'Single-Leg Hip Thrust', category: 'glutes',
    description: 'Same as hip thrust but one leg extended, maximises glute loading on working side.',
    videoUrl: '',
    tags: ['glutes', 'unilateral', 'hip extension'],
    muscleGroup: 'Gluteus Maximus', equipment: 'bodyweight',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-glt-006', name: 'Lateral Band Walk', category: 'glutes',
    description: 'Place band above knees, squat slightly, step side to side maintaining tension.',
    videoUrl: '',
    tags: ['glutes', 'abductors', 'resistance band'],
    muscleGroup: 'Gluteus Medius', equipment: 'resistance_band',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },

  // ── CORE ───────────────────────────────────────────────────────────────────
  {
    id: 'gym-core-001', name: 'Plank', category: 'core',
    description: 'Hold push-up position on forearms, body in straight line, breathe steadily throughout.',
    videoUrl: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
    tags: ['core', 'isometric', 'bodyweight'],
    muscleGroup: 'Transverse Abdominis', equipment: 'bodyweight',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-core-002', name: 'Cable Crunch', category: 'core',
    description: 'Kneel facing cable, pull rope toward floor crunching abs hard, keep hips stationary.',
    videoUrl: 'https://www.youtube.com/watch?v=_FBhzFhiFhQ',
    tags: ['core', 'abs', 'cable'],
    muscleGroup: 'Rectus Abdominis', equipment: 'cable',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-core-003', name: 'Hanging Leg Raise', category: 'core',
    description: 'Hang from pull-up bar, raise straight legs to 90° or higher, lower under control.',
    videoUrl: 'https://www.youtube.com/watch?v=Pr1ieGZ5atk',
    tags: ['core', 'abs', 'hip flexors'],
    muscleGroup: 'Rectus Abdominis', equipment: 'bodyweight',
    progressionLevel: 'advanced', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-core-004', name: 'Russian Twist', category: 'core',
    description: 'Sit with feet elevated, rotate torso side to side holding a weight plate or dumbbell.',
    videoUrl: 'https://www.youtube.com/watch?v=JyyvI6dJDME',
    tags: ['core', 'obliques', 'rotation'],
    muscleGroup: 'Obliques', equipment: 'dumbbell',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-core-005', name: 'Ab Wheel Rollout', category: 'core',
    description: 'Kneel holding ab wheel, roll forward until arms are extended, pull back using core.',
    videoUrl: 'https://www.youtube.com/watch?v=IVTeRSkWZBM',
    tags: ['core', 'abs', 'anti-extension'],
    muscleGroup: 'Rectus Abdominis', equipment: 'other',
    progressionLevel: 'advanced', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-core-006', name: 'Side Plank', category: 'core',
    description: 'Hold side-lying position on one forearm and foot, body straight, hips off the floor.',
    videoUrl: '',
    tags: ['core', 'obliques', 'isometric'],
    muscleGroup: 'Obliques', equipment: 'bodyweight',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-core-007', name: 'Dead Bug', category: 'core',
    description: 'Lie on back, extend opposite arm and leg simultaneously keeping lower back pressed to floor.',
    videoUrl: '',
    tags: ['core', 'anti-rotation', 'stability'],
    muscleGroup: 'Transverse Abdominis', equipment: 'bodyweight',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },

  // ── CARDIO ─────────────────────────────────────────────────────────────────
  {
    id: 'gym-cardio-001', name: 'Treadmill Run', category: 'cardio',
    description: 'Maintain consistent pace on treadmill; adjust speed and incline to target heart rate.',
    videoUrl: '', tags: ['cardio', 'endurance', 'running'],
    muscleGroup: 'Full Body', equipment: 'machine',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-cardio-002', name: 'Rowing Machine', category: 'cardio',
    description: 'Drive with legs first, then lean back and pull handle to lower ribs, return in reverse order.',
    videoUrl: '', tags: ['cardio', 'full body', 'endurance'],
    muscleGroup: 'Full Body', equipment: 'machine',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-cardio-003', name: 'Jump Rope', category: 'cardio',
    description: 'Skip rope at consistent rhythm; progress to double-unders for higher intensity.',
    videoUrl: '', tags: ['cardio', 'coordination', 'endurance'],
    muscleGroup: 'Full Body', equipment: 'other',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-cardio-004', name: 'Stationary Bike', category: 'cardio',
    description: 'Pedal at target cadence and resistance; use interval protocols for conditioning.',
    videoUrl: '', tags: ['cardio', 'low impact', 'endurance'],
    muscleGroup: 'Legs', equipment: 'machine',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-cardio-005', name: 'Stair Climber', category: 'cardio',
    description: 'Step at steady pace on stair machine; avoid leaning on handles for best effort.',
    videoUrl: '', tags: ['cardio', 'legs', 'glutes', 'endurance'],
    muscleGroup: 'Legs & Glutes', equipment: 'machine',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-cardio-006', name: 'Battle Ropes', category: 'cardio',
    description: 'Alternate or simultaneous waves with heavy ropes for high-intensity conditioning.',
    videoUrl: '', tags: ['cardio', 'upper body', 'HIIT'],
    muscleGroup: 'Shoulders & Core', equipment: 'other',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },

  // ── FULL BODY ──────────────────────────────────────────────────────────────
  {
    id: 'gym-fb-001', name: 'Deadlift', category: 'full_body',
    description: 'Push floor away with legs, hinge hips forward, bar stays close to body throughout.',
    videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
    tags: ['full body', 'compound', 'back', 'legs'], muscleGroup: 'Posterior Chain', equipment: 'barbell',
    progressionLevel: 'advanced', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-fb-002', name: 'Kettlebell Swing', category: 'full_body',
    description: 'Hike kettlebell back, drive hips explosively forward, swing to chest height.',
    videoUrl: 'https://www.youtube.com/watch?v=YSxHifyI6s8',
    tags: ['full body', 'cardio', 'power', 'glutes'], muscleGroup: 'Posterior Chain', equipment: 'kettlebell',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-fb-003', name: 'Farmer\'s Walk', category: 'full_body',
    description: 'Hold heavy dumbbells at sides, walk with tall posture and controlled steps.',
    videoUrl: 'https://www.youtube.com/watch?v=rt17lmnaLSM',
    tags: ['full body', 'grip', 'carry', 'core'],
    muscleGroup: 'Full Body', equipment: 'dumbbell',
    progressionLevel: 'beginner', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-fb-004', name: 'Burpee', category: 'full_body',
    description: 'Squat down, jump feet back to push-up, perform push-up, jump feet forward, jump up.',
    videoUrl: 'https://www.youtube.com/watch?v=auBLPXO8Fww',
    tags: ['full body', 'cardio', 'bodyweight', 'HIIT'],
    muscleGroup: 'Full Body', equipment: 'bodyweight',
    progressionLevel: 'intermediate', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-fb-005', name: 'Power Clean', category: 'full_body',
    description: 'Pull bar from floor explosively, drop under and catch in front rack position.',
    videoUrl: 'https://www.youtube.com/watch?v=RFLU0OuSHkE',
    tags: ['full body', 'power', 'olympic', 'explosive'],
    muscleGroup: 'Full Body', equipment: 'barbell',
    progressionLevel: 'advanced', createdAt: new Date().toISOString(), isCustom: false,
  },
  {
    id: 'gym-fb-006', name: 'Turkish Get-Up', category: 'full_body',
    description: 'Start lying holding kettlebell overhead, stand up through a series of controlled steps.',
    videoUrl: 'https://www.youtube.com/watch?v=0bWRPC49-KI',
    tags: ['full body', 'stability', 'mobility', 'shoulder'],
    muscleGroup: 'Full Body', equipment: 'kettlebell',
    progressionLevel: 'advanced', createdAt: new Date().toISOString(), isCustom: false,
  },
];

export { SEED_EXERCISES, SEED_TEMPLATES };
