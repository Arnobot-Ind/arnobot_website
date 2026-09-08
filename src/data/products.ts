import type { Product, ProductId } from '@/types';

/**
 * Product data definitions from the official "Product data.docx",
 * ported from the $products array in product.php.
 */
const PRODUCTS: Readonly<Record<ProductId, Product>> = {
  saibya: {
    id: 'saibya',
    name: 'SAIBYA',
    subtitle: '(Heavy-Duty UGV)',
    heroTitleLines: ['Robots for ', 'the Future'],
    heroBg: '/assets/images/hero-bg.png',
    heroVideo: '/assets/videos/products/saibya/saibya_hero_full.mp4',
    /* A frame of the Max on a field trial, not the turntable render — the hero
       draws across the whole screen and a keyed studio render has no environment
       to fill it. The clean render still gets its moment on the turntable below.
       The hero plays no video here; the clip it used to autoplay is the first
       card in the showcase band.

       Now a photograph rather than a frame lifted from the trial clip. The two
       cuts before this were both video stills, and a still off a moving camera
       shows it at full-bleed: soft edges, motion smear on the wheels, and a
       crop that ran out of machine at the top. This is from the 2026-08 product
       shoot (`Saibya-Surveillance/Photos/saibya-surveillance-field-03.jpg`,
       8847x5898), so the chassis holds up across the whole screen.

       Cropped from the left of the frame, not centred: the title sits
       bottom-left over the scrim, so the machine is carried into the right half
       and the tree and shade fall behind the words. Wide enough to keep the
       whole platform and the ground it is standing on — the version before this
       was pushed in so close that the frame stopped being a place. Still a
       deliberately different look from the company-page band
       (`about-band-saibya-v2.webp`), which is the same platform standing wide
       against a treeline — the two should not read as one photograph used
       twice. */
    heroImage: '/assets/images/products/saibya/saibya_hero_v3.webp',
    heroImageAlt:
      'Saibya standing in dry scrub against a shaded wall on a field trial, sensor mast and beacon up, light bars across its deck',
    mainImage: '/assets/renders/saibya-hero.webp',
    brochure: '/assets/brochures/Saibya_Brochure.pdf',
    overview:
      'SAIBYA is a rugged, high-payload unmanned ground vehicle designed for defence logistics, hazardous material transport, industrial inspection, and mission-critical ground operations.',
    specs: [
      ['Type', 'Unmanned Ground Vehicle (UGV)'],
      ['Payload Capacity', '200 kg'],
      ['Drive System', '4×4 All-Terrain Drive'],
    ],
    features: [
      '200 kg payload capacity',
      '4×4 high-traction drive',
      'Stair-climbing & all-terrain mobility',
      'Remote, semi-autonomous & fully autonomous control',
      'Modular attachment capability',
    ],
    applications: [
      'Defence logistics & supply transport',
      'Ammunition carriage',
      'Industrial material handling',
      'Towing & surveillance',
      'Disaster response',
    ],
    /* The lists above, marked with an icon each. Same wording, trimmed only
       where the icon already says it. */
    featureItems: [
      { icon: 'payload', lead: '200 kg', label: 'payload capacity' },
      { icon: 'drive', lead: '4×4', label: 'high-traction drive' },
      { icon: 'stairs', label: 'Stair-climbing & all-terrain mobility' },
      { icon: 'control', label: 'Remote, semi-autonomous & fully autonomous control' },
      { icon: 'modular', label: 'Modular attachment capability' },
    ],
    applicationItems: [
      { icon: 'defence', label: 'Defence logistics & supply transport' },
      { icon: 'ammunition', label: 'Ammunition carriage' },
      { icon: 'industrial', label: 'Industrial material handling' },
      { icon: 'towing', label: 'Towing & surveillance' },
      { icon: 'disaster', label: 'Disaster response' },
    ],
    /* 72 frames, one every 5 degrees, rendered in Cycles from the Fusion OBJ
       (ArnobotDoc `02-Products/turntable.py`) with the matte-gunmetal body.
       No contact shadow is baked in — `.spin-frame` draws its own drop-shadow
       off the alpha, so a rendered one would double up.
       It opens on 18, the front-on pose. */
    spin: {
      dir: '/assets/renders/saibya-360',
      frames: 72,
      startIndex: 18,
      width: 720,
      height: 491,
    },
    /* Photographs of the machine, cropped to the cards' 3:2 rather than dropped
       in as portrait phone shots that `cover` then cut in half.
       Two builds exist and the difference is visible, so the cards say which is
       which: the turntable above and cards 1 and 3 are the standard Saibya —
       black deck, knobbly ATV tyres, front bumper bar, the platform these specs
       describe. Card 2 is Saibya Max, the larger surveillance fit with the mast,
       twin rear wheels and ribbed tyres. Every professional photograph Arnobot
       has of this product line is of the Max; the two standard-Saibya shots are
       field phone photographs, which is why they are the lower-resolution pair.
       All three clips are cut from the Santoor product shoot, which only ever
       filmed the Max — there is no footage of the standard build anywhere, so
       cards 1 and 3 pair a standard-Saibya still with a Max clip. Their titles
       are therefore build-neutral; only card 2, whose still is also the Max,
       names the build. Card 1 used to read "Defence Logistics & Field Trials";
       neither its still nor its clip carries a load, so "Logistics" is gone. */
    showcase: [
      {
        title: 'Defence Field Trials',
        img: '/assets/images/products/saibya/saibya_desert_trial.webp',
        video: '/assets/videos/products/saibya/saibya_hero_full.mp4',
      },
      {
        title: 'Saibya Max — Surveillance Fit Trials',
        img: '/assets/images/products/saibya/saibya_max_surveillance_v2.webp',
        video: '/assets/videos/products/saibya/saibya_diadem_demo.mp4',
      },
      {
        title: 'Field Operations Demonstration',
        img: '/assets/images/products/saibya/saibya_solar_inspection.webp',
        video: '/assets/videos/products/saibya/saibya_whatsapp_demo1.mp4',
      },
    ],
  },

  atm: {
    id: 'atm',
    name: 'ATM',
    subtitle: '(High-Payload UGV)',
    heroTitleLines: ['Any Terrain ', 'Machine'],
    heroBg: '/assets/images/hero-bg.png',
    heroVideo: '/assets/videos/products/atm/atm_dust_run_clean.mp4',
    /* The desert exercise: the ATM on trackway matting laid over sand, an army
       transport parked in the trees on the left and more vehicles up the ridge.
       It replaces the car-pull frame, which was a good demonstration but a poor
       hero — shot at dusk in a parking area, so the machine sat dark against
       dark and the setting said "residential street" under a title that says
       Any Terrain Machine. This is the terrain, and the customer is in it.

       The full frame rather than a crop, which is also what keeps it apart from
       the home page's ATM card: that one is cropped portrait and close on the
       machine, this one is the whole scene. Left at its native 1600x900 — the
       source is a phone photograph and upscaling to match the other heroes'
       1920x1080 would only invent detail. */
    heroImage: '/assets/images/products/atm/atm_hero_field.webp',
    heroImageAlt:
      'The camouflaged ATM standing on trackway matting over desert sand during a field exercise, an army transport truck parked under trees behind it',
    // ATM has no turntable, so the details band shows one image on the same
    // stage. It is a photograph of the machine working rather than the hero
    // render again — the render already fills the band above it, and showing it
    // twice on one screen said nothing the second time.
    stillRender: '/assets/images/products/atm/atm_field_grass.webp',
    mainImage: '/assets/renders/atm-hero.webp',
    // TODO: no PDF yet — the page falls back to "Request Brochure".
    brochure: '/assets/brochures/ATM_Brochure.pdf',
    overview:
      "ATM is Arnobot's highest-capacity unmanned ground vehicle, built to move heavy loads across worksite and field terrain with stability where lighter platforms cannot operate.",
    specs: [
      ['Type', 'Unmanned Ground Vehicle (UGV)'],
      ['Payload Capacity', '500 kg'],
      ['Drive System', 'All-Terrain Drive with Suspension'],
    ],
    features: [
      '500 kg payload capacity',
      'Front & rear suspension for load stability',
      'Remote & autonomous control',
      'Modular attachment capability',
      'Real-time telemetry & video feed',
    ],
    applications: [
      'Heavy material transport & logistics',
      'Towing',
      'Industrial site operations',
      'Surveillance',
      'Grass cutting',
    ],
    featureItems: [
      { icon: 'payload', lead: '500 kg', label: 'payload capacity' },
      { icon: 'suspension', label: 'Front & rear suspension for load stability' },
      { icon: 'control', label: 'Remote & autonomous control' },
      { icon: 'modular', label: 'Modular attachment capability' },
      { icon: 'feed', label: 'Real-time telemetry & video feed' },
    ],
    applicationItems: [
      { icon: 'transport', label: 'Heavy material transport & logistics' },
      { icon: 'towing', label: 'Towing' },
      { icon: 'industrial', label: 'Industrial site operations' },
      { icon: 'surveillance', label: 'Surveillance' },
      { icon: 'grass', label: 'Grass cutting' },
    ],
    /* The three cards used to carry two photographs of SAIBYA and a 200px crop
       upscaled 3.4×; they now carry ATM's own trial footage, one still per card.
       Card 1 opens the car-pull clip cut from the Car-Pull-2026-03-12 drone
       rushes — the machine towing a loaded SUV, which is the only footage that
       answers for "Heavy Load Transport". It lives at the site-root demo1.mp4
       because that file was already committed for ATM and this is what it now
       holds; the name is legacy, the content is not. Its stills were already
       clean crops; only the clips behind cards 2 and 3 were not.

       Those two used to share atm_vehicle_demo.mp4 verbatim. That file is a
       finished marketing edit and it was published here watermark and all: an
       "ARNOBOT ™" bug sits top-right on every frame and a captioned title runs
       across the picture throughout — including the two later captions that
       misspell "active". Both cards now play their own re-cut from the 3840x2160
       master (ArnobotDoc `02-Products/ATM-Any-Terrain-Machine/Videos/ATM_Vehicle
       Demo.mp4`), cropped below the graphics at native resolution. The crop
       offset differs per segment because the captions do: the title band over the
       dust run sits higher than the lower-third over the grass runs, so the dust
       cut takes `crop=3022:1700:400:460` (the same crop the home hero uses) and
       the suspension cut has to go to `crop=2702:1520:569:640`.
       Card 3 also stops borrowing card 2's footage: it plays the grass-and-
       hummock run the "Suspension & Drivetrain" title actually claims, framed to
       avoid the bystanders who walk through the later half of that segment.
       atm_vehicle_demo.mp4 stays in place, unreferenced. */
    showcase: [
      {
        title: 'Heavy Load Transport',
        img: '/assets/images/products/atm/atm_car_pull.webp',
        video: '/assets/videos/demo1.mp4',
      },
      {
        title: 'All-Terrain Field Operations',
        img: '/assets/images/products/atm/atm_dust_run_v2.webp',
        video: '/assets/videos/products/atm/atm_dust_run_clean.mp4',
      },
      {
        title: 'Suspension & Drivetrain',
        img: '/assets/images/products/atm/atm_drivetrain_v2.webp',
        video: '/assets/videos/products/atm/atm_suspension_run.mp4',
      },
    ],
  },

  nexus: {
    id: 'nexus',
    name: 'NEXUS',
    subtitle: '(Compact Tactical Robot)',
    heroTitleLines: ['Rapid Tactical ', 'Reconnaissance'],
    heroBg: '/assets/images/hero-bg.png',
    heroVideo: '/assets/videos/products/nexus/nexus_trial_1.mp4',
    /* A frame of the WHEELED build straddling a tree root, not the turntable
       render — the hero draws across the whole screen and a keyed studio render
       has no environment to fill it. The turntable below is the TRACKED Mark-3,
       so the two are visibly different machines; see the note on the showcase
       titles. The hero plays no video here — the clip it used to autoplay is the
       first card in the showcase band. */
    heroImage: '/assets/images/products/nexus/nexus_hero.webp',
    heroImageAlt:
      'The wheeled NEXUS straddling a split tree root with both headlights lit, rocker arms articulated over the bark',
    mainImage: '/assets/renders/nexus-hero.webp',
    // TODO: no PDF yet — the page falls back to "Request Brochure".
    brochure: '/assets/brochures/Nexus_Brochure.pdf',
    overview:
      'A lightweight, portable tactical robot primarily designed for surveillance, reconnaissance, and rapid tactical deployment in confined and high-risk spaces.',
    specs: [
      ['Type', 'Compact Tactical Ground Robot'],
      ['Weight Class', '3 kg'],
    ],
    features: [
      'Ultra-lightweight (3 kg)',
      'Fully invertible — drives upside down',
      'Onboard camera with live video feed',
      'Encrypted remote tactical control',
      'Rapid deployment capability',
    ],
    applications: [
      'Defence surveillance',
      'Tactical & urban reconnaissance',
      'Indoor security inspection',
      'Border monitoring',
      'High-risk area scouting',
    ],
    featureItems: [
      { icon: 'lightweight', lead: '3 kg', label: 'ultra-lightweight platform' },
      { icon: 'invertible', label: 'Fully invertible — drives upside down' },
      { icon: 'feed', label: 'Onboard camera with live video feed' },
      { icon: 'encrypted', label: 'Encrypted remote tactical control' },
      { icon: 'rapid', label: 'Rapid deployment capability' },
    ],
    applicationItems: [
      { icon: 'defence', label: 'Defence surveillance' },
      { icon: 'recon', label: 'Tactical & urban reconnaissance' },
      { icon: 'building', label: 'Indoor security inspection' },
      { icon: 'border', label: 'Border monitoring' },
      { icon: 'radar', label: 'High-risk area scouting' },
    ],
    /* 72 frames, one every 5 degrees, keyed out of the KeyShot studio render.
       It opens on 9, the front-on pose. */
    spin: {
      dir: '/assets/renders/nexus-360',
      frames: 72,
      startIndex: 9,
      width: 720,
      height: 526,
    },
    /* Card 1 used to show a green four-wheeled buggy on blue-spoked RC wheels —
       a render of an older machine altogether, not this product. All three cards
       now carry photographs of Nexus in the field.
       Those photographs are of the WHEELED build, as is the hero; the turntable
       above is the TRACKED Mark-3. The two are visibly different machines, so
       the titles name the build rather than leaving a reader to assume the
       tracks in the viewer and the wheels in the cards are the same thing.

       Card 3 is the strongest footage on this page and it is deliberately last:
       card 1's clip is the one the hero used to autoplay, and the note on
       `heroImage` above says so, which only stays true while that clip opens the
       band. Worth revisiting — leading with the drop would sell the platform
       harder — but it is a two-place edit, not a reorder. */
    showcase: [
      {
        title: 'Wheeled Nexus — Invertible Drive Trial',
        img: '/assets/images/products/nexus/nexus_invertible_trial.webp',
        video: '/assets/videos/products/nexus/nexus_trial_1.mp4',
      },
      {
        title: 'Wheeled Nexus — Rough-Terrain Traverse',
        img: '/assets/images/products/nexus/nexus_root_traverse.webp',
        video: '/assets/videos/products/nexus/nexus_trial_2.mp4',
      },
      {
        /* Nine seconds cut from the middle of the trial: Nexus drives the top
           edge of a concrete water tank, goes over it, falls the full height of
           the wall, lands, and drives off. Two of the five claims in
           `featureItems` are on screen here rather than asserted — the drop is
           the "rapid deployment" case, and it comes to rest inverted and keeps
           driving, which is the invertible one.
           The still is the free-fall frame, the robot clear of the wall with
           nothing touching it. It is the only picture on the product pages where
           the machine is mid-air, so the card reads at a glance in the band.
           The 26s original runs on either side of this: eight seconds of
           approach along the top of the tank before, and a long drive-away
           after, neither of which shows anything the other two cards do not. */
        title: 'Wheeled Nexus — Wall Drop & Drive-Away',
        img: '/assets/images/products/nexus/nexus_wall_drop_v2.webp',
        video: '/assets/videos/products/nexus/nexus_wall_drop.mp4',
      },
    ],
  },

  altius: {
    id: 'altius',
    name: 'ALTIUS',
    subtitle: '(Vertical Climbing Robot)',
    heroTitleLines: ['Vertical Climbing ', 'Robotics'],
    heroBg: '/assets/images/hero-bg.png',
    heroVideo: '/assets/videos/products/altius/altius_hull_cleaning.mp4',
    /* Third hero on this page, and the first one that carries the headline.
       The original was a frame of the Alang hull trial with two hard-hatted
       operators filling the bottom half — machine incidental. The ocean render
       that replaced it went too far the other way: at hero scale the crawler is
       a dark speck on a near-white hull, so a page headlined "Vertical Climbing
       Robotics" opened on an empty wall. This is a frame of the hull-climb
       footage at Alang, upscaled from the 1440p clip: a real machine on real
       plating, nobody in frame, the crawler right of centre and clear of the
       bottom-left scrim where `.hero-cinematic` lays the title. It is cut from
       the same clip showcase card 1 plays, which is deliberate: that clip is the
       only footage of this machine doing the job the page describes, and the
       hero states the claim the band then shows moving. The frame comes from the
       already-cropped 1440x810 derivative, so the master's iCreate logo and
       courtesy bar are gone before the upscale. The hero plays no video here;
       `heroVideo` remains the fallback for consumers that only know video.
       `altius_hero.webp` and `altius_hero_ocean.webp` are left in place,
       unreferenced. */
    heroImage: '/assets/images/products/altius/altius_hero_hull.webp',
    heroImageAlt:
      'ALTIUS climbing the weathered steel plating of a ship hull at Alang, its two magnetic track belts gripping the vertical surface, tether and umbilical trailing down behind it',
    /* The turntable below replaces the still gallery on the page; this stays as
       the fallback any consumer that only knows about images still gets. */
    mainImage: '/assets/renders/altius-hero.webp',
    brochure: '/assets/brochures/Altius_Brochure.pdf',
    overview:
      'ALTIUS is a vertical climbing robot built for advanced inspection, cleaning and monitoring of high-altitude and hard to reach places for ferromagnetic surfaces.',
    specs: [
      ['Type', 'Vertical Climbing Robot'],
      ['Vertical Payload', '30 kg'],
    ],
    features: [
      '30 kg vertical payload capacity',
      'Magnetic grip for secure climbing on steel surfaces',
      'Interchangeable tooling support',
      'Real-time video transmission',
      'Rugged industrial build',
    ],
    applications: [
      'Infrastructure inspection',
      'Industrial cleaning at height',
      'Surface painting & sand blasting',
      'Industrial surveillance',
      'Critical asset mapping',
    ],
    featureItems: [
      { icon: 'payload', lead: '30 kg', label: 'vertical payload capacity' },
      { icon: 'magnet', label: 'Magnetic grip for secure climbing on steel surfaces' },
      { icon: 'tooling', label: 'Interchangeable tooling support' },
      { icon: 'transmit', label: 'Real-time video transmission' },
      { icon: 'rugged', label: 'Rugged industrial build' },
    ],
    applicationItems: [
      { icon: 'bridge', label: 'Infrastructure inspection' },
      { icon: 'spray', label: 'Industrial cleaning at height' },
      { icon: 'paint', label: 'Surface painting & sand blasting' },
      { icon: 'surveillance', label: 'Industrial surveillance' },
      { icon: 'mapping', label: 'Critical asset mapping' },
    ],
    /* 72 frames, one every 5 degrees, rendered in Cycles from the Fusion OBJ
       (ArnobotDoc `02-Products/turntable.py`, `--up y`) with the top plate and
       shrouds on the same matte gunmetal as the Saibya deck, and the world HDRI
       raised to 1.0 — at the pipeline default of 0.25 a metallic body has nothing
       to reflect off these near-vertical surfaces and renders black.
       `mainImage` above is cut from frame 0 of this same set, so the two must be
       regenerated together.
       It opens on 0, the front-on pose. */
    spin: {
      dir: '/assets/renders/altius-360',
      frames: 72,
      startIndex: 0,
      width: 720,
      height: 513,
    },
    /* All three cards are re-cut from the ship-hull trial Arnobot filmed at the
       Leela Group ship-recycling yard, Alang, on 26 July 2025 — the footage that
       lives in ArnobotDoc as `02-Products/Altius/Videos/Arnobot (With
       Courtsey).mp4`. It is the only material anywhere that shows this machine
       doing the job the page describes: climbing a hull and washing it down.
       It supersedes what these cards used to carry — an indoor wall climb beside
       a folding chair, and two clips in which hard-hatted operators, not the
       robot, fill the frame. Those three files (`cleaning-attachment`,
       `payload-capacity`, `GroundStation_setup`) are left in place, unreferenced.

       That master is a finished edit: an iCreate / ProtoQuik logo sits top-right
       on every frame, a "COURTESY : LEELA GROUP OF SHIP RECYCLING YARDS" bar runs
       bottom-left, and a testimonial card cuts in and out bottom-right.
       `crop=1500:844:0:80` clears all three at native resolution, and cards 1 and
       2 use it. Card 3 does not: it IS the iCreate feature, so its branding and
       its yard credit are the point and stay in frame. The yard is named in the
       card titles as well, so the credit survives the crop in the copy even where
       it does not survive it in the picture. */
    showcase: [
      {
        title: 'Hull Climb — Alang Ship-Recycling Yard',
        img: '/assets/images/products/altius/altius_hull_climb.webp',
        video: '/assets/videos/products/altius/altius_hull_climb.mp4',
      },
      /* The Alang trial as it was actually run, restored at the client's
         direction: two ARNOBOT operators on the ground working the tether and
         the controller while ALTIUS holds the hull above them.

         This is the frame the hero-imagery brief objected to, and the reversal
         is deliberate. The brief's rule — machines at work, people only where
         the team is the subject — was written for hero-scale imagery, and it
         still governs the heroes. Here the subject IS the trial: a card
         captioned "Alang Yard Trial" showing the crew who ran it is a record,
         not a mismatch. The machine reads small against the hull, which is the
         honest scale of that job.

         Cards 1 and 3 both show the machine close on the plating, so this is
         also the only frame in the row that gives the work a setting. */
      {
        title: 'Ship Hull Climb — Alang Yard Trial',
        img: '/assets/images/products/altius/altius_alang_climb.webp',
        video: '/assets/videos/products/altius/payload-capacity.mp4',
      },
      /* The iCreate cut, trimmed from 14.4s to the 10s of hull footage: the
         ProtoQuik title card that opened it is gone. The iCreate identity is
         not lost with it — the logo bug is burned into every frame of the
         source, so it still reads on the footage itself. */
      {
        title: "ALTIUS on iCreate's ProtoQuik Launchpad",
        img: '/assets/images/products/altius/altius_icreate_v2.webp',
        video: '/assets/videos/products/altius/altius_icreate_protoquik_v2.mp4',
      },
    ],
  },
};

const DEFAULT_PRODUCT_ID: ProductId = 'saibya';

function isProductId(value: string): value is ProductId {
  return Object.prototype.hasOwnProperty.call(PRODUCTS, value);
}

/** Mirrors product.php: an unknown or missing `id` falls back to SAIBYA. */
export function resolveProduct(rawId: string | string[] | undefined): Product {
  const raw = Array.isArray(rawId) ? rawId[0] : rawId;
  const id = raw?.trim().toLowerCase() ?? '';
  return PRODUCTS[isProductId(id) ? id : DEFAULT_PRODUCT_ID];
}
