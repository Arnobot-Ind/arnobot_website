/** The looping hero clip: a montage of all four platforms at work — SAIBYA
    coming down a tree-lined road, NEXUS working leaf litter, ALTIUS magnetised
    to a ship hull with its jets running, ATM crossing broken grass and rubble
    on its suspension — cross-dissolved, and dissolving back into the first shot
    so the loop closes on a cut of the same kind as every other. No one is in
    frame in any of the four.

    Every segment is framed so the whole machine is inside it, with air on all
    four sides for the segment's full length. That constraint is what picked
    these four windows over more dramatic ones: the closer, more cinematic takes
    all cut the vehicle at a frame edge, which reads as a detail rather than a
    product.

    Two of the four windows are additionally constrained. The SAIBYA shot is a
    low three-quarter front, held to the stretch where the machine is still far
    enough out that the "Indian Army" deck decal is sub-legible and half-hidden
    behind the mast strut — a customer relationship the site does not claim
    anywhere else. It also keeps the machine near centre over an out-of-focus
    road, so the copy lands on ground rather than on the robot. The ATM window is
    cropped to 1600x900 off the top of the frame: that drops the empty sky, lifts
    the machine clear of the copy, and holds the run where the suspension is
    visibly working — the flatter dust-run take reads as an open lot rather than
    as terrain, which is the thing that shot is there to say.

    A phone crops this 16:9 frame to roughly its centre quarter, and only a shot
    where the machine is both centred and under about a quarter of the frame wide
    survives that. SAIBYA and NEXUS do — the SAIBYA window stops at 10.6s in its
    source for exactly this reason, before the dolly-in outgrows the strip.
    ALTIUS and ATM do not: on a phone both read as a close detail of the machine
    rather than the whole of it. Every take we have of those two is framed tight,
    so this is a footage limit, not a choice — worth revisiting if either is ever
    reshot wide.

    The whole product line is in the footage, which is what lets the copy over
    it stay to a single line. The poster is the clip's own first frame, so
    nothing shifts when it starts, and the closing dissolve lands back on that
    same frame so the loop has no jump. Cut by `scripts/build-hero-v5.sh`, which
    is the record of which window came from which clip. */
const HERO_VIDEO = '/assets/videos/home-hero-v5.mp4';
const HERO_POSTER = '/assets/images/home-hero-v5-poster.webp';

export default function HeroSection() {
  return (
    <section className="hero hero-cinematic" id="home" data-cinematic-hero data-header-theme="dark">
      {/* Layer 1 — the footage. `.hero.hero-cinematic` keeps a dark ground
          beneath it, so the poster carries the frame until playback starts. */}
      <video className="hero-video" autoPlay muted loop playsInline poster={HERO_POSTER}>
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>
      {/* Layer 2 — the dark gradient scrim is `.hero-cinematic::after`. */}

      {/* Layer 3 — copy. */}
      <div className="hero-content">
        <span className="eyebrow">Robotics Redefined</span>
        <h1 className="russo">
          Building Autonomous <br />
          Systems For Industry
        </h1>
      </div>
    </section>
  );
}
