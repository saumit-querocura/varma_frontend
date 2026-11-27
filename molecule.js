// The local PubChem conformer supplies atom positions and bond connectivity.
const elements = {
  C: { name: 'Carbon', color: '#74c898', light: '#d3ffde', dark: '#244e37', radius: 0.38, vdw: 1.7 },
  N: { name: 'Nitrogen', color: '#9589ed', light: '#e5dfff', dark: '#3e356e', radius: 0.39, vdw: 1.55 },
  O: { name: 'Oxygen', color: '#f18e71', light: '#ffe5cb', dark: '#823e32', radius: 0.41, vdw: 1.52 },
  H: { name: 'Hydrogen', color: '#c8d3d3', light: '#ffffff', dark: '#5b6868', radius: 0.25, vdw: 1.2 }
};

function createViewer(canvas) {
  const context = canvas.getContext('2d');
  let record;
  let yaw, pitch, zoom;
  let mode = 'ball';
  let pointer;
  let frame = 0;

  function invalidate() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function draw() {
    frame = 0;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!context || !record || !w || !h) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const { atoms, bonds } = record['3d'];
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const extent = Math.max(...atoms.map(([, x, y, z]) => Math.hypot(x, y, z)));
    const unit = Math.min(w * 0.42, h * 0.595) / (extent + (mode === 'space' ? 1.1 : 0.2)) * zoom;
    const points = atoms.map(([el, x, y, z]) => {
      const depth = z * cy - x * sy;
      const rotatedY = y * cp - depth * sp;
      const rotatedZ = y * sp + depth * cp;
      // A small roll keeps the molecular plane legible in the starting view.
      const rotatedX = x * cy + z * sy;
      const perspective = 22 / (22 - rotatedZ);
      return { el, x: w / 2 + (rotatedX * .956 - rotatedY * .292) * unit * perspective,
        y: h * .53 - (rotatedY * .956 + rotatedX * .292) * unit * perspective,
        z: rotatedZ, r: unit * perspective * elements[el][mode === 'space' ? 'vdw' : 'radius'] };
    });
    const pieces = points.map(atom => ({ z: atom.z, atom }));
    if (mode === 'ball') {
      for (const [from, to] of bonds) {
        const a = points[from], b = points[to];
        pieces.push({ z: (a.z + b.z) / 2, a, b });
      }
    }
    pieces.sort((a, b) => a.z - b.z);
    for (const piece of pieces) {
      if (piece.atom) {
        const { x, y, r, el } = piece.atom;
        const palette = elements[el];
        const shade = context.createRadialGradient(x - r * .38, y - r * .44, r * .025, x, y, r);
        shade.addColorStop(0, palette.light);
        shade.addColorStop(.31, palette.color);
        shade.addColorStop(.85, palette.dark);
        shade.addColorStop(1, '#182629');
        context.fillStyle = shade;
        context.beginPath();
        context.arc(x, y, r, 0, 2 * Math.PI);
        context.fill();
      } else {
        const { a, b } = piece;
        const dx = b.x - a.x, dy = b.y - a.y;
        const length = Math.hypot(dx, dy) || 1;
        const width = unit * (a.el === 'H' || b.el === 'H' ? .12 : .17);
        const nx = -dy / length * width / 2, ny = dx / length * width / 2;
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const shade = context.createLinearGradient(mx - nx, my - ny, mx + nx, my + ny);
        shade.addColorStop(0, '#495c56');
        shade.addColorStop(.34, '#d3ded5');
        shade.addColorStop(.56, '#a9b9ae');
        shade.addColorStop(1, '#40524b');
        // End each cylinder at the sphere surfaces, including at shallow depth angles.
        const insetA = Math.min(a.r * .72, length * .45) / length;
        const insetB = Math.min(b.r * .72, length * .45) / length;
        context.lineWidth = width;
        context.lineCap = 'round';
        context.strokeStyle = shade;
        context.beginPath();
        context.moveTo(a.x + dx * insetA, a.y + dy * insetA);
        context.lineTo(b.x - dx * insetB, b.y - dy * insetB);
        context.stroke();
      }
    }
  }

  function reset() { yaw = -.29; pitch = .58; zoom = 1; invalidate(); }
  function zoomBy(factor) { zoom = Math.min(2.2, Math.max(.55, zoom * factor)); invalidate(); }
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(pointer.id);
  });
  canvas.addEventListener('pointermove', event => {
    if (!pointer || event.pointerId !== pointer.id) return;
    yaw += (event.clientX - pointer.x) * .015;
    pitch -= (event.clientY - pointer.y) * .015;
    pointer.x = event.clientX; pointer.y = event.clientY;
    invalidate();
  });
  canvas.addEventListener('lostpointercapture', () => { pointer = null; });
  canvas.addEventListener('keydown', event => {
    const steps = { ArrowRight: [.15, 0], ArrowLeft: [-.15, 0], ArrowUp: [0, .15], ArrowDown: [0, -.15] };
    const step = steps[event.key];
    if (step) { event.preventDefault(); yaw += step[0]; pitch += step[1]; invalidate(); }
  });
  new ResizeObserver(invalidate).observe(canvas);
  reset();
  return { reset, zoomBy, setMode(value) { mode = value; invalidate(); },
    setCompound(value) { record = value; reset(); } };
}
