import PitchScripts from '@/components/PitchScripts';

const A = '/pitch/assets';

export default function PitchPage() {
  return (
    <>
      <div className="grid-bg" />

      <div className="shell">
        <nav className="rail">
          <div className="rail-top">
            <div className="brand">
              <img src={`${A}/arnobot-wordmark.png`} alt="ARNOBOT™" />
              <div className="sub">Robotics Redefined</div>
            </div>
            <ul className="navlist">
              <li><a href="#overview"><span className="idx">00</span> Overview</a></li>
              <li><a href="#company"><span className="idx">01</span> Company</a></li>
              <li><a href="#products"><span className="idx">02</span> Products</a></li>
              <li><a href="#technology"><span className="idx">03</span> Technology</a></li>
              <li><a href="#market"><span className="idx">04</span> Market</a></li>
              <li><a href="#traction"><span className="idx">05</span> Traction</a></li>
              <li><a href="#ask"><span className="idx">06</span> The Ask</a></li>
              <li><a href="#recognition"><span className="idx">07</span> Recognition</a></li>
              <li><a href="#contact"><span className="idx">08</span> Contact</a></li>
            </ul>
          </div>
          <div className="rail-bottom">Ahmedabad, India<br />Est. 2024<br /><br />Private &amp; Confidential</div>
        </nav>

        <main>
          {/* HERO */}
          <section id="overview" className="hero">
            <div className="hero-inner">
              <div>
                <div className="kicker">Defence &amp; Industrial Robotics — Capability &amp; Investment Overview</div>
                <h1>Unmanned systems<br />for <em>where humans</em><br />shouldn&apos;t go.</h1>
                <p className="lede">ARNOBOT designs and builds mission-ready ground, climbing and tactical robots for hazardous environments across defence, energy, maritime and industrial sectors — engineered end-to-end, in-house.</p>
              </div>
              <figure className="hero-photo">
                <img src={`${A}/saibya-hero.jpg`} alt="SAIBYA unmanned ground vehicle in surveillance fit, with mast-mounted cameras, floodlight bar, siren and beacon" />
                <figcaption>SAIBYA (surveillance fit) — field deployment</figcaption>
              </figure>
            </div>
            <div className="hero-stats">
              <div className="stat"><div className="num">2024</div><div className="lbl">Founded, Ahmedabad</div></div>
              <div className="stat"><div className="num">4</div><div className="lbl">Platforms built and field-tested</div></div>
              <div className="stat"><div className="num">4</div><div className="lbl">Completed field pilots</div></div>
              <div className="stat"><div className="num">3 + 5</div><div className="lbl">Heavy + light units / month, in-house</div></div>
              <div className="stat"><div className="num">₹4 Cr</div><div className="lbl">Current raise — Project Sentinel</div></div>
            </div>
            <div className="scroll-cue"><div className="ln" />SCROLL</div>
          </section>

          {/* COMPANY */}
          <section id="company">
            <div className="eyebrow">01 — Company &amp; Mission</div>
            <h2 className="sec-title">Full-stack robotics, engineered end-to-end in India.</h2>
            <p className="sec-lede">Arnobot Private Limited designs, fabricates and integrates its own machines under one roof in Ahmedabad — chassis and drivetrain, electronics and power, the autonomy stack and the ground-control software. Nothing core is outsourced, so a mission requirement can be answered with a change to the robot rather than a change of supplier.</p>

            <div className="grid-2">
              <div className="cell">
                <h4>Mission</h4>
                <p>To revolutionise operational landscapes by delivering precise, scalable and intelligent robotic platforms that enhance efficiency, reliability and safety — empowering organisations with tailored automation for their most demanding challenges.</p>
              </div>
              <div className="cell">
                <h4>Vision</h4>
                <p>To become a global leader in robotics-driven asset lifecycle management — making industrial maintenance safer, smarter and more efficient through intelligent robotics.</p>
              </div>
            </div>
            <div className="grid-2" style={{ marginTop: '1px' }}>
              <div className="cell">
                <h4>Core Activity</h4>
                <p>Unmanned Ground Vehicles (UGVs) · Industrial inspection robots · Vertical climbing robots · Defence &amp; mission-critical robotic systems · Automation for hazardous industrial environments.</p>
              </div>
              <div className="cell">
                <h4>Values</h4>
                <div className="pill-row" style={{ marginTop: '4px' }}>
                  <span className="pill">Engineering Excellence</span>
                  <span className="pill">Safety First</span>
                  <span className="pill">Client-Centric Innovation</span>
                  <span className="pill">Data-Driven Decisions</span>
                  <span className="pill">Made in India</span>
                </div>
              </div>
            </div>

            {/* The in-house claim above is the one an investor will test, so it
                is shown rather than asserted: design, fabrication, integration. */}
            <div style={{ marginTop: '56px' }}>
              <div className="eyebrow" style={{ marginBottom: '20px' }}>Under one roof, Ahmedabad</div>
              <div className="grid-3">
                <figure className="proof-figure">
                  <img src={`${A}/facility-cad.jpg`} alt="An ARNOBOT engineer modelling the Nexus assembly in CAD at the Ahmedabad design desk" />
                  <figcaption>Design — full CAD and mechanical revision in-house</figcaption>
                </figure>
                <figure className="proof-figure">
                  <img src={`${A}/facility-print.jpg`} alt="Freshly printed polymer parts being lifted off a 3D printer bed by a gloved hand" />
                  <figcaption>Fabrication — printing, machining and prototyping</figcaption>
                </figure>
                <figure className="proof-figure">
                  <img src={`${A}/facility-integration.jpg`} alt="Four ARNOBOT engineers working into the opened electronics bay of a Saibya chassis" />
                  <figcaption>Integration — electronics, power and autonomy build-up</figcaption>
                </figure>
              </div>
            </div>

            <div style={{ marginTop: '60px' }}>
              <div className="eyebrow" style={{ marginBottom: '24px' }}>Leadership</div>
              <div className="grid-3">
                <div className="cell bracket founder"><span className="bl" /><span className="br" />
                  <div className="ph">AS</div>
                  <h3>Anmol Shah</h3>
                  <div className="role">Founder &amp; CEO</div>
                  <div className="cred">B.E. Mechatronics — Industrial Automation &amp; Maintenance, TPM</div>
                </div>
                <div className="cell bracket founder"><span className="bl" /><span className="br" />
                  <div className="ph">AM</div>
                  <h3>Anil Maity</h3>
                  <div className="role">Co-Founder &amp; CTO</div>
                  <div className="cred">B.E. Mechatronics — Robotics &amp; Software Development</div>
                </div>
                <div className="cell bracket founder"><span className="bl" /><span className="br" />
                  <div className="ph">AS</div>
                  <h3>Amit Shah</h3>
                  <div className="role">Co-Founder &amp; Director</div>
                  <div className="cred">B.Com, LLB, D.L.P, D.T.P — Interior Designer</div>
                </div>
              </div>
              {/* The team photograph does the work the sentence used to do
                  alone. It is a cut-out on white, so it sits on the deck's own
                  paper without a crop or a frame. */}
              <div className="team-band">
                <img src={`${A}/team-assembly.jpg`} alt="Five ARNOBOT engineers around a Saibya chassis on the bench — one fitting a drive wheel, the others working the deck and taking notes" />
                <p>Backed by an <strong>8-professional core team</strong> spanning robotics engineering, product design, system integration and strategic management.</p>
              </div>
            </div>
          </section>

          <div className="hazard-rule" />

          {/* PRODUCTS */}
          <section id="products" className="alt">
            <div className="eyebrow">02 — Product Range</div>
            <h2 className="sec-title">Four platforms. One mission-ready fleet.</h2>
            <p className="sec-lede">Every platform is designed, fabricated and integrated in-house, and every one has been run on a real site. Click a unit to expand its specification, use case and target industries.</p>

            <div className="grid-2" id="productGrid">
              <div className="bracket product" data-p="1"><span className="bl" /><span className="br" />
                <div className="shot tile"><img src={`${A}/prod-saibya.jpg`} alt="SAIBYA heavy-duty 4×4 unmanned ground vehicle" /></div>
                <div className="head">
                  <div><div className="name">SAIBYA</div><div className="tag">Heavy-Duty Unmanned Ground Vehicle</div></div>
                  <div className="plus">+</div>
                </div>
                <div className="body"><div className="body-inner">
                  <div className="row"><div className="k">Overview</div><div className="v">Rugged, high-payload 4×4 UGV for defence logistics, hazardous material transport, industrial inspection and mission-critical ground operations. Modular deck accepts mission-specific payloads.</div></div>
                  <div className="row"><div className="k">Mission fits</div><div className="v">Night surveillance · Mine dispensing · Sub-surface cable mapping (GPR + active EM) · Weed cutting · Payload carriage.</div></div>
                  <div className="row"><div className="k">Industry</div><div className="v">Defence, solar &amp; renewables, construction, asset-heavy industry.</div></div>
                  <table className="spec-table">
                    <tbody>
                      <tr><td>External dimensions</td><td>1078 × 692 × 402 mm</td></tr>
                      <tr><td>Weight</td><td>70 kg</td></tr>
                      <tr><td>Max payload</td><td>200 kg (90 kg all-terrain)</td></tr>
                      <tr><td>Drivetrain</td><td>4×4 · zero-radius turn</td></tr>
                      <tr><td>Max speed</td><td>8 km/h</td></tr>
                      <tr><td>Climb grade / stair step</td><td>30° · 150 mm</td></tr>
                      <tr><td>Ground clearance</td><td>130 mm</td></tr>
                      <tr><td>Battery</td><td>NMC 24 V 50 Ah</td></tr>
                      <tr><td>Runtime / charge</td><td>3 h · 5 h</td></tr>
                      <tr><td>User power take-off</td><td>24 V / 12 V @ 10 A</td></tr>
                    </tbody>
                  </table>
                </div></div>
              </div>

              <div className="bracket product" data-p="2"><span className="bl" /><span className="br" />
                <div className="shot"><img src={`${A}/nexus-studio.jpg`} alt="NEXUS compact tactical ground robot" /></div>
                <div className="head">
                  <div><div className="name">NEXUS</div><div className="tag">Nano Exploration &amp; Utility System</div></div>
                  <div className="plus">+</div>
                </div>
                <div className="body"><div className="body-inner">
                  <div className="row"><div className="k">Overview</div><div className="v">Compact, invertible tactical robot — drives equally well upside down. Small enough for tight spaces, rugged enough to scout hazardous areas before a team enters.</div></div>
                  <div className="row"><div className="k">Use case</div><div className="v">Tactical reconnaissance, pre-entry surveillance, indoor security inspection, border monitoring.</div></div>
                  <div className="row"><div className="k">Industry</div><div className="v">Defence, police, protection forces, disaster response.</div></div>
                  <table className="spec-table">
                    <tbody>
                      <tr><td>Dimensions</td><td>350 × 330 × 140 mm</td></tr>
                      <tr><td>Drive</td><td>4WD — wheels or chain tracks</td></tr>
                      <tr><td>Payload</td><td>Up to 2 kg (modular)</td></tr>
                      <tr><td>RC range</td><td>300 m LOS / 100 m NLOS</td></tr>
                      <tr><td>Camera</td><td>Live digital video feed</td></tr>
                      <tr><td>Thermal tolerance</td><td>60 °C loaded, 30 min</td></tr>
                      <tr><td>Orientation</td><td>Fully invertible</td></tr>
                    </tbody>
                  </table>
                </div></div>
              </div>

              <div className="bracket product" data-p="3"><span className="bl" /><span className="br" />
                <div className="shot tile"><img src={`${A}/prod-altius.jpg`} alt="ALTIUS vertical climbing robot" /></div>
                <div className="head">
                  <div><div className="name">ALTIUS</div><div className="tag">Vertical Climbing Robot</div></div>
                  <div className="plus">+</div>
                </div>
                <div className="body"><div className="body-inner">
                  <div className="row"><div className="k">Overview</div><div className="v">Climbs ferromagnetic surfaces for inspection, cleaning and monitoring of high-altitude and hard-to-reach assets — removing the need for scaffolding, rope access and confined-space entry.</div></div>
                  <div className="row"><div className="k">Use case</div><div className="v">Ship-hull and storage-tank cleaning &amp; inspection, silo and infrastructure inspection, critical asset mapping.</div></div>
                  <div className="row"><div className="k">Industry</div><div className="v">Maritime &amp; shipbuilding, oil &amp; gas, power generation, manufacturing.</div></div>
                  <table className="spec-table">
                    <tbody>
                      <tr><td>Surface</td><td>Ferromagnetic, vertical</td></tr>
                      <tr><td>Ingress protection</td><td>Up to IP-65</td></tr>
                      <tr><td>Power</td><td>Continuous supply from station</td></tr>
                      <tr><td>Control</td><td>RF wireless drive</td></tr>
                      <tr><td>Payload</td><td>Modular tooling, multiple payloads</td></tr>
                      <tr><td>Data</td><td>Cloud-based live monitoring</td></tr>
                    </tbody>
                  </table>
                </div></div>
              </div>

              <div className="bracket product" data-p="4"><span className="bl" /><span className="br" />
                <div className="shot"><img src={`${A}/prod-atm.jpg`} alt="ATM all-terrain heavy carrier platform" /></div>
                <div className="head">
                  <div><div className="name">ATM</div><div className="tag">Any Terrain Machine</div></div>
                  <div className="plus">+</div>
                </div>
                <div className="body"><div className="body-inner">
                  <div className="row"><div className="k">Overview</div><div className="v">Heavy-class all-terrain carrier built around payload capacity and mounting flexibility for defence and heavy-construction duty.</div></div>
                  <div className="row"><div className="k">Use case</div><div className="v">Heavy payload carriage, anti-drone system carriage, accessory and weapon-station mounting.</div></div>
                  <div className="row"><div className="k">Industry</div><div className="v">Defence, construction.</div></div>
                  <div className="row"><div className="k">Configuration</div><div className="v">All-terrain wheeled carrier, camouflage finish. Detailed specification issued on request — configuration is defined per mission profile.</div></div>
                </div></div>
              </div>
            </div>

            <div style={{ marginTop: '56px' }}>
              <div className="eyebrow" style={{ marginBottom: '20px' }}>Platform &amp; Services</div>
              <div className="grid-2">
                <div className="cell svc"><div className="n">01</div><div><h4>ARNOBOT GCS Software</h4><p>Ground-control station for human–robot interaction: live video, sensor telemetry, SLAM maps, mission control and exportable field-usable mission reports.</p></div></div>
                <div className="cell svc"><div className="n">02</div><div><h4>Multi-Sensor Payload Integration</h4><p>LiDAR, thermal imaging, gas sensors, GPR and active-EM survey heads, and custom payloads tailored to defence and industrial requirements.</p></div></div>
                <div className="cell svc"><div className="n">03</div><div><h4>Field Deployment &amp; Ops Support</h4><p>On-site robot operation, mission execution and safety-critical deployment services — delivered as a managed service where the client prefers outcomes to assets.</p></div></div>
                <div className="cell svc"><div className="n">04</div><div><h4>R&amp;D Collaboration</h4><p>Joint development programmes with defence units, industry and research organisations, including custom attachment engineering on the SAIBYA chassis.</p></div></div>
              </div>
            </div>

            <div style={{ marginTop: '56px' }}>
              <div className="eyebrow" style={{ marginBottom: '20px' }}>Field Footage</div>
              <div className="video-grid">
                {/* To add another: copy a button below. YouTube -> data-yt="VIDEO_ID";
                    Google Drive -> data-drive="FILE_ID" (the file must be shared "anyone with the link"). */}
                <div className="video-slot">
                  <button className="yt" data-drive="1WRgcXtniGM7O_sUm11s0Wto3DwWiGKma" aria-label="Play: ALTIUS ship-hull trial at Alang">
                    <img src={`${A}/video-altius-alang.jpg`} alt="ARNOBOT engineers running the ALTIUS climbing robot on a ship hull at Alang" />
                    <span className="play" />
                    <span className="yt-cap">ALTIUS — ship-hull trial, Alang</span>
                  </button>
                </div>
                <div className="video-slot">
                  <button className="yt" data-drive="1-cVEB8JkxcN3BBFlSW9r0QFixCi6jm3r" aria-label="Play: ATM vehicle demonstration">
                    <img src={`${A}/atm-hero-field.jpg`} alt="The camouflaged ATM standing on trackway matting over desert sand during a field exercise, an army transport truck parked under trees behind it" />
                    <span className="play" />
                    <span className="yt-cap">ATM — desert field exercise</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Which vehicle answers which job — the matrix a buyer actually
                reads the product range through. Platform and mission only; the
                named customers behind them sit in section 05. */}
            <div style={{ marginTop: '56px' }}>
              <div className="eyebrow" style={{ marginBottom: '20px' }}>Vehicle Use Cases</div>
              <p className="sec-lede" style={{ marginBottom: '24px' }}>Every deployment starts as a job on a site, not a robot on a spec sheet. This is how the four platforms divide that work.</p>
              <table className="uc-table">
                <thead>
                  <tr><th scope="col">Vehicle</th><th scope="col">Use case</th><th scope="col">Operating environment</th><th scope="col">Sector</th></tr>
                </thead>
                <tbody>
                  <tr><td className="uc-veh">SAIBYA</td><td>Night perimeter surveillance — autonomous patrol, thermal and day optics, intrusion alerting to a control room</td><td>Open solar fields, plant perimeters, unlit sites</td><td>Renewables, industrial</td></tr>
                  <tr><td className="uc-veh">SAIBYA</td><td>Sub-surface cable mapping — GPR and active-EM survey heads over utility-scale ground</td><td>Buried trench routes, no satellite fix underground</td><td>Renewables, EPC, utilities</td></tr>
                  <tr><td className="uc-veh">SAIBYA</td><td>Mine dispensing and defence logistics — payload carriage to and across a laying line</td><td>Desert and broken cross-country terrain</td><td>Defence</td></tr>
                  <tr><td className="uc-veh">SAIBYA</td><td>Vegetation and weed cutting under panel rows, and general payload carriage on the modular deck</td><td>Solar arrays, worksites</td><td>Renewables, construction</td></tr>
                  <tr><td className="uc-veh">ALTIUS</td><td>Ship-hull cleaning and inspection — climbs the plate under tether, removing rope access and staging</td><td>Vertical ferromagnetic steel, at height, over water</td><td>Maritime, ship recycling</td></tr>
                  <tr><td className="uc-veh">ALTIUS</td><td>Storage-tank, silo and boiler-wall inspection with live cloud monitoring of the pass</td><td>Confined and elevated assets, no man-entry</td><td>Oil &amp; gas, power generation</td></tr>
                  <tr><td className="uc-veh">NEXUS</td><td>Pre-entry reconnaissance — invertible, drives on either face, scouts a space before a team commits to it</td><td>Culverts, rubble, indoor and tight approaches</td><td>Defence, police, disaster response</td></tr>
                  <tr><td className="uc-veh">NEXUS</td><td>Indoor security and border-post monitoring on a repeated route</td><td>Buildings, posts, fence lines</td><td>Homeland security</td></tr>
                  <tr><td className="uc-veh">ATM</td><td>Heavy payload carriage, anti-drone system carriage and weapon-station mounting</td><td>Sand, trackway, unprepared ground</td><td>Defence, heavy construction</td></tr>
                </tbody>
              </table>
              <p className="fin-note">Configurations are defined per mission profile. Detailed specifications and BOMs issued on request.</p>
            </div>
          </section>

          {/* TECHNOLOGY */}
          <section id="technology">
            <div className="eyebrow">03 — Technology</div>
            <h2 className="sec-title">One autonomy core. Every platform.</h2>
            <p className="sec-lede">For a new environment we change the body, not the intelligence. The same four-layer stack runs on all four vehicles, from remote control through semi-autonomous to fully autonomous — which is why a new mission is an integration job measured in weeks, not a new product programme.</p>

            <div className="grid-4">
              <div className="cell svc"><div className="n">L1</div><div><h4>Reflex</h4><p>Motor control, power management and the safety interlocks. Emergency stop is wired here, not to the autonomy computer — so it works even when everything above it is fully loaded.</p></div></div>
              <div className="cell svc"><div className="n">L2</div><div><h4>Perception</h4><p>Laser, camera and inertial data fused onboard. Detection runs on the robot, not in the cloud, so a lost link does not blind it.</p></div></div>
              <div className="cell svc"><div className="n">L3</div><div><h4>Autonomy</h4><p>Mapping, localisation and mission execution. Missions are handed over as an area to cover; the vehicle replans around obstacles and resumes the pass.</p></div></div>
              <div className="cell svc"><div className="n">L4</div><div><h4>Operations</h4><p>The GCS, the mission record and the reporting layer — where a run is planned, watched and afterwards audited.</p></div></div>
            </div>

            <div style={{ marginTop: '56px' }}>
              <div className="eyebrow" style={{ marginBottom: '20px' }}>The onboard loop</div>
              <div className="grid-3">
                <div className="cell tcard">
                  <img src={`${A}/tech-perceive.jpg`} alt="The sensor head on a Saibya mast in the field: a camera housing on each side, the radio antennas, and the amber warning beacon above them" />
                  <div className="n">01</div>
                  <h4>Perceive</h4>
                  <p>Laser, camera and inertial data fused on the robot. Detection runs onboard, not in the cloud.</p>
                </div>
                <div className="cell tcard">
                  <img src={`${A}/tech-localise.jpg`} alt="The scanning laser bolted to the Saibya deck — the sensor the robot builds its own map from when there is no satellite fix" />
                  <div className="n">02</div>
                  <h4>Localise</h4>
                  <p>Centimetre-grade with a satellite fix. Its own map without one — underground, indoors, under steel.</p>
                </div>
                <div className="cell tcard">
                  <img src={`${A}/tech-decide.jpg`} alt="The ARNOBOT Ground Control Station with five waypoints placed across satellite imagery" />
                  <div className="n">03</div>
                  <h4>Decide</h4>
                  <p>Missions are an area, not a joystick input. It replans around obstacles and resumes the pass.</p>
                </div>
              </div>
            </div>

            {/* The operations layer, on its own — the picture is the software
                itself, so the card runs wide with the capture beside the copy. */}
            <div className="cell tcard tcard-wide" style={{ marginTop: '56px' }}>
              <img src={`${A}/tech-gcs.jpg`} alt="The ARNOBOT Ground Control Station live mission dashboard: the route drawn on a map beside heading, speed, odometer and battery readouts, with the camera feeds along the bottom" />
              <div className="tcard-body">
                <div className="n">GCS</div>
                <h4>Ground Control &amp; mission record</h4>
                <p>Live video, sensor telemetry, SLAM maps and mission control in one operator interface. Every pass comes back as data — the map, the route actually driven, what was seen and when — exported as a field-usable mission report and reviewed at a desk long after the robot has left the site.</p>
              </div>
            </div>
          </section>

          <div className="hazard-rule" />

          {/* MARKET */}
          <section id="market" className="alt">
            <div className="eyebrow">04 — Market Opportunity</div>
            <h2 className="sec-title">A policy-backed shift toward remote, unmanned operations.</h2>
            <p className="sec-lede">Extreme hazards — toxins, explosions, radiation, confined spaces — across power, shipbuilding, defence and maritime operations are driving structural demand for reliable, standardised unmanned platforms.</p>

            <div className="grid-5">
              <div className="cell mstat"><div className="lbl">Industrial Robotics — India</div><div className="val">$4.86<small>Bn</small> → $13.47<small>Bn</small></div><div className="ctx">By 2033 · CAGR ≈ 13%</div></div>
              <div className="cell mstat"><div className="lbl">Defence / Deep-Tech — India</div><div className="val">$30<small>Bn</small></div><div className="ctx">Deep-tech market by 2030</div></div>
              <div className="cell mstat"><div className="lbl">UGV Market — Global</div><div className="val">$3.2<small>Bn</small> → $5.9<small>Bn</small></div><div className="ctx">By 2035 · CAGR ≈ 6–9%</div></div>
              <div className="cell mstat"><div className="lbl">Shipbuilding — India</div><div className="val">$1.12<small>Bn</small> → $8<small>Bn</small></div><div className="ctx">By 2033 · CAGR ≈ 28%</div></div>
              <div className="cell mstat"><div className="lbl">Maritime Investment — India</div><div className="val">₹3–3.5<small>L Cr</small></div><div className="ctx">Planned govt. investment by 2030</div></div>
            </div>

            <div className="grid-2" style={{ marginTop: '1px' }}>
              <div className="cell">
                <h4>Value Proposition</h4>
                <p>Robotic systems that make inspection, surveillance and asset protection safe and repeatable in environments where sending a person is slow, costly or dangerous — with the data captured, structured and reportable.</p>
              </div>
              <div className="cell">
                <h4>Customer Segments</h4>
                <div className="pill-row">
                  <span className="pill">Defence &amp; Homeland Security</span><span className="pill">Oil &amp; Gas</span><span className="pill">Power Generation</span><span className="pill">Shipyards &amp; Maritime</span><span className="pill">Renewables / Solar</span><span className="pill">Infrastructure &amp; Disaster Response</span>
                </div>
              </div>
            </div>
            <p className="fin-note">Market figures are company-compiled estimates from published third-party research; sources available on request.</p>
          </section>

          <div className="hazard-rule" />

          {/* TRACTION */}
          <section id="traction">
            <div className="eyebrow">05 — Traction &amp; Validation</div>
            <h2 className="sec-title">From field trial to purchase order.</h2>

            {/* Every figure here is itemised somewhere else in the deck —
                the awards and media in section 07, the design registration in
                the legal record. Nothing is counted twice. */}
            <div className="trac-nums">
              <div className="tn"><div className="num">5</div><div className="lbl">Awards &amp; recognitions</div></div>
              <div className="tn"><div className="num">1</div><div className="lbl">Design registration — granted</div></div>
              <div className="tn"><div className="num">1</div><div className="lbl">Provisional patent</div></div>
              <div className="tn"><div className="num">3</div><div className="lbl">Media features</div></div>
              <div className="tn"><div className="num">18+</div><div className="lbl">Exhibitions</div></div>
              <div className="tn"><div className="num">2+</div><div className="lbl">Guest lectures</div></div>
            </div>

            {/* The names, unsorted and unlabelled — who has put our machines on
                their ground. How far each has gone is a conversation, not a
                column heading. */}
            <div style={{ marginTop: '32px' }}>
              <div className="eyebrow" style={{ marginBottom: '18px' }}>Clients &amp; Validators</div>
              <ul className="name-strip">
                <li>Stable Dynamics</li>
                <li>Indian Army — 21 Engr Regiment</li>
                <li>SOLARISM Project — KP Group</li>
                <li>Leela Group of Ship Recycling Yard</li>
                <li>Atmos Power (Mazda Limited)</li>
                <li>Indian Army — 86 Infantry</li>
                <li>Barmer — desert terrain trial</li>
              </ul>
            </div>

            <div className="grid-2" style={{ marginTop: '1px' }}>
              <div className="cell">
                <h4>Revenue Streams</h4>
                <div className="pill-row" style={{ marginTop: '4px' }}>
                  <span className="pill">Product Sales</span><span className="pill">Custom Development</span><span className="pill">Service Contracts</span><span className="pill">Government Projects</span><span className="pill">Robotics-as-a-Service</span>
                </div>
              </div>
              <div className="cell">
                <h4>Live Opportunities</h4>
                <p>Solar-plant night surveillance (managed service and outright), sub-surface cable mapping at utility scale, defence electro-optic / weapon-station integration, and robotic HVAC duct cleaning.</p>
              </div>
            </div>

            {/* The pilots named above, photographed on the day. Each caption
                says only what the frame shows. */}
            <div style={{ marginTop: '56px' }}>
              <div className="eyebrow" style={{ marginBottom: '20px' }}>On site</div>
              <div className="grid-4">
                <figure className="proof-figure">
                  <img src={`${A}/proof-alang.jpg`} alt="Two ARNOBOT engineers in hard hats and hi-vis working the ground controls while the ALTIUS crawler holds the face of a ship hull above them" />
                  <figcaption>ALTIUS on a hull face — ship-recycling yard, Alang</figcaption>
                </figure>
                <figure className="proof-figure">
                  <img src={`${A}/proof-solar.jpg`} alt="A Saibya UGV on a paved service path beside a solar array, at the edge of the vegetation under the panel row" />
                  <figcaption>SAIBYA on a solar plant service route</figcaption>
                </figure>
                <figure className="proof-figure">
                  <img src={`${A}/proof-barmer.jpg`} alt="A Saibya UGV standing on open desert sand, its own tyre tracks behind it" />
                  <figcaption>SAIBYA on open sand — desert terrain trial</figcaption>
                </figure>
                <figure className="proof-figure">
                  <img src={`${A}/proof-nexus.jpg`} alt="The NEXUS robot driving inverted across leaf litter and roots, its lamps and camera facing forward from the underside" />
                  <figcaption>NEXUS running inverted over broken ground</figcaption>
                </figure>
              </div>
            </div>
          </section>

          <div className="hazard-rule" />

          {/* THE ASK */}
          <section id="ask" className="alt">
            <div className="eyebrow">06 — The Ask</div>
            <h2 className="sec-title">Raising ₹4 Cr to scale product, infrastructure and field validation.</h2>
            <p className="sec-lede">Seeking strategic stakeholders who understand real-world operational needs in defence and high-risk industries. Hover a segment for its allocation.</p>

            <div className="ask-wrap">
              <div style={{ textAlign: 'center' }}>
                <svg id="donutChart" className="donut-svg" viewBox="0 0 200 200" width="270" height="270" style={{ margin: '0 auto', display: 'block' }} />
                <div className="raise-amt">₹4 Cr</div>
                <div style={{ color: 'var(--text-3)', fontFamily: 'var(--font-plex-mono), monospace', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '.1em' }}>Total Ask</div>
              </div>
              <ul className="donut-legend" id="donutLegend" />
            </div>

            {/* The closing argument. Every line restates something already
                evidenced earlier in the deck — no new claim is introduced here. */}
            <div className="grid-4" style={{ marginTop: '56px' }}>
              <div className="cell svc"><div className="n">01</div><div><h4>The machines exist</h4><p>Four platforms built and run on real sites — a ship hull at Alang, a solar plant, open desert, broken ground. This is a scale-up, not a first build.</p></div></div>
              <div className="cell svc"><div className="n">02</div><div><h4>Demand is named, not modelled</h4><p>Two named clients — one of them an Indian Army engineer regiment — a purchase order in line on the SOLARISM project, and four completed field pilots.</p></div></div>
              <div className="cell svc"><div className="n">03</div><div><h4>One core, many bodies</h4><p>The same four-layer autonomy stack runs on every vehicle, so each new mission is an integration measured in weeks rather than a fresh product programme.</p></div></div>
              <div className="cell svc"><div className="n">04</div><div><h4>Built here, protected here</h4><p>Designed, fabricated and integrated in Ahmedabad, with a granted design registration on the tactical platform and a provisional patent filed.</p></div></div>
            </div>

            <p className="fin-note">Detailed financials, cap table and the full due-diligence pack are shared on request under NDA.</p>
          </section>

          {/* RECOGNITION */}
          <section id="recognition">
            <div className="eyebrow">07 — Recognition &amp; Media</div>
            <h2 className="sec-title">Awards, publications and press coverage.</h2>

            <div className="grid-2">
              <div className="cell">
                <h4 style={{ marginBottom: '6px' }}>Awards &amp; Recognition</h4>
                <div className="award-row"><div className="yr">Apr 2025</div><div><h4>Startup Maharathi, Startup Mahakumbh</h4><p>Bharat Mandapam, New Delhi · Category: B2B</p></div></div>
                <div className="award-row"><div className="yr">2025</div><div><h4>Robotics Startup of the Year</h4><p>World STEM &amp; Robotics Olympiad (WSRO)</p></div></div>
                <div className="award-row"><div className="yr">Jan 2025</div><div><h4>Startup Demo Day</h4><p>KPGU Vadodara — Recognition</p></div></div>
                <div className="award-row"><div className="yr">2025/26</div><div><h4>Distinguished Lecture Recognition</h4><p>Karnavati University — Startup &amp; Ecosystem</p></div></div>
                <div className="award-row" style={{ borderBottom: 'none' }}><div className="yr">2026</div><div><h4>Pride of Gujarat — Defence Category</h4><p>Vibrant Gujarat 2026, Rajkot</p></div></div>
              </div>
              <div className="cell">
                <h4 style={{ marginBottom: '6px' }}>Media Coverage</h4>
                <div className="award-row"><div className="yr">Jan 2026</div><div><h4>Efficient Manufacturing (EM) Magazine</h4><p>Vol. 17, Issue 03</p></div></div>
                <div className="award-row"><div className="yr">20 Jun 2026</div><div><h4>Divyabhaskar — City Activity</h4><p>Newspaper feature</p></div></div>
                <div className="award-row" style={{ borderBottom: 'none' }}><div className="yr">19 Jun 2026</div><div><h4>Gujarat First — News Channel</h4><p>Soft publication / on-air recognition</p></div></div>
                <div className="video-slot" style={{ marginTop: '16px' }}>
                  <button className="yt" data-yt="TWqw0dBhC78" aria-label="Play: Gujarat First coverage of ARNOBOT">
                    <img src={`${A}/video-gujarat-first.jpg`} alt="Gujarat First news coverage of ARNOBOT" />
                    <span className="play" />
                    <span className="yt-cap">Gujarat First — 19 Jun 2026</span>
                  </button>
                </div>
              </div>
            </div>

            {/* The bodies that gave the awards and the outlets that ran the
                coverage, as marks. The trophy photographs from the same award
                register are ~200px straight out of a PDF — unreadable at any
                size and five different aspect ratios, so the strip shows who
                recognised us rather than the object they handed over. */}
            <div className="logo-strip">
              <img src={`${A}/logo-mahakumbh.webp`} alt="Startup Mahakumbh" />
              <img src={`${A}/logo-wsro.webp`} alt="World STEM &amp; Robotics Olympiad" />
              <img src={`${A}/logo-vibrant-gujarat.png`} alt="Vibrant Gujarat" />
              <img src={`${A}/logo-kpgu.png`} alt="KPGU Vadodara" />
              <img src={`${A}/logo-karnavati.png`} alt="Karnavati University" />
              <img src={`${A}/logo-gujarat-first.png`} alt="Gujarat First" />
              <img src={`${A}/logo-divya-bhaskar.png`} alt="Divya Bhaskar" />
            </div>
          </section>

          {/* CONTACT */}
          <section id="contact" style={{ paddingBottom: 0, borderBottom: 'none' }}>
            <div className="eyebrow">08 — Contact</div>
            <h2 className="sec-title">Let&apos;s talk.</h2>

            <div className="contact-wrap">
              <div className="contact-card">
                <div className="role">Founder &amp; CEO — Company</div>
                <h3>Anmol Shah</h3>
                <a className="line" href="mailto:anmol@arnobot.in">anmol@arnobot.in</a>
                <a className="line" href="tel:+919925512860">+91 99255 12860</a>
                <a className="line" href="https://arnobot.in" target="_blank" rel="noopener">arnobot.in</a>
                <div className="addr">Arnobot Private Limited<br />G-2, Parul Apartments, Satellite Road<br />Ahmedabad – 380015, Gujarat, India</div>
              </div>
            </div>

            <div className="supported-by">
              <div className="lbl">Supported By</div>
              <div className="sb-pills">
                <span>i-Hub — Gujarat Government Enterprise</span>
                <span>KIIF — Karnavati Innovation &amp; Incubation Foundation</span>
                <span>AIC RRU Incubation Foundation</span>
                <span>GUSEC</span>
                <span>KPGU Vadodara</span>
                <span>SSIP Gujarat</span>
              </div>
            </div>

            <div className="foot-mark">
              <img src={`${A}/arnobot-wordmark.png`} alt="ARNOBOT™" />
              <span>Robotics Redefined · Made in India</span>
            </div>
            <div style={{ height: '36px' }} />
          </section>
          <div className="hazard-rule" />
          <div className="confidential">Strictly Private &amp; Confidential — Prepared for discussion purposes only</div>
        </main>
      </div>

      <PitchScripts />
    </>
  );
}
