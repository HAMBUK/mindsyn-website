/* ==========================================================================
   MindSyn interaction layer
   ========================================================================== */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ----------------------------------------------------------------------
     language
     ---------------------------------------------------------------------- */
  var LANG_KEY = 'mindsyn-lang';
  var DEFAULT_LANG = 'en';          // the markup ships in English
  var stored = null;
  try { stored = localStorage.getItem(LANG_KEY); } catch (e) { /* private mode */ }
  var lang = stored === 'ko' || stored === 'en' ? stored : DEFAULT_LANG;

  // `remember` is set only when a visitor picks a language themselves, so the
  // default stays free to change later without being pinned by a stored value.
  function applyLang(next, remember) {
    lang = next;
    document.documentElement.lang = next;
    document.documentElement.setAttribute('data-lang', next);
    $$('[data-ko]').forEach(function (el) {
      var val = el.getAttribute(next === 'ko' ? 'data-ko' : 'data-en');
      if (val == null) return;
      if (val.indexOf('<') > -1) el.innerHTML = val; else el.textContent = val;
    });
    var label = $('#langLabel');
    if (label) label.textContent = next === 'ko' ? 'EN' : 'KO';
    if (remember) {
      try { localStorage.setItem(LANG_KEY, next); } catch (e) { /* ignore */ }
    }
  }

  var langBtn = $('#langBtn');
  if (langBtn) langBtn.addEventListener('click', function () {
    applyLang(lang === 'ko' ? 'en' : 'ko', true);
  });
  // the page already renders in DEFAULT_LANG, so only repaint when it differs
  if (lang !== DEFAULT_LANG) applyLang(lang, false);
  else if (langBtn) $('#langLabel').textContent = lang === 'ko' ? 'EN' : 'KO';

  /* ----------------------------------------------------------------------
     year
     ---------------------------------------------------------------------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ----------------------------------------------------------------------
     nav: stuck state, mobile menu, current section
     ---------------------------------------------------------------------- */
  var nav = $('#nav');
  var burger = $('#burger');
  var mobileMenu = $('#mobileMenu');

  function openMenu(open) {
    if (!mobileMenu) return;
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('is-locked', open);
    if (open) {
      mobileMenu.hidden = false;
      requestAnimationFrame(function () { mobileMenu.classList.add('in'); });
    } else {
      mobileMenu.classList.remove('in');
      setTimeout(function () { mobileMenu.hidden = true; }, 340);
    }
  }
  if (burger) burger.addEventListener('click', function () {
    openMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  if (mobileMenu) $$('a', mobileMenu).forEach(function (a) {
    a.addEventListener('click', function () { openMenu(false); });
  });

  var navLinks = $$('.nav__links a');
  var sectionMap = {};
  navLinks.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var sec = document.getElementById(id);
    if (sec) sectionMap[id] = { link: a, el: sec };
  });

  if ('IntersectionObserver' in window) {
    var currentObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var rec = sectionMap[e.target.id];
        if (!rec) return;
        if (e.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('is-current'); });
          rec.link.classList.add('is-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(sectionMap).forEach(function (k) { currentObserver.observe(sectionMap[k].el); });
  }

  /* ----------------------------------------------------------------------
     reveal on scroll
     ---------------------------------------------------------------------- */
  var revealables = $$('.reveal');

  // The hero headline sits inside an overflow:hidden mask and starts translated
  // fully out of it, so IntersectionObserver would never see it. Above the fold
  // it does not need one: play it as an entrance animation on load.
  function revealHero() {
    $$('.hero .reveal').forEach(function (el) { el.classList.add('in'); });
  }
  if (document.readyState === 'complete') requestAnimationFrame(revealHero);
  else window.addEventListener('load', function () { requestAnimationFrame(revealHero); });
  setTimeout(revealHero, 900);   // fallback if a slow asset delays `load`

  if ('IntersectionObserver' in window && !REDUCED) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        revealObserver.unobserve(e.target);
        if (e.target.querySelector('.count') || e.target.classList.contains('count')) startCount(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  /* ----------------------------------------------------------------------
     number count-up
     ---------------------------------------------------------------------- */
  function startCount(scope) {
    $$('.count', scope).concat(scope.classList && scope.classList.contains('count') ? [scope] : [])
      .forEach(function (el) {
        if (el.dataset.done) return;
        el.dataset.done = '1';
        var from = parseFloat(el.getAttribute('data-from') || '0');
        var to = parseFloat(el.getAttribute('data-to') || el.textContent);
        var dur = 1250;
        var t0 = performance.now();
        function tick(now) {
          var p = Math.min(1, (now - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          var v = from + (to - from) * eased;
          el.textContent = String(Math.round(v));
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
  }

  /* ----------------------------------------------------------------------
     scroll driver: progress bar, sticky story, chip stage
     ---------------------------------------------------------------------- */
  var bar = $('#scrollBar');
  var shift = $('#shift');
  var steps = $$('.step');
  var dots = $$('.shift__dots i');
  var vizLabel = $('#vizLabel');
  var vizOps = $('#vizOps');
  var meters = $('.viz-frame__meters');
  var meterClock = $('#meterClock');
  var meterEvent = $('#meterEvent');
  var meterEventVal = $('#meterEventVal');
  var chipStage = $('#chipStage');
  var chipSticky = chipStage ? $('.chipstage__sticky', chipStage) : null;
  var fabric = window.MSVisuals && window.MSVisuals.fabric;

  var lastStep = -1;
  var metersOn = false;
  var opsClock = 0;


  function sectionProgress(el) {
    var rect = el.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    if (total <= 0) return rect.top <= 0 ? 1 : 0;
    return Math.min(1, Math.max(0, -rect.top / total));
  }

  function onScroll() {
    // progress bar
    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 12);

    // sticky story
    if (shift && steps.length) {
      var p = sectionProgress(shift);
      var idx = p < 0.34 ? 0 : p < 0.66 ? 1 : 2;
      if (idx !== lastStep) {
        lastStep = idx;
        steps.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
        dots.forEach(function (d, i) { d.classList.toggle('on', i === idx); });
      }
      if (fabric) {
        var ph = Math.min(1, Math.max(0, (p - 0.16) / 0.26)) +
                 Math.min(1, Math.max(0, (p - 0.56) / 0.24));
        fabric.setPhase(ph);
      }
      var showMeters = p > 0.68;
      if (showMeters !== metersOn && meters) {
        metersOn = showMeters;
        meters.classList.toggle('on', showMeters);
        if (showMeters && fabric) {
          var ratio = fabric.opsEvent > 0 && fabric.opsClock > 0
            ? fabric.opsEvent / fabric.opsClock : 0.05;
          var pct = ratio * 100;
          if (meterClock) meterClock.style.width = '100%';
          if (meterEvent) meterEvent.style.width = Math.max(2.5, pct).toFixed(1) + '%';
          if (meterEventVal) meterEventVal.textContent = pct.toFixed(pct < 10 ? 1 : 0) + '%';
        }
      }
    }

    // chip stage
    if (chipStage && chipSticky) {
      var cp = sectionProgress(chipStage);
      chipSticky.style.setProperty('--s', (0.82 + cp * 0.26).toFixed(3));
      chipSticky.style.setProperty('--rot', (-5 + cp * 7).toFixed(2) + 'deg');
      chipSticky.style.setProperty('--gs', (0.75 + cp * 0.5).toFixed(3));
      chipStage.classList.toggle('callouts-on', cp > 0.22);
    }
  }

  var ticking = false;
  function requestScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }
  if (!REDUCED) {
    window.addEventListener('scroll', requestScroll, { passive: true });
    window.addEventListener('resize', requestScroll);
    onScroll();
  } else {
    steps.forEach(function (s) { s.classList.add('is-active'); });
    if (meters) meters.classList.add('on');
    if (chipStage) chipStage.classList.add('callouts-on');
    // the static comparison still needs its numbers filled in
    setTimeout(function () {
      var ratio = fabric && fabric.opsClock > 0 ? fabric.opsEvent / fabric.opsClock : 0.05;
      var pct = ratio * 100;
      if (meterClock) meterClock.style.width = '100%';
      if (meterEvent) meterEvent.style.width = Math.max(2.5, pct).toFixed(1) + '%';
      if (meterEventVal) meterEventVal.textContent = pct.toFixed(pct < 10 ? 1 : 0) + '%';
      if (vizLabel) vizLabel.textContent = 'Side by side';
      if (vizOps && ratio > 0) {
        vizOps.textContent = Math.round(1 / ratio) + '×';
        var suffix = vizOps.nextElementSibling;
        if (suffix) {
          suffix.setAttribute('data-ko', '더 적은 연산');
          suffix.setAttribute('data-en', 'fewer ops');
          suffix.textContent = lang === 'ko' ? '더 적은 연산' : 'fewer ops';
        }
      }
    }, 120);
  }

  /* readout for the fabric visual */
  if (fabric && vizOps && !REDUCED) {
    setInterval(function () {
      var p = fabric.cur;
      if (p < 0.6) {
        vizLabel.textContent = 'Clock-driven';
        vizOps.textContent = Math.round(fabric.opsClock).toLocaleString();
      } else if (p < 1.5) {
        vizLabel.textContent = 'Event-driven';
        vizOps.textContent = Math.round(fabric.opsEvent).toLocaleString();
      } else {
        var factor = fabric.opsEvent > 0 ? fabric.opsClock / fabric.opsEvent : 0;
        vizLabel.textContent = 'Side by side';
        vizOps.textContent = factor > 0 ? Math.round(factor) + '×' : '—';
        var suffix = vizOps.nextElementSibling;
        if (suffix) {
          suffix.setAttribute('data-ko', '더 적은 연산');
          suffix.setAttribute('data-en', 'fewer ops');
          suffix.textContent = lang === 'ko' ? '더 적은 연산' : 'fewer ops';
        }
      }
      opsClock = fabric.opsClock;
    }, 160);
  }

  /* ----------------------------------------------------------------------
     applications rail
     ---------------------------------------------------------------------- */
  var rail = $('#appsRail');
  $$('[data-scroll]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!rail) return;
      var card = $('.acard', rail);
      var step = card ? card.getBoundingClientRect().width + 18 : 300;
      rail.scrollBy({ left: step * parseInt(btn.getAttribute('data-scroll'), 10), behavior: 'smooth' });
    });
  });

  /* ----------------------------------------------------------------------
     video lightbox
     ---------------------------------------------------------------------- */
  var lightbox = $('#lightbox');
  var lbVideo = $('#lightboxVideo');
  var lbCap = $('#lightboxCap');
  var lastFocus = null;

  function openLightbox(src, title) {
    if (!lightbox) return;
    lastFocus = document.activeElement;
    lbVideo.src = src;
    lbCap.textContent = title || '';
    lightbox.hidden = false;
    document.body.classList.add('is-locked');
    requestAnimationFrame(function () {
      lightbox.classList.add('in');
      var play = lbVideo.play();
      if (play && play.catch) play.catch(function () { /* autoplay blocked */ });
      $('#lightboxClose').focus();
    });
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.classList.remove('in');
    lbVideo.pause();
    document.body.classList.remove('is-locked');
    setTimeout(function () {
      lightbox.hidden = true;
      lbVideo.removeAttribute('src');
      lbVideo.load();
      if (lastFocus) lastFocus.focus();
    }, 300);
  }

  $$('.dcard').forEach(function (card) {
    card.addEventListener('click', function () {
      openLightbox(card.getAttribute('data-video'), card.getAttribute('data-title'));
    });
  });
  var lbClose = $('#lightboxClose');
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lightbox) lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeLightbox();
    if (burger && burger.getAttribute('aria-expanded') === 'true') openMenu(false);
  });

  /* ----------------------------------------------------------------------
     BibTeX toggle
     ---------------------------------------------------------------------- */
  $$('[data-bib]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pre = document.getElementById(btn.getAttribute('data-bib'));
      if (pre) pre.hidden = !pre.hidden;
    });
  });

  /* ----------------------------------------------------------------------
     pointer flourishes (desktop only)
     ---------------------------------------------------------------------- */
  if (window.matchMedia('(pointer:fine)').matches && !REDUCED) {
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.transform = 'translate(' + (dx * 9).toFixed(2) + 'px,' + (dy * 7).toFixed(2) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });

    $$('.fcard').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });
  }

  /* ----------------------------------------------------------------------
     anchor scrolling that respects the fixed header
     ---------------------------------------------------------------------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 62;
      window.scrollTo({ top: top, behavior: REDUCED ? 'auto' : 'smooth' });
      try { history.replaceState(null, '', id); } catch (err) { /* file:// */ }
    });
  });
})();
