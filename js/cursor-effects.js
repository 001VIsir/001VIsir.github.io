/* 鼠标特效：爱心跟随 + Canvas 烟花 */
(function() {
  var heartTrail = [];

  /* ========== 爱心跟随 ========== */
  function createHeartSVG(color) {
    return '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="' + color + '" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
  }

  function spawnHeart(e) {
    if (heartTrail.length >= 8) {
      var oldest = heartTrail.shift();
      oldest.el.remove();
    }
    var colors = ['#ff6b6b', '#ee5a24', '#ff9ff3', '#feca57', '#ff6b9d', '#ff4081'];
    var color = colors[Math.floor(Math.random() * colors.length)];
    var heart = document.createElement('span');
    heart.className = 'trail-heart';
    heart.innerHTML = createHeartSVG(color);
    heart.style.cssText = [
      'position:fixed', 'pointer-events:none', 'z-index:9999',
      'left:' + e.clientX + 'px', 'top:' + e.clientY + 'px',
      'font-size:14px', 'transform:translate(-50%,-50%)',
      'opacity:1', 'display:block'
    ].join(';');
    document.body.appendChild(heart);
    heartTrail.push({ el: heart });

    var startTime = Date.now();
    var dy = -60 - Math.random() * 40;
    var dx = (Math.random() - 0.5) * 30;
    function animate() {
      var progress = (Date.now() - startTime) / 600;
      if (progress >= 1) { heart.remove(); return; }
      heart.style.opacity = (1 - progress).toString();
      heart.style.transform = 'translate(calc(-50% + ' + (dx * progress) + 'px), calc(-50% + ' + (dy * progress) + 'px)) scale(' + (1 - progress * 0.7) + ')';
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  var lastHeartTime = 0;
  document.addEventListener('mousemove', function(e) {
    var now = Date.now();
    if (now - lastHeartTime > 80) {
      spawnHeart(e);
      lastHeartTime = now;
    }
  });

  document.addEventListener('click', function(e) {
    heartTrail.forEach(function(item) { item.el.remove(); });
    heartTrail = [];
    fireworks.push(new Firework(e.clientX, e.clientY));
  });

  /* ========== Canvas 烟花 ========== */
  var canvas = document.createElement('canvas');
  canvas.id = 'fireworksCanvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9997';
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  var fireworks = [];
  var particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  var fireworkColors = [
    '#ff6b6b', '#ff9f43', '#feca57', '#ff4081', '#ee5a24',
    '#54a0ff', '#48dbfb', '#a29bfe', '#fd79a8', '#00d2d3',
    '#1dd1a1', '#ff9ff3', '#5f27cd', '#e17055', '#74b9ff', '#ffffff'
  ];

  function Firework(x, y) {
    this.x = x;
    this.y = y;
    this.color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
    this.flash = { x: x, y: y, alpha: 1, radius: 3 };

    var count = 60 + Math.floor(Math.random() * 40);
    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.2;
      var speed = 3 + Math.random() * 8;
      particles.push(new Particle(x, y, angle, speed, this.color));
    }
  }

  function Particle(x, y, angle, speed, color) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.color = color;
    this.alpha = 1;
    this.decay = 0.012 + Math.random() * 0.008;
    this.radius = 1.5 + Math.random() * 2;
    this.gravity = 0.06;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* 画粒子 */
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }

    /* 画中心闪光 */
    for (var j = fireworks.length - 1; j >= 0; j--) {
      var f = fireworks[j];
      if (f.flash.alpha > 0) {
        f.flash.alpha -= 0.08;
        f.flash.radius += 4;
        ctx.save();
        ctx.globalAlpha = f.flash.alpha;
        var grad = ctx.createRadialGradient(f.flash.x, f.flash.y, 0, f.flash.x, f.flash.y, f.flash.radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, f.color);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(f.flash.x, f.flash.y, f.flash.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      } else {
        fireworks.splice(j, 1);
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
})();
