(function () {
  var SVG = 'http://www.w3.org/2000/svg';

  // 波形は説明用の図。毎回同じ形になるよう、固定の種で作る。
  function seeded(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ライブ一本の大まかな起伏。MC は静かに、ソロのあたりが一番大きい。
  function envelope(x) {
    var e = 0.42 + 0.18 * Math.sin(x * 23) + 0.1 * Math.sin(x * 61);
    if (x < 0.03) e *= 0.35;
    if (x > 0.172 && x < 0.215) e *= 0.28;
    if (x > 0.432 && x < 0.5) e += 0.3;
    if (x > 0.97) e *= 0.4;
    return Math.max(0.08, Math.min(1, e));
  }

  function bars(width, height) {
    var svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    var rand = seeded(7);
    var step = 4;
    for (var x = 0; x < width; x += step) {
      var h = Math.max(2, height * envelope(x / width) * (0.45 + 0.55 * rand()));
      var r = document.createElementNS(SVG, 'rect');
      r.setAttribute('x', x);
      r.setAttribute('y', ((height - h) / 2).toFixed(1));
      r.setAttribute('width', 1.5);
      r.setAttribute('height', h.toFixed(1));
      svg.appendChild(r);
    }
    return svg;
  }

  function draw(el) {
    var w = Math.round(el.clientWidth);
    var h = Math.round(el.clientHeight);
    if (!w || !h) return;
    el.textContent = '';
    var base = bars(w, h);
    base.setAttribute('class', 'wave__base');
    var played = document.createElement('div');
    played.className = 'wave__played';
    played.appendChild(bars(w, h));
    el.appendChild(base);
    el.appendChild(played);
  }

  var waves = Array.prototype.slice.call(document.querySelectorAll('[data-wave]'));
  waves.forEach(function (el) {
    el.style.setProperty('--pos', el.getAttribute('data-pos') + '%');
    draw(el);
  });

  var lastWidth = window.innerWidth;
  var pending;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    clearTimeout(pending);
    pending = setTimeout(function () { waves.forEach(draw); }, 150);
  });

  // 操作デモ：チャプターを押すと、再生位置と表示が移る。音は鳴らさない。
  var demo = document.querySelector('[data-demo]');
  if (demo) {
    var head = demo.querySelector('[data-demo-head]');
    var wave = demo.querySelector('[data-wave]');
    var time = demo.querySelector('[data-demo-time]');
    var name = demo.querySelector('[data-demo-name]');
    var chips = Array.prototype.slice.call(demo.querySelectorAll('.chip'));
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var at = chip.getAttribute('data-at') + '%';
        head.style.setProperty('--at', at);
        wave.style.setProperty('--pos', at);
        time.textContent = chip.getAttribute('data-time');
        name.textContent = chip.getAttribute('data-name');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      });
    });
  }

  // スマートフォンのメニュー
  var menu = document.querySelector('.menu');
  var nav = document.getElementById('nav');
  if (menu && nav) {
    function setOpen(open) {
      menu.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    }
    menu.addEventListener('click', function () {
      setOpen(menu.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); menu.focus(); }
    });
  }
})();
