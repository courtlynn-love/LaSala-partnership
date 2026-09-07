/* =========================================================================
   LA SALA — Corporate Partnership Microsite
   script.js — vanilla, no dependencies, no build step.
   ========================================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav = document.getElementById('nav');

  /* ---------------------------------------------------------------- Nav --- */
  var toggle = document.getElementById('nav-toggle');
  var navLinks = document.getElementById('nav-links');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  function closeMenu() { setMenu(false); }

  toggle.addEventListener('click', function () {
    setMenu(!nav.classList.contains('is-open'));
  });

  navLinks.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });

  /* ------------------------------------------------- Active nav section --- */
  // Section id -> the nav link it should activate. Two sections share the
  // Community link because that movement spans a light and a dark band.
  var sectionMap = {
    'community': '#community',
    'community-data': '#community',
    'afrotech': '#afrotech',
    'why-partner': '#why-partner',
    'experience': '#experience'
  };
  var navMap = {};
  Object.keys(sectionMap).forEach(function (id) {
    var link = navLinks.querySelector('a[href="' + sectionMap[id] + '"]:not(.btn)');
    var section = document.getElementById(id);
    if (link && section) navMap[id] = { link: link, section: section };
  });

  function clearActive() {
    Object.keys(navMap).forEach(function (k) { navMap[k].link.classList.remove('is-active'); });
  }

  // Flip nav to its light state once past the hero; no section is "active" over the hero.
  var hero = document.querySelector('.hero');
  if ('IntersectionObserver' in window && hero) {
    new IntersectionObserver(function (entries) {
      var overHero = entries[0].isIntersecting;
      nav.classList.toggle('is-stuck', !overHero);
      if (overHero) clearActive();
    }, { rootMargin: '-72px 0px 0px 0px', threshold: 0 }).observe(hero);
  }

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var rec = navMap[entry.target.id];
        if (!rec) return;
        if (entry.isIntersecting) {
          clearActive();
          rec.link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    Object.keys(navMap).forEach(function (k) { spy.observe(navMap[k].section); });
  }

  /* ------------------------------------------------------------ Reveals --- */
  var revealables = document.querySelectorAll('.reveal');
  revealables.forEach(function (el) {
    var d = el.getAttribute('data-reveal-delay');
    if (d) el.style.setProperty('--d', d);
  });

  function onEnter(el) {
    el.classList.add('is-in');
    if (el.hasAttribute('data-count')) countUp(el);
    if (el.classList.contains('bar')) fillBar(el);
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) {
      el.classList.add('is-in');
      if (el.classList.contains('bar')) fillBar(el);
    });
    document.querySelectorAll('[data-count]').forEach(function (el) {
      el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
    });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        onEnter(entry.target);
        entry.target.querySelectorAll('[data-count]').forEach(countUp);
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ----------------------------------------------------------- Counters --- */
  function countUp(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';

    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;

    var duration = 1500;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    el.textContent = '0' + suffix;
    requestAnimationFrame(step);
  }

  /* --------------------------------------------------- Composition bars --- */
  function fillBar(bar) {
    var fill = bar.querySelector('.bar__fill');
    if (!fill || fill.dataset.filled) return;
    fill.dataset.filled = '1';
    var pct = fill.getAttribute('data-pct') || '0';
    if (reduceMotion) { fill.style.width = pct + '%'; return; }
    requestAnimationFrame(function () { fill.style.width = pct + '%'; });
  }

  /* ------------------------------------------------- Seamless marquee ----- */
  var track = document.getElementById('marquee-track');
  if (track && !reduceMotion) {
    var clone = track.firstElementChild.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  }

  /* ------------------------------- Graceful handling of missing imagery --- */
  document.querySelectorAll('.gallery__item img').forEach(function (img) {
    function markEmpty() {
      img.closest('.gallery__item').classList.add('is-empty');
      img.remove();
    }
    img.addEventListener('error', markEmpty);
    // A lazy image can fail before this listener is attached, in which case the
    // error event is already gone — catch that case up front.
    if (img.complete && img.naturalWidth === 0) markEmpty();
  });

  /* ------------------------------------------------------------- Misc ----- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
