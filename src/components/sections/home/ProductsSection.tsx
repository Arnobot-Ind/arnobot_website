import Link from 'next/link';
import type { ProductId } from '@/types';

/* Each card opens its own product page at /product?id=<slug>, the same
   addresses the header and footer menus use.

   The pictures are photographs of the actual machines, cropped to roughly 2:3
   because `.product-card` is a tall portrait box (~308x486) that covers its
   image — a landscape frame would lose two thirds of the robot to the crop.
   `alt` describes what the photograph shows rather than repeating the product
   name: the SAIBYA frame is of the Saibya Max variant, which is the platform
   we have field photography of.

   ALTIUS went through two wrong cards before this one. The workshop snap showed
   the machine but not the job (painted indoor wall, folding chair in shot); the
   Cycles ocean render showed the job but not the machine — at card size the
   crawler was a speck on a flat grey hull, and `.product-card img` desaturates
   85% by default, so it read as an empty tile beside three robot photographs.
   This is the Alang hull-climb frame cropped to portrait around the crawler: a
   real photograph, machine filling the frame, on the plating it works on. The
   `h3` pill sits at the top of the card, which is why the crop leaves clean
   plating up there and carries the machine in the lower two thirds. */
const CARDS: ReadonlyArray<{
  readonly id: ProductId;
  readonly name: string;
  readonly image: string;
  readonly alt: string;
}> = [
  {
    id: 'altius',
    name: 'ALTIUS',
    image: '/assets/images/card-altius-hull.webp',
    alt: 'ALTIUS magnetic crawler climbing the steel plating of a ship hull, tether and umbilical trailing behind it',
  },
  {
    id: 'saibya',
    name: 'SAIBYA',
    image: '/assets/images/card-saibya.webp',
    alt: 'Saibya Max surveillance UGV, mast and beacon raised, photographed side-on during a field trial',
  },
  {
    id: 'nexus',
    name: 'NEXUS',
    image: '/assets/images/card-nexus.webp',
    alt: 'Wheeled NEXUS UGV standing on open ground, seen head-on across its sensor pods',
  },
  {
    id: 'atm',
    name: 'ATM',
    /* The desert exercise, cropped portrait around the machine: sand and the
       trackway matting it is standing on, army vehicles up the ridge behind.
       It replaces a frame lifted from the dust-run clip — soft, and a wall of
       dust that read as grey haze once `.product-card img` took 85% of the
       colour out. This crop no longer collides with anything: the Defence &
       Security card in the industries slider was the same photograph, landscape
       and wide, but that card has since been swapped to a supplied render. */
    image: '/assets/images/card-atm-v2.webp',
    alt: 'The camouflaged ATM standing on trackway matting over desert sand, army vehicles parked on the ridge behind it',
  },
];

const HUD_CORNERS = ['tl', 'tr', 'bl', 'br'] as const;

export default function ProductsSection() {
  return (
    <section className="products reveal" id="product">
      <div className="product-head">
        <span className="eyebrow">What We Build</span>
        <h2 className="section-title">Our Robotics Solution</h2>
        <p className="section-lead">Advanced robotic systems for defense, industrial, and hazardous environments.</p>
      </div>

      <div className="product-grid">
        {CARDS.map((card) => (
          <Link className="product-card-link" href={`/product?id=${card.id}`} key={card.id}>
            <article className="product-card">
              {HUD_CORNERS.map((corner) => (
                <span className={`product-hud-corner ${corner}`} key={corner} />
              ))}
              <div className="product-scan-beam" />
              <img src={card.image} alt={card.alt} />
              <h3 className="russo">{card.name}</h3>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
