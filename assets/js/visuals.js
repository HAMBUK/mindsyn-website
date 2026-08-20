/* ==========================================================================
   MindSyn canvas visuals
   1) SpikeField  : hero / contact background, a live spike-raster plot
   2) Fabric      : clock-driven vs event-driven compute fabric comparison
   ========================================================================== */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CYAN = [25, 209, 255];
  var VIOLET = [76, 36, 255];

  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function mixColor(t, alpha) {
    t = clamp(t, 0, 1);
    var r = Math.round(lerp(CYAN[0], VIOLET[0], t));
    var g = Math.round(lerp(CYAN[1], VIOLET[1], t));
    var b = Math.round(lerp(CYAN[2], VIOLET[2], t));
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function fitCanvas(canvas) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(1, Math.round(rect.width));
    var h = Math.max(1, Math.round(rect.height));
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }

  function roundedBar(ctx, x, y, w, h, r) {
    r = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  /* ======================================================================
     1) SpikeField: a raster plot of a population of neurons, flowing left
     ====================================================================== */
  function SpikeField(canvas, opts) {
    opts = opts || {};
    this.canvas = canvas;
    this.density = opts.density || 1;
    this.speed = opts.speed || 120;
    this.rowGap = opts.rowGap || 30;
    this.alpha = opts.alpha == null ? 1 : opts.alpha;
    this.spikes = [];
    this.rows = [];
    this.burstAt = 1.4;
    this.time = 0;
    this.visible = true;
    this.w = 0;
    this.h = 0;
    this.resize();
    this.warm(16);
  }

  // run the simulation forward so the raster is already full on first paint
  SpikeField.prototype.warm = function (seconds) {
    var stepSize = 1 / 45;
    for (var t = 0; t < seconds; t += stepSize) this.step(stepSize);
  };

  SpikeField.prototype.resize = function () {
    var f = fitCanvas(this.canvas);
    this.ctx = f.ctx;
    this.w = f.w;
    this.h = f.h;
    var n = Math.max(6, Math.round(this.h / this.rowGap));
    this.rows = [];
    for (var i = 0; i < n; i++) {
      this.rows.push({
        y: (i + 0.5) * (this.h / n),
        rate: 0.5 + Math.random() * 1.9,      // spikes per second
        acc: Math.random()
      });
    }
    // keep spikes inside the new box
    this.spikes = this.spikes.filter(function (s) { return s.x < f.w + 60; });
  };

  SpikeField.prototype.emit = function (row, x, strength) {
    this.spikes.push({
      x: x,
      y: row.y + (Math.random() - 0.5) * 3,
      len: 3 + Math.random() * (strength ? 16 : 10),
      life: 1,
      decay: 0.055 + Math.random() * 0.05,
      vx: -(this.speed * (0.75 + Math.random() * 0.6)),
      big: Math.random() < 0.06
    });
    if (this.spikes.length > 900) this.spikes.splice(0, 200);
  };

  SpikeField.prototype.burst = function (yPos, count) {
    var self = this;
    var x = this.w + 10;
    var picked = 0;
    this.rows.forEach(function (r) {
      var near = yPos == null ? true : Math.abs(r.y - yPos) < 130;
      if (near && Math.random() < (yPos == null ? 0.45 : 0.75) && picked < (count || 99)) {
        picked++;
        self.emit(r, yPos == null ? x : self.w * (0.35 + Math.random() * 0.5), true);
      }
    });
  };

  SpikeField.prototype.step = function (dt) {
    var self = this;
    this.time += dt;

    // spontaneous firing, poisson-ish
    this.rows.forEach(function (r) {
      r.acc += dt * r.rate * self.density;
      while (r.acc > 1) {
        r.acc -= 1;
        self.emit(r, self.w + Math.random() * 40, false);
      }
    });

    // population bursts: the visual signature of a spiking network
    this.burstAt -= dt;
    if (this.burstAt <= 0) {
      this.burstAt = 2.2 + Math.random() * 2.6;
      this.burst(null);
    }

    var out = [];
    for (var i = 0; i < this.spikes.length; i++) {
      var s = this.spikes[i];
      s.x += s.vx * dt;
      s.life -= s.decay * dt;
      if (s.x + s.len > -20 && s.life > 0) out.push(s);
    }
    this.spikes = out;
  };

  SpikeField.prototype.draw = function () {
    var ctx = this.ctx, w = this.w, h = this.h;
    ctx.clearRect(0, 0, w, h);

    // raster guide lines
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.028)';
    ctx.lineWidth = 1;
    for (var i = 0; i < this.rows.length; i++) {
      var y = Math.round(this.rows[i].y) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();

    // spikes
    for (var j = 0; j < this.spikes.length; j++) {
      var s = this.spikes[j];
      var t = 1 - clamp(s.x / w, 0, 1);          // colour follows the time axis
      var a = clamp(s.life, 0, 1) * this.alpha;
      var hgt = s.big ? 5 : 3;
      if (s.big) {
        ctx.fillStyle = mixColor(t, a * 0.18);
        roundedBar(ctx, s.x - 4, s.y - hgt / 2 - 4, s.len + 8, hgt + 8, 8);
        ctx.fill();
      }
      ctx.fillStyle = mixColor(t, a * 0.92);
      roundedBar(ctx, s.x, s.y - hgt / 2, s.len, hgt, hgt / 2);
      ctx.fill();
    }
  };

  SpikeField.prototype.frame = function (dt) {
    if (!this.visible) return;
    this.step(dt);
    this.draw();
  };

  SpikeField.prototype.still = function () {
    // one static frame for reduced-motion users; the constructor already warmed
    // the field, so this is just a paint
    this.draw();
  };

  /* ======================================================================
     2) Fabric: clock-driven vs event-driven compute
     ====================================================================== */
  function Fabric(canvas) {
    this.canvas = canvas;
    this.cols = 26;
    this.rows = 16;
    this.phase = 0;      // target 0..2
    this.cur = 0;        // animated
    this.tick = 0;
    this.opsClock = 0;
    this.opsEvent = 0;
    this.wave = 0;
    this.clockGrid = new Float32Array(this.cols * this.rows);
    this.eventGrid = new Float32Array(this.cols * this.rows);
    this.resize();
  }

  Fabric.prototype.resize = function () {
    var f = fitCanvas(this.canvas);
    this.ctx = f.ctx;
    this.w = f.w;
    this.h = f.h;
  };

  Fabric.prototype.setPhase = function (p) { this.phase = clamp(p, 0, 2); };

  Fabric.prototype.step = function (dt) {
    this.cur += (this.phase - this.cur) * Math.min(1, dt * 3.4);
    var n = this.cols * this.rows;
    var i;

    // decay
    for (i = 0; i < n; i++) {
      this.clockGrid[i] *= Math.pow(0.30, dt);
      this.eventGrid[i] *= Math.pow(0.004, dt);
    }

    // clock-driven: every tick the whole array switches, so it never goes dark
    this.tick += dt;
    if (this.tick > 0.2) {
      this.tick = 0;
      for (i = 0; i < n; i++) this.clockGrid[i] = 0.72 + Math.random() * 0.28;
      this.opsClock += n;
    }

    // event-driven: a travelling wavefront plus sparse spontaneous events
    this.wave += dt * 0.30;
    if (this.wave > 1) this.wave -= 1;
    var wx = this.wave * this.cols;
    for (var r = 0; r < this.rows; r++) {
      var jitter = Math.sin(r * 0.9 + this.wave * 6.0) * 2.0;
      var c = Math.round(wx + jitter);
      var k = r * this.cols + c;
      // one op is charged on the rising edge only, never for a lingering glow
      if (c >= 0 && c < this.cols && this.eventGrid[k] < 0.25 && Math.random() < 0.75) {
        this.eventGrid[k] = 1;
        this.opsEvent++;
      }
    }
    if (Math.random() < dt * 9) {
      var rr = Math.floor(Math.random() * this.rows);
      var cc = Math.floor(Math.random() * this.cols);
      if (this.eventGrid[rr * this.cols + cc] < 0.25) {
        this.eventGrid[rr * this.cols + cc] = 1;
        this.opsEvent++;
      }
    }
  };

  Fabric.prototype.drawGrid = function (rect, grid, alpha, mode) {
    if (alpha <= 0.001) return;
    var ctx = this.ctx;
    var pad = 8;
    var cw = (rect.w - pad * 2) / this.cols;
    var ch = (rect.h - pad * 2) / this.rows;
    var size = Math.min(cw, ch) * 0.68;
    var rad = Math.max(1.5, size * 0.28);

    ctx.save();
    ctx.globalAlpha = alpha;
    for (var r = 0; r < this.rows; r++) {
      for (var c = 0; c < this.cols; c++) {
        var v = grid[r * this.cols + c];
        var x = rect.x + pad + c * cw + (cw - size) / 2;
        var y = rect.y + pad + r * ch + (ch - size) / 2;

        // idle cell
        ctx.fillStyle = 'rgba(255,255,255,0.055)';
        roundedBar(ctx, x, y, size, size, rad);
        ctx.fill();

        if (v > 0.02) {
          if (mode === 'clock') {
            ctx.fillStyle = 'rgba(198,208,228,' + (v * 0.9) + ')';
          } else {
            var t = c / this.cols;
            ctx.fillStyle = mixColor(t, v);
            ctx.shadowColor = mixColor(t, v * 0.75);
            ctx.shadowBlur = 10;
          }
          roundedBar(ctx, x, y, size, size, rad);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }
    ctx.restore();
  };

  Fabric.prototype.drawLabel = function (rect, text, alpha) {
    if (alpha <= 0.02) return;
    var ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '600 10px ui-sans-serif, system-ui, -apple-system, sans-serif';
    ctx.letterSpacing = '1.4px';
    ctx.fillStyle = 'rgba(243,245,249,0.55)';
    ctx.textAlign = 'center';
    ctx.fillText(text.toUpperCase(), rect.x + rect.w / 2, rect.y + rect.h + 12);
    ctx.restore();
  };

  Fabric.prototype.draw = function () {
    var ctx = this.ctx, w = this.w, h = this.h;
    ctx.clearRect(0, 0, w, h);

    var p = this.cur;
    var labelRoom = 16;
    var gh = h - labelRoom;
    var full = { x: 0, y: 0, w: w, h: gh };
    var gap = 10;
    var half = (w - gap) / 2;
    var left = { x: 0, y: 0, w: half, h: gh };
    var right = { x: half + gap, y: 0, w: half, h: gh };

    var clockRect, eventRect, aClock, aEvent, showLabels = 0;

    if (p <= 1) {
      clockRect = full; eventRect = full;
      aClock = 1 - p; aEvent = p;
    } else {
      var q = easeInOut(clamp(p - 1, 0, 1));
      clockRect = {
        x: lerp(full.x, left.x, q), y: 0,
        w: lerp(full.w, left.w, q), h: gh
      };
      eventRect = {
        x: lerp(full.x, right.x, q), y: 0,
        w: lerp(full.w, right.w, q), h: gh
      };
      aClock = q; aEvent = 1;
      showLabels = q;
    }

    this.drawGrid(clockRect, this.clockGrid, aClock, 'clock');
    this.drawGrid(eventRect, this.eventGrid, aEvent, 'event');
    if (showLabels > 0.05) {
      this.drawLabel(clockRect, 'clock-driven', showLabels);
      this.drawLabel(eventRect, 'event-driven', showLabels);
    }
  };

  Fabric.prototype.frame = function (dt) {
    this.step(dt);
    this.draw();
  };

  /* ======================================================================
     boot
     ====================================================================== */
  var heroCanvas = document.getElementById('spikeField');
  var contactCanvas = document.getElementById('contactField');
  var fabricCanvas = document.getElementById('fabricCanvas');

  var hero = heroCanvas ? new SpikeField(heroCanvas, { density: 1, rowGap: 30 }) : null;
  var contact = contactCanvas ? new SpikeField(contactCanvas, { density: 0.75, speed: 70, rowGap: 34, alpha: 0.75 }) : null;
  var fabric = fabricCanvas ? new Fabric(fabricCanvas) : null;

  window.MSVisuals = { hero: hero, contact: contact, fabric: fabric };

  // pause off-screen work
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var inst = e.target === heroCanvas ? hero : e.target === contactCanvas ? contact : fabric;
        if (inst) inst.visible = e.isIntersecting;
      });
    }, { rootMargin: '120px' });
    [heroCanvas, contactCanvas, fabricCanvas].forEach(function (c) { if (c) io.observe(c); });
  }

  var ro;
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(function () {
      if (hero) hero.resize();
      if (contact) contact.resize();
      if (fabric) fabric.resize();
      if (REDUCED) stillFrame();
    });
    [heroCanvas, contactCanvas, fabricCanvas].forEach(function (c) { if (c) ro.observe(c); });
  } else {
    window.addEventListener('resize', function () {
      if (hero) hero.resize();
      if (contact) contact.resize();
      if (fabric) fabric.resize();
    });
  }

  function stillFrame() {
    if (hero) hero.still();
    if (contact) contact.still();
    if (fabric) {
      fabric.setPhase(2); fabric.cur = 2;
      for (var i = 0; i < 40; i++) fabric.step(0.05);
      fabric.draw();
    }
  }

  if (REDUCED) {
    // draw once, never animate
    requestAnimationFrame(stillFrame);
    return;
  }

  // pointer interaction: the cursor injects events into the hero raster
  if (heroCanvas && window.matchMedia('(pointer:fine)').matches) {
    var lastBurst = 0;
    heroCanvas.parentElement.addEventListener('pointermove', function (e) {
      var now = performance.now();
      if (now - lastBurst < 90) return;
      lastBurst = now;
      var rect = heroCanvas.getBoundingClientRect();
      hero.burst(e.clientY - rect.top, 6);
    }, { passive: true });
  }

  var prev = performance.now();
  var running = true;
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    prev = performance.now();
    if (running) requestAnimationFrame(loop);
  });

  function loop(now) {
    if (!running) return;
    var dt = Math.min((now - prev) / 1000, 0.05);
    prev = now;
    if (hero) hero.frame(dt);
    if (contact) contact.frame(dt);
    if (fabric && fabric.visible !== false) fabric.frame(dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
