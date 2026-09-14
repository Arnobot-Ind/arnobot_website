import type { Industry, IndustryId } from '@/types';

/**
 * Industry detail copy shown in the home-page modal — ported from the
 * `industryData` object that lived inside assets/js/main.js.
 */
const INDUSTRIES: Readonly<Record<IndustryId, Industry>> = {
  defence: {
    id: 'defence',
    title: 'Defence & Security',
    desc: 'Critical operations in hazardous and combat zones. ARNOBOT designs autonomous unmanned ground platforms to handle scouting, route monitoring, and remote tactical supply delivery without risking human lives.',
    robots: [
      {
        name: 'ATM',
        desc: 'Any Terrain Machine. High-clearance heavy chassis designed to scale rocky industrial slopes.',
        image: '/assets/images/card-atm-tile.webp',
        specs: ['All-Terrain', 'Chassis-Suspension', '4x4 Drive', 'Dual GPS'],
      },
      {
        name: 'SAIBYA',
        desc: 'Rugged heavy-payload unmanned ground vehicle (UGV). Supports payloads up to 200\u00A0kg.',
        image: '/assets/images/card-saibya-tile.webp',
        specs: ['UGV', '200kg Load', '4x4 Drive', 'LiDAR SLAM'],
      },
      {
        name: 'NEXUS',
        desc: 'Tactical UGV platform optimized for perimeter patrol, tactical surveillance, and security integrations.',
        image: '/assets/images/card-nexus-tile.webp',
        specs: ['Tactical UGV', 'LiDAR', 'Thermal Cam', 'Mesh Network'],
      },
    ],
  },

  maritime: {
    id: 'maritime',
    title: 'Maritime & Marine',
    desc: 'Extreme saltwater environments require high-grade rugged robotic crawlers. ARNOBOT platforms inspect vessel hull walls, clean biofouling, and monitor harbor gates efficiently.',
    robots: [
      {
        name: 'ALTIUS',
        desc: 'Magnetic climbing robotic system designed for vertical steel wall inspection and cleaning.',
        /* Cropped to 500x363 to match the other three tiles, because
           `.modal-robot-img-wrap` is a 200x145 box using `object-fit: contain`:
           the square 420x420 frame this replaces was letterboxed down to 145px
           wide inside it, so ALTIUS showed smaller than every machine listed
           beside it. Its content was wrong too — the indoor workshop climb with
           a folding chair in shot, the same frame the product card retired. */
        image: '/assets/images/card-altius-tile-v2.webp',
        specs: ['Climbing Robot', 'Magnetic', 'IP67 Waterproof', 'NDT Scan'],
      },
    ],
  },

  power: {
    id: 'power',
    title: 'Power & Utilities',
    desc: 'High-voltage switchyards, transformers, and nuclear facilities expose humans to intense safety risks. ARNOBOT robots replace personnel in routine inspections and critical structural mapping.',
    robots: [
      {
        name: 'ATM',
        desc: 'Any Terrain Machine. High-clearance heavy chassis designed to scale rocky industrial slopes.',
        image: '/assets/images/card-atm-tile.webp',
        specs: ['All-Terrain', 'Chassis-Suspension', '4x4 Drive', 'Dual GPS'],
      },
      {
        name: 'SAIBYA',
        desc: 'Rugged multi-mission ground platform carrying specialized sensor modules.',
        image: '/assets/images/card-saibya-tile.webp',
        specs: ['UGV', 'Modular Platform', 'Gas Sniffer', 'Thermal Engine'],
      },
    ],
  },

  industrial: {
    id: 'industrial',
    title: 'Industrial Operations',
    desc: 'Steel mills, smelting plants, paper mills, and chemical warehouses are hot, hazardous, and noisy. ARNOBOT platforms automate heavy material transport and structural inspection.',
    robots: [
      {
        name: 'SAIBYA',
        desc: 'Rugged heavy-payload unmanned ground vehicle (UGV). Supports payloads up to 200\u00A0kg.',
        image: '/assets/images/card-saibya-tile.webp',
        specs: ['UGV', 'Heavy Load', 'IP65 Weatherproof', 'Auto-Charger'],
      },
    ],
  },

  infrastructure: {
    id: 'infrastructure',
    title: 'Critical Infrastructure',
    desc: 'Railways, deep tunnels, dams, and remote cellular towers require continuous structural monitoring. ARNOBOT platforms scale long corridors and vertical walls without downtime.',
    robots: [
      {
        name: 'SAIBYA',
        desc: 'Rugged heavy-payload unmanned ground vehicle (UGV). Supports payloads up to 200\u00A0kg.',
        image: '/assets/images/card-saibya-tile.webp',
        specs: ['UGV', 'Heavy Load', 'IP65 Weatherproof', 'Auto-Charger'],
      },
      {
        name: 'ATM',
        desc: 'Any Terrain Machine. Heavy suspension chassis equipped with 3D LiDAR for spatial mapping.',
        image: '/assets/images/card-atm-tile.webp',
        specs: ['All-Terrain', 'LiDAR Mapping', 'GPS-Denied Navigation', 'Obstacle Avoidance'],
      },
    ],
  },

  asset: {
    id: 'asset',
    title: 'Asset Protection',
    desc: 'Continuous facility protection demands reliable 24/7 coverage. ARNOBOT platforms autonomously navigate preset paths, detect intruders, and report anomalies instantaneously.',
    robots: [
      {
        name: 'NEXUS',
        desc: 'Tactical surveillance UGV equipped with thermal imaging cameras, sirens, and obstacle avoidance.',
        image: '/assets/images/card-nexus-tile.webp',
        specs: ['Tactical Patrol', 'Thermal Analytics', 'LiDAR Avoidance', 'IP65 Waterproof'],
      },
    ],
  },

  solar: {
    id: 'solar',
    title: 'Solar Projects',
    desc: 'Dust buildup reduces solar farm output significantly. ARNOBOT provides specialized, lightweight tracking robots that clean solar panel assemblies without using water.',
    robots: [
      {
        name: 'SAIBYA',
        desc: 'Rugged heavy-payload unmanned ground vehicle (UGV). Supports payloads up to 200\u00A0kg.',
        image: '/assets/images/card-saibya-tile.webp',
        specs: ['UGV', 'Heavy Load', 'IP65 Weatherproof', 'Auto-Charger'],
      },
      {
        name: 'ALTIUS',
        desc: 'Vertical climbing robot customized with panel track guidance and high-efficiency waterless brush arrays.',
        /* Same tile as the maritime entry above; see the note there. */
        image: '/assets/images/card-altius-tile-v2.webp',
        specs: ['Lightweight UGV', 'Waterless Cleaning', 'Solar Special', 'Fast Brush'],
      },
    ],
  },
};

export function getIndustry(id: string | null | undefined): Industry | undefined {
  if (!id) return undefined;
  return Object.prototype.hasOwnProperty.call(INDUSTRIES, id)
    ? INDUSTRIES[id as IndustryId]
    : undefined;
}

/**
 * The cards rendered in the home-page industries slider, in display order.
 *
 * `maritime`, `industrial` and `infrastructure` are photographs of our own
 * hardware on a real trial. `defence` and `solar` are generated imagery, both
 * supplied by Arnobot and used at their direction — see the note on each. That
 * is a reversal: this card art was once all generated, it was replaced with
 * photography for a reason, and two of the five have now gone back. Do not
 * "fix" either one back to a photograph without asking; the notes below record
 * what was traded away in each case.
 *
 * `alt` says what the frame actually shows rather than restating the label
 * above it, so the two are not read as the same sentence twice. Where a frame
 * shows something the product line does not do, the alt still describes it
 * accurately rather than writing around it.
 *
 * The image area is 190px tall and about 279px wide on a 1440px screen, and it
 * sits under `grayscale(80%)` until the card is hovered. Two consequences the
 * card art has to respect: lettering on the machine is a smudge at that size,
 * so nothing legible can be claimed for it, and the frames have to separate on
 * composition and tone rather than on colour.
 *
 * Four of the five have now been re-cut a second time, because the set failed
 * as a set rather than one frame at a time. `defence` and `industrial` were
 * both a black Saibya Max, mast up and beacon on, three-quarter view, in dry
 * scrub, in the same light — read side by side in the slider they were the same
 * picture twice, and neither said anything its label did not. `maritime` was
 * two operators in blue hard hats and hi-vis filling the lower third of a pale
 * wall, with the ALTIUS a dark speck above them: a person, not a machine, and
 * a frame that reads as a concrete wall rather than a hull.
 *
 * So the set is split by machine and by shot type, which is what makes the five
 * separate at 279x190: an armed UGV on a forest track (defence), ALTIUS wet on
 * hull plating (maritime), a control-panel detail (industrial), ATM in dust
 * under a pylon (infrastructure), and an aerial down a panel row (solar).
 *
 * Defence has been re-cut twice since. Splitting the set by shot type fixed the
 * duplication but not the labels: every frame was still a machine on its own
 * somewhere outdoors, so `defence` was carrying its meaning entirely in the
 * caption. The photograph that fixed that — the desert exercise, with the army
 * truck in frame — has in turn been replaced by the generated frame described
 * on the card below.
 *
 * Note `power` and `asset` exist in INDUSTRIES (they are reachable from the
 * modal) but have never had a card here.
 */
export const HOME_INDUSTRY_CARDS: ReadonlyArray<{
  readonly id: IndustryId;
  readonly label: string;
  readonly image: string;
  readonly alt: string;
}> = [
  {
    id: 'defence',
    label: 'Defence & Security',
    /* Generated imagery, supplied by Arnobot and used at their direction, and
       the one card on the site that shows a weapon.

       Read the trade before changing it. The machine in this frame carries a
       remote weapon station with a mounted gun. Arnobot builds no armed
       platform: SAIBYA, ALTIUS, NEXUS and ATM are all unarmed, and the copy
       this card opens — `INDUSTRIES.defence.desc`, a few dozen lines up — sells
       "scouting, route monitoring, and remote tactical supply delivery without
       risking human lives". The picture and the paragraph under it therefore
       disagree, and the vehicle is not a recognisable Arnobot platform. This
       was raised and the card was swapped anyway; it is a deliberate decision,
       not an oversight, which is why the alt below names the weapon rather than
       describing around it.

       What it replaced, if it is ever reverted: `card-industry-defence-v4.webp`,
       a photograph of the camouflaged ATM on trackway matting in desert sand
       with an army transport truck behind it — the only frame in the set with
       the customer in it, and the same shoot the ATM product card uses. That
       file is left in place, unreferenced.

       Composition-wise this one holds up: the machine is large and centred, and
       the pale grass and hillside behind it keep it the set's brightest frame,
       so it still separates from the close and medium frames beside it under
       `grayscale(80%)`. */
    image: '/assets/images/card-industry-defence-v5.webp',
    alt: 'Rendered view of a four-wheeled military ground robot parked on a forest track, a remote weapon station with a mounted gun and sighting optics on its deck, open grassland behind',
  },
  {
    id: 'maritime',
    label: 'Maritime & Shipbuilding',
    /* The wet, high-contrast frame in the row — spray against dark plating is
       the one tone nothing else here has, which is how it separates under
       `grayscale(80%)`. Cut from the hull-cleaning clip rather than the climb,
       so it does not repeat the ALTIUS product card on the same page. */
    image: '/assets/images/card-industry-maritime-v2.webp',
    alt: 'ALTIUS crawler washing down ship hull plating with a high-pressure water jet, spray fanning out beneath its nozzle bar',
  },
  {
    id: 'industrial',
    label: 'Industrial Operations',
    /* The machine inside a plant at last: a Saibya-class UGV, beacon lit,
       driving the aisle of a pump hall between the motor sets and under the
       overhead crane — the hot, noisy, hazardous floor the copy for this
       entry is about. Generated imagery (2026-09-08), not footage; nothing
       we have shot shows a robot in a plant. Wide, evenly lit and low in
       contrast, so under `grayscale(80%)` it sits calm between the darker
       frames either side rather than competing with them. */
    image: '/assets/images/card-industry-industrial-v4.webp',
    alt: 'Four-wheeled ARNOBOT UGV with an amber beacon driving down the aisle of an industrial pump hall, motor sets on the left and an overhead crane above',
  },
  {
    id: 'infrastructure',
    label: 'Critical Infrastructure',
    /* A black UGV carrying strapped-down cases over the rubble of a
       collapsed structure, two operators crouched behind it over a ground
       station. Generated imagery (2026-09-08), not footage. The machine is
       the one dark mass against pale concrete and a grey sky, so it holds
       as a shape under `grayscale(80%)` where the old dust-and-tower frame
       tended to wash out. Cropped from the centre of the 1336×744 render,
       which keeps both the machine and the operators inside the card. */
    image: '/assets/images/card-industry-infra-v3.webp',
    alt: 'Black four-wheeled UGV carrying strapped-down equipment cases across the rubble of a collapsed building, two operators crouched behind it with a ground control laptop',
  },
  {
    id: 'solar',
    label: 'Solar Projects',
    image: '/assets/images/card-industry-solar-v2.webp',
    /* The only card here that is NOT a photograph of a real trial, against the
       rule stated above — supplied by Arnobot and used at their direction. The
       old frame was an ATM on bare ground with nothing solar in it, so the one
       card whose label says "Solar Projects" showed no panels. This is a
       generated aerial: a UGV on the service track between two panel rows.
       Cropped from the 2880x1440 original around the machine (720px of source
       height above it, none below) because the full frame puts the robot at
       about 30 card pixels, and `.industry-img-wrap img` desaturates 80% before
       hover on top of that. The alt says "rendered" for the same reason the
       ALTIUS ocean-render alt did. */
    alt: 'Rendered aerial view of an ARNOBOT wheeled UGV driving the service track between two rows of solar panels on an open utility-scale solar farm',
  },
];
