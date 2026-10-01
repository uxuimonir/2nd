/* NOIRÉ 2 — generative demo imagery.
 * Runs in a browser (headless Chromium via scripts/media/render.mjs).
 * Every image is original and procedurally drawn, so the template can ship
 * and redistribute it freely. One shared grade keeps the library cohesive:
 * soft contrast, controlled highlights, natural blacks, 2–4% grain.
 */
(() => {
  // ---------------------------------------------------------------- utilities
  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeNoise(rand) {
    const p = new Uint8Array(512);
    const perm = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
    const grad = new Float32Array(256);
    for (let i = 0; i < 256; i++) grad[i] = rand();
    const fade = (t) => t * t * (3 - 2 * t);
    function value(x, y) {
      const xi = Math.floor(x), yi = Math.floor(y);
      const xf = x - xi, yf = y - yi;
      const a = grad[p[(p[xi & 255] + yi) & 511] & 255];
      const b = grad[p[(p[(xi + 1) & 255] + yi) & 511] & 255];
      const c = grad[p[(p[xi & 255] + yi + 1) & 511] & 255];
      const d = grad[p[(p[(xi + 1) & 255] + yi + 1) & 511] & 255];
      const u = fade(xf), v = fade(yf);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    }
    function fbm(x, y, oct = 4) {
      let sum = 0, amp = 0.5, f = 1, norm = 0;
      for (let i = 0; i < oct; i++) {
        sum += amp * value(x * f, y * f);
        norm += amp;
        amp *= 0.5;
        f *= 2.03;
      }
      return sum / norm;
    }
    return { value, fbm };
  }

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  function hex(c) {
    const n = parseInt(c.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgba(c, a = 1) {
    const [r, g, b] = hex(c);
    return `rgba(${r},${g},${b},${a})`;
  }
  function mix(c1, c2, t) {
    const a = hex(c1), b = hex(c2);
    const m = a.map((v, i) => Math.round(lerp(v, b[i], t)));
    return "#" + m.map((v) => v.toString(16).padStart(2, "0")).join("");
  }

  function vgrad(ctx, x, y, w, h, stops) {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  }
  function hgradFill(ctx, x0, x1, stops) {
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    return g;
  }
  function radial(ctx, x, y, r, stops) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    return g;
  }
  function blurred(ctx, px, fn) {
    ctx.save();
    ctx.filter = `blur(${Math.max(0, px)}px)`;
    fn();
    ctx.restore();
  }
  function poly(ctx, pts) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
  }
  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  /** Multiply a per-pixel noise field into the existing image. */
  function texture(ctx, w, h, N, { scale = 0.004, strength = 0.12, oct = 4, region, speck = 0, rand, stretch = 1 }) {
    const [rx, ry, rw, rh] = region || [0, 0, w, h];
    const x0 = Math.max(0, Math.floor(rx)), y0 = Math.max(0, Math.floor(ry));
    const ww = Math.min(w - x0, Math.ceil(rw)), hh = Math.min(h - y0, Math.ceil(rh));
    if (ww <= 0 || hh <= 0) return;
    const img = ctx.getImageData(x0, y0, ww, hh);
    const d = img.data;
    for (let y = 0; y < hh; y++) {
      for (let x = 0; x < ww; x++) {
        const n = N.fbm((x0 + x) * scale, (y0 + y) * scale * stretch, oct) - 0.5;
        let k = 1 + n * strength * 2;
        if (speck && rand() < speck) k *= 0.55 + rand() * 0.3;
        const i = (y * ww + x) * 4;
        d[i] = clamp(d[i] * k, 0, 255);
        d[i + 1] = clamp(d[i + 1] * k, 0, 255);
        d[i + 2] = clamp(d[i + 2] * k, 0, 255);
      }
    }
    ctx.putImageData(img, x0, y0);
  }

  /** Shared grade: tone curve, gentle vignette, film grain. */
  function grade(ctx, w, h, rand, { grain = 9, vignette = 0.16, lift = 6 } = {}) {
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    const cx = w / 2, cy = h / 2, maxd = Math.hypot(cx, cy);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const dist = Math.hypot(x - cx, y - cy) / maxd;
        const v = 1 - vignette * Math.pow(dist, 2.2);
        const g = (rand() - 0.5) * grain;
        for (let c = 0; c < 3; c++) {
          let t = d[i + c] / 255;
          // soft S-curve with rolled-off highlights and lifted blacks
          t = t < 0.5 ? 0.5 * Math.pow(2 * t, 1.08) : 1 - 0.5 * Math.pow(2 * (1 - t), 1.12);
          t = lift / 255 + t * (1 - (lift + 8) / 255);
          d[i + c] = clamp(t * 255 * v + g, 0, 255);
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  function shadowEllipse(ctx, x, y, rx, ry, alpha, blur) {
    blurred(ctx, blur, () => {
      ctx.fillStyle = `rgba(20,16,12,${alpha})`;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // ---------------------------------------------------------------- stone
  function blobPath(ctx, cx, cy, rx, ry, rand, wobble = 0.06, squash = 0) {
    const pts = 64;
    const ph = rand() * Math.PI * 2;
    const k1 = 2 + Math.floor(rand() * 2), k2 = 3 + Math.floor(rand() * 3);
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const a = (i / pts) * Math.PI * 2;
      const r = 1 + wobble * Math.sin(a * k1 + ph) + wobble * 0.5 * Math.sin(a * k2 - ph);
      let y = Math.sin(a) * ry * r;
      if (y > 0) y *= 1 - squash; // flatter base
      const x = Math.cos(a) * rx * r;
      i ? ctx.lineTo(cx + x, cy + y) : ctx.moveTo(cx + x, cy + y);
    }
    ctx.closePath();
  }

  function stoneForm(ctx, cx, cy, rx, ry, rand, tone, light = -0.4) {
    // cast shadow
    shadowEllipse(ctx, cx + rx * 0.35, cy + ry * 0.92, rx * 1.05, ry * 0.16, 0.38, rx * 0.12);
    blobPath(ctx, cx, cy, rx, ry, rand, 0.05, 0.25);
    const g = ctx.createRadialGradient(cx + rx * light, cy - ry * 0.45, rx * 0.05, cx, cy, Math.max(rx, ry) * 1.25);
    g.addColorStop(0, mix(tone, "#ffffff", 0.45));
    g.addColorStop(0.45, tone);
    g.addColorStop(1, mix(tone, "#1a1612", 0.55));
    ctx.fillStyle = g;
    ctx.fill();
  }

  function plinth(ctx, x, y, w, h, depth, light = "#e6e1d8") {
    // top face
    poly(ctx, [[x, y], [x + w, y], [x + w + depth, y - depth * 0.5], [x + depth, y - depth * 0.5]]);
    ctx.fillStyle = mix(light, "#ffffff", 0.25);
    ctx.fill();
    // front face
    ctx.fillStyle = hgradFill(ctx, x, x + w, [[0, mix(light, "#000", 0.02)], [1, mix(light, "#000", 0.12)]]);
    ctx.fillRect(x, y, w, h);
    // side face
    poly(ctx, [[x + w, y], [x + w + depth, y - depth * 0.5], [x + w + depth, y + h - depth * 0.5], [x + w, y + h]]);
    ctx.fillStyle = mix(light, "#2a241e", 0.32);
    ctx.fill();
  }

  function galleryRoom(ctx, w, h, floorY, wallA = "#d5cec3", wallB = "#bfb6a9") {
    vgrad(ctx, 0, 0, w, floorY, [[0, wallA], [1, wallB]]);
    vgrad(ctx, 0, floorY, w, h - floorY, [[0, "#9c9387"], [1, "#7c7469"]]);
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(0, floorY - 2, w, 3);
  }

  const STONE_TONES = ["#c9c0b2", "#b9ad9c", "#d8d1c6", "#a99c8b", "#cfc6ba"];

  function stone(ctx, w, h, v, rand, N) {
    const u = Math.min(w, h) / 1000;
    const tone = STONE_TONES[Math.floor(rand() * STONE_TONES.length)];
    const comp = [0, 1, 2, 3, 4, 4, 0, 3, 0, 0, 2][v % 11];
    if (comp === 0) {
      const raking = v === 8;
      const far = v === 9;
      const floorY = h * (far ? 0.66 : 0.74);
      galleryRoom(ctx, w, h, floorY, raking ? "#bdb4a6" : "#d6cfc4", raking ? "#988e80" : "#c1b8ab");
      if (raking) {
        // raking light wedge from the left
        blurred(ctx, 40 * u, () => {
          ctx.fillStyle = "rgba(255,245,225,0.32)";
          poly(ctx, [[0, 0], [w * 0.55, 0], [w * 0.2, h], [0, h]]);
          ctx.fill();
        });
      }
      const s = far ? 0.55 : 1;
      const pw = w * 0.26 * s, ph = h * 0.26 * s;
      const px = w * 0.5 - pw / 2, py = floorY - ph * 0.62;
      shadowEllipse(ctx, w * 0.5 + pw * 0.2, floorY + ph * 0.38, pw * 0.8, ph * 0.08, 0.3, 18 * u);
      plinth(ctx, px, py, pw, ph, pw * 0.12);
      const rx = pw * 0.36, ry = rx * (0.75 + rand() * 0.35);
      stoneForm(ctx, w * 0.5 + pw * 0.04, py - ry * 0.8 - pw * 0.03, rx, ry, rand, tone, raking ? -0.9 : -0.4);
      texture(ctx, w, h, N, { scale: 0.006 / u, strength: 0.05, oct: 3 });
    } else if (comp === 1) {
      const floorY = h * 0.78;
      galleryRoom(ctx, w, h, floorY);
      const pw = w * 0.62, ph = h * 0.2;
      const px = w * 0.19, py = floorY - ph * 0.55;
      plinth(ctx, px, py, pw, ph, pw * 0.08);
      const r1 = pw * 0.17;
      stoneForm(ctx, px + pw * 0.3, py - r1 * 1.5, r1, r1 * 1.6, rand, tone);
      const r2 = pw * 0.15;
      stoneForm(ctx, px + pw * 0.7, py - r2 * 0.75, r2 * 1.15, r2 * 0.8, rand, mix(tone, "#7c6f5f", 0.25));
    } else if (comp === 2) {
      // surface close-up (v10: sample with pencil)
      vgrad(ctx, 0, 0, w, h, [[0, mix(tone, "#e9dcc6", 0.3)], [1, mix(tone, "#5a4532", 0.3)]]);
      if (v === 10) {
        vgrad(ctx, 0, 0, w, h, [[0, "#e9e4da"], [1, "#d8d1c4"]]);
        stoneForm(ctx, w * 0.45, h * 0.5, w * 0.2, h * 0.15, rand, tone);
        // pencil
        ctx.save();
        ctx.translate(w * 0.72, h * 0.56);
        ctx.rotate(-1.2);
        shadowEllipse(ctx, 6 * u, 10 * u, w * 0.2, 6 * u, 0.25, 6 * u);
        ctx.fillStyle = "#2c2a27";
        ctx.fillRect(-w * 0.2, -6 * u, w * 0.36, 12 * u);
        ctx.fillStyle = "#d9b98a";
        poly(ctx, [[w * 0.16, -6 * u], [w * 0.2, 0], [w * 0.16, 6 * u]]);
        ctx.fill();
        ctx.restore();
        texture(ctx, w, h, N, { scale: 0.01 / u, strength: 0.04, oct: 2 });
      } else {
        texture(ctx, w, h, N, { scale: 0.0035 / u, strength: 0.32, oct: 6, speck: 0.012, rand });
        blurred(ctx, 60 * u, () => {
          ctx.fillStyle = "rgba(255,248,235,0.18)";
          ctx.beginPath();
          ctx.ellipse(w * 0.3, h * 0.3, w * 0.4, h * 0.3, 0.4, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    } else if (comp === 3) {
      // gallery wall with low framed works on paper
      const floorY = h * 0.84;
      galleryRoom(ctx, w, h, floorY, "#e3ddd3", "#cfc7bb");
      const n = 5;
      const fw = w * 0.11, fh = fw * 1.3, gap = (w - n * fw) / (n + 1);
      for (let i = 0; i < n; i++) {
        const x = gap + i * (fw + gap), y = floorY - fh - h * 0.24 + (i % 2) * 0;
        blurred(ctx, 8 * u, () => {
          ctx.fillStyle = "rgba(30,24,18,0.28)";
          ctx.fillRect(x + 6 * u, y + 10 * u, fw, fh);
        });
        ctx.fillStyle = "#3a332c";
        ctx.fillRect(x, y, fw, fh);
        ctx.fillStyle = "#f2eee7";
        ctx.fillRect(x + fw * 0.06, y + fw * 0.06, fw * 0.88, fh - fw * 0.12);
        // work: a soft charcoal smudge
        const cx = x + fw / 2, cy = y + fh / 2;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x + fw * 0.2, y + fh * 0.22, fw * 0.6, fh * 0.56);
        ctx.clip();
        blurred(ctx, 3 * u, () => {
          ctx.fillStyle = mix("#5a5147", "#a29684", rand());
          blobPath(ctx, cx, cy, fw * 0.2, fh * 0.17, rand, 0.12);
          ctx.fill();
        });
        ctx.restore();
        // caption tag
        ctx.fillStyle = "#f6f3ee";
        ctx.fillRect(x + fw * 1.06, y + fh * 0.84, fw * 0.22, fw * 0.12);
      }
      texture(ctx, w, h, N, { scale: 0.005 / u, strength: 0.04, oct: 3 });
    } else if (comp === 4) {
      // receding low plinths
      const floorY = h * 0.42;
      galleryRoom(ctx, w, h, floorY, "#d8d1c6", "#c4bbae");
      const items = v === 5 ? 3 : 3;
      for (let i = items - 1; i >= 0; i--) {
        const t = i / (items - 1);
        const s = lerp(1, 0.42, t);
        const cx = lerp(w * 0.5, w * (v === 5 ? 0.78 : 0.62), t) + (i === 1 ? -w * 0.22 : 0);
        const py = lerp(h * 0.8, floorY + h * 0.06, t);
        const pw = w * 0.3 * s, ph = h * 0.1 * s;
        shadowEllipse(ctx, cx + pw * 0.15, py + ph * 1.05, pw * 0.65, ph * 0.3, 0.25, 14 * u * s);
        plinth(ctx, cx - pw / 2, py, pw, ph, pw * 0.1);
        const rx = pw * 0.3;
        stoneForm(ctx, cx, py - rx * 0.62, rx, rx * (0.6 + rand() * 0.3), rand, STONE_TONES[(i + 1) % 5]);
      }
      texture(ctx, w, h, N, { scale: 0.006 / u, strength: 0.05, oct: 3 });
    }
  }

  // ---------------------------------------------------------------- water
  const GREENS = ["#2f6b5c", "#3b7a69", "#4e8c78", "#5c9a86", "#2a5f52"];

  function tileField(ctx, x0, y0, w, h, size, colors, rand, gloss = 0.25, grout = "#d9d6cc") {
    ctx.fillStyle = grout;
    ctx.fillRect(x0, y0, w, h);
    const g = Math.max(1, size * 0.06);
    for (let y = y0; y < y0 + h; y += size) {
      for (let x = x0; x < x0 + w; x += size) {
        const c = colors[Math.floor(rand() * colors.length)];
        const tw = size - g, th = size - g;
        ctx.fillStyle = mix(c, rand() > 0.5 ? "#ffffff" : "#000000", rand() * 0.12);
        ctx.fillRect(x + g / 2, y + g / 2, tw, th);
        const gr = ctx.createLinearGradient(x, y, x + tw, y + th);
        gr.addColorStop(0, `rgba(255,255,255,${gloss * (0.5 + rand() * 0.5)})`);
        gr.addColorStop(0.5, "rgba(255,255,255,0)");
        gr.addColorStop(1, "rgba(0,0,0,0.1)");
        ctx.fillStyle = gr;
        ctx.fillRect(x + g / 2, y + g / 2, tw, th);
      }
    }
  }

  function waterSurface(ctx, x, y, w, h, top, bottom, rand, u) {
    vgrad(ctx, x, y, w, h, [[0, top], [1, bottom]]);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    for (let i = 0; i < 140; i++) {
      const t = rand();
      const yy = y + Math.pow(t, 1.6) * h;
      const len = lerp(w * 0.04, w * 0.3, Math.pow(t, 0.7));
      const xx = rand() * w;
      ctx.strokeStyle = `rgba(255,255,255,${0.05 + rand() * 0.12})`;
      ctx.lineWidth = lerp(1, 4, t) * u;
      ctx.beginPath();
      ctx.moveTo(xx, yy);
      ctx.bezierCurveTo(xx + len * 0.3, yy - 2 * u, xx + len * 0.6, yy + 2 * u, xx + len, yy);
      ctx.stroke();
    }
    ctx.restore();
  }

  function water(ctx, w, h, v, rand, N) {
    const u = Math.min(w, h) / 1000;
    const comp = [0, 1, 2, 3, 4, 5, 0, 1][v % 8];
    if (comp === 0) {
      const waterY = h * 0.58;
      tileField(ctx, 0, 0, w, waterY, 46 * u, GREENS, rand);
      if (v === 6) {
        // vaulted ceiling shadow
        blurred(ctx, 30 * u, () => {
          ctx.fillStyle = "rgba(10,20,18,0.55)";
          ctx.beginPath();
          ctx.ellipse(w / 2, -h * 0.25, w * 0.7, h * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      // pool edge
      vgrad(ctx, 0, waterY - 14 * u, w, 22 * u, [[0, "#ece8de"], [1, "#b9b4a8"]]);
      // reflection
      ctx.save();
      ctx.translate(0, waterY * 2 + 8 * u);
      ctx.scale(1, -1);
      ctx.globalAlpha = 0.3;
      ctx.filter = `blur(${10 * u}px)`;
      ctx.drawImage(ctx.canvas, 0, 0, w, waterY, 0, 0, w, waterY);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.82;
      waterSurface(ctx, 0, waterY + 8 * u, w, h - waterY, "#3f7f72", "#1d4a44", rand, u);
      ctx.restore();
      blurred(ctx, 80 * u, () => {
        ctx.fillStyle = "rgba(255,248,226,0.18)";
        ctx.fillRect(w * 0.55, 0, w * 0.25, h);
      });
    } else if (comp === 1) {
      if (v === 7) {
        vgrad(ctx, 0, 0, w, h, [[0, "#e4ddd0"], [1, "#d3cabb"]]);
        const sets = [GREENS.slice(0, 2), ["#7fae9b", "#8db8a6"], ["#1f4d43", "#24564b"]];
        sets.forEach((cols, i) => {
          const s = w * 0.12;
          const x = w * (0.12 + i * 0.28), y = h * (0.3 + (i % 2) * 0.12);
          blurred(ctx, 10 * u, () => {
            ctx.fillStyle = "rgba(40,30,20,0.3)";
            ctx.fillRect(x + 8 * u, y + 12 * u, s * 2, s * 2);
          });
          tileField(ctx, x, y, s * 2, s * 2, s, cols, rand, 0.3, "#e9e5dc");
        });
        texture(ctx, w, h, N, { scale: 0.008 / u, strength: 0.05, oct: 3 });
      } else {
        tileField(ctx, 0, 0, w, h, 120 * u, GREENS, rand, 0.32);
        blurred(ctx, 100 * u, () => {
          ctx.fillStyle = "rgba(255,250,235,0.22)";
          ctx.beginPath();
          ctx.ellipse(w * 0.3, h * 0.25, w * 0.35, h * 0.25, 0, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    } else if (comp === 2) {
      const hy = h * (0.42 + rand() * 0.08);
      vgrad(ctx, 0, 0, w, hy, [[0, "#b9c3c4"], [0.7, "#d9d9d0"], [1, "#e8e2d4"]]);
      vgrad(ctx, 0, hy, w, h - hy, [[0, "#7f9497"], [0.4, "#5f7a7e"], [1, "#3c5559"]]);
      ctx.save();
      for (let i = 0; i < 90; i++) {
        const t = rand();
        const y = hy + Math.pow(t, 1.8) * (h - hy);
        ctx.fillStyle = `rgba(235,240,235,${0.04 + rand() * 0.1})`;
        ctx.fillRect(rand() * w, y, lerp(w * 0.05, w * 0.4, t), lerp(1, 5, t) * u);
      }
      ctx.restore();
      texture(ctx, w, h, N, { scale: 0.003 / u, strength: 0.05, oct: 3, stretch: 6 });
    } else if (comp === 3) {
      const waterY = h * 0.64;
      vgrad(ctx, 0, 0, w, waterY, [[0, "#2e4b45"], [1, "#3e5f57"]]);
      // arched window
      const aw = w * 0.42, ax = w / 2 - aw / 2, ay = h * 0.1, ah = waterY - ay - h * 0.05;
      ctx.beginPath();
      ctx.moveTo(ax, ay + aw / 2);
      ctx.arc(ax + aw / 2, ay + aw / 2, aw / 2, Math.PI, 0);
      ctx.lineTo(ax + aw, ay + ah);
      ctx.lineTo(ax, ay + ah);
      ctx.closePath();
      ctx.fillStyle = vgradStyle(ctx, ay, ay + ah, [[0, "#f7efd9"], [1, "#f2d9a8"]]);
      ctx.fill();
      ctx.strokeStyle = "rgba(30,50,45,0.9)";
      ctx.lineWidth = 6 * u;
      ctx.beginPath();
      ctx.moveTo(ax + aw / 2, ay);
      ctx.lineTo(ax + aw / 2, ay + ah);
      ctx.moveTo(ax, ay + ah * 0.55);
      ctx.lineTo(ax + aw, ay + ah * 0.55);
      ctx.stroke();
      blurred(ctx, 50 * u, () => {
        ctx.fillStyle = "rgba(250,225,170,0.35)";
        ctx.fillRect(ax - aw * 0.1, ay, aw * 1.2, ah);
      });
      waterSurface(ctx, 0, waterY, w, h - waterY, "#2b4c46", "#14302c", rand, u);
      // reflection streaks
      for (let i = 0; i < 70; i++) {
        const t = rand();
        ctx.fillStyle = `rgba(250,220,160,${0.08 + rand() * 0.25 * (1 - t)})`;
        const ww = aw * (0.2 + rand() * 0.8) * (1 - t * 0.4);
        ctx.fillRect(w / 2 - ww / 2 + (rand() - 0.5) * aw * 0.2, waterY + t * (h - waterY), ww, (1 + rand() * 3) * u);
      }
    } else if (comp === 4) {
      tileField(ctx, 0, 0, w, h, 250 * u, ["#efece4", "#e7e3d9", "#f3f0e9"], rand, 0.35, "#cbc6ba");
      ctx.fillStyle = "#1f4f45";
      ctx.font = `700 ${240 * u}px "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("1.40", w / 2, h / 2);
      ctx.fillStyle = "#efece4";
      // stencil bridges
      for (let i = 0; i < 4; i++) ctx.fillRect(w * (0.3 + i * 0.13), h / 2 - 4 * u, 10 * u, 8 * u);
      ctx.fillStyle = "#1f4f45";
      ctx.font = `600 ${44 * u}px "Courier New", monospace`;
      ctx.fillText("M", w / 2, h * 0.68);
      texture(ctx, w, h, N, { scale: 0.006 / u, strength: 0.05, oct: 3 });
    } else if (comp === 5) {
      vgrad(ctx, 0, 0, w, h, [[0, "#9cc7bd"], [1, "#6fa79a"]]);
      const img = ctx.getImageData(0, 0, w, h);
      const d = img.data;
      const sc = 0.0042 / u;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const n1 = N.fbm(x * sc, y * sc * 1.2, 3);
          const n2 = N.fbm(x * sc * 1.9 + 31, y * sc * 1.7 + 7, 3);
          const c1 = Math.pow(1 - Math.abs(n1 - 0.5) * 2, 14);
          const c2 = Math.pow(1 - Math.abs(n2 - 0.5) * 2, 18);
          const k = (c1 + c2 * 0.7) * 120;
          const i = (y * w + x) * 4;
          d[i] = clamp(d[i] + k, 0, 255);
          d[i + 1] = clamp(d[i + 1] + k, 0, 255);
          d[i + 2] = clamp(d[i + 2] + k * 0.85, 0, 255);
        }
      }
      ctx.putImageData(img, 0, 0);
      blurred(ctx, 2 * u, () => ctx.drawImage(ctx.canvas, 0, 0));
    }
  }

  function vgradStyle(ctx, y0, y1, stops) {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    return g;
  }

  // ---------------------------------------------------------------- paper
  const CLOTH = ["#8a8173", "#b5a58c", "#6f7a72", "#a8826b", "#c9bda6", "#4f5a5e", "#9a6b55", "#d4c8b0", "#7d6b5b"];
  const VERMILION = "#d9573f";

  function textLines(ctx, x, y, w, h, lh, rand, color = "rgba(40,36,32,0.55)", u = 1) {
    ctx.fillStyle = color;
    for (let yy = y; yy < y + h; yy += lh) {
      let xx = x;
      const lineEnd = x + w * (yy + lh >= y + h ? 0.4 + rand() * 0.3 : 1);
      while (xx < lineEnd) {
        const word = lh * (0.6 + rand() * 2.4);
        if (xx + word > lineEnd) break;
        ctx.fillRect(xx, yy, word, lh * 0.36);
        xx += word + lh * 0.32;
      }
    }
  }

  function page(ctx, x, y, w, h, side, base = "#f3eee4") {
    ctx.fillStyle = base;
    ctx.fillRect(x, y, w, h);
    const g = ctx.createLinearGradient(side === "left" ? x + w : x, 0, side === "left" ? x + w * 0.8 : x + w * 0.2, 0);
    g.addColorStop(0, "rgba(60,45,30,0.28)");
    g.addColorStop(1, "rgba(60,45,30,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  }

  function paper(ctx, w, h, v, rand, N) {
    const u = Math.min(w, h) / 1000;
    const comp = [0, 1, 2, 3, 4, 5, 2, 0, 2, 0, 5][v % 11];
    vgrad(ctx, 0, 0, w, h, [[0, "#d8d0c3"], [1, "#c6bcad"]]);
    if (comp === 0) {
      const bw = w * 0.78, bh = bw * 0.62 > h * 0.8 ? h * 0.8 : bw * 0.62;
      const realW = bh / 0.62;
      const bx = w / 2 - realW / 2, by = h / 2 - bh / 2;
      shadowEllipse(ctx, w / 2, by + bh + 4 * u, realW * 0.52, 20 * u, 0.35, 24 * u);
      blurred(ctx, 18 * u, () => {
        ctx.fillStyle = "rgba(40,30,20,0.25)";
        ctx.fillRect(bx + 10 * u, by + 14 * u, realW, bh);
      });
      page(ctx, bx, by, realW / 2, bh, "left");
      page(ctx, bx + realW / 2, by, realW / 2, bh, "right");
      const m = realW * 0.06, lh = 13 * u;
      if (v === 9) {
        ctx.fillStyle = "#6d675e";
        ctx.fillRect(bx + m, by + m, realW / 2 - m * 2, bh * 0.55);
        blurred(ctx, 4 * u, () => {
          ctx.fillStyle = "#a59c8e";
          ctx.beginPath();
          ctx.ellipse(bx + realW / 4, by + m + bh * 0.3, realW * 0.08, bh * 0.14, 0, 0, Math.PI * 2);
          ctx.fill();
        });
        textLines(ctx, bx + m, by + m + bh * 0.6, realW * 0.18, lh * 4, lh, rand, "rgba(40,36,32,0.5)");
        textLines(ctx, bx + realW / 2 + m, by + m, realW / 2 - m * 2, bh - m * 2, lh, rand);
      } else {
        textLines(ctx, bx + m, by + m * 1.6, realW / 2 - m * 2, bh - m * 3, lh, rand);
        textLines(ctx, bx + realW / 2 + m, by + m * 1.6, realW / 2 - m * 2, bh * 0.45, lh, rand);
        if (v === 0) {
          ctx.fillStyle = VERMILION;
          ctx.fillRect(bx + realW / 2 + m, by + m, realW * 0.12, 3 * u);
        }
        ctx.fillStyle = "rgba(40,36,32,0.8)";
        ctx.fillRect(bx + realW / 2 + m, by + bh * 0.62, realW * 0.2, lh * 1.1);
      }
    } else if (comp === 1) {
      const n = 9;
      const bh = h * 0.07, bw0 = w * 0.6;
      let y = h * 0.86;
      shadowEllipse(ctx, w / 2, y + 6 * u, bw0 * 0.6, 14 * u, 0.4, 20 * u);
      for (let i = 0; i < n; i++) {
        const bw = bw0 * (0.86 + rand() * 0.14);
        const x = w / 2 - bw / 2 + (rand() - 0.5) * w * 0.04;
        y -= bh * (0.85 + rand() * 0.3);
        const c = CLOTH[i % CLOTH.length];
        ctx.fillStyle = vgradStyle(ctx, y, y + bh, [[0, mix(c, "#fff", 0.12)], [1, mix(c, "#000", 0.15)]]);
        ctx.fillRect(x, y, bw, bh * 0.92);
        ctx.fillStyle = "rgba(245,240,230,0.7)";
        ctx.fillRect(x + bw * 0.08, y + bh * 0.4, bw * 0.18, bh * 0.1);
      }
      texture(ctx, w, h, N, { scale: 0.01 / u, strength: 0.05, oct: 3 });
    } else if (comp === 2) {
      // folded sheets
      const layers = v === 6 ? 4 : 1;
      for (let l = layers - 1; l >= 0; l--) {
        const sw = w * 0.6, sh = h * 0.6;
        const x = w / 2 - sw / 2 + l * 16 * u, y = h / 2 - sh / 2 - l * 22 * u;
        blurred(ctx, 20 * u, () => {
          ctx.fillStyle = "rgba(40,30,20,0.25)";
          ctx.fillRect(x + 14 * u, y + 18 * u, sw, sh);
        });
        const folds = 3;
        for (let f = 0; f < folds; f++) {
          const fx = x + (sw / folds) * f;
          const shade = f % 2 === 0 ? 0.02 : 0.16;
          ctx.fillStyle = hgradFill(ctx, fx, fx + sw / folds, [
            [0, mix("#f4efe5", "#5a4a3a", shade)],
            [1, mix("#f4efe5", "#5a4a3a", shade + 0.06)],
          ]);
          ctx.fillRect(fx, y, sw / folds + 1, sh);
        }
        ctx.strokeStyle = "rgba(90,70,50,0.15)";
        ctx.lineWidth = 1.5 * u;
        ctx.beginPath();
        ctx.moveTo(x, y + sh / 2);
        ctx.lineTo(x + sw, y + sh / 2);
        ctx.stroke();
      }
      if (v === 6) {
        ctx.strokeStyle = VERMILION;
        ctx.lineWidth = 3 * u;
        ctx.beginPath();
        ctx.moveTo(w * 0.52, h * 0.1);
        ctx.bezierCurveTo(w * 0.5, h * 0.4, w * 0.56, h * 0.6, w * 0.53, h * 0.92);
        ctx.stroke();
      }
      texture(ctx, w, h, N, { scale: 0.012 / u, strength: 0.04, oct: 3 });
    } else if (comp === 3) {
      vgrad(ctx, 0, 0, w, h, [[0, "#f3eee3"], [1, "#ebe4d6"]]);
      const lh = 34 * u;
      textLines(ctx, w * 0.08, h * 0.08, w * 0.84, h * 0.84, lh, rand, "rgba(35,32,28,0.78)");
      texture(ctx, w, h, N, { scale: 0.02 / u, strength: 0.05, oct: 3, speck: 0.002, rand });
    } else if (comp === 4) {
      const n = 9, gap = w * 0.015;
      const cw = (w * 0.9 - gap * (n - 1)) / n, ch = cw * 1.45;
      const y = h / 2 - ch / 2;
      for (let i = 0; i < n; i++) {
        const x = w * 0.05 + i * (cw + gap);
        blurred(ctx, 8 * u, () => {
          ctx.fillStyle = "rgba(40,30,20,0.3)";
          ctx.fillRect(x + 5 * u, y + 8 * u, cw, ch);
        });
        ctx.fillStyle = CLOTH[i];
        ctx.fillRect(x, y, cw, ch);
        ctx.fillStyle = "rgba(247,243,236,0.85)";
        ctx.fillRect(x + cw * 0.14, y + ch * 0.12, cw * 0.5, 4 * u);
        ctx.fillRect(x + cw * 0.14, y + ch * 0.8, cw * 0.2, cw * 0.2);
        ctx.fillStyle = VERMILION;
        ctx.fillRect(x + cw * 0.14, y + ch * 0.18, cw * 0.1, 2 * u);
      }
      texture(ctx, w, h, N, { scale: 0.01 / u, strength: 0.05, oct: 3 });
    } else if (comp === 5) {
      if (v === 10) {
        const tints = ["#f2ede2", "#e8dfcf", "#efe3d3", "#dfe0d8", "#ece6da", "#f0d9cf"];
        for (let i = 0; i < 6; i++) {
          ctx.save();
          ctx.translate(w * 0.5, h * 0.85);
          ctx.rotate(-0.55 + i * 0.2);
          blurred(ctx, 10 * u, () => {
            ctx.fillStyle = "rgba(40,30,20,0.18)";
            ctx.fillRect(-w * 0.13 + 6 * u, -h * 0.72 + 8 * u, w * 0.26, h * 0.72);
          });
          ctx.fillStyle = tints[i];
          ctx.fillRect(-w * 0.13, -h * 0.72, w * 0.26, h * 0.72);
          ctx.restore();
        }
      } else {
        vgrad(ctx, 0, 0, w, h, [[0, "#ebe4d6"], [1, "#d9d0c0"]]);
        for (let y = 0; y < h; y += 3 * u + rand() * 3 * u) {
          ctx.fillStyle = `rgba(70,55,40,${0.14 + rand() * 0.26})`;
          ctx.fillRect(0, y, w, (1 + rand() * 1.4) * u);
        }
        blurred(ctx, 60 * u, () => {
          ctx.fillStyle = "rgba(60,45,30,0.2)";
          ctx.fillRect(w * 0.75, 0, w * 0.3, h);
        });
      }
      texture(ctx, w, h, N, { scale: 0.01 / u, strength: 0.04, oct: 3 });
    }
  }

  // ---------------------------------------------------------------- light
  function glow(ctx, x, y, r, color, a = 1) {
    ctx.fillStyle = radial(ctx, x, y, r, [[0, rgba(color, a)], [0.35, rgba(color, a * 0.35)], [1, rgba(color, 0)]]);
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function darkRoom(ctx, w, h, floorY) {
    vgrad(ctx, 0, 0, w, floorY, [[0, "#0f0d0b"], [1, "#1c1915"]]);
    vgrad(ctx, 0, floorY, w, h - floorY, [[0, "#211d18"], [1, "#0e0c0a"]]);
  }

  function pendant(ctx, x, y, r, u, warm = "#ffd9a0") {
    ctx.strokeStyle = "rgba(30,28,25,1)";
    ctx.lineWidth = 2 * u;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, y - r * 0.6);
    ctx.stroke();
    // dome
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.62, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fillStyle = hgradFill(ctx, x - r, x + r, [[0, "#3a332b"], [0.4, "#6b5c49"], [1, "#2a241e"]]);
    ctx.fill();
    // glowing rim
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(warm, 0.95);
    ctx.fill();
  }

  function light(ctx, w, h, v, rand, N) {
    const u = Math.min(w, h) / 1000;
    const comp = [0, 1, 2, 3, 4, 5, 2, 0, 5, 1][v % 10];
    const warm = "#ffcf8a";
    if (comp === 0) {
      const floorY = h * 0.72;
      darkRoom(ctx, w, h, floorY);
      const lx = w * 0.5, ly = h * (v === 7 ? 0.42 : 0.36), r = Math.min(w, h) * 0.17;
      ctx.globalCompositeOperation = "screen";
      // light cone
      blurred(ctx, 50 * u, () => {
        const g = ctx.createLinearGradient(0, ly, 0, floorY + h * 0.1);
        g.addColorStop(0, "rgba(255,205,140,0.45)");
        g.addColorStop(1, "rgba(255,205,140,0.05)");
        ctx.fillStyle = g;
        poly(ctx, [[lx - r, ly], [lx + r, ly], [lx + r * 2.6, floorY + h * 0.05], [lx - r * 2.6, floorY + h * 0.05]]);
        ctx.fill();
      });
      // table pool
      ctx.save();
      ctx.translate(lx, floorY + h * 0.06);
      ctx.scale(1, 0.22);
      glow(ctx, 0, 0, r * 3.4, warm, 0.8);
      ctx.restore();
      ctx.globalCompositeOperation = "source-over";
      // table edge
      ctx.fillStyle = "rgba(10,8,6,0.85)";
      ctx.fillRect(0, floorY + h * 0.14, w, h);
      pendant(ctx, lx, ly, r, u);
      ctx.globalCompositeOperation = "screen";
      glow(ctx, lx, ly + r * 0.05, r * 1.4, warm, 0.5);
      ctx.globalCompositeOperation = "source-over";
    } else if (comp === 1) {
      darkRoom(ctx, w, h, h);
      ctx.globalCompositeOperation = "screen";
      if (v === 9) {
        blurred(ctx, 40 * u, () => {
          const g = ctx.createLinearGradient(0, h, 0, h * 0.4);
          g.addColorStop(0, "rgba(255,190,120,0.75)");
          g.addColorStop(1, "rgba(255,190,120,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, h * 0.4, w, h * 0.6);
        });
      } else {
        for (let i = 0; i < 3; i++) {
          const x = w * (0.2 + i * 0.3);
          blurred(ctx, 30 * u, () => {
            const g = ctx.createLinearGradient(0, h, 0, 0);
            g.addColorStop(0, "rgba(255,200,130,0.6)");
            g.addColorStop(1, "rgba(255,200,130,0)");
            ctx.fillStyle = g;
            poly(ctx, [[x - w * 0.03, h], [x + w * 0.03, h], [x + w * 0.12, 0], [x - w * 0.12, 0]]);
            ctx.fill();
          });
        }
      }
      ctx.globalCompositeOperation = "source-over";
      texture(ctx, w, h, N, { scale: 0.004 / u, strength: 0.1, oct: 4 });
    } else if (comp === 2) {
      darkRoom(ctx, w, h, h * 0.8);
      const r = Math.min(w, h) * 0.22;
      ctx.globalCompositeOperation = "screen";
      glow(ctx, w / 2, h * 0.46, r * 3.2, "#ffbf7a", 0.35);
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.46, r, 0, Math.PI * 2);
      ctx.fillStyle = radial(ctx, w / 2 - r * 0.25, h * 0.46 - r * 0.3, r * 1.3, [[0, "#fffaf0"], [0.5, "#ffe2b0"], [1, "#e7a964"]]);
      ctx.fill();
      // base
      ctx.fillStyle = "#2a241d";
      ctx.fillRect(w / 2 - r * 0.25, h * 0.46 + r * 0.95, r * 0.5, r * 0.3);
      ctx.save();
      ctx.translate(w / 2, h * 0.8);
      ctx.scale(1, 0.15);
      ctx.globalCompositeOperation = "screen";
      glow(ctx, 0, 0, r * 2.6, "#ffcf8a", 0.5);
      ctx.restore();
    } else if (comp === 3) {
      const floorY = h * 0.74;
      darkRoom(ctx, w, h, floorY);
      const n = 5;
      for (let i = 0; i < n; i++) {
        const x = w * (0.14 + i * 0.18), s = Math.min(w, h) * (0.07 + rand() * 0.04);
        const y = floorY - s * 1.6;
        ctx.globalCompositeOperation = "screen";
        glow(ctx, x, y, s * 3.4, "#ffc781", 0.3);
        ctx.globalCompositeOperation = "source-over";
        const shape = i % 3;
        ctx.fillStyle = radial(ctx, x - s * 0.2, y - s * 0.3, s * 1.4, [[0, "#fff4de"], [0.6, "#ffd59a"], [1, "#d0904f"]]);
        ctx.beginPath();
        if (shape === 0) ctx.arc(x, y, s, 0, Math.PI * 2);
        else if (shape === 1) ctx.ellipse(x, y, s * 0.7, s * 1.2, 0, 0, Math.PI * 2);
        else ctx.roundRect(x - s * 0.8, y - s * 0.6, s * 1.6, s * 1.2, s * 0.6);
        ctx.fill();
        ctx.fillStyle = "#1e1a15";
        ctx.fillRect(x - s * 0.08, y + s * 0.8, s * 0.16, floorY - y - s * 0.8);
        ctx.fillRect(x - s * 0.5, floorY - 4 * u, s, 8 * u);
      }
    } else if (comp === 4) {
      vgrad(ctx, 0, 0, w, h, [[0, "#8e7a62"], [1, "#5d4e3e"]]);
      ctx.globalCompositeOperation = "screen";
      glow(ctx, w * 0.3, h * 0.2, Math.max(w, h) * 0.8, "#ffd59a", 0.5);
      ctx.globalCompositeOperation = "source-over";
      blurred(ctx, 26 * u, () => {
        ctx.fillStyle = "rgba(20,15,10,0.72)";
        poly(ctx, [[w * 0.42, h * 0.18], [w * 0.7, h * 0.18], [w * 0.92, h * 0.62], [w * 0.28, h * 0.62]]);
        ctx.fill();
        ctx.fillRect(w * 0.58, h * 0.62, w * 0.04, h * 0.4);
      });
      texture(ctx, w, h, N, { scale: 0.005 / u, strength: 0.1, oct: 4 });
    } else if (comp === 5) {
      const floorY = h * (v === 8 ? 0.82 : 0.68);
      darkRoom(ctx, w, h, floorY);
      const x = w * (v === 8 ? 0.35 : 0.5), s = Math.min(w, h) * 0.12;
      ctx.globalCompositeOperation = "screen";
      if (v === 8) {
        blurred(ctx, 60 * u, () => {
          ctx.fillStyle = radial(ctx, x, floorY, w * 0.5, [[0, "rgba(255,200,130,0.6)"], [1, "rgba(255,200,130,0)"]]);
          ctx.fillRect(0, 0, w, floorY);
        });
      }
      glow(ctx, x, floorY - s * 1.8, s * 4, "#ffc781", 0.4);
      ctx.globalCompositeOperation = "source-over";
      // shade
      poly(ctx, [[x - s * 0.5, floorY - s * 2.6], [x + s * 0.5, floorY - s * 2.6], [x + s, floorY - s * 1.5], [x - s, floorY - s * 1.5]]);
      ctx.fillStyle = vgradStyle(ctx, floorY - s * 2.6, floorY - s * 1.5, [[0, "#f6dfb4"], [1, "#ffcf8a"]]);
      ctx.fill();
      ctx.fillStyle = "#14110e";
      ctx.fillRect(x - s * 0.06, floorY - s * 1.5, s * 0.12, s * 1.3);
      ctx.beginPath();
      ctx.ellipse(x, floorY - s * 0.15, s * 0.5, s * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---------------------------------------------------------------- clay
  const GLAZES = ["#b9a585", "#6e7d6a", "#cfc6b4", "#8a4a32", "#3e3a35", "#a88c62", "#8f998f"];
  const CLAYS = ["#a8714f", "#94603f", "#b4825f", "#83563c"];

  function vessel(ctx, cx, baseY, hgt, wid, rand, { glaze, clay, glazeLine = 0.7, u = 1 }) {
    const lip = wid * (0.32 + rand() * 0.25);
    const belly = wid * 0.5;
    const foot = wid * (0.26 + rand() * 0.1);
    const bellyAt = 0.35 + rand() * 0.25;
    const neckAt = 0.82 + rand() * 0.08;
    const neck = lip * (0.75 + rand() * 0.2);
    const profile = (t) => {
      if (t < bellyAt) {
        const k = t / bellyAt;
        return lerp(foot, belly, Math.sin((k * Math.PI) / 2));
      }
      if (t < neckAt) {
        const k = (t - bellyAt) / (neckAt - bellyAt);
        return lerp(belly, neck, 1 - Math.cos((k * Math.PI) / 2));
      }
      const k = (t - neckAt) / (1 - neckAt);
      return lerp(neck, lip, k);
    };
    const steps = 80;
    const path = new Path2D();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = cx + profile(t), y = baseY - t * hgt;
      i ? path.lineTo(x, y) : path.moveTo(x, y);
    }
    for (let i = steps; i >= 0; i--) {
      const t = i / steps;
      path.lineTo(cx - profile(t), baseY - t * hgt);
    }
    path.closePath();
    shadowEllipse(ctx, cx + wid * 0.25, baseY, wid * 0.65, wid * 0.08, 0.4, wid * 0.06);
    ctx.save();
    ctx.clip(path);
    const shade = (col) =>
      hgradFill(ctx, cx - belly, cx + belly, [
        [0, mix(col, "#2a1d14", 0.38)],
        [0.32, mix(col, "#f1e4cf", 0.1)],
        [0.6, col],
        [1, mix(col, "#2a1d14", 0.42)],
      ]);
    ctx.fillStyle = shade(clay);
    ctx.fillRect(cx - belly * 1.2, baseY - hgt * 1.05, belly * 2.4, hgt * 1.1);
    if (glaze) {
      // glaze with drips
      ctx.beginPath();
      const gy = baseY - hgt * (1 - glazeLine);
      ctx.moveTo(cx - belly * 1.2, baseY - hgt * 1.1);
      ctx.lineTo(cx + belly * 1.2, baseY - hgt * 1.1);
      ctx.lineTo(cx + belly * 1.2, gy);
      for (let x = belly * 1.2; x >= -belly * 1.2; x -= belly * 0.08) {
        ctx.lineTo(cx + x, gy + (rand() < 0.25 ? rand() * hgt * 0.08 : rand() * hgt * 0.015));
      }
      ctx.closePath();
      ctx.fillStyle = shade(glaze);
      ctx.fill();
    }
    // matte surface: soft vertical variation
    ctx.fillStyle = vgradStyle(ctx, baseY - hgt, baseY, [[0, "rgba(255,245,230,0.08)"], [1, "rgba(30,20,12,0.12)"]]);
    ctx.fillRect(cx - belly * 1.2, baseY - hgt * 1.05, belly * 2.4, hgt * 1.1);
    // rim shadow
    ctx.fillStyle = "rgba(20,14,10,0.35)";
    ctx.beginPath();
    ctx.ellipse(cx, baseY - hgt, lip, lip * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function warmWall(ctx, w, h, tableY, a = "#e2d8c8", b = "#cdbfa9") {
    vgrad(ctx, 0, 0, w, tableY, [[0, a], [1, b]]);
    vgrad(ctx, 0, tableY, w, h - tableY, [[0, "#9d7f62"], [1, "#6f5641"]]);
    ctx.fillStyle = "rgba(255,240,215,0.25)";
    ctx.fillRect(0, tableY, w, 3);
  }

  function clay(ctx, w, h, v, rand, N) {
    const u = Math.min(w, h) / 1000;
    const comp = [0, 1, 2, 3, 4, 0, 3, 1, 5, 5][v % 10];
    if (comp === 0) {
      const tY = h * 0.78;
      warmWall(ctx, w, h, tY);
      if (v === 5) {
        blurred(ctx, 60 * u, () => {
          ctx.fillStyle = "rgba(255,248,230,0.45)";
          ctx.fillRect(w * 0.55, 0, w * 0.3, tY);
        });
      }
      const hg = h * (v === 5 ? 0.56 : 0.44), wd = w * (v === 5 ? 0.24 : 0.36);
      vessel(ctx, w * 0.5, tY + h * 0.03, hg, wd, rand, { glaze: v === 5 ? GLAZES[1] : GLAZES[0], clay: CLAYS[0], glazeLine: 0.75, u });
      texture(ctx, w, h, N, { scale: 0.008 / u, strength: 0.06, oct: 3, speck: 0.001, rand });
    } else if (comp === 1) {
      const tY = h * 0.7;
      warmWall(ctx, w, h, tY, "#ddd3c3", "#c9bba5");
      // shelf board
      vgrad(ctx, 0, tY - 6 * u, w, 26 * u, [[0, "#a88a6b"], [1, "#6a533e"]]);
      const n = v === 7 ? 5 : 6;
      let x = w * 0.1;
      for (let i = 0; i < n; i++) {
        const wd = w * (0.08 + rand() * 0.06), hg = h * (0.18 + rand() * 0.22);
        vessel(ctx, x + wd / 2, tY, hg, wd, rand, {
          glaze: v === 7 ? null : GLAZES[(i * 3) % GLAZES.length],
          clay: CLAYS[i % CLAYS.length],
          glazeLine: 0.6 + rand() * 0.25,
          u,
        });
        x += wd + w * (0.04 + rand() * 0.03);
      }
      texture(ctx, w, h, N, { scale: 0.008 / u, strength: 0.06, oct: 3 });
    } else if (comp === 2) {
      vgrad(ctx, 0, 0, w, h, [[0, "#b49a76"], [1, "#6d5440"]]);
      texture(ctx, w, h, N, { scale: 0.0025 / u, strength: 0.35, oct: 6, speck: 0.02, rand });
      ctx.globalCompositeOperation = "soft-light";
      for (let i = 0; i < 18; i++) {
        const x = rand() * w;
        ctx.fillStyle = `rgba(230,220,190,${0.2 + rand() * 0.3})`;
        blurred(ctx, 6 * u, () => {
          ctx.beginPath();
          ctx.ellipse(x, h * 0.3 + rand() * h * 0.4, w * 0.012, h * (0.1 + rand() * 0.3), 0, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.globalCompositeOperation = "source-over";
    } else if (comp === 3) {
      const tY = h * 0.76;
      warmWall(ctx, w, h, tY, "#e6ddcf", "#d1c4b0");
      blurred(ctx, 80 * u, () => {
        ctx.fillStyle = "rgba(255,250,235,0.4)";
        ctx.fillRect(0, 0, w * 0.4, tY);
      });
      vessel(ctx, w * 0.38, tY + h * 0.03, h * 0.46, w * (v === 6 ? 0.16 : 0.22), rand, { glaze: null, clay: CLAYS[2], u });
      vessel(ctx, w * 0.64, tY + h * 0.03, h * 0.34, w * (v === 6 ? 0.14 : 0.2), rand, { glaze: GLAZES[2], clay: CLAYS[1], glazeLine: 0.85, u });
      texture(ctx, w, h, N, { scale: 0.008 / u, strength: 0.05, oct: 3 });
    } else if (comp === 4) {
      vgrad(ctx, 0, 0, w, h, [[0, "#cdbca2"], [1, "#b29c7e"]]);
      texture(ctx, w, h, N, { scale: 0.004 / u, strength: 0.08, oct: 4, stretch: 0.2 });
      const r = Math.min(w, h) * 0.36;
      shadowEllipse(ctx, w / 2 + r * 0.08, h / 2 + r * 0.1, r, r, 0.45, r * 0.08);
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.fillStyle = radial(ctx, w / 2 - r * 0.3, h / 2 - r * 0.3, r * 1.4, [[0, "#c79a74"], [1, "#7e5038"]]);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r * 0.86, 0, Math.PI * 2);
      ctx.fillStyle = radial(ctx, w / 2 + r * 0.2, h / 2 + r * 0.2, r, [[0, "#9aa39a"], [0.7, "#6e7d6a"], [1, "#4a5548"]]);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w / 2 + r * 0.05, h / 2 + r * 0.05, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(200,215,200,0.35)";
      ctx.fill();
      texture(ctx, w, h, N, { scale: 0.01 / u, strength: 0.08, oct: 3, speck: 0.003, rand, region: [w / 2 - r, h / 2 - r, r * 2, r * 2] });
    } else if (comp === 5) {
      vgrad(ctx, 0, 0, w, h, [[0, "#8f7258"], [1, "#6c533f"]]);
      const cols = 5, rows = 4;
      const cw = w * 0.13, ch = cw * 0.7, gx = (w - cols * cw) / (cols + 1), gy = (h - rows * ch) / (rows + 1);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const x = gx + c * (cw + gx), y = gy + r * (ch + gy);
          blurred(ctx, 6 * u, () => {
            ctx.fillStyle = "rgba(20,12,6,0.4)";
            ctx.fillRect(x + 4 * u, y + 6 * u, cw, ch);
          });
          ctx.fillStyle = vgradStyle(ctx, y, y + ch, [[0, mix(GLAZES[(r * cols + c) % GLAZES.length], "#fff", 0.15)], [1, GLAZES[(r * cols + c) % GLAZES.length]]]);
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = CLAYS[c % CLAYS.length];
          ctx.fillRect(x, y + ch * (0.72 + rand() * 0.15), cw, ch * 0.3);
        }
      texture(ctx, w, h, N, { scale: 0.01 / u, strength: 0.08, oct: 3, speck: 0.002, rand });
    }
  }

  // ---------------------------------------------------------------- concrete
  function concreteTex(ctx, w, h, N, u, s = 0.12) {
    texture(ctx, w, h, N, { scale: 0.006 / u, strength: s, oct: 5 });
  }

  function concrete(ctx, w, h, v, rand, N) {
    const u = Math.min(w, h) / 1000;
    const comp = [0, 1, 2, 3, 4, 5, 6, 0, 0, 7][v % 10];
    if (comp === 0) {
      const vx = w * (v === 7 ? 0.5 : 0.62), vy = h * 0.46;
      const ex = w * 0.07, ey = h * 0.12; // end opening half size
      // ceiling, floor, walls
      poly(ctx, [[0, 0], [w, 0], [vx + ex, vy - ey], [vx - ex, vy - ey]]);
      ctx.fillStyle = "#8d8a85"; ctx.fill();
      poly(ctx, [[0, h], [w, h], [vx + ex, vy + ey], [vx - ex, vy + ey]]);
      ctx.fillStyle = vgradStyle(ctx, vy, h, [[0, "#bdb8b0"], [1, "#8e8981"]]); ctx.fill();
      poly(ctx, [[0, 0], [vx - ex, vy - ey], [vx - ex, vy + ey], [0, h]]);
      ctx.fillStyle = hgradFill(ctx, 0, vx, [[0, "#a7a39c"], [1, "#c9c5be"]]); ctx.fill();
      poly(ctx, [[w, 0], [vx + ex, vy - ey], [vx + ex, vy + ey], [w, h]]);
      ctx.fillStyle = hgradFill(ctx, vx, w, [[0, "#9c978f"], [1, "#6f6b65"]]); ctx.fill();
      // end opening
      ctx.fillStyle = "#f5f1e8";
      ctx.fillRect(vx - ex, vy - ey, ex * 2, ey * 2);
      if (v === 7) {
        blurred(ctx, 60 * u, () => {
          ctx.fillStyle = "rgba(255,250,235,0.6)";
          ctx.beginPath();
          ctx.ellipse(vx, vy + ey * 1.4, ex * 3, ey, 0, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      // light shafts
      const shafts = v === 8 ? 4 : 2;
      for (let i = 0; i < shafts; i++) {
        const t = 0.25 + i * (0.5 / shafts);
        const x0 = lerp(0, vx - ex, t), x1 = lerp(0, vx - ex, t + 0.08);
        const fy0 = lerp(h, vy + ey, t), fy1 = lerp(h, vy + ey, t + 0.08);
        ctx.fillStyle = "rgba(255,246,225,0.5)";
        poly(ctx, [[x0, fy0], [x1, fy1], [x1 + w * 0.25 * (1 - t), fy1], [x0 + w * 0.3 * (1 - t), fy0]]);
        ctx.fill();
      }
      concreteTex(ctx, w, h, N, u);
    } else if (comp === 1) {
      vgrad(ctx, 0, 0, w, h, [[0, "#cfcac2"], [1, "#b7b1a8"]]);
      // stair
      const steps = 9;
      const sx = w * 0.1, sy = h * 0.95, stepW = w * 0.09, stepH = h * 0.085;
      const pts = [[sx, sy]];
      for (let i = 0; i < steps; i++) {
        pts.push([sx + i * stepW, sy - (i + 1) * stepH]);
        pts.push([sx + (i + 1) * stepW, sy - (i + 1) * stepH]);
      }
      pts.push([sx + steps * stepW, sy]);
      poly(ctx, pts);
      ctx.fillStyle = "#9e988f";
      ctx.fill();
      // diagonal shadow
      ctx.fillStyle = "rgba(40,36,32,0.55)";
      poly(ctx, [[w * 0.45, 0], [w, 0], [w, h * 0.6], [w * 0.2, h]]);
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      blurred(ctx, 4 * u, () => ctx.fill());
      ctx.restore();
      concreteTex(ctx, w, h, N, u);
    } else if (comp === 2) {
      vgrad(ctx, 0, 0, w, h, [[0, "#c8c3bb"], [1, "#b2aca3"]]);
      const cols = 4, rows = 5;
      const cw = w / cols, rh = h / rows;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const x = c * cw + cw * 0.2, y = r * rh + rh * 0.18, ww = cw * 0.6, hh = rh * 0.64;
          ctx.fillStyle = "#3d3a36";
          ctx.fillRect(x, y, ww, hh);
          // reveal shading
          ctx.fillStyle = "#6e6a64";
          poly(ctx, [[x, y], [x + ww, y], [x + ww - ww * 0.15, y + hh * 0.18], [x + ww * 0.15, y + hh * 0.18]]);
          ctx.fill();
          ctx.fillStyle = "#87827b";
          poly(ctx, [[x, y], [x + ww * 0.15, y + hh * 0.18], [x + ww * 0.15, y + hh], [x, y + hh]]);
          ctx.fill();
          ctx.fillStyle = "rgba(170,190,200,0.25)";
          ctx.fillRect(x + ww * 0.15, y + hh * 0.18, ww * 0.85, hh * 0.82);
        }
      concreteTex(ctx, w, h, N, u, 0.1);
    } else if (comp === 3) {
      vgrad(ctx, 0, 0, w, h, [[0, "#f0ece3"], [1, "#e7e2d7"]]);
      ctx.strokeStyle = "rgba(40,38,35,0.85)";
      const lw = 5 * u;
      ctx.lineWidth = lw;
      const ox = w * 0.1, oy = h * 0.14, W = w * 0.8, H = h * 0.72;
      ctx.strokeRect(ox, oy, W, H);
      const xs = [0.3, 0.55, 0.78].map((t) => ox + W * t);
      xs.forEach((x, i) => {
        ctx.beginPath();
        ctx.moveTo(x, oy);
        ctx.lineTo(x, oy + H * (i === 1 ? 0.62 : 1));
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.moveTo(ox, oy + H * 0.62);
      ctx.lineTo(xs[1], oy + H * 0.62);
      ctx.stroke();
      // door arcs
      ctx.lineWidth = 1.5 * u;
      [[xs[0], oy + H * 0.62], [xs[2], oy + H * 0.3]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, W * 0.06, 0, Math.PI / 2);
        ctx.stroke();
      });
      // hatch
      ctx.save();
      ctx.beginPath();
      ctx.rect(xs[2], oy, ox + W - xs[2], H * 0.3);
      ctx.clip();
      ctx.lineWidth = 1 * u;
      for (let i = -20; i < 40; i++) {
        ctx.beginPath();
        ctx.moveTo(xs[2] + i * 14 * u, oy);
        ctx.lineTo(xs[2] + i * 14 * u + H * 0.3, oy + H * 0.3);
        ctx.stroke();
      }
      ctx.restore();
      texture(ctx, w, h, N, { scale: 0.01 / u, strength: 0.03, oct: 3 });
    } else if (comp === 4) {
      vgrad(ctx, 0, 0, w, h, [[0, "#3b3833"], [1, "#25231f"]]);
      const ow = w * 0.3, ox = w * 0.38, oy = h * 0.1, oh = h * 0.66;
      ctx.fillStyle = vgradStyle(ctx, oy, oy + oh, [[0, "#f6f3ec"], [1, "#e6dfcf"]]);
      ctx.fillRect(ox, oy, ow, oh);
      ctx.fillStyle = "rgba(255,248,230,0.35)";
      poly(ctx, [[ox, oy + oh], [ox + ow, oy + oh], [ox + ow * 1.6, h], [ox - ow * 0.4, h]]);
      ctx.fill();
      concreteTex(ctx, w, h, N, u, 0.14);
    } else if (comp === 5) {
      vgrad(ctx, 0, 0, w, h, [[0, "#d9d4ca"], [1, "#c3bdb3"]]);
      ctx.fillStyle = "rgba(60,55,50,0.45)";
      for (let i = -2; i < 8; i++) {
        const x = i * w * 0.18;
        poly(ctx, [[x, 0], [x + w * 0.07, 0], [x + w * 0.37, h], [x + w * 0.3, h]]);
        ctx.fill();
      }
      concreteTex(ctx, w, h, N, u, 0.1);
    } else if (comp === 6) {
      vgrad(ctx, 0, 0, w, h, [[0, "#a6a199"], [1, "#8f8a82"]]);
      ctx.fillStyle = "rgba(255,248,232,0.55)";
      poly(ctx, [[w * 0.3, h * 0.15], [w * 0.62, h * 0.08], [w * 0.7, h * 0.7], [w * 0.36, h * 0.82]]);
      ctx.fill();
      concreteTex(ctx, w, h, N, u, 0.14);
    } else if (comp === 7) {
      vgrad(ctx, 0, 0, w, h, [[0, "#cfcac1"], [1, "#a9a39a"]]);
      const rows = 5;
      for (let r = 0; r < rows; r++) {
        const y = h * (0.12 + r * 0.17);
        ctx.fillStyle = "#6c675f";
        ctx.fillRect(w * 0.06, y + h * 0.12, w * 0.88, h * 0.012);
        let x = w * 0.08;
        while (x < w * 0.9) {
          const bw = w * (0.04 + rand() * 0.06);
          ctx.fillStyle = mix("#b8a888", "#e7e0d2", rand());
          ctx.fillRect(x, y + h * (0.12 - 0.09 - rand() * 0.02), bw, h * 0.1);
          x += bw + w * 0.006;
        }
      }
      concreteTex(ctx, w, h, N, u, 0.08);
    }
  }

  // ---------------------------------------------------------------- linen
  function linenBase(ctx, w, h, rand, u, base = "#e8e1d4") {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    const rowN = new Float32Array(h).map(() => rand() - 0.5);
    const colN = new Float32Array(w).map(() => rand() - 0.5);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const k = 1 + (rowN[y] * 0.07 + colN[x] * 0.06);
        const i = (y * w + x) * 4;
        d[i] *= k; d[i + 1] *= k; d[i + 2] *= k;
      }
    ctx.putImageData(img, 0, 0);
  }

  function plate(ctx, x, y, r, u, food, rand) {
    shadowEllipse(ctx, x + r * 0.08, y + r * 0.12, r * 1.02, r * 1.02, 0.3, r * 0.08);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = radial(ctx, x - r * 0.3, y - r * 0.3, r * 1.5, [[0, "#fbf9f4"], [1, "#d9d3c8"]]);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, r * 0.72, 0, Math.PI * 2);
    ctx.fillStyle = radial(ctx, x + r * 0.2, y + r * 0.2, r, [[0, "#f6f3ec"], [1, "#e3ddd2"]]);
    ctx.fill();
    if (food) {
      const cols = ["#6b7a4f", "#c2803e", "#8c3b2a", "#d9c28a"];
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = cols[i % cols.length];
        blobPath(ctx, x + (rand() - 0.5) * r * 0.5, y + (rand() - 0.5) * r * 0.5, r * (0.08 + rand() * 0.12), r * (0.06 + rand() * 0.1), rand, 0.2);
        ctx.fill();
      }
    }
  }

  function glassTop(ctx, x, y, r) {
    shadowEllipse(ctx, x + r * 0.3, y + r * 0.3, r, r, 0.15, r * 0.2);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = r * 0.06;
    ctx.stroke();
    ctx.strokeStyle = "rgba(120,110,95,0.25)";
    ctx.lineWidth = r * 0.03;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.88, 0.5, 2.6);
    ctx.stroke();
  }

  function cutlery(ctx, x, y, len, u) {
    shadowEllipse(ctx, x + 4 * u, y + len / 2 + 4 * u, 5 * u, len / 2, 0.25, 4 * u);
    ctx.fillStyle = hgradFill(ctx, x - 6 * u, x + 6 * u, [[0, "#8d8a84"], [0.5, "#e8e6e1"], [1, "#77736d"]]);
    rrect(ctx, x - 5 * u, y, 10 * u, len, 5 * u);
    ctx.fill();
  }

  function linen(ctx, w, h, v, rand, N) {
    const u = Math.min(w, h) / 1000;
    const comp = v % 6;
    linenBase(ctx, w, h, rand, u, ["#e8e1d4", "#e2dbcd", "#ebe5da"][v % 3]);
    if (comp === 0 || comp === 2) {
      const r = Math.min(w, h) * (comp === 2 ? 0.1 : 0.17);
      const places = comp === 2 ? [0.12, 0.31, 0.5, 0.69, 0.88] : [0.28, 0.72];
      // runner
      ctx.fillStyle = "rgba(160,145,120,0.25)";
      ctx.fillRect(0, h * 0.44, w, h * 0.12);
      places.forEach((px) => {
        [0.2, 0.8].forEach((py) => {
          const x = w * px, y = h * py;
          plate(ctx, x, y, r, u, comp === 0, rand);
          cutlery(ctx, x + r * 1.25, y - r * 0.8, r * 1.6, u);
          glassTop(ctx, x - r * 1.05, y + (py < 0.5 ? r * 1.0 : -r * 1.0), r * 0.32);
        });
      });
      // bread & bowl centre
      ctx.fillStyle = "#b9824d";
      blobPath(ctx, w * 0.5, h * 0.5, r * 0.55, r * 0.3, rand, 0.08);
      ctx.fill();
    } else if (comp === 1) {
      plate(ctx, w / 2, h / 2, Math.min(w, h) * 0.34, u, true, rand);
      cutlery(ctx, w * 0.9, h * 0.25, h * 0.5, u);
    } else if (comp === 3) {
      glassTop(ctx, w * 0.42, h * 0.38, Math.min(w, h) * 0.16);
      shadowEllipse(ctx, w * 0.62, h * 0.7, w * 0.2, h * 0.08, 0.3, 14 * u);
      ctx.fillStyle = radial(ctx, w * 0.6, h * 0.66, w * 0.25, [[0, "#d29a5e"], [1, "#8d5a2e"]]);
      blobPath(ctx, w * 0.6, h * 0.66, w * 0.2, h * 0.09, rand, 0.06);
      ctx.fill();
    } else if (comp === 4) {
      const cw = w * 0.56, ch = cw * 1.4 > h * 0.8 ? h * 0.8 : cw * 1.4;
      const cx = w / 2 - cw / 2, cy = h / 2 - ch / 2;
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(-0.04);
      ctx.translate(-w / 2, -h / 2);
      blurred(ctx, 14 * u, () => {
        ctx.fillStyle = "rgba(40,30,20,0.3)";
        ctx.fillRect(cx + 10 * u, cy + 14 * u, cw, ch);
      });
      ctx.fillStyle = "#f6f2ea";
      ctx.fillRect(cx, cy, cw, ch);
      ctx.fillStyle = "rgba(30,28,25,0.85)";
      ctx.fillRect(cx + cw * 0.3, cy + ch * 0.1, cw * 0.4, 12 * u);
      for (let i = 0; i < 6; i++) {
        const y = cy + ch * (0.24 + i * 0.1);
        ctx.fillStyle = "rgba(30,28,25,0.7)";
        ctx.fillRect(cx + cw * (0.5 - 0.15 - rand() * 0.15), y, cw * (0.3 + rand() * 0.3), 7 * u);
        ctx.fillStyle = "rgba(30,28,25,0.35)";
        ctx.fillRect(cx + cw * 0.38, y + 18 * u, cw * 0.24, 4 * u);
      }
      ctx.fillStyle = VERMILION;
      ctx.beginPath();
      ctx.arc(w / 2, cy + ch * 0.9, 8 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (comp === 5) {
      for (let i = 0; i < 4; i++) {
        const x = w * (0.1 + i * 0.22), y = h * 0.25;
        const nw = w * 0.17, nh = h * 0.5;
        blurred(ctx, 14 * u, () => {
          ctx.fillStyle = "rgba(40,30,20,0.22)";
          ctx.fillRect(x + 8 * u, y + 14 * u, nw, nh);
        });
        for (let f = 0; f < 3; f++) {
          ctx.fillStyle = mix("#f3eee5", "#7a6a55", f * 0.07 + (i % 2) * 0.03);
          ctx.fillRect(x, y + (nh / 3) * f, nw, nh / 3 + 1);
        }
        ctx.strokeStyle = VERMILION;
        ctx.lineWidth = 2 * u;
        ctx.strokeRect(x + nw * 0.42, y + nh * 0.82, nw * 0.16, nh * 0.08);
      }
    }
    texture(ctx, w, h, N, { scale: 0.004 / u, strength: 0.06, oct: 4 });
  }

  // ---------------------------------------------------------------- riso
  const INKS = { red: "#e4553b", blue: "#3459b8", yellow: "#f2c230", teal: "#2f8f86", pink: "#e98aa0" };

  function risoLayer(ctx, w, h, color, offset, draw, rand, u) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const x = c.getContext("2d");
    x.fillStyle = color;
    x.strokeStyle = color;
    draw(x);
    // ink texture: knock out random specks
    x.globalCompositeOperation = "destination-out";
    for (let i = 0; i < (w * h) / 380; i++) {
      x.fillStyle = `rgba(0,0,0,${0.15 + rand() * 0.5})`;
      x.fillRect(rand() * w, rand() * h, (1 + rand() * 2) * u, (1 + rand() * 2) * u);
    }
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.9;
    ctx.drawImage(c, offset[0], offset[1]);
    ctx.restore();
  }

  function halftone(x, w, h, cell, fn) {
    for (let yy = 0; yy < h; yy += cell)
      for (let xx = 0; xx < w; xx += cell) {
        const r = fn(xx / w, yy / h) * cell * 0.6;
        if (r <= 0.2) continue;
        x.beginPath();
        x.arc(xx + cell / 2, yy + cell / 2, r, 0, Math.PI * 2);
        x.fill();
      }
  }

  function riso(ctx, w, h, v, rand, N) {
    const u = Math.min(w, h) / 1000;
    const comp = [0, 1, 2, 1, 4, 5, 6, 5][v % 8];
    vgrad(ctx, 0, 0, w, h, [[0, "#f3eee3"], [1, "#ece5d7"]]);
    texture(ctx, w, h, N, { scale: 0.02 / u, strength: 0.03, oct: 2 });
    const mis = () => [(rand() - 0.5) * 14 * u, (rand() - 0.5) * 14 * u];
    if (comp === 0) {
      risoLayer(ctx, w, h, INKS.yellow, mis(), (x) => { x.beginPath(); x.arc(w * 0.38, h * 0.42, Math.min(w, h) * 0.3, 0, Math.PI * 2); x.fill(); }, rand, u);
      risoLayer(ctx, w, h, INKS.blue, mis(), (x) => { x.beginPath(); x.arc(w * 0.62, h * 0.56, Math.min(w, h) * 0.28, 0, Math.PI * 2); x.fill(); }, rand, u);
      risoLayer(ctx, w, h, INKS.red, mis(), (x) => { x.beginPath(); x.arc(w * 0.46, h * 0.68, Math.min(w, h) * 0.16, 0, Math.PI * 2); x.fill(); }, rand, u);
    } else if (comp === 1) {
      const poster = v === 3;
      const m = poster ? w * 0.08 : 0;
      risoLayer(ctx, w, h, INKS.red, mis(), (x) => {
        let y = poster ? h * 0.12 : 0;
        const end = poster ? h * 0.72 : h;
        while (y < end) {
          const bh = h * (0.01 + rand() * 0.06);
          if (rand() > 0.35) x.fillRect(m, y, w - m * 2, bh);
          y += bh + h * (0.01 + rand() * 0.03);
        }
      }, rand, u);
      risoLayer(ctx, w, h, INKS.blue, mis(), (x) => {
        if (poster) {
          x.fillRect(m, h * 0.78, w * 0.5, h * 0.05);
          x.fillRect(m, h * 0.86, w * 0.3, h * 0.02);
          x.fillRect(m, h * 0.9, w * 0.36, h * 0.02);
        } else {
          x.globalAlpha = 0.7;
          x.fillRect(0, h * 0.55, w, h * 0.45);
        }
      }, rand, u);
    } else if (comp === 2) {
      risoLayer(ctx, w, h, INKS.blue, mis(), (x) => halftone(x, w, h, 22 * u, (a, b) => 0.3 + 0.7 * b), rand, u);
      risoLayer(ctx, w, h, INKS.yellow, mis(), (x) => halftone(x, w, h, 18 * u, (a, b) => 1 - Math.hypot(a - 0.4, b - 0.4) * 1.4), rand, u);
    } else if (comp === 4) {
      vgrad(ctx, 0, 0, w, h, [[0, "#f2f0eb"], [1, "#e4e0d8"]]);
      for (let i = 0; i < 3; i++) {
        const pw = w * 0.22, ph = pw * 1.35, x = w * (0.1 + i * 0.29), y = h / 2 - ph / 2;
        blurred(ctx, 10 * u, () => {
          ctx.fillStyle = "rgba(30,25,20,0.22)";
          ctx.fillRect(x + 6 * u, y + 10 * u, pw, ph);
        });
        ctx.fillStyle = "#f6f1e6";
        ctx.fillRect(x, y, pw, ph);
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, pw, ph);
        ctx.clip();
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = INKS.red;
        let yy = y + ph * 0.1;
        while (yy < y + ph * 0.9) {
          const bh = ph * (0.02 + rand() * 0.07);
          if (rand() > 0.4) ctx.fillRect(x + pw * 0.1, yy, pw * 0.8, bh);
          yy += bh + ph * 0.03;
        }
        ctx.fillStyle = INKS.blue;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(x + pw * 0.1, y + ph * (0.5 + i * 0.1), pw * 0.8, ph * 0.3);
        ctx.restore();
      }
    } else if (comp === 5) {
      const shapes = [];
      for (let i = 0; i < 6; i++) shapes.push([rand() * w * 0.8 + w * 0.1, rand() * h * 0.8 + h * 0.1, Math.min(w, h) * (0.08 + rand() * 0.14), Math.floor(rand() * 3)]);
      const drawShapes = (x) => shapes.forEach(([sx, sy, r, k]) => {
        x.beginPath();
        if (k === 0) x.arc(sx, sy, r, 0, Math.PI * 2);
        else if (k === 1) x.rect(sx - r, sy - r, r * 2, r * 2);
        else { x.moveTo(sx, sy - r); x.lineTo(sx + r, sy + r); x.lineTo(sx - r, sy + r); x.closePath(); }
        x.fill();
      });
      risoLayer(ctx, w, h, INKS.teal, [0, 0], drawShapes, rand, u);
      risoLayer(ctx, w, h, INKS.pink, [22 * u, 16 * u], drawShapes, rand, u);
      if (v === 7) {
        risoLayer(ctx, w, h, INKS.blue, mis(), (x) => { x.fillRect(0, 0, w * 0.06, h); x.fillRect(w * 0.94, 0, w * 0.06, h); }, rand, u);
      }
    } else if (comp === 6) {
      risoLayer(ctx, w, h, INKS.red, mis(), (x) => { x.beginPath(); x.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.32, Math.PI, 0); x.fill(); }, rand, u);
      risoLayer(ctx, w, h, INKS.blue, mis(), (x) => { x.fillRect(w * 0.18, h * 0.5, w * 0.64, h * 0.28); }, rand, u);
    }
  }

  // ---------------------------------------------------------------- studio
  function plasterWall(ctx, w, h, N, u, a = "#e3dccf", b = "#cfc6b7") {
    vgrad(ctx, 0, 0, w, h, [[0, a], [1, b]]);
  }

  function studio(ctx, w, h, v, rand, N) {
    const u = Math.min(w, h) / 1000;
    const comp = v % 6;
    if (comp === 0 || comp === 2) {
      const floorY = h * (comp === 0 ? 0.72 : 0.68);
      plasterWall(ctx, w, floorY, N, u, comp === 2 ? "#d9cfbf" : "#ddd5c8", comp === 2 ? "#c7bba8" : "#c8bfb1");
      vgrad(ctx, 0, floorY, w, h - floorY, [[0, "#b49c7e"], [1, "#8c745a"]]);
      // window light patch on wall + floor
      const wx = w * (comp === 2 ? 0.38 : 0.2), ww = w * (comp === 2 ? 0.32 : 0.34);
      ctx.save();
      ctx.globalCompositeOperation = "soft-light";
      blurred(ctx, 6 * u, () => {
        ctx.fillStyle = "rgba(255,240,205,0.95)";
        poly(ctx, [[wx, h * 0.1], [wx + ww, h * 0.05], [wx + ww * 1.1, floorY], [wx + ww * 0.05, floorY]]);
        ctx.fill();
        poly(ctx, [[wx + ww * 0.05, floorY], [wx + ww * 1.1, floorY], [wx + ww * 1.9, h], [wx + ww * 0.6, h]]);
        ctx.fill();
      });
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      blurred(ctx, 10 * u, () => {
        ctx.fillStyle = "rgba(255,236,200,0.35)";
        poly(ctx, [[wx, h * 0.1], [wx + ww, h * 0.05], [wx + ww * 1.1, floorY], [wx + ww * 0.05, floorY]]);
        ctx.fill();
      });
      ctx.restore();
      // mullion shadows
      ctx.fillStyle = "rgba(60,48,36,0.22)";
      ctx.fillRect(wx + ww * 0.5, h * 0.07, 10 * u, floorY - h * 0.07);
      ctx.fillRect(wx, h * 0.42, ww * 1.05, 8 * u);
      if (comp === 0) {
        // chair
        const cx = w * 0.62, seatY = floorY + h * 0.02, cw = w * 0.22;
        shadowEllipse(ctx, cx + cw * 0.3, seatY + h * 0.17, cw * 0.7, h * 0.03, 0.35, 12 * u);
        ctx.fillStyle = "#4a3b2d";
        ctx.fillRect(cx, seatY - h * 0.26, cw * 0.07, h * 0.44); // back leg
        ctx.fillRect(cx + cw * 0.85, seatY, cw * 0.07, h * 0.18);
        ctx.fillRect(cx + cw * 0.08, seatY, cw * 0.06, h * 0.18);
        ctx.fillStyle = "#6b5440";
        ctx.fillRect(cx, seatY - h * 0.02, cw * 0.95, h * 0.035); // seat
        ctx.fillRect(cx, seatY - h * 0.26, cw * 0.07, h * 0.03);
        ctx.fillRect(cx - cw * 0.02, seatY - h * 0.22, cw * 0.11, h * 0.08); // backrest
      }
      texture(ctx, w, h, N, { scale: 0.005 / u, strength: 0.07, oct: 4 });
    } else if (comp === 1) {
      vgrad(ctx, 0, 0, w, h, [[0, "#a7896a"], [1, "#8b6f53"]]);
      texture(ctx, w, h, N, { scale: 0.002 / u, strength: 0.18, oct: 5, stretch: 0.08 });
      const sheet = (x, y, sw, sh, rot, c = "#f4f0e8") => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        blurred(ctx, 10 * u, () => { ctx.fillStyle = "rgba(30,20,10,0.35)"; ctx.fillRect(-sw / 2 + 8 * u, -sh / 2 + 10 * u, sw, sh); });
        ctx.fillStyle = c;
        ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
        ctx.restore();
      };
      sheet(w * 0.36, h * 0.5, w * 0.3, h * 0.62, -0.06);
      sheet(w * 0.5, h * 0.46, w * 0.22, h * 0.46, 0.05, "#ebe3d4");
      textLines(ctx, w * 0.41, h * 0.3, w * 0.16, h * 0.3, 12 * u, rand, "rgba(40,36,32,0.4)");
      // cup
      shadowEllipse(ctx, w * 0.78, h * 0.34, w * 0.07, w * 0.07, 0.4, 10 * u);
      ctx.beginPath(); ctx.arc(w * 0.77, h * 0.32, w * 0.065, 0, Math.PI * 2);
      ctx.fillStyle = "#efece6"; ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.77, h * 0.32, w * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = "#3a2618"; ctx.fill();
      // pencil
      ctx.save(); ctx.translate(w * 0.72, h * 0.7); ctx.rotate(0.5);
      ctx.fillStyle = "#2c2a27"; ctx.fillRect(-w * 0.12, -5 * u, w * 0.22, 10 * u);
      ctx.restore();
    } else if (comp === 3) {
      plasterWall(ctx, w, h, N, u);
      const sy = h * 0.66;
      vgrad(ctx, 0, sy, w, 24 * u, [[0, "#9b8165"], [1, "#6b563f"]]);
      shadowEllipse(ctx, w / 2, sy + 40 * u, w * 0.45, 18 * u, 0.25, 20 * u);
      vessel(ctx, w * 0.24, sy, h * 0.24, w * 0.12, rand, { glaze: GLAZES[1], clay: CLAYS[0], u });
      // tiles
      ctx.fillStyle = GREENS[0]; ctx.fillRect(w * 0.38, sy - h * 0.12, w * 0.08, h * 0.12);
      ctx.fillStyle = "#d8d2c4"; ctx.fillRect(w * 0.47, sy - h * 0.1, w * 0.07, h * 0.1);
      // paper stack
      for (let i = 0; i < 6; i++) { ctx.fillStyle = mix("#f2ede4", "#c9bca6", i * 0.08); ctx.fillRect(w * 0.6, sy - (i + 1) * 9 * u, w * 0.2, 8 * u); }
      stoneForm(ctx, w * 0.86, sy - h * 0.045, w * 0.05, h * 0.045, rand, "#b9ad9c");
      texture(ctx, w, h, N, { scale: 0.006 / u, strength: 0.06, oct: 3 });
    } else if (comp === 4) {
      vgrad(ctx, 0, 0, w, h, [[0, "#c9b493"], [1, "#b39c79"]]);
      texture(ctx, w, h, N, { scale: 0.03 / u, strength: 0.15, oct: 3, speck: 0.01, rand });
      const items = 9;
      for (let i = 0; i < items; i++) {
        const sw = w * (0.1 + rand() * 0.12), sh = sw * (0.7 + rand() * 0.7);
        const x = w * 0.06 + (i % 5) * w * 0.18 + rand() * w * 0.03, y = h * (0.08 + Math.floor(i / 5) * 0.46) + rand() * h * 0.05;
        const c = [ "#f4f0e8", "#e9e1d2", INKS.red, "#2f6b5c", "#f0e6cf", "#d8d2c4" ][i % 6];
        blurred(ctx, 6 * u, () => { ctx.fillStyle = "rgba(30,20,10,0.3)"; ctx.fillRect(x + 5 * u, y + 7 * u, sw, sh); });
        ctx.fillStyle = c; ctx.fillRect(x, y, sw, sh);
        if (i % 3 === 0) textLines(ctx, x + sw * 0.12, y + sh * 0.15, sw * 0.76, sh * 0.6, 9 * u, rand, "rgba(40,36,32,0.35)");
        ctx.fillStyle = "#3b3a38";
        ctx.beginPath(); ctx.arc(x + sw / 2, y + 8 * u, 4 * u, 0, Math.PI * 2); ctx.fill();
      }
    } else if (comp === 5) {
      const floorY = h * 0.6;
      vgrad(ctx, 0, 0, w, floorY, [[0, "#3a3631"], [1, "#4a453e"]]);
      vgrad(ctx, 0, floorY, w, h - floorY, [[0, "#6a6157"], [1, "#4a433b"]]);
      // reflector boards
      [[0.12, -0.12], [0.7, 0.1]].forEach(([x, rot]) => {
        ctx.save(); ctx.translate(w * x, floorY); ctx.rotate(rot);
        ctx.fillStyle = "#e9e5dc"; ctx.fillRect(0, -h * 0.5, w * 0.18, h * 0.5);
        ctx.restore();
      });
      ctx.globalCompositeOperation = "screen";
      glow(ctx, w * 0.48, floorY - h * 0.2, w * 0.3, "#ffd9a0", 0.6);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#1c1915"; ctx.fillRect(w * 0.475, floorY - h * 0.16, 6 * u, h * 0.2);
      ctx.beginPath(); ctx.arc(w * 0.48, floorY - h * 0.2, w * 0.04, 0, Math.PI * 2); ctx.fillStyle = "#fff1d6"; ctx.fill();
      texture(ctx, w, h, N, { scale: 0.006 / u, strength: 0.08, oct: 3 });
    }
  }

  // ---------------------------------------------------------------- sketch
  function pencil(ctx, pts, rand, u, alpha = 0.6, width = 1.6, passes = 2) {
    for (let p = 0; p < passes; p++) {
      ctx.strokeStyle = `rgba(48,46,43,${alpha * (0.6 + rand() * 0.4)})`;
      ctx.lineWidth = width * u * (0.7 + rand() * 0.6);
      ctx.beginPath();
      pts.forEach(([x, y], i) => {
        const jx = x + (rand() - 0.5) * 2.2 * u, jy = y + (rand() - 0.5) * 2.2 * u;
        i ? ctx.lineTo(jx, jy) : ctx.moveTo(jx, jy);
      });
      ctx.stroke();
    }
  }
  function seg(a, b, n = 12) {
    return Array.from({ length: n + 1 }, (_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]);
  }
  function arcPts(cx, cy, r, a0, a1, n = 48, ry = r) {
    return Array.from({ length: n + 1 }, (_, i) => {
      const a = lerp(a0, a1, i / n);
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * ry];
    });
  }

  function sketch(ctx, w, h, v, rand, N) {
    const u = Math.min(w, h) / 1000;
    const comp = v % 7;
    vgrad(ctx, 0, 0, w, h, [[0, "#f3efe6"], [1, "#ebe5d9"]]);
    texture(ctx, w, h, N, { scale: 0.03 / u, strength: 0.03, oct: 2, speck: 0.0008, rand });
    const L = (a, b, al = 0.5) => pencil(ctx, seg(a, b), rand, u, al);
    if (comp === 0) {
      const cx = w * 0.5, cy = h * 0.52, r = Math.min(w, h) * 0.26;
      L([w * 0.08, cy + r], [w * 0.92, cy + r], 0.25);
      L([w * 0.08, cy - r], [w * 0.92, cy - r], 0.25);
      L([w * 0.08, cy], [w * 0.92, cy], 0.18);
      L([cx, h * 0.1], [cx, h * 0.92], 0.18);
      pencil(ctx, arcPts(cx, cy, r, 0, Math.PI * 2), rand, u, 0.25);
      pencil(ctx, arcPts(cx - r * 0.1, cy + r * 0.1, r * 0.62, -0.3, Math.PI * 2 - 0.6), rand, u, 0.7, 3.2, 3);
      pencil(ctx, seg([cx + r * 0.55, cy - r * 0.5], [cx + r * 0.55, cy + r]), rand, u, 0.75, 3.2, 3);
    } else if (comp === 1) {
      const g = 40 * u;
      ctx.strokeStyle = "rgba(90,120,160,0.12)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += g) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += g) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      const ox = w * 0.15, oy = h * 0.18, W = w * 0.7, H = h * 0.64;
      [[[ox, oy], [ox + W, oy]], [[ox + W, oy], [ox + W, oy + H]], [[ox + W, oy + H], [ox, oy + H]], [[ox, oy + H], [ox, oy]],
       [[ox + W * 0.4, oy], [ox + W * 0.4, oy + H * 0.7]], [[ox, oy + H * 0.55], [ox + W * 0.4, oy + H * 0.55]], [[ox + W * 0.7, oy + H * 0.3], [ox + W, oy + H * 0.3]]]
        .forEach(([a, b]) => pencil(ctx, seg(a, b), rand, u, 0.7, 2.4, 3));
      pencil(ctx, arcPts(ox + W * 0.4, oy + H * 0.7, W * 0.08, 0, Math.PI / 2), rand, u, 0.4);
    } else if (comp === 2) {
      for (let i = 0; i < 6; i++) {
        const x = w * (0.1 + (i % 3) * 0.3), y = h * (0.15 + Math.floor(i / 3) * 0.42);
        const s = Math.min(w, h) * 0.22;
        pencil(ctx, arcPts(x + s / 2, y + s / 2, s * 0.45, Math.PI * (0.8 + rand() * 0.3), Math.PI * (2.1 + rand() * 0.4), 40, s * (0.3 + rand() * 0.2)), rand, u, 0.7, 4, 3);
        pencil(ctx, seg([x + s * 0.1, y + s], [x + s * 0.9, y + s]), rand, u, 0.2);
      }
    } else if (comp === 3) {
      for (let i = 0; i < 3; i++) {
        const cx = w * (0.22 + i * 0.28), base = h * 0.82, hg = h * (0.45 + rand() * 0.2), wd = w * (0.08 + rand() * 0.05);
        const prof = (t) => wd * (0.6 + Math.sin(t * Math.PI) * 0.5 - t * 0.2);
        const right = Array.from({ length: 30 }, (_, k) => [cx + prof(k / 29), base - (k / 29) * hg]);
        const left = right.map(([x, y]) => [2 * cx - x, y]);
        pencil(ctx, right, rand, u, 0.7, 2.6, 3);
        pencil(ctx, left, rand, u, 0.7, 2.6, 3);
        L([cx, base + 20 * u], [cx, base - hg - 30 * u], 0.18);
        pencil(ctx, arcPts(cx, base - hg, prof(1), 0, Math.PI * 2, 30, prof(1) * 0.18), rand, u, 0.5);
      }
    } else if (comp === 4) {
      const vx = w * 0.55, vy = h * 0.45;
      const box = [[w * 0.32, h * 0.3], [w * 0.75, h * 0.3], [w * 0.75, h * 0.66], [w * 0.32, h * 0.66]];
      [[0, 0], [w, 0], [w, h], [0, h]].forEach((c, i) => L(c, box[i], 0.55));
      for (let i = 0; i < 4; i++) L(box[i], box[(i + 1) % 4], 0.65);
      // window
      L([w * 0.08, h * 0.2], [w * 0.2, h * 0.27], 0.6); L([w * 0.2, h * 0.27], [w * 0.2, h * 0.6], 0.6);
      L([w * 0.08, h * 0.2], [w * 0.08, h * 0.75], 0.6); L([w * 0.08, h * 0.75], [w * 0.2, h * 0.6], 0.6);
      for (let i = 0; i < 18; i++) L([vx - w * 0.1 + i * 8 * u, h * 0.9], [vx + i * 8 * u, h * 0.7], 0.15);
    } else if (comp === 5) {
      for (let r = 0; r < 14; r++) {
        let x = w * 0.1;
        const y = h * (0.1 + r * 0.06);
        const end = w * (0.6 + rand() * 0.3);
        while (x < end) {
          const ww = w * (0.03 + rand() * 0.07);
          const pts = Array.from({ length: 10 }, (_, k) => [x + (ww * k) / 9, y + Math.sin(k * 1.7 + r) * 5 * u]);
          pencil(ctx, pts, rand, u, 0.55, 1.6, 1);
          x += ww + w * 0.015;
        }
      }
      pencil(ctx, arcPts(w * 0.78, h * 0.32, w * 0.1, 0, Math.PI * 2, 40, h * 0.06), rand, u, 0.6, 2.2, 2);
      L([w * 0.6, h * 0.62], [w * 0.8, h * 0.5], 0.6);
      L([w * 0.8, h * 0.5], [w * 0.77, h * 0.55], 0.6);
    } else if (comp === 6) {
      const rows = 10, cols = 4;
      const ox = w * 0.1, oy = h * 0.12, W = w * 0.8, H = h * 0.76;
      for (let r = 0; r <= rows; r++) L([ox, oy + (H / rows) * r], [ox + W, oy + (H / rows) * r], r === 1 ? 0.7 : 0.3);
      [0, 0.12, 0.62, 0.82, 1].forEach((t) => L([ox + W * t, oy], [ox + W * t, oy + H], 0.3));
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const x0 = ox + W * [0, 0.12, 0.62, 0.82][c] + 10 * u;
          const ww = W * [0.06, 0.3 + rand() * 0.15, 0.1, 0.08][c];
          const y = oy + (H / rows) * (r + 0.55);
          pencil(ctx, Array.from({ length: 8 }, (_, k) => [x0 + (ww * k) / 7, y + Math.sin(k * 2 + r) * 3 * u]), rand, u, 0.5, 1.4, 1);
        }
    }
  }

  const RECIPES = { stone, water, paper, light, clay, concrete, linen, riso, studio, sketch };

  window.renderMedia = function (spec) {
    const { width: w, height: h, recipe, variant, seed } = spec;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const rand = mulberry32(seed);
    const N = makeNoise(mulberry32(seed ^ 0x9e3779b9));
    RECIPES[recipe](ctx, w, h, variant, rand, N);
    const dark = recipe === "light" || (recipe === "studio" && variant === 5);
    grade(ctx, w, h, rand, { grain: dark ? 7 : 10, vignette: dark ? 0.28 : 0.14, lift: dark ? 9 : 5 });
    return canvas.toDataURL("image/webp", 0.8);
  };
})();
