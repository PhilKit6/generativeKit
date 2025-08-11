let bodies = [];
let t = 0;
let paperCol, inkCol;
let trails = []; // store past positions for intersection checks

function setup() {
  createCanvas(900, 700);
  colorMode(RGB, 255);
  paperCol = color(17, 17, 17);
  inkCol   = color(240, 240, 240, 200); // off-white ink

  background(paperCol);
  noFill();
  strokeWeight(1);

  initSystem();
}

function draw() {
  // gentle fade
  noStroke();
  fill(paperCol.levels[0], paperCol.levels[1], paperCol.levels[2], 15);
  rect(0, 0, width, height);
  stroke(inkCol);

  t += 0.01;

  for (const b of bodies) {
    if (!b.parent) continue;

    // modulated angular speed
    const speedNow = b.baseSpeed * (1 + b.speedAmp * sin(t * b.speedFreq + b.speedPhase));
    b.theta += speedNow;

    // eccentric radial breathing
    b.eccPhase += b.eccSpeed;
    const r = b.baseDist * (1 + b.eccAmp * sin(b.eccPhase));

    // precession
    const angle = b.theta + b.precess * t;

    const px = b.parent.x;
    const py = b.parent.y;
    const x = px + cos(angle) * r;
    const y = py + sin(angle) * r;

    // check intersection: see if close to any recent trail point
    for (let p of trails) {
      if (dist(x, y, p.x, p.y) < 3) {
        point(x, y); // only draw at intersections
        break;
      }
    }

    // store trail point (light memory)
    trails.push({ x, y });
    if (trails.length > 2000) trails.shift(); // limit memory

    // update body position
    b.x = x;
    b.y = y;
  }
}

function initSystem() {
  bodies = [];
  trails = [];
  background(paperCol);

  const sun = { x: width/2, y: height/2, parent: null };
  bodies.push(sun);

  const add = (parent, baseDist, baseSpeed, opts = {}) => {
    const b = {
      parent,
      baseDist,
      baseSpeed,
      theta: random(TAU),
      eccAmp: opts.eccAmp ?? random(0.03, 0.18),
      eccSpeed: opts.eccSpeed ?? random(0.005, 0.02),
      eccPhase: random(TAU),
      precess: opts.precess ?? random(-0.003, 0.003),
      speedAmp: opts.speedAmp ?? random(0.02, 0.12),
      speedFreq: opts.speedFreq ?? random(0.2, 0.8),
      speedPhase: random(TAU),
      x: 0, y: 0
    };
    bodies.push(b);
    return b;
  };

  const p1 = add(sun, 130, 0.010, { precess: 0.0015 });
  const p2 = add(sun, 210, 0.007, { eccAmp: 0.12, eccSpeed: 0.012, precess: -0.002 });
  const p3 = add(sun, 300, 0.005, { eccAmp: 0.06, precess: 0.0008 });

  add(p1, 40, 0.04,  { eccAmp: 0.10, precess: -0.004 });
  add(p2, 60, 0.035, { eccAmp: 0.08, precess: 0.006 });
  add(p3, 45, 0.05,  { eccAmp: 0.05, precess: -0.005 });

  for (let i = 0; i < 3; i++) add(p2, 30 + i*8, 0.06 + i*0.01, { eccAmp: 0.04 });
}

function keyPressed(){
  if (key === 'R') initSystem();
  if (key === 'S') saveCanvas('orbital_intersections', 'png');
}
