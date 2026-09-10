/**
 * The serviceable ARNOBOT range, for the quotation product selector.
 *
 * Wider than `@/data/products` (which drives the public product pages and knows
 * only the four headline platforms) because the workshop services the Saibya
 * variants and the robotic arm as distinct machines. `presets` seed the
 * component rows for the common jobs; the operator can edit or clear them.
 */
export interface ProductPreset {
  readonly id: string;
  /** Written into the PDF's Product row verbatim. */
  readonly label: string;
  readonly presets: readonly { component: string; description: string }[];
}

const COMMON = [
  { component: 'Body', description: 'Body / chassis shell' },
  { component: 'Battery', description: 'Battery pack' },
  { component: 'Receiver', description: 'Radio receiver unit' },
  { component: 'Electronic Unit', description: 'Electronic control box' },
] as const;

export const QUOTATION_PRODUCTS: readonly ProductPreset[] = [
  {
    id: 'nexus',
    label: 'Nexus — tracked inspection robot',
    presets: [
      { component: 'Body', description: 'Nexus body / chassis shell' },
      { component: 'Receiver', description: 'Radio receiver unit' },
      { component: 'Battery', description: 'Battery pack' },
      { component: 'Electronic Unit', description: 'Electronic control box' },
    ],
  },
  {
    id: 'saibya',
    label: 'Saibya — heavy-duty 4×4 UGV',
    presets: [
      { component: 'Body', description: 'Body / chassis shell' },
      { component: 'Drive Motor', description: 'Drive motor assembly' },
      { component: 'Battery', description: '24 V battery pack' },
      { component: 'Electronic Unit', description: 'Electronic control box' },
    ],
  },
  {
    id: 'saibya-surveillance',
    label: 'Saibya Night Surveillance — surveillance variant',
    presets: [
      { component: 'Camera Module', description: 'Night-surveillance camera head' },
      { component: 'Sensor Mast', description: 'Mast and pan-tilt assembly' },
      { component: 'Battery', description: '24 V battery pack' },
      { component: 'Electronic Unit', description: 'Electronic control box' },
    ],
  },
  {
    id: 'saibya-mine-dispensing',
    label: 'Saibya Mine Dispensing — dispensing variant',
    presets: [
      { component: 'Dispensing Unit', description: 'Mine-dispensing mechanism' },
      { component: 'Body', description: 'Body / chassis shell' },
      { component: 'Battery', description: '24 V battery pack' },
      { component: 'Electronic Unit', description: 'Electronic control box' },
    ],
  },
  {
    id: 'altius',
    label: 'Altius — hull-cleaning climbing crawler',
    presets: [
      { component: 'Body', description: 'Crawler body / chassis' },
      { component: 'Thruster', description: 'Adhesion thruster assembly' },
      { component: 'Umbilical', description: 'Tether and umbilical' },
      { component: 'Electronic Unit', description: 'Electronic control box' },
    ],
  },
  {
    id: 'atm',
    label: 'ATM — Any Terrain Machine',
    presets: [...COMMON],
  },
  {
    id: 'robotic-arm',
    label: 'Robotic Arm — R&D arm / gripper',
    presets: [
      { component: 'Joint Assembly', description: 'Stepper joint assembly' },
      { component: 'Gripper', description: 'End-effector gripper' },
      { component: 'Controller', description: 'Controller board' },
      { component: 'Wiring Harness', description: 'Internal wiring harness' },
    ],
  },
];

export const OTHER_PRODUCT_ID = 'other';

export function findProduct(id: string): ProductPreset | undefined {
  return QUOTATION_PRODUCTS.find((p) => p.id === id);
}
