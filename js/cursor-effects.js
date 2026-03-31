/* 鼠标特效：爱心跟随 + Canvas 烟花 + 桌宠 */
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

  /* ========== CSS 桌宠（Hiyori 风格女孩） ========== */
  (function() {
    var style = document.createElement('style');
    style.textContent = [
      '#pet-container{position:fixed;bottom:0;right:0;z-index:9999;width:180px;height:280px;pointer-events:none}',

      '#pet-body{position:absolute;bottom:0;right:20px;width:120px;height:180px;background:linear-gradient(135deg,#fce4ec 0%,#f8bbd0 100%);border-radius:60px 60px 40px 40px;animation:pet-bounce 3s ease-in-out infinite}',

      '#pet-head{position:absolute;bottom:130px;right:30px;width:90px;height:85px;background:linear-gradient(145deg,#fff5f8,#fce4ec);border-radius:50% 50% 45% 45%;animation:pet-float 3s ease-in-out infinite}',

      '#pet-hair{position:absolute;bottom:185px;right:22px;width:106px;height:60px;background:linear-gradient(180deg,#5a3d2b,#8b5e3c);border-radius:53px 53px 0 0;animation:pet-float 3s ease-in-out infinite}',

      '#pet-hair-side{position:absolute;bottom:130px;width:25px;height:70px;background:linear-gradient(180deg,#8b5e3c,#6d4c41);border-radius:0 0 15px 15px;animation:pet-bounce 3s ease-in-out infinite}',

      '#pet-eye{position:absolute;bottom:170px;width:18px;height:22px;background:#2d1b0e;border-radius:50%;animation:pet-look 6s ease-in-out infinite;transition:transform 0.1s}',

      '#pet-eye::after{content:"";position:absolute;top:5px;left:4px;width:7px;height:7px;background:#fff;border-radius:50%}',

      '#pet-blush{position:absolute;bottom:158px;width:20px;height:12px;background:rgba(255,105,135,0.4);border-radius:50%}',

      '#pet-mouth{position:absolute;bottom:152px;width:8px;height:4px;border-bottom:2px solid #d4817a;border-radius:0 0 4px 4px}',

      '#pet-arm{position:absolute;bottom:80px;width:18px;height:45px;background:linear-gradient(180deg,#f8bbd0,#f48fb1);border-radius:10px;transform-origin:top center}',

      '#pet-toggle{position:fixed;bottom:20px;right:20px;z-index:10000;background:linear-gradient(135deg,#ff6b9d,#ff8a80);color:#fff;border:none;border-radius:25px;padding:8px 18px;cursor:pointer;font-size:14px;box-shadow:0 4px 15px rgba(255,107,157,0.4);pointer-events:auto;transition:all .3s;font-weight:500}',

      '#pet-toggle:hover{transform:scale(1.05);box-shadow:0 6px 20px rgba(255,107,157,0.5)}',

      '@keyframes pet-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}',
      '@keyframes pet-float{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-5px) rotate(1deg)}}',
      '@keyframes pet-look{0%,45%,55%,100%{transform:translateX(0)}50%{transform:translateX(3px)}}',
      '@keyframes pet-arm-wave{0%,100%{transform:rotate(-15deg)}50%{transform:rotate(-45deg)}}'
    ].join('');
    document.head.appendChild(style);

    var container = document.createElement('div');
    container.id = 'pet-container';

    var bodyHTML = [
      '<div id="pet-body"></div>',
      '<div id="pet-hair"></div>',
      '<div id="pet-hair-side" style="right:115px;transform:scaleX(-1)"></div>',
      '<div id="pet-hair-side" style="right:0"></div>',
      '<div id="pet-head"></div>',
      '<div id="pet-eye" style="right:55px"></div>',
      '<div id="pet-eye" style="right:35px"></div>',
      '<div id="pet-blush" style="right:58px"></div>',
      '<div id="pet-blush" style="right:38px"></div>',
      '<div id="pet-mouth" style="right:47px"></div>',
      '<div id="pet-arm" style="right:100px;animation:pet-arm-wave 2s ease-in-out infinite"></div>',
      '<div id="pet-arm" style="right:0;animation:pet-arm-wave 2s ease-in-out 1s infinite"></div>'
    ].join('');

    container.innerHTML = bodyHTML;
    document.body.appendChild(container);

    var btn = document.createElement('button');
    btn.id = 'pet-toggle';
    btn.textContent = '隐藏桌宠';
    btn.onclick = function() {
      if (container.style.display === 'none') {
        container.style.display = '';
        btn.textContent = '隐藏桌宠';
      } else {
        container.style.display = 'none';
        btn.textContent = '显示桌宠';
      }
    };
    document.body.appendChild(btn);

    /* 眼睛跟随鼠标 */
    var eyeL = container.querySelector('#pet-eye');
    var eyeR = container.querySelectorAll('#pet-eye')[1];
    var lookX = 0, lookY = 0;
    var targetX = 0, targetY = 0;

    document.addEventListener('mousemove', function(e) {
      targetX = (e.clientX / window.innerWidth - 0.5) * 6;
      targetY = (e.clientY / window.innerHeight - 0.5) * 4;
    });

    setInterval(function() {
      lookX += (targetX - lookX) * 0.15;
      lookY += (targetY - lookY) * 0.15;
      eyeL.style.transform = 'translate(' + lookX + 'px,' + lookY + 'px)';
      eyeR.style.transform = 'translate(' + lookX + 'px,' + lookY + 'px)';
    }, 16);

    /* 随机动作 */
    var petBody = container.querySelector('#pet-body');
    var animations = ['pet-bounce', 'pet-float'];
    setInterval(function() {
      var anim = animations[Math.floor(Math.random() * animations.length)];
      petBody.style.animation = anim + ' 3s ease-in-out infinite';
    }, 5000);

  })();
})();
