/* 鼠标特效：爱心跟随 + 真实烟花爆炸 */
(function() {
  var heartTrail = [];

  /* 爱心 SVG */
  function createHeartSVG(color) {
    return '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="' + color + '" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
  }

  /* 跟随鼠标的爱心 */
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
      'position:fixed',
      'pointer-events:none',
      'z-index:9999',
      'left:' + e.clientX + 'px',
      'top:' + e.clientY + 'px',
      'font-size:14px',
      'transform:translate(-50%,-50%)',
      'opacity:1',
      'display:block'
    ].join(';');
    document.body.appendChild(heart);
    heartTrail.push({ el: heart, x: e.clientX, y: e.clientY });

    /* 向上飘动并消失 */
    var dy = -60 - Math.random() * 40;
    var dx = (Math.random() - 0.5) * 30;
    var startTime = Date.now();
    function animateHeart() {
      var progress = (Date.now() - startTime) / 600;
      if (progress >= 1) {
        heart.style.opacity = '0';
        heart.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% - 80px)) scale(0.3)';
        setTimeout(function() { heart.remove(); }, 50);
        return;
      }
      heart.style.opacity = (1 - progress).toString();
      heart.style.transform = 'translate(calc(-50% + ' + (dx * progress) + 'px), calc(-50% + ' + (dy * progress) + 'px)) scale(' + (1 - progress * 0.7) + ')';
      requestAnimationFrame(animateHeart);
    }
    requestAnimationFrame(animateHeart);
  }

  var lastHeartTime = 0;
  document.addEventListener('mousemove', function(e) {
    var now = Date.now();
    if (now - lastHeartTime > 80) {
      spawnHeart(e);
      lastHeartTime = now;
    }
  });

  /* 真实烟花爆炸效果 */
  function createFireworks(e) {
    var colors = [
      '#ff6b6b', '#ff9f43', '#feca57', '#ff4081', '#ee5a24',
      '#54a0ff', '#48dbfb', '#a29bfe', '#fd79a8', '#00d2d3',
      '#1dd1a1', '#ff9ff3', '#5f27cd', '#e17055', '#74b9ff'
    ];

    /* 中心闪光圆 */
    var flash = document.createElement('div');
    flash.style.cssText = [
      'position:fixed',
      'pointer-events:none',
      'z-index:9998',
      'left:' + e.clientX + 'px',
      'top:' + e.clientY + 'px',
      'width:12px',
      'height:12px',
      'border-radius:50%',
      'background:radial-gradient(circle,#fff 0%,#ffeb3b 30%,transparent 70%)',
      'transform:translate(-50%,-50%)',
      'animation:fwFlash 0.3s ease-out forwards'
    ].join(';');
    document.body.appendChild(flash);
    setTimeout(function() { flash.remove(); }, 300);

    /* 发射多条"光线"作为烟花主体 */
    var rays = 16 + Math.floor(Math.random() * 8);
    for (var i = 0; i < rays; i++) {
      var particle = document.createElement('div');
      var color = colors[Math.floor(Math.random() * colors.length)];
      var angle = (Math.PI * 2 * i) / rays + (Math.random() - 0.5) * 0.3;
      var speed = 120 + Math.random() * 100;
      var size = 2 + Math.random() * 3;

      particle.style.cssText = [
        'position:fixed',
        'pointer-events:none',
        'z-index:9999',
        'left:' + e.clientX + 'px',
        'top:' + e.clientY + 'px',
        'width:' + size + 'px',
        'height:' + size + 'px',
        'border-radius:50%',
        'background:' + color,
        'box-shadow:0 0 4px ' + color + ', 0 0 8px ' + color,
        'transform:translate(-50%,-50%)',
        'will-change:transform,opacity'
      ].join(';');

      document.body.appendChild(particle);

      var startTime = Date.now();
      var duration = 700 + Math.random() * 300;
      var vx = Math.cos(angle) * speed;
      var vy = Math.sin(angle) * speed;
      var gravity = 120;
      var startX = e.clientX;
      var startY = e.clientY;

      (function(p, startT, dur, svx, svy, grav, sx, sy) {
        function animate() {
          var t = (Date.now() - startT) / dur;
          if (t >= 1) {
            p.remove();
            return;
          }
          /* 贝塞尔曲线模拟：先快后慢 + 重力下坠 */
          var ease = 1 - Math.pow(1 - t, 3);
          var x = sx + svx * ease;
          var y = sy + svy * ease + 0.5 * grav * ease * ease;
          var scale = 1 - t * 0.5;
          var opacity = 1 - Math.pow(t, 2);
          p.style.transform = 'translate(calc(-50% + ' + (x - sx) + 'px), calc(-50% + ' + (y - sy) + 'px)) scale(' + scale + ')';
          p.style.opacity = opacity.toString();
          requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
      })(particle, startTime, duration, vx, vy, gravity, startX, startY);
    }

    /* 添加一些小的散射粒子 */
    var miniCount = 20 + Math.floor(Math.random() * 10);
    for (var j = 0; j < miniCount; j++) {
      var mini = document.createElement('div');
      var color = colors[Math.floor(Math.random() * colors.length)];
      var angle = Math.random() * Math.PI * 2;
      var speed = 40 + Math.random() * 80;
      var size = 1 + Math.random() * 1.5;

      mini.style.cssText = [
        'position:fixed',
        'pointer-events:none',
        'z-index:9999',
        'left:' + e.clientX + 'px',
        'top:' + e.clientY + 'px',
        'width:' + size + 'px',
        'height:' + size + 'px',
        'border-radius:50%',
        'background:' + color,
        'box-shadow:0 0 3px ' + color,
        'transform:translate(-50%,-50%)',
        'will-change:transform,opacity'
      ].join(';');

      document.body.appendChild(mini);

      var startTime2 = Date.now();
      var duration2 = 500 + Math.random() * 300;
      var vx2 = Math.cos(angle) * speed;
      var vy2 = Math.sin(angle) * speed;
      var sx2 = e.clientX;
      var sy2 = e.clientY;

      (function(m, st, dur, svx, svy, sx, sy) {
        function animate() {
          var t = (Date.now() - st) / dur;
          if (t >= 1) {
            m.remove();
            return;
          }
          var ease = 1 - Math.pow(1 - t, 2);
          var x = sx + svx * ease;
          var y = sy + svy * ease;
          m.style.transform = 'translate(calc(-50% + ' + (x - sx) + 'px), calc(-50% + ' + (y - sy) + 'px)) scale(' + (1 - t) + ')';
          m.style.opacity = (1 - t).toString();
          requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
      })(mini, startTime2, duration2, vx2, vy2, sx2, sy2);
    }
  }

  /* 点击时清空爱心轨迹 */
  document.addEventListener('click', function(e) {
    heartTrail.forEach(function(item) { item.el.remove(); });
    heartTrail = [];
    createFireworks(e);
  });

  /* 动画样式 */
  var style = document.createElement('style');
  style.textContent = [
    '@keyframes fwFlash {',
    '  0% { opacity:1; transform:translate(-50%,-50%) scale(1); }',
    '  100% { opacity:0; transform:translate(-50%,-50%) scale(3); }',
    '}'
  ].join('');
  document.head.appendChild(style);
})();
