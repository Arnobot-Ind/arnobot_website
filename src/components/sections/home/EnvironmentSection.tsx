export default function EnvironmentSection() {
  return (
    <section className="environment reveal">
      {/* A frame from the ALTIUS3 marketing clip (Downloads/Website Videos,
          3.0 s): the crawler alone on a wall of dark hull plating, spray bar on,
          tether trailing down. That clip is generated footage, not the Alang
          trial the product page shows, and this frame appears nowhere else on
          the site. Cropped to the left 1400x788 so the tool watermark in the
          bottom-right corner is gone and the machine sits high in the right
          third, clear of the wash that carries the heading on the left. */}
      <img
        className="environment-bg"
        src="/assets/images/environment-band-v2.webp"
        alt="ALTIUS climbing a wall of dark ship-hull plating, its spray bar running and its tether trailing down the steel"
      />
      <div className="environment-content">
        <h2 className="russo">
          Built for environments
          <br />
          humans can&apos;t enter.
        </h2>
      </div>
    </section>
  );
}
