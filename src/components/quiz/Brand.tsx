/* ARNOBOT™ brand marks. The stacked-diamond glyph and the wordmark logo. */

/** The ARNOBOT stacked-diamond mark (three slanted parallelograms, steel→indigo). */
export function Diamonds({
  size = 28,
  gradientId = "arn-d",
}: {
  size?: number;
  gradientId?: string;
}) {
  const w = size;
  const h = size * (36 / 36);
  return (
    <svg width={w} height={h} viewBox="0 0 36 34" fill="none" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#7AA7F0" />
          <stop offset="0.5" stopColor="#3A5FA8" />
          <stop offset="1" stopColor="#230C75" />
        </linearGradient>
      </defs>
      {/* top → bottom, lightest steel to deep indigo */}
      <path d="M1 6 L21 2 L33 8 L13 12 Z" fill="#6E97E0" />
      <path d="M1 16 L21 12 L33 18 L13 22 Z" fill="#2F4E9C" />
      <path d="M1 26 L21 22 L33 28 L13 32 Z" fill="#230C75" />
    </svg>
  );
}

/**
 * The full ARNOBOT wordmark logo (diamonds + lettering). Uses the optimized
 * trademark PNGs in /public/brand. `variant` picks the colourway.
 */
export function ArnobotLogo({
  height = 30,
  variant = "color",
  className = "",
}: {
  height?: number;
  variant?: "white" | "color" | "black";
  className?: string;
}) {
   
  return (
    <img
      src={`/brand/arnobot-logo-${variant}.png`}
      alt="ARNOBOT"
      height={height}
      style={{ height, width: "auto" }}
      className={className}
      draggable={false}
    />
  );
}
