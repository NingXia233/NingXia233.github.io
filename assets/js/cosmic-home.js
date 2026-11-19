(() => {
  const canvas = document.querySelector('.stage .cosmos');
  const story = canvas.closest('.story');

  const scenes = [...document.querySelectorAll('[data-scene]')];
  const nav = [...document.querySelectorAll('.site-bar nav a')];
  const header = document.querySelector('.site-bar');
  const toggle = header.querySelector('.reading-toggle');
  const index = document.getElementById('site-index');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 48rem)');
  const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));
  const mix = (a, b, amount) => a + (b - a) * amount;
  const ease = amount => amount * amount * (3 - 2 * amount);
  let width = 0;
  let height = 0;
  let points = [];
  let indexPoint = 0;
  let target = 0;
  let shown = 0;
  let lastTime = 0;
  let frame = 0;
  let active = -1;
  let enabled = false;
  let viewOverride = null;
  let flight = null;
  let lastTextProgress = -1;
  let lastRender = 0;

  function resize() {
    if (!enabled) return;
    const box = canvas.parentElement.getBoundingClientRect();
    width = box.width;
    height = box.height;
    if (width <= 0 || height <= 0) return;
    resizeArt();
    const bar = header.getBoundingClientRect().height;
    points = scenes.map(scene => scene.getBoundingClientRect().top + scrollY - bar);
    indexPoint = index.getBoundingClientRect().top + scrollY - bar;
    update(true);
  }

  function update(jump = false) {
    if (!enabled || points.length === 0 || document.hidden) return;
    const position = scrollY;
    let segment = 0;
    while (segment < points.length - 1 && position >= points[segment + 1]) segment += 1;
    const length = points[segment + 1] - points[segment];
    target = segment + (length > 0 ? clamp((position - points[segment]) / length) : 0);
    const next = position >= indexPoint - 24 ? 3 : Math.round(target) - 1;
    if (next !== active) {
      active = next;
      nav.forEach((link, number) => number === active ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
    }
    if (jump) shown = target;
    if (!frame) {
      lastTime = 0;
      frame = requestAnimationFrame(tick);
    }
  }

  function flightView(now) {
    if (!flight) return shown;
    if (flight.start === null) return 1.045;
    const elapsed = (now - flight.start) / 1280;
    if (elapsed >= 1 || Math.abs(target - flight.destination) > .20) {
      flight = null;
      return shown;
    }
    if (elapsed <= .86) return mix(1.045, 2, clamp(elapsed / .86));
    return mix(2, flight.destination, fadeBetween(.86, 1, elapsed));
  }

  function tick(now) {
    frame = 0;
    if (!enabled || document.hidden) return;
    const dt = lastTime ? Math.min(now - lastTime, 48) : 16;
    lastTime = now;
    shown += (target - shown) * (1 - Math.exp(-dt / 90));
    if (Math.abs(shown - target) < .0015) shown = target;

    if (shown !== lastTextProgress) {
      lastTextProgress = shown;
      for (let i = 0; i < scenes.length; i++) {
        const entry = ease(clamp((shown - i + .57) / .57));
        scenes[i].style.setProperty('--rise', ((1 - entry) * 24) + 'px');
        scenes[i].style.setProperty('--incoming', (.61 + .39 * entry).toFixed(3));
      }
    }

    const inStory = scrollY < indexPoint - 7;
    if (inStory) {
      const visual = flightView(now);
      const interval = renderer.fallback ? 32 : renderer.software ? 24 : 14;
      if (now - lastRender >= interval || lastRender === 0) {
        paint(visual, motion.matches ? 0 : now * .001);
        lastRender = now;
      }
      const crossing = visual - 1;
      const veil = motion.matches ? 0 :
        fadeBetween(.16, .44, crossing) * (1 - fadeBetween(.68, .91, crossing));
      story.style.setProperty('--transit-veil', (veil * .86).toFixed(3));
    }
    if (inStory && (flight || shown !== target || !motion.matches)) {
      frame = requestAnimationFrame(tick);
    }
  }

  function onChapterJump(event) {
    const route = event.detail;
    if (!enabled) return;
    if (route?.phase === 'prepare') {
      const fromBlackHole = route.sourceY >= points[1] - height * .16 &&
        route.sourceY < points[2] - height * .21;
      const destination = { writing: 2, making: 3 }[route.destination];
      flight = fromBlackHole && destination && !motion.matches ?
        { start: null, destination } : null;
    }
    if (route?.phase === 'arrive' && flight) flight.start = performance.now();
    update(true);
  }

const cpuGiantRenderer = (() => {
    const TAU = 2 * Math.PI;
    const clamp = value => Math.max(0, Math.min(1, value));
    const mix = (a, b, amount) => a + (b - a) * amount;
    const curve = value => value * value * (3 - 2 * value);
    let surface = null;

    function hash(x, y, z) {
      let n = Math.imul(x, 1597334677) ^ Math.imul(y, 3812015801) ^ Math.imul(z, 958689871);
      n = Math.imul(n ^ n >>> 14, 2246822519);
      return ((n ^ n >>> 13) >>> 0) / 4294967296;
    }

    function noise(x, y, z) {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      const iz = Math.floor(z);
      const u = curve(x - ix);
      const v = curve(y - iy);
      const w = curve(z - iz);
      const near = mix(mix(hash(ix, iy, iz), hash(ix + 1, iy, iz), u),
                       mix(hash(ix, iy + 1, iz), hash(ix + 1, iy + 1, iz), u), v);
      const far = mix(mix(hash(ix, iy, iz + 1), hash(ix + 1, iy, iz + 1), u),
                      mix(hash(ix, iy + 1, iz + 1), hash(ix + 1, iy + 1, iz + 1), u), v);
      return mix(near, far, w);
    }

    // Semi-Lagrangian heat transport on a periodic-longitude photosphere.
    // The prescribed flow consists of two moving cells from streamfunctions
    // plus differential rotation. Diffusion competes with convective forcing.
    const lon = 112, lat = 64;
    let heat = new Float32Array(lon * lat);
    let next = new Float32Array(heat.length);
    const forcing = new Float32Array(heat.length);
    let seeded = false;
    let lastUpdate = -Infinity;

    function heatSample(x, y) {
      x = (x + lon) % lon;
      y = Math.max(0, Math.min(lat - 1.001, y));
      const x0 = x | 0, y0 = y | 0, right = (x0 + 1) % lon;
      const row = y0 * lon, below = row + lon;
      return mix(mix(heat[row + x0], heat[row + right], x - x0),
                 mix(heat[below + x0], heat[below + right], x - x0), y - y0);
    }

    function seedHeat() {
      for (let y = 0; y < lat; y++) {
        for (let x = 0; x < lon; x++) {
          const phase = x / lon * TAU;
          const a = Math.cos(phase), b = Math.sin(phase);
          const w = y * .126;
          const broad = noise(6 + a * 3.6, b * 3.6 + 4.0, w);
          const cells = noise(a * 12.5 + broad * 2.8, b * 12.5 + 11, w * 3.15);
          const spots = noise(a * 23.5 + 8.0, b * 23.5 + cells * 2, w * 7.1);
          const i = y * lon + x;
          forcing[i] = .17 + .43 * broad + .23 * cells + .16 * spots;
          heat[i] = forcing[i];
        }
      }
      seeded = true;
    }

    function evolve(time) {
      const fx = TAU * 4 / lon, fy = TAU * 2.4 / lat;
      const gx = TAU * 7 / lon, gy = TAU * 3.3 / lat;
      for (let y = 0; y < lat; y++) {
        const row = y * lon;
        const high = Math.min(lat - 1, y + 1) * lon;
        const low = Math.max(0, y - 1) * lon;
        const ay = y * fy - time * .53;
        const by = y * gy + time * .61;
        const sinA = Math.sin(ay), cosA = Math.cos(ay);
        const sinB = Math.sin(by), cosB = Math.cos(by);
        const spin = .12 + .31 * Math.sin(Math.PI * (y + .5) / lat) ** 2;
        for (let x = 0; x < lon; x++) {
          const ax = x * fx + time * .47, bx = x * gx - time * .76;
          const u = spin + 2.34 * fy * Math.sin(ax) * cosA + .91 * gy * Math.sin(bx) * cosB;
          const v = -2.34 * fx * Math.cos(ax) * sinA - .91 * gx * Math.cos(bx) * sinB;
          const i = row + x;
          const neighborhood = (heat[row + (x + lon - 1) % lon] + heat[row + (x + 1) % lon]
                               + heat[high + x] + heat[low + x]) * .25;
          const transported = mix(heatSample(x - u, y - v), neighborhood, .018);
          const buoyant = forcing[i] + .052 * Math.sin(bx + by * .64);
          next[i] = mix(transported, buoyant, .047);
        }
      }
      [heat, next] = [next, heat];
    }

    function imagePlane(size) {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ink = canvas.getContext('2d');
      if (!ink) return null;
      const frame = ink.createImageData(size, size);
      const points = [];
      const half = size * .5;
      for (let j = 0; j < size; j++) {
        for (let i = 0; i < size; i++) {
          const x = (i + .5 - half) / (half - 1);
          const y = (j + .5 - half) / (half - 1);
          const radius = Math.hypot(x, y);
          const edge = clamp((1 - radius) * half + .5);
          if (!edge) continue;
          const z = Math.sqrt(Math.max(0, 1 - radius * radius));
          const limb = .48 + .52 * z ** .43;
          const u = (.5 + Math.atan2(x, z) / TAU) * lon;
          const v = (.5 + Math.asin(y) / Math.PI) * (lat - 1);
          points.push({ offset: (j * size + i) * 4, x, y, z, limb, u, v });
          frame.data[(j * size + i) * 4 + 3] = 255 * edge;
        }
      }
      return { canvas, ink, frame, points };
    }

    function liveSurface(time, mobile) {
      if (!surface) surface = imagePlane(mobile ? 150 : 208);
      if (!surface) return null;
      if (time >= lastUpdate && time - lastUpdate < .045) return surface.canvas;
      if (!seeded) seedHeat();
      evolve(time);
      lastUpdate = time;
      const { canvas, ink, frame, points } = surface;
      const pixels = frame.data;
      const along = time * 1.23;
      const microShift = time * .85;
      for (const p of points) {
        const { offset, x, y, z, limb, u, v } = p;
        const cell = heatSample((u + along) % lon, v);
        const swirl = noise(15 + x * 7.8 + time * .22, 7 + y * 7.8, 13 + z * 7.8);
        const granule = noise(6 + x * 32 + microShift + swirl * 2.3,
                              2 + y * 32 - swirl * 2.0, 12 + z * 32);
        const fiber = noise(9 + x * 58 + granule * 1.5, y * 51 + microShift, 13 + z * 51);
        const granular = .6 * granule + .4 * fiber;
        const curled = 1 - Math.abs(granule * 2 - 1);
        const brightness = clamp((cell - .27) * 1.88 + granular * .35 + curled ** 4 * .092);
        const fire = brightness * Math.sqrt(brightness);
        const hot = brightness * fire;
        const rim = Math.max(0, 1 - z * 5) * (.15 + .13 * granular);
        pixels[offset] = (69 + 183 * brightness + 88 * hot) * limb + 225 * rim;
        pixels[offset + 1] = (9 + 49 * brightness + 167 * hot) * limb + 102 * rim;
        pixels[offset + 2] = (16 + 12 * brightness + 55 * hot) * limb + 26 * rim;
      }
      ink.putImageData(frame, 0, 0);
      return canvas;
    }

    const ejecta = Array.from({ length: 14 }, (_, i) => ({
      angle: i / 14 * TAU + (hash(i, 371, 83) - .5) * .61,
      span: .08 + hash(i, 129, 932) * .16,
      reach: .082 + hash(i, 349, 100) ** 2 * .35,
      speed: .34 + hash(i, 20, 311) * .83,
      phase: hash(i, 83, 371) * TAU,
      strength: .33 + .67 * hash(i, 210, 193) ** .58
    }));

    function flarePath(ctx, radius, angle, span, rise, lean, from = 0, to = 1) {
      const count = Math.max(4, Math.ceil((to - from) * 22));
      ctx.beginPath();
      for (let i = 0; i <= count; i++) {
        const u = mix(from, to, i / count);
        const envelope = Math.sin(Math.PI * u) ** .83;
        const twist = Math.sin(18 * u + angle * 4) * .052 + Math.sin(37 * u + span * 11) * .018;
        const lift = envelope * (1 + twist);
        const azimuth = angle + (u * 2 - 1) * span + lean * lift;
        const distance = radius * (.987 + rise * lift);
        const x = Math.cos(azimuth) * distance;
        const y = Math.sin(azimuth) * distance;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    }

    function drawCorona(ctx, radius, time) {
      const corona = ctx.createRadialGradient(0, 0, radius * .68, 0, 0, radius * 2.45);
      corona.addColorStop(0, 'transparent');
      corona.addColorStop(.18, '#ff4a1824');
      corona.addColorStop(.34, '#fa54192d');
      corona.addColorStop(.46, '#f5221519');
      corona.addColorStop(.67, '#ca13240c');
      corona.addColorStop(1, 'transparent');
      ctx.fillStyle = corona;
      ctx.fillRect(-radius * 2.46, -radius * 2.46, radius * 4.92, radius * 4.92);

      const strands = 11;
      for (let i = 0; i < strands; i++) {
        const arc = i / strands * TAU;
        const drift = Math.sin(time * .45 + i * 2.4);
        const span = .24 + .07 * Math.sin(i * 13);
        const x = Math.cos(arc) * radius * 1.06;
        const y = Math.sin(arc) * radius * 1.06;
        const plume = ctx.createRadialGradient(x, y, radius * .02, x, y, radius * (.22 + span));
        plume.addColorStop(0, '#ff683428');
        plume.addColorStop(.36, '#ff431512');
        plume.addColorStop(1, 'transparent');
        ctx.save();
        ctx.globalAlpha *= .36 + .33 * drift ** 2;
        ctx.fillStyle = plume;
        ctx.fillRect(x - radius * .6, y - radius * .6, radius * 1.2, radius * 1.2);
        ctx.restore();
      }
    }

    function drawArches(ctx, radius, time, mobile) {
      const quality = mobile ? 2 : 4;
      ctx.lineCap = 'round';
      for (const [index, flare] of ejecta.entries()) {
        if (mobile && index % 3 === 1) continue;
        const pulse = time * flare.speed + flare.phase;
        const intensity = .36 + .64 * (.5 + .5 * Math.sin(pulse)) ** 1.55;
        const rise = flare.reach * (.55 + .68 * intensity);
        const angle = flare.angle + Math.sin(pulse * .57) * .019;
        const lean = Math.sin(pulse * .71) * .072;
        ctx.save();
        ctx.globalAlpha *= intensity * flare.strength;
        const x = Math.cos(angle) * radius * 1.015;
        const y = Math.sin(angle) * radius * 1.015;
        const heat = ctx.createRadialGradient(x, y, 0, x, y, radius * (.12 + rise * .72));
        heat.addColorStop(0, '#ffac50cd');
        heat.addColorStop(.24, '#ff6b337c');
        heat.addColorStop(.54, '#ff49162e');
        heat.addColorStop(1, 'transparent');
        ctx.fillStyle = heat;
        ctx.fillRect(x - radius * .52, y - radius * .52, radius * 1.04, radius * 1.04);

        for (let thread = 0; thread < quality; thread++) {
          const proportion = thread / quality;
          const reach = rise * (.62 + proportion * .59);
          const azimuth = angle + (proportion - .5) * .096;
          const width = flare.span * (.76 + proportion * .51);
          flarePath(ctx, radius, azimuth, width, reach, lean - proportion * .06);
          ctx.lineWidth = Math.max(.43, radius * (.031 - proportion * .012));
          ctx.strokeStyle = '#ff3c1731';
          ctx.stroke();
          ctx.lineWidth = Math.max(.3, radius * (.009 - proportion * .004));
          ctx.strokeStyle = thread === quality - 1 ? '#ffb16199' : '#ff603981';
          ctx.stroke();

          const runner = .38 + .25 * Math.sin(pulse * 1.6 + thread * .86);
          flarePath(ctx, radius, azimuth, width, reach, lean - proportion * .06, runner, Math.min(1, runner + .22));
          ctx.lineWidth = Math.max(.25, radius * .004);
          ctx.strokeStyle = '#ffcd8ea4';
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    function drawSunspots(ctx, radius, time) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, radius * .999, 0, TAU);
      ctx.clip();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 6; i++) {
        const glow = .19 + .22 * (.5 + .5 * Math.sin(time * (.63 + i * .047) + i * 1.83));
        const x = radius * (hash(i, 198, 214) * 1.3 - .65);
        const y = radius * (hash(i, 202, 93) * 1.3 - .65);
        const size = radius * (.17 + hash(i, 239, 37) * .13);
        const active = ctx.createRadialGradient(x, y, 0, x, y, size);
        active.addColorStop(0, 'rgba(255, 92, 24, ' + glow + ')');
        active.addColorStop(.35, 'rgba(221, 56, 22, ' + glow * .72 + ')');
        active.addColorStop(1, 'transparent');
        ctx.fillStyle = active;
        ctx.fillRect(x - size, y - size, size * 2, size * 2);
      }
      ctx.restore();
    }

    return function draw(ctx, { x, y, r, time, opacity, mobile }) {
      if (r < 1 || opacity <= .001) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha *= clamp(opacity);
      drawCorona(ctx, r, time);
      const live = liveSurface(time, mobile);
      if (live) {
        ctx.drawImage(live, -r, -r, r * 2, r * 2);
      } else {
        ctx.fillStyle = '#b73219';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, TAU);
        ctx.fill();
      }
      drawSunspots(ctx, r, time);
      drawArches(ctx, r, time, mobile);
      ctx.restore();
    };
  })();

  function drawCpuGiant(ctx, scene) {
    cpuGiantRenderer(ctx, scene);
  }

// Canvas fallback. The cached values are inverse radii along numerically
// integrated null geodesics; disk coordinates and emission are evaluated here.
const drawCpuHole = (() => {
  const PI = Math.PI, BC = Math.sqrt(27), H = .14, STEPS = 79, BINS = 540;
  const span = 1 + Math.sqrt(7.3);
  let radii, orbit, bending, surface, pixels, mesh, meshKey = '', lastFrame = -1;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function smooth(a, b, v) {
    const q = clamp((v-a)/(b-a), 0, 1);
    return q*q*(3-2*q);
  }
  function buildRays() {
    orbit = new Float32Array(BINS*STEPS);
    radii = new Float32Array(BINS);
    bending = new Float32Array(BINS);
    for (let k = 0; k < BINS; ++k) {
      const s = k/(BINS-1)*span-1;
      const radius = 1 + s*Math.abs(s);
      radii[k] = radius;
      let u=0, v=1/Math.max(.012, BC*radius), end=false;
      bending[k] = 8.0;
      for (let n=1; n<STEPS; n++) {
        if (!end) {
          const a1=u*(3*u-1), um=u+.5*H*v, a2=um*(3*um-1);
          const un=um+.25*H*H*a1, a3=un*(3*un-1);
          const ue=u+H*v+.5*H*H*a2, a4=ue*(3*ue-1);
          const next=u+H*v+H*H/6*(a1+a2+a3);
          v+=H/6*(a1+2*a2+2*a3+a4);
          if(next>=.5) {end=true;u=.5;}
          else if(next<=0) {
            bending[k]=H*(n-1+u/(u-next))-PI;
            end=true;u=next;
          } else u=next;
        }
        orbit[k*STEPS+n]=u;
      }
    }
  }
  function bin(radius) {
    const d=radius-1;
    return clamp((1+Math.sign(d)*Math.sqrt(Math.abs(d)))*(BINS-1)/span,0,BINS-1.0001);
  }
  function buildMesh(res, view) {
    const w=2*Math.ceil(7.88*res)+1, h=2*Math.ceil(3.32*res)+1;
    if (!surface) surface=document.createElement('canvas');
    surface.width=w;surface.height=h;
    const sc=surface.getContext('2d');
    pixels=sc.createImageData(w,h);
    const rgba=pixels.data;
    const mu=.145+.075*view, sini=Math.sqrt(1-mu*mu);
    const roll=.105+.045*view, cr=Math.cos(roll), sr=Math.sin(roll);
    const sample=[], ids=[];
    for(let y=0; y<h; y++) {
      const py=((h-1)*.5-y)/res;
      for(let x=0; x<w; x++) {
        const px=(x-(w-1)*.5)/res, rr=Math.sqrt(px*px+py*py);
        if(rr>8.15) continue;
        const idx=y*w+x, off=idx*4;
        const cover=1-smooth(1-.48/res,1+.48/res,rr);
        rgba[off+3]=Math.round(255*cover);
        const ex=px/Math.max(rr,1e-5), ey=py/Math.max(rr,1e-5);
        const dx=ex*cr+ey*sr, dy=ey*cr-ex*sr;
        let phi=Math.atan2(mu,-dy*sini), tr=1, start=sample.length/10;
        const bk=bin(rr), k=Math.floor(bk), fraction=bk-k;
        for(let j=0; j<4 && phi<(STEPS-1)*H && tr>.007; j++,phi+=PI) {
          const an=phi/H, n=Math.floor(an), f=an-n, i=k*STEPS+n;
          const lo=orbit[i]+f*(orbit[i+1]-orbit[i]);
          const hi=orbit[i+STEPS]+f*(orbit[i+STEPS+1]-orbit[i+STEPS]);
          const inv=lo+fraction*(hi-lo);
          if(inv<=1/39 || inv>=1/6) continue;
          const r=1/inv, opacity=.91*smooth(6,7.4,r)*(1-smooth(23,39,r));
          if(opacity<.003) continue;
          const omega=inv*Math.sqrt(inv), az=Math.atan2(mu*Math.sin(phi)*dy-sini*Math.cos(phi),Math.sin(phi)*dx);
          const g=Math.sqrt(1-3*inv)/Math.max(.32,1+omega*BC*rr*sini*dx);
          const heat=Math.min(1.65,Math.pow(8*inv,.72)*g);
          const gold=smooth(.28,.8,heat), cream=smooth(.65,1.39,heat);
          const skyG=(.15+.37*gold)*(1-cream)+.86*cream;
          const skyB=(.032+.148*gold)*(1-cream)+.66*cream;
          const lr=Math.log(r), flux=tr*opacity*3.85*Math.pow(9.2*inv,1.72)*g*g*g;
          sample.push(flux,skyG,skyB,lr,az,3*omega,2*az+5.8*lr,3*az-6.5*lr,16*lr,40*lr);
          tr*=1-opacity;
        }
        if(sample.length/10>start) {
          const alpha=1-(1-cover)*tr;
          rgba[off+3]=Math.round(255*alpha);
          ids.push(off,start,sample.length/10,1/Math.max(alpha,.001));
        }
      }
    }
    mesh={sc, ids:new Float32Array(ids), sample:new Float32Array(sample),res};
  }
  const tone=new Uint8Array(4097);
  for(let i=0;i<tone.length;i++) tone[i]=Math.round(255*Math.pow(1-Math.exp(-i/256),1/2.2));
  function shade(t) {
    const {sc,ids,sample:a}=mesh, rgba=pixels.data;
    for(let k=0;k<ids.length;k+=4) {
      let r=0,g=0,b=0;
      for(let n=ids[k+1]*10;n<ids[k+2]*10;n+=10) {
        const dt=t*a[n+5], ph=a[n+4]-dt;
        const spiral=Math.sin(a[n+6]-2*dt);
        const eddy=Math.sin(a[n+7]-3*dt+.7*spiral);
        const warp=1.4*spiral+.85*eddy;
        const broad=.5+.5*Math.sin(a[n+8]+warp);
        const middle=Math.sin(a[n+9]+1.8*warp+.6*Math.sin(ph+a[n+3]));
        const fine=Math.sin(93*a[n+3]+3.6*warp+1.3*middle);
        const density=.63+.3*broad+.115*eddy+.13*middle+.075*fine;
        const value=a[n]*density;
        r+=value;g+=value*a[n+1];b+=value*a[n+2];
      }
      const off=ids[k], f=256*ids[k+3];
      rgba[off]=tone[clamp(Math.round(r*f),0,4096)];
      rgba[off+1]=tone[clamp(Math.round(g*f),0,4096)];
      rgba[off+2]=tone[clamp(Math.round(b*f),0,4096)];
    }
    sc.putImageData(pixels,0,0);
  }
  function bendAt(r) {
    if(r>8.2) {const ib=1/(BC*r);return ib*(4+ib*(11.78097+ib*42.66667));}
    const b=bin(r), i=Math.floor(b);
    return bending[i]+(b-i)*(bending[i+1]-bending[i]);
  }
  function imageRadius(angle, focal, hi) {
    let lo=1.001;
    for(let i=0;i<13;i++) {
      const r=.5*(lo+hi);
      if(Math.atan(r/focal)-bendAt(r)<angle) lo=r; else hi=r;
    }
    return .5*(lo+hi);
  }
  function drawStars(ctx,s,cx,cy,r,height,opacity) {
    const focal=clamp(3.4*r,.17*height,.6*height)/r;
    for(const star of s) {
      const dx=star.x-cx,dy=star.y-cy,dist=Math.hypot(dx,dy),rs=dist/r;
      if(rs>7) continue;
      const angle=Math.atan(rs/focal), direction=Math.atan2(dy,dx);
      const ux=Math.cos(direction),uy=Math.sin(direction);
      const size=clamp(star.size??.8,.35,2.5);
      ctx.fillStyle=star.blue?'#b5d9fd':'#fff1da';
      ctx.strokeStyle=ctx.fillStyle;ctx.lineCap='round';
      for(let parity=rs<=3?0:1;parity<2;parity++) {
        const side=parity?-1:1;
        const ri=imageRadius(side*angle,focal,Math.max(9,rs+3*Math.sqrt(focal)));
        const db=(bendAt(ri+.003)-bendAt(ri-.003))/.006;
        const radial=1/((1+(rs/focal)**2)*(1/(1+(ri/focal)**2)-focal*db));
        const tangential=ri/Math.max(rs,.00001);
        const gain=clamp(radial*tangential,.09,1);
        ctx.globalAlpha=clamp(opacity*(star.alpha??.75)*gain,0,1);
        if(tangential>1.65 && size*tangential>1.05) {
          const a=direction+parity*PI, half=dist<=size?PI:Math.asin(Math.min(.995,size/dist));
          ctx.lineWidth=Math.max(.4,2*size*radial);
          ctx.beginPath();ctx.arc(cx,cy,ri*r,a-half,a+half);ctx.stroke();
          if(half===PI) break;
        } else {
          const dotSize=size*Math.sqrt(clamp(radial*tangential,.15,1.6));
          ctx.beginPath();ctx.arc(cx+side*ri*r*ux,cy+side*ri*r*uy,dotSize,0,PI*2);ctx.fill();
        }
      }
    }
  }
  return function drawCpuHole(ctx,{x,y,r,width,height,time,opacity=1,view=0,stars=[]}) {
    if(!(r>.1) || opacity<=.002) return;
    if(!orbit) buildRays();
    const res=r<13?12:r<33?20:r<72?27:34;
    const tilt=Math.round(clamp(view,0,1)*20)/20;
    const key=res+'-'+tilt, frame=Math.floor(time*18);
    if(key!==meshKey) {buildMesh(res,tilt);meshKey=key;lastFrame=-1;}
    if(frame!==lastFrame) {shade(frame/18);lastFrame=frame;}
    ctx.save();
    drawStars(ctx,stars,x,y,r,height,opacity);
    ctx.globalAlpha=opacity;ctx.imageSmoothingEnabled=true;
    ctx.drawImage(surface,x-surface.width*r/(2*res),y-surface.height*r/(2*res),surface.width*r/res,surface.height*r/res);
    ctx.restore();
  };
})();

const cpuPlanetRenderer = (() => {
  const africa = [[-6.0,35.0],[3.0,36.0],[10.0,37.0],[12.0,33.0],[22.0,32.0],[31.0,31.0],[33.0,24.0],[39.0,15.0],[43.0,12.0],[51.0,12.0],[49.0,5.0],[43.0,-1.0],[40.0,-11.0],[36.0,-20.0],[31.0,-30.0],[20.0,-35.0],[16.0,-29.0],[12.0,-18.0],[13.0,-7.0],[8.0,4.0],[0.0,5.0],[-9.0,5.0],[-17.0,14.0],[-14.0,25.0]];
  const south = [[-79.0,9.0],[-74.0,12.0],[-68.0,11.0],[-62.0,10.0],[-57.0,6.0],[-50.0,1.0],[-44.0,-2.0],[-35.0,-6.0],[-37.0,-13.0],[-39.0,-20.0],[-45.0,-24.0],[-49.0,-28.0],[-52.0,-34.0],[-58.0,-38.0],[-63.0,-42.0],[-65.0,-49.0],[-67.0,-55.0],[-73.0,-52.0],[-74.0,-42.0],[-72.0,-29.0],[-70.0,-18.0],[-76.0,-12.0],[-81.0,-6.0],[-78.0,1.0]];
  const north = [[-153.0,60.0],[-163.0,65.0],[-154.0,71.0],[-134.0,70.0],[-126.0,73.0],[-103.0,75.0],[-89.0,73.0],[-83.0,65.0],[-76.0,70.0],[-65.0,61.0],[-57.0,54.0],[-66.0,44.0],[-75.0,36.0],[-81.0,26.0],[-86.0,30.0],[-96.0,25.0],[-97.0,19.0],[-87.0,21.0],[-86.0,14.0],[-79.0,10.0],[-86.0,9.0],[-104.0,21.0],[-120.0,33.0],[-135.0,56.0]];
  const eurasia = [[-10.0,43.0],[-9.0,36.0],[2.0,42.0],[12.0,45.0],[18.0,39.0],[27.0,40.0],[36.0,36.0],[35.0,30.0],[44.0,13.0],[57.0,24.0],[66.0,25.0],[75.0,19.0],[79.0,8.0],[89.0,22.0],[99.0,10.0],[106.0,20.0],[123.0,31.0],[139.0,51.0],[178.0,65.0],[161.0,72.0],[112.0,75.0],[52.0,72.0],[22.0,71.0],[4.0,56.0]];

  let world = null;
  let moon = null;
  const mix = (a,b,t) => a + (b-a)*t;
  const clip = value => Math.max(0, Math.min(1,value));
  const smooth = (a,b,x) => {
    const t = clip((x-a)/(b-a));
    return t*t*(3-2*t);
  };
  const sample255 = Array.from({length:2049}, (_, i) =>
    Math.round(255 * (1 - Math.exp(-i * .00134)) ** .455)
  );
  const tone = val => sample255[Math.min(2048, Math.max(0,Math.round(val*1024)))];

  function hash(x,y) {
    let n = Math.imul(x,374761393) ^ Math.imul(y,668265263);
    n = Math.imul(n ^ (n >>> 13),1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  function noise(x,y) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x-ix;
    const fy = y-iy;
    const u = fx*fx*(3-2*fx);
    const v = fy*fy*(3-2*fy);
    return mix(mix(hash(ix,iy),hash(ix+1,iy),u),mix(hash(ix,iy+1),hash(ix+1,iy+1),u),v);
  }

  function detail(x,y) {
    return .63*noise(x,y)+.27*noise(x*2.14+11,y*2.24+5)+.10*noise(x*4.52-8,y*4.43-6);
  }

  function outline(x,y,border) {
    let inside = false;
    let distance = 1000;
    let a = border[border.length-1];
    for (const b of border) {
      const ux = b[0]-a[0];
      const uy = b[1]-a[1];
      const vx = x-a[0];
      const vy = y-a[1];
      if ((a[1]>y)!==(b[1]>y) && ((uy>0)===(ux*vy-uy*vx>0))) inside = !inside;
      const h = clip((ux*vx+uy*vy)/Math.max(.001,ux*ux+uy*uy));
      distance = Math.min(distance,(vx-ux*h)**2+(vy-uy*h)**2);
      a = b;
    }
    return Math.sqrt(distance)*(inside?-1:1);
  }

  function ellipse(x,y,cx,cy,rx,ry) {
    return (Math.hypot((x-cx)/rx,(y-cy)/ry)-1)*Math.min(rx,ry);
  }

  function landDistance(x,y) {
    let distance = 12;
    if (x>-25 && x<58 && y>-43 && y<45) {
      distance = Math.min(outline(x,y,africa),ellipse(x,y,47,-20,2.2,6.3));
    }
    if (x>-89 && x<-28 && y<18 && y>-62) distance = Math.min(distance,outline(x,y,south));
    if (x<-49 && y>4) distance = Math.min(distance,outline(x,y,north));
    if (x>-19 && y>5) {
      distance = Math.min(distance,outline(x,y,eurasia),ellipse(x,y,-3.4,55,3,5.1),
        ellipse(x,y,-7.7,53,1.65,2.8),ellipse(x,y,15,65,5.2,7.6));
    }
    if (x>-81 && x<-14 && y>50) distance = Math.min(distance,ellipse(x,y,-43,72,15,10.6));
    return Math.min(distance,y+69+3*Math.sin(x*.033));
  }

  function createPage(size) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ink = canvas.getContext('2d');
    return {canvas,ink,pixels:ink.createImageData(size,size),size};
  }

  function setupEarth(size) {
    const page = createPage(size);
    page.geometry = new Float32Array(size*size*7);
    page.latitude = new Float32Array(size*size);
    page.last = -Infinity;
    const { data } = page.pixels;
    const angle = Math.PI/180;
    const tilt=.17, center=-.22;
    const ct=Math.cos(tilt), st=Math.sin(tilt), cc=Math.cos(center), sc=Math.sin(center);
    for (let y=0;y<size;y++) {
      const dy=1-(y+.5)*2/size;
      for (let x=0;x<size;x++) {
        const dx=(x+.5)*2/size-1;
        const pixel=y*size+x;
        const r2=dx*dx+dy*dy;
        if (r2>=1) continue;
        const z=Math.sqrt(1-r2);
        const lat = Math.asin(dy*ct+z*st);
        const forward = z*ct-dy*st;
        const lon = Math.atan2(dx*cc+forward*sc,forward*cc-dx*sc);
        const longitude=lon/angle;
        const latitude=lat/angle;
        const wr=detail(lon*42+27,lat*43-16);
        const ridge=detail(lon*17+16,lat*18+9);
        const wv=noise(lon*39+6,lat*40+22);
        const dist = landDistance(longitude+(wr-.5)*2.1,latitude+(wv-.5)*2.0);
        const solid = 1-smooth(-.55,.65,dist);
        const sand = clip(smooth(11,29,latitude)*(1-smooth(31,43,latitude))
          *smooth(-21,-9,longitude)*(.73+.34*ridge)+.21*smooth(.49,.72,ridge));
        const iced=smooth(61,82,Math.abs(latitude)+(ridge-.5)*8);
        const nearSea=Math.exp(-Math.max(0,dist)*.70);
        const lr=mix(mix(.033,.49,sand),.67,iced);
        const lg=mix(mix(.103,.30,sand),.75,iced);
        const lb=mix(mix(.043,.12,sand),.84,iced);
        const relief=.74+.43*wr+.17*ridge;
        const g=pixel*7;
        page.geometry[g]=mix(.004+.021*nearSea,lr*relief,solid);
        page.geometry[g+1]=mix(.027+.112*nearSea,lg*relief,solid);
        page.geometry[g+2]=mix(.107+.141*nearSea,lb*relief,solid);
        page.geometry[g+3]=lon;
        page.geometry[g+4]=lat;
        page.geometry[g+5]=-.49*dx+.36*dy+.79*z;
        page.geometry[g+6]=(1-z)**3.1;
        page.latitude[pixel]=Math.sin(lat);
        data[pixel*4+3]=Math.min(255,(1-Math.sqrt(r2))*size*142);
      }
    }
    return page;
  }

  function earthFrame(time, mobile) {
    const size=mobile?154:194;
    if (!world || world.size!==size) world=setupEarth(size);
    if (time-world.last<.095 && time>=world.last) return world.canvas;
    world.last=time;
    const { geometry, latitude, pixels, ink }=world;
    const { data }=pixels;
    const windPhase=time*.123;
    for (let i=0;i<latitude.length;i++) {
      const k=i*4;
      if (data[k+3]===0) continue;
      const g=i*7;
      const lat=latitude[i];
      const lon=geometry[g+3]+windPhase*(1+.6*lat*lat);
      const y=geometry[g+4];
      const sweeping=noise(lon*4.3+6.8,y*5.4+10.3);
      const u=lon*10.3+sweeping*3.4+4.0;
      const v=y*20.2+sweeping*1.5+17.0;
      const vapor=detail(u,v);
      const clouds=smooth(.47,.70,vapor*(.935+.112*Math.sin(lat*25+sweeping*5)));
      const shade=1-.22*clouds;
      const lit=.035+1.02*smooth(-.16,.71,geometry[g+5]);
      const dusk=smooth(-.21,.28,geometry[g+5]);
      const limb=geometry[g+6]*dusk;
      data[k]=tone(mix(geometry[g]*shade,.83,clouds*.93)*lit+.046*limb);
      data[k+1]=tone(mix(geometry[g+1]*shade,.91,clouds*.93)*lit+.21*limb);
      data[k+2]=tone(mix(geometry[g+2]*shade,1.06,clouds*.93)*lit+.57*limb);
    }
    ink.putImageData(pixels,0,0);
    return world.canvas;
  }

  function moonFrame() {
    if (moon) return moon;
    const {canvas,ink,pixels,size}=createPage(116);
    const craters=Array.from({length:95},(_,i)=>({
      x:hash(i,41)*2.8-1.4,y:hash(i,53)*2.4-1.2,
      r:.028+.17*hash(i,29)**3
    }));
    const {data}=pixels;
    for (let y=0;y<size;y++) {
      const ny=1-(y+.5)*2/size;
      for (let x=0;x<size;x++) {
        const nx=(x+.5)*2/size-1;
        const r2=nx*nx+ny*ny;
        if (r2>=1) continue;
        const nz=Math.sqrt(1-r2);
        const lon=Math.atan2(nx,nz);
        const lat=Math.asin(ny);
        const irregular=detail(lon*11+30,lat*11+14);
        const grains=noise(lon*61+19,lat*64+21);
        const coast=Math.min(ellipse(lon,lat,-.35,.19,.35,.32),
          ellipse(lon,lat,.28,.4,.27,.35),ellipse(lon,lat,-.17,-.36,.25,.26));
        const maria=1-smooth(-.12,.065,coast+(irregular-.5)*.27);
        let relief=0;
        for (const c of craters) {
          const dx=lon-c.x;
          const dy=lat-c.y;
          if (Math.abs(dx)>c.r*1.24 || Math.abs(dy)>c.r*1.24) continue;
          const d=Math.hypot(dx,dy)/c.r;
          const slope=(-dx*.71+dy*.61)/(Math.max(.015,d)*c.r);
          relief+=smooth(.60,.95,d)*(1-smooth(.96,1.25,d))*(.06+.19*slope);
          relief-=(1-smooth(.23,.9,d))*(.10+.09*slope);
        }
        const light=.020+Math.max(0,-.68*nx+.31*ny+.66*nz)*.89;
        const surface=clip(.43+.27*irregular+.13*grains-.25*maria+relief)*light;
        const p=(y*size+x)*4;
        data[p]=tone(surface*.95);
        data[p+1]=tone(surface*.92);
        data[p+2]=tone(surface*.89);
        data[p+3]=Math.min(255,(1-Math.sqrt(r2))*size*140);
      }
    }
    ink.putImageData(pixels,0,0);
    moon=canvas;
    return moon;
  }

  return function draw(ctx, { x,y,r,width,height,time,stage,mobile,opacity=1 }) {
    if (r<1 || opacity<.001) return;
    ctx.save();
    ctx.globalAlpha*=opacity;
    const approach=clip(stage);
    const drift=Math.sin(time*.071+approach*.72);
    const moonR=r*(.212-.024*approach);
    const away=width-x<r*1.51?-1:1;
    const moonX=Math.min(width-moonR*1.12,Math.max(moonR*1.12,x+away*r*(1.37+approach*.08+drift*.045)));
    const moonY=Math.max(moonR*1.22,y-r*(.66+.15*approach));
    ctx.drawImage(moonFrame(),moonX-moonR,moonY-moonR,moonR*2,moonR*2);

    const haze=ctx.createRadialGradient(x,y,r*.93,x,y,r*1.145);
    haze.addColorStop(0,'rgba(79,157,247,0)');
    haze.addColorStop(.30,'rgba(95,172,255,.77)');
    haze.addColorStop(.44,'rgba(65,141,239,.46)');
    haze.addColorStop(.67,'rgba(40,105,212,.12)');
    haze.addColorStop(1,'rgba(40,105,212,0)');
    ctx.fillStyle=haze;
    ctx.fillRect(x-r*1.15,y-r*1.15,r*2.30,r*2.30);
    ctx.drawImage(earthFrame(time,mobile),x-r,y-r,r*2,r*2);
    ctx.restore();
  };
})();

function drawCpuPlanets(ctx, scene) {
  cpuPlanetRenderer(ctx,scene);
}

  const softwareCanvas = document.querySelector('.stage .software');
  const ink = softwareCanvas.getContext('2d');
  const cpuStars = [];
  const cpuChannels = [];
  const cpuColors = [
    ['#09060e','#240d16','#571c17'],
    ['#06080f','#11101f','#211426'],
    ['#060e19','#102438','#25486a'],
    ['#040c17','#122a41','#23456e']
  ];

  function grainSeed(number) {
    const n = Math.sin(number * 12.9898 + 78.233) * 43758.5453123;
    return n - Math.floor(n);
  }

  for (let i = 0; i < 179; i++) {
    const seed = i * 9;
    cpuStars.push({
      rawX: grainSeed(seed + 1), rawY: grainSeed(seed + 2),
      size: .27 + grainSeed(seed + 3) ** 4 * 1.66,
      light: .18 + grainSeed(seed + 4) ** 2 * .78,
      blue: grainSeed(seed + 5) > .43,
      x: 0,y: 0,alpha: 0
    });
  }
  for (let i = 0; i < 126; i++) {
    const seed = i * 11;
    cpuChannels.push({
      azimuth: grainSeed(seed + 6) * Math.PI * 2,
      depth: grainSeed(seed + 7),
      speed: .42 + grainSeed(seed + 8) * 1.27,
      bend: .26 + grainSeed(seed + 9) * .74,
      light: .17 + grainSeed(seed + 10) ** 1.5 * .83
    });
  }

  function cpuSky(target,look,mode,time,progress,lens=0) {
    const first = cpuColors[Math.floor(mode)];
    const second = cpuColors[Math.ceil(mode)];
    const phase = mode - Math.floor(mode);
    const colors = first === second ? first : first.map((color, i) => {
      const a = parseInt(color.slice(1), 16);
      const b = parseInt(second[i].slice(1), 16);
      const red = Math.round(mix(a >> 16, b >> 16, phase));
      const green = Math.round(mix((a >> 8) & 255, (b >> 8) & 255, phase));
      const blue = Math.round(mix(a & 255, b & 255, phase));
      return 'rgb(' + red + ',' + green + ',' + blue + ')';
    });
    const radius = Math.max(width,height) * .67;
    const field = target.createRadialGradient(look.x,look.y,0,look.x,look.y,radius);
    field.addColorStop(0,colors[2]);
    field.addColorStop(.52,colors[1]);
    field.addColorStop(1,colors[0]);
    target.fillStyle = field;
    target.fillRect(0,0,width,height);
    target.save();
    for (let i = 0; i < cpuStars.length; i++) {
      const star = cpuStars[i];
      star.x = ((star.rawX + 1 - progress * .018 * (1 + star.size)) % 1) * width;
      star.y = ((star.rawY + 1 + progress * .012 * (1 + star.size)) % 1) * height;
      const behindText = compact.matches ? star.y > height * .44 : star.x < width * .40;
      star.alpha = star.light * (behindText ? .38 : 1) * (.91 + .09 * Math.sin(i * 6.4 + time * .97));
      const r = Math.hypot(star.x - look.x,star.y-look.y);
      target.globalAlpha = star.alpha * (r < 3.0 * look.r ? 1 - lens : 1);
      target.fillStyle = star.blue ? '#bad4ff' : '#ffe4cd';
      target.beginPath();
      target.arc(star.x,star.y,star.size,0,Math.PI*2);
      target.fill();
    }
    target.restore();
  }

  function cpuOrbit(target,planet,stage,time,progress) {
    cpuSky(target,planet,progress >= 2.5 ? 3 : 2,time,progress);
    drawCpuPlanets(target,{
      ...planet,width,height,time,stage,opacity:1,mobile:compact.matches
    });
  }

  function cpuCaustics(target,cx,cy,u,time,opacity) {
    const unit = Math.min(width,height);
    const span = Math.hypot(width,height) * .85;
    const opening = fadeBetween(.425,.66,u);
    const blowout = fadeBetween(.47,.64,u) * (1 - fadeBetween(.76,.94,u));
    const depth = u * 6.2;
    const shell = unit * (.105 + opening * .29);
    const roll = .33 + .73 * u;
    target.save();
    target.translate(cx,cy);
    target.rotate(roll);
    target.scale(1,.83);
    target.globalCompositeOperation = 'screen';
    const fog = target.createRadialGradient(0,0,0,0,0,unit*.83);
    fog.addColorStop(0,opening > .5 ? '#38599c' : '#381334');
    fog.addColorStop(.31,opening > .5 ? '#183265' : '#2a1328');
    fog.addColorStop(1,'transparent');
    target.globalAlpha = opacity * (.50 + .3 * blowout);
    target.fillStyle = fog;
    target.fillRect(-span,-span,span*2,span*2);

    const filtered = target.createRadialGradient(0,0,unit*.01,0,0,span);
    filtered.addColorStop(0,opening > .5 ? '#b9eeff' : '#ffd6a1');
    filtered.addColorStop(.24,opening > .5 ? '#658cff' : '#e0896a');
    filtered.addColorStop(.63,opening > .5 ? '#9b7bff' : '#bd5e91');
    filtered.addColorStop(1,'transparent');
    target.strokeStyle = filtered;
    const amount = compact.matches ? 72 : cpuChannels.length;
    for (let j = 0; j < amount; j++) {
      const jet = cpuChannels[j];
      const flow = (jet.depth + depth * jet.speed) % 1;
      const r0 = unit * (.031 + flow ** 1.85 * .65);
      const d = (unit * (.17 + .27 * (1 - flow)) + span * flow * .65) * jet.speed;
      const strength = opacity * jet.light * (.29 + .51 * blowout) *
        (.57 + .43 * Math.sin(j*.54 + time*.37 + depth)**2);
      target.globalAlpha = strength;
      target.beginPath();
      for (let k = 0; k <= 18; k++) {
        const step = k/18;
        const r = r0 + d * step;
        const phi = jet.azimuth + Math.log(.06 + r/unit) * (jet.bend + .48*u) +
          .15*Math.sin(step*4.8 + depth*.93 + jet.depth*3.2);
        const x = r * Math.cos(phi), y = r * Math.sin(phi);
        if (k === 0) target.moveTo(x,y);
        else target.lineTo(x,y);
      }
      target.lineWidth = .58 + 1.31 * flow + 2.1 * blowout * jet.light;
      target.stroke();
      if (j % 4 === 0) {
        target.globalAlpha *= .21;
        target.lineWidth *= 4.1;
        target.stroke();
      }
    }

    if (blowout > .002) {
      const glow = target.createRadialGradient(0,0,0,0,0,shell*1.65);
      glow.addColorStop(0,'#effbff');
      glow.addColorStop(.18,'#bae4ff');
      glow.addColorStop(.38,'#6897ef8a');
      glow.addColorStop(.71,'#364f9136');
      glow.addColorStop(1,'transparent');
      target.globalAlpha = blowout * opacity * .91;
      target.fillStyle = glow;
      target.fillRect(-shell*1.65,-shell*1.65,shell*3.3,shell*3.3);

      for (let band = 0; band < 11; band++) {
        const radius = shell * (.70 + band*.062);
        target.globalAlpha = opacity * blowout * (.55 - band*.031);
        target.strokeStyle = ['#a2d3ff','#d8f7ff','#9c9dff'][band % 3];
        target.lineWidth = .85 + band * .115;
        target.beginPath();
        for (let k = 0; k <= 90; k++) {
          const theta = k / 90 * Math.PI*2;
          const wave = 1 + .13*Math.sin(theta*3 + u*5 + band*.07) +
            .049*Math.cos(theta*7 + depth*.83 - band*.12);
          const x = radius*wave * Math.cos(theta);
          const y = radius*wave * Math.sin(theta);
          if (k === 0) target.moveTo(x,y);
          else target.lineTo(x,y);
        }
        target.closePath();
        target.stroke();
      }
    }
    target.restore();
  }

  function tracePortalExit(target,look,radius,relax,u) {
    target.beginPath();
    for (let k = 0; k <= 90; k++) {
      const a = k / 90 * Math.PI * 2;
      const r = radius * (1 + relax * (.16*Math.sin(a*3+u*8) + .06*Math.cos(a*7-u*14)));
      const x = look.x + Math.cos(a)*r;
      const y = look.y + Math.sin(a)*r;
      if (k === 0) target.moveTo(x,y);
      else target.lineTo(x,y);
    }
    target.closePath();
  }

  function cpuPass(target,look,earth,u,time) {
    const occult = fadeBetween(.205,.52,u);
    cpuSky(target,look,1,time,1+u,1-occult);
    if (occult < .945) {
      target.save();
      target.translate(look.x,look.y);
      const tilt = fadeBetween(.02,.39,u);
      target.rotate(-.24*tilt);
      target.transform(1,.12*tilt,-.22*tilt,1-.15*tilt,0,0);
      drawCpuHole(target,{
        x:0,y:0,r:look.r,width,height,time,opacity:1-occult,view:tilt,
        stars:cpuStars.map(star=>({...star,x:star.x-look.x,y:star.y-look.y}))
      });
      target.restore();
    }
    target.save();
    target.fillStyle='#050611';
    target.globalAlpha=occult;
    target.fillRect(0,0,width,height);
    target.restore();
    const light = fadeBetween(.17,.46,u) * (1-fadeBetween(.80,.987,u));
    if (light > .001) cpuCaustics(target,look.x,look.y,u,time,light);

    const exit = fadeBetween(.641,.956,u);
    if (exit <= .002) return;
    const radius = Math.hypot(width,height)*1.09*exit;
    const relax = 1 - fadeBetween(.70,.97,u);
    target.save();
    tracePortalExit(target,look,radius,relax,u);
    target.clip();
    if (relax > .001) {
      target.translate(look.x,look.y);
      target.rotate(-relax*.33);
      target.transform(1+relax*.33,-relax*.10,relax*.19,1+relax*.14,0,0);
      target.translate(-look.x,-look.y);
    }
    cpuOrbit(target,earth,0,time,2);
    target.restore();

    const rim = relax * (1 - fadeBetween(.76,.94,u));
    if (rim <= .003) return;
    target.save();
    target.globalCompositeOperation = 'screen';
    const bands = [['#6754b9',-6,4.8],['#a6e6ff',0,2.0],['#e4ab9c',5,2.7]];
    for (const [color, offset, thickness] of bands) {
      tracePortalExit(target,look,Math.max(.01,radius + offset),relax,u);
      target.strokeStyle = color;
      target.globalAlpha = rim * .65;
      target.lineWidth = thickness;
      target.stroke();
    }
    target.restore();
  }

  function drawSoftware(progress,time,look,earth,mode,transit,stage,blend) {
    if (mode === 2) {
      cpuOrbit(ink,earth,stage,time,progress);
      return;
    }
    if (mode === 1) {
      cpuPass(ink,look,earth,transit,time);
      return;
    }
    const lunar = fadeBetween(.18,.88,blend);
    const mobile = compact.matches;
    cpuSky(ink,look,blend,time,progress,lunar);
    if (lunar < .997) {
      drawCpuGiant(ink,{...look,width,height,time,opacity:1-lunar,mobile});
    }
    if (lunar > .003) {
      drawCpuHole(ink,{...look,width,height,time,opacity:lunar,view:0,stars:cpuStars});
    }
  }


  const cosmos = document.querySelector('.stage .cosmos');
  const station = document.querySelector('.stage .station');
  const stationInk = station.getContext('2d');
  const gl = cosmos.getContext('webgl2', {
    alpha: false, antialias: false, depth: false, stencil: false,
    powerPreference: 'high-performance'
  });
  let renderer = null;
  let stationVisible = false;

  function softRenderer() {
    return ink ? { fallback: true, software: true } : null;
  }

  function chooseRenderer() {
    return buildRenderer() || softRenderer();
  }

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(error);
    }
    return shader;
  }

  function buildRenderer() {
    if (!gl) return null;
    const vertexSource = '#version 300 es\nvoid main(){vec2 p=vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);gl_Position=vec4(p*2.0-1.0,0.0,1.0);}';
    try {
      const vertex = compile(gl.VERTEX_SHADER, vertexSource);
      const source = document.querySelector('#cosmos-shader').textContent.trimStart();
      const fragment = compile(gl.FRAGMENT_SHADER, source);
      const program = gl.createProgram();
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      gl.bindVertexArray(gl.createVertexArray());
      const uniforms = {};
      for (const name of ['Viewport', 'Center', 'EarthCenter', 'Radius', 'EarthRadius',
        'Time', 'Stage', 'Travel', 'Mix', 'View', 'Quality', 'Mode']) {
        uniforms[name] = gl.getUniformLocation(program, 'u' + name);
      }
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      const software = info && /SwiftShader|llvmpipe|Software|lavapipe/i.test(
        gl.getParameter(info.UNMASKED_RENDERER_WEBGL) || '');
      return { uniforms, software };
    } catch (error) {
      console.error('Cosmos shader could not start.', error);
      return null;
    }
  }

  const skyCameras = [
    { x: .749, y: .428, radius: .212 },
    { x: .721, y: .429, radius: .126 },
    { x: .731, y: .422, radius: .179 },
    { x: .744, y: .452, radius: .205 }
  ];
  const fadeBetween = (from, to, value) => ease(clamp((value - from) / (to - from)));
  let gpuScale = 1;

  function camera(a, b, fraction) {
    const x = mix(a.x,b.x,fraction);
    const y = mix(a.y,b.y,fraction);
    const radius = mix(a.radius,b.radius,fraction);
    const narrow = compact.matches;
    return {
      x: width * (narrow ? .52 + (x - .73) * .53 : x),
      y: height * (narrow ? .114 + .288 * y : y),
      r: Math.min(width,height) * radius * (narrow ? 1.16 : 1)
    };
  }

  function resizeArt() {
    const narrow = compact.matches;
    const maxWidth = renderer.software ? (narrow ? 470 : 800) : (narrow ? 675 : 1420);
    const maxHeight = renderer.software ? 600 : 1050;
    gpuScale = Math.min(devicePixelRatio || 1, maxWidth / width, maxHeight / height);
    const displayScale = Math.min(devicePixelRatio || 1, 1.55);
    if (renderer.fallback) {
      const cpuScale = Math.min(devicePixelRatio || 1, 1150 / width, 920 / height);
      softwareCanvas.width = Math.max(2, Math.round(width * cpuScale));
      softwareCanvas.height = Math.max(2, Math.round(height * cpuScale));
      ink.setTransform(cpuScale,0,0,cpuScale,0,0);
    } else {
      cosmos.width = Math.max(2, Math.round(width * gpuScale));
      cosmos.height = Math.max(2, Math.round(height * gpuScale));
      gl.viewport(0,0,cosmos.width,cosmos.height);
    }
    station.width = Math.max(2, Math.round(width * displayScale));
    station.height = Math.max(2, Math.round(height * displayScale));
    stationInk?.setTransform(displayScale, 0, 0, displayScale, 0, 0);
    stationVisible = false;
  }

  function drawStation(planet, stage, opacity, time) {
    if (!stationInk || (!stationVisible && opacity <= .001)) return;
    stationInk.clearRect(0,0,width,height);
    stationVisible = opacity > .001;
    if (!stationVisible) return;
    const {x,y,r} = planet;
    const narrow = compact.matches;
    const span = r * ((narrow ? .97 : 1.18) + stage * (narrow ? .38 : .56));
    const rigX = Math.min(width - span * .57, Math.max(span * .57, x + r * (.33 - .36 * stage)));
    const rigY = Math.min(height - span * .13, y + r * (.91 - .29 * stage) + 2.5 * Math.sin(time * .46));
    stationInk.save();
    stationInk.globalAlpha = opacity;
    drawEarthStationRig(stationInk, rigX, rigY, span / 7.5, time, stage);
    stationInk.restore();
  }

  function paint(progress, time) {
    if (!renderer || !width || !height || (!renderer.fallback && gl.isContextLost())) return;
    const stage = clamp(progress - 2);
    const toOrbit = progress >= 2;
    const crossing = progress > 1 && !toOrbit && !motion.matches;
    const mode = toOrbit ? 2 : crossing ? 1 : 0;
    const transit = crossing ? progress - 1 : 0;
    const holeBlend = ease(clamp(progress));
    const earth = camera(skyCameras[2], skyCameras[3], ease(stage));
    const cameraView = camera(skyCameras[0], skyCameras[1],holeBlend);
    const plunge = fadeBetween(.012,.35,transit);
    if (crossing) {
      cameraView.x = mix(cameraView.x, width * (compact.matches ? .51 : .58), plunge);
      cameraView.y = mix(cameraView.y, height * .47, plunge);
      cameraView.r *= 1 + plunge * 3.15;
    }
    if (renderer.fallback) {
      drawSoftware(progress,time,cameraView,earth,mode,transit,stage,holeBlend);
      drawStation(earth,stage,toOrbit ? 1 : fadeBetween(.89,.99,transit),time);
      return;
    }

    const uniforms = renderer.uniforms;
    gl.uniform2f(uniforms.Viewport,cosmos.width,cosmos.height);
    gl.uniform2f(uniforms.Center,cameraView.x * gpuScale,(height-cameraView.y) * gpuScale);
    gl.uniform2f(uniforms.EarthCenter,earth.x * gpuScale,(height-earth.y) * gpuScale);
    gl.uniform1f(uniforms.Radius,cameraView.r * gpuScale);
    gl.uniform1f(uniforms.EarthRadius,earth.r * gpuScale);
    gl.uniform1f(uniforms.Time,time % 900);
    gl.uniform1f(uniforms.Stage,stage);
    gl.uniform1f(uniforms.Travel,transit);
    gl.uniform1f(uniforms.Mix,holeBlend);
    gl.uniform1f(uniforms.View,plunge);
    gl.uniform1f(uniforms.Quality,renderer.software || compact.matches ? 0 : 1);
    gl.uniform1i(uniforms.Mode,mode);
    gl.drawArrays(gl.TRIANGLES,0,3);
    const opacity = toOrbit ? 1 : fadeBetween(.89,.99,transit);
    drawStation(earth,stage,opacity,time);
  }



  function drawEarthStationRig(ctx, cx, cy, scale, time, approach) {
    const yaw = .30 + approach * .19 + .07 * Math.sin(time * .23);
    const pitch = .23 + .12 * Math.sin(time * .21 + .8);
    const roll = -.26 + .22 * approach + .04 * Math.sin(time * .27);
    const sy = Math.sin(yaw), cyaw = Math.cos(yaw);
    const sp = Math.sin(pitch), cp = Math.cos(pitch);
    const sr = Math.sin(roll), cr = Math.cos(roll);
    const project = (x, y, z) => {
      const ax = x * cyaw + z * sy;
      const az = -x * sy + z * cyaw;
      const ay = y * cp - az * sp;
      const depth = y * sp + az * cp;
      const perspective = 9 / (9 + depth);
      return [cx + (ax * cr - ay * sr) * scale * perspective, cy + (ax * sr + ay * cr) * scale * perspective];
    };
    const path = (points, close = false) => {
      const first = project(...points[0]);
      ctx.beginPath();
      ctx.moveTo(first[0], first[1]);
      for (const point of points.slice(1)) {
        const p = project(...point);
        ctx.lineTo(p[0], p[1]);
      }
      if (close) ctx.closePath();
    };
    const beam = (a, b, color, weight = 1) => {
      path([a, b]);
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(.45, scale * weight);
      ctx.stroke();
    };
    const fill = (points, color) => {
      path(points, true);
      ctx.fillStyle = color;
      ctx.fill();
    };
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Silver truss with gold structural edges. Extra members are fully projected too.
    beam([-3.86, 0, 0], [3.86, 0, 0], '#0b1021', .24);
    beam([-3.84, -.064, 0], [3.84, -.064, 0], '#d2d7d9', .075);
    beam([-3.84, .089, 0], [3.84, .089, 0], '#7d92ac', .059);
    for (let i = -9; i < 9; i += 1) {
      const x = i * .42;
      beam([x, .09, 0], [x + .42, -.075, 0], '#a0adba', .025);
    }
    const wingX = [-3.23, -2.10, 2.10, 3.23];
    for (const x of wingX) {
      for (const sign of [-1, 1]) {
        const y0 = sign * .25, y1 = sign * 1.62;
        const z0 = .06, z1 = .24 + sign * .13;
        const left = x - .46, right = x + .46;
        const west = project(left, y0, z0);
        const east = project(right, y1, z1);
        const panel = ctx.createLinearGradient(west[0], west[1], east[0], east[1]);
        panel.addColorStop(0, '#223759');
        panel.addColorStop(.5, '#365480');
        panel.addColorStop(.72, '#345587');
        panel.addColorStop(1, '#122744');
        beam([x, 0, 0], [x, y0, z0], '#d9b56f', .07);
        fill([[left, y0, z0], [right, y0, z0], [right, y1, z1], [left, y1, z1]], panel);
        ctx.strokeStyle = '#c3a278b9';
        ctx.lineWidth = Math.max(.45, scale * .033);
        ctx.stroke();
        for (let row = 1; row < 8; row += 1) {
          const q = row / 8;
          const yy = y0 + (y1 - y0) * q;
          const zz = z0 + (z1 - z0) * q;
          beam([left, yy, zz], [right, yy, zz], '#07192eaa', .016);
        }
        for (let column = 1; column <= 5; column += 1) {
          const xx = left + (right - left) * (column / 6);
          beam([xx, y0, z0], [xx, y1, z1], column === 3 ? '#809ab287' : '#6496d836', .016);
        }
      }
    }

    // Longitudinal pressure modules, segmented insulation and perpendicular docking nodes.
    const module = (x1, x2, y, z, radius) => {
      const top = project(0, y - radius, z);
      const bottom = project(0, y + radius, z);
      const hull = ctx.createLinearGradient(top[0], top[1], bottom[0], bottom[1]);
      hull.addColorStop(0, '#e7edf0');
      hull.addColorStop(.33, '#a7b9ca');
      hull.addColorStop(.62, '#536a86');
      hull.addColorStop(1, '#22334b');
      fill([[x1, y - radius, z], [x2, y - radius, z], [x2, y + radius, z], [x1, y + radius, z]], hull);
      for (let i = 1; i < 5; i += 1) {
        const xx = x1 + (x2 - x1) * i / 5;
        beam([xx, y - radius, z], [xx, y + radius, z], '#c8d3dd61', .026);
      }
      const cap = project(x2, y, z);
      ctx.save();
      ctx.translate(cap[0], cap[1]);
      ctx.rotate(roll);
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.max(.9, scale * radius * .34), Math.max(.5, scale * radius), 0, 0, Math.PI * 2);
      ctx.fillStyle = '#4d647e';
      ctx.fill();
      ctx.strokeStyle = '#c8d5dc';
      ctx.lineWidth = Math.max(.45, scale * .044);
      ctx.stroke();
      ctx.restore();
    };
    module(-1.44, -.52, .045, .06, .18);
    module(.30, 1.45, -.025, -.02, .20);
    module(-.65, .68, .067, -.11, .262);
    module(-.48, .46, .50, -.15, .18);
    beam([-.29, .20, -.15], [-.29, .42, -.15], '#91a7bf', .16);
    beam([.57, -.17, -.13], [.93, -.59, -.25], '#c2d2df', .09);
    beam([.93, -.59, -.25], [1.18, -.53, -.32], '#eef5df', .06);
    beam([-.54, -.15, 0], [-1.15, -.67, -.22], '#99afc5', .056);
    beam([-.26, .22, -.16], [-.6, .83, -.35], '#8a9db4', .07);
    const window = project(-.07, .508, -.29);
    ctx.fillStyle = '#83deff';
    ctx.beginPath();
    ctx.arc(window[0], window[1], Math.max(.7, scale * .085), 0, Math.PI * 2);
    ctx.fill();
    const chassis = project(.7, -.12, -.25);
    ctx.fillStyle = '#f3dfad';
    ctx.fillRect(chassis[0] - .9, chassis[1] - .9, 1.8, 1.8);
    ctx.restore();
  }


  function configure() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    flight = null;
    story.style.removeProperty('--transit-veil');
    enabled = !!renderer && (viewOverride ?? !motion.matches);
    cosmos.hidden = !!renderer?.fallback;
    softwareCanvas.hidden = !renderer?.fallback;
    document.documentElement.classList.toggle('art-enabled', enabled);
    toggle.hidden = !renderer;
    toggle.setAttribute('aria-pressed', String(!enabled));
    toggle.textContent = enabled ? '静态阅读' : '开启过场';
    active = -1;
    lastRender = 0;
    if (enabled) resize();
    else nav.forEach(link => link.removeAttribute('aria-current'));
  }

  toggle.addEventListener('click', () => {
    const bar = header.getBoundingClientRect().height;
    const visible = [index, ...scenes.slice().reverse()].find(section => section.getBoundingClientRect().top < bar + 30);
    viewOverride = !enabled;
    configure();
    if (visible) scrollTo(0, visible.getBoundingClientRect().top + scrollY - bar);
    update(true);
  });
  window.addEventListener('scroll', () => update(), { passive: true });
  window.addEventListener('chapter-jump', onChapterJump);
  cosmos.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    renderer = softRenderer();
    configure();
  });
  cosmos.addEventListener('webglcontextrestored', () => {
    renderer = chooseRenderer();
    configure();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      update(true);
    }
  });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pageshow', resize);
  motion.addEventListener('change', configure);
  if (document.fonts) document.fonts.ready.then(resize);
  renderer = chooseRenderer();
  configure();
})();

(() => {
  const dialog = document.querySelector('#chapter-atlas');
  if (typeof dialog.showModal !== 'function') return;

  const root = document.documentElement;
  const trigger = document.querySelector('[data-menu-trigger]');
  const panel = dialog.querySelector('.atlas-panel');
  const closeButton = dialog.querySelector('.atlas-close');
  const links = [...dialog.querySelectorAll('.atlas-link')];
  const headings = links.map(link => document.getElementById(link.hash.slice(1)));
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const timing = 'cubic-bezier(.24,.78,.24,1)';
  const canAnimate = () => !media.matches && root.classList.contains('art-enabled') &&
    typeof panel.animate === 'function' && CSS.supports('clip-path', 'circle(0px at 0px 0px)');
  let phase = 'closed';
  let version = 0;
  let iris = null;
  let entrances = [];
  let queued = null;
  let returnScroll = 0;

  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', dialog.id);
  trigger.setAttribute('aria-expanded', 'false');

  function center(element) {
    const { left, top, width, height } = element.getBoundingClientRect();
    return { x: left + width / 2, y: top + height / 2 };
  }

  function aperture({ x, y }, open) {
    const { width, height } = dialog.getBoundingClientRect();
    const radius = open ? Math.hypot(Math.max(x, width - x), Math.max(y, height - y)) + 2 : 0;
    return 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)';
  }

  function runIris(from, to, duration) {
    iris?.cancel();
    iris = null;
    panel.style.clipPath = from;
    if (!canAnimate()) return Promise.resolve();
    iris = panel.animate([{ clipPath: from }, { clipPath: to }], {
      duration,
      easing: timing,
      fill: 'both'
    });
    return iris.finished.catch(() => {});
  }

  function clearIris() {
    iris?.cancel();
    iris = null;
    panel.style.clipPath = '';
  }

  function cancelEntrances() {
    entrances.forEach(animation => animation.cancel());
    entrances = [];
  }

  function updateActiveLink() {
    let active = 0;
    let closestTop = -Infinity;
    headings.forEach((heading, index) => {
      const top = heading.getBoundingClientRect().top;
      if (top < innerHeight * .35 && top > closestTop) {
        active = index;
        closestTop = top;
      }
    });
    links.forEach(link => link.removeAttribute('aria-current'));
    links[active].setAttribute('aria-current', 'location');
  }

  async function open() {
    if (phase !== 'closed') return;
    const thisVersion = ++version;
    const origin = center(trigger);
    returnScroll = scrollY;
    phase = 'opening';
    queued = null;
    updateActiveLink();
    dialog.showModal();
    panel.scrollTop = 0;
    root.classList.add('atlas-open');
    trigger.setAttribute('aria-expanded', 'true');
    closeButton.focus({ preventScroll: true });
    if (scrollY !== returnScroll) scrollTo({ top: returnScroll, behavior: 'instant' });

    if (canAnimate()) {
      entrances = [dialog.querySelector('.atlas-title'), ...links].map((element, index) =>
        element.animate(
          [{ opacity: 0, transform: 'translateY(17px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 490, delay: 90 + index * 43, fill: 'backwards', easing: timing }
        )
      );
      await runIris(aperture(origin, false), aperture(origin, true), 640);
    }
    if (thisVersion !== version) return;
    clearIris();
    phase = 'open';
    if (queued) close(queued);
  }

  function scrollToChapter(link) {
    const destination = document.getElementById(link.hash.slice(1));
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    destination.scrollIntoView({ block: 'start', behavior: 'instant' });
    window.dispatchEvent(new CustomEvent('chapter-jump', {
      detail: { phase: 'prepare', sourceY: returnScroll, destination: destination.id }
    }));
    return destination;
  }

  async function close(link = null) {
    if (phase === 'closed' || phase === 'closing') return;
    if (link && phase === 'opening') {
      queued = link;
      return;
    }

    ++version;
    phase = 'closing';
    queued = null;
    panel.dataset.phase = phase;
    const origin = center(link || trigger);
    const full = aperture(origin, true);
    const from = getComputedStyle(panel).clipPath;
    const destination = link ? scrollToChapter(link) : null;

    if (canAnimate()) {
      await runIris(from === 'none' ? full : from, aperture(origin, false), link ? 620 : 465);
    }
    dialog.close();
    clearIris();
    cancelEntrances();
    root.classList.remove('atlas-open');
    trigger.setAttribute('aria-expanded', 'false');
    delete panel.dataset.phase;
    phase = 'closed';

    if (destination) {
      destination.setAttribute('tabindex', '-1');
      destination.focus({ preventScroll: true });
      destination.scrollIntoView({ block: 'start', behavior: 'instant' });
    } else {
      trigger.focus({ preventScroll: true });
      scrollTo({ top: returnScroll, behavior: 'instant' });
    }
    window.dispatchEvent(new CustomEvent('chapter-jump', { detail: { phase: 'arrive' } }));
  }

  function plainClick(event) {
    return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
  }

  trigger.addEventListener('click', event => {
    if (!plainClick(event)) return;
    event.preventDefault();
    open();
  });
  closeButton.addEventListener('click', () => close());
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    close();
  });
  links.forEach(link => {
    link.addEventListener('click', event => {
      if (!plainClick(event)) return;
      event.preventDefault();
      close(link);
    });
  });
  media.addEventListener('change', () => {
    if (media.matches) {
      iris?.finish();
      cancelEntrances();
    }
  });
})();
