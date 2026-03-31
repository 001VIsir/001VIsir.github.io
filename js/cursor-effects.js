/* 鼠标特效：爱心跟随 + 点击烟花 */
(function() {
  var heartTrail = [];
  var maxHearts = 8;

  /* 爱心 SVG */
  function createHeartSVG(color) {
    return '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="' + color + '" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
  }

  /* 跟随鼠标的爱心 */
  function spawnHeart(e) {
    if (heartTrail.length >= maxHearts) {
      var oldest = heartTrail.shift();
      oldest.el.remove();
    }
    var colors = ['#ff6b6b', '#ee5a24', '#ff9ff3', '#feca57', '#ff6b9d'];
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
      'transition: all 0.6s ease-out',
      'display:block'
    ].join(';');
    document.body.appendChild(heart);
    heartTrail.push({ el: heart, x: e.clientX, y: e.clientY });
  }

  /* 鼠标移动 - 生成爱心 */
  var lastHeartTime = 0;
  document.addEventListener('mousemove', function(e) {
    var now = Date.now();
    if (now - lastHeartTime > 80) {
      spawnHeart(e);
      lastHeartTime = now;
    }
  });

  /* 鼠标点击 - 烟花效果 */
  function createFireworks(e) {
    var colors = [
      '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff',
      '#5f27cd', '#00d2d3', '#1dd1a1', '#ff9f43', '#ee5a24',
      '#a29bfe', '#fd79a8', '#00cec9', '#e17055', '#74b9ff'
    ];
    var particles = 24;
    for (var i = 0; i < particles; i++) {
      var particle = document.createElement('span');
      particle.className = 'firework-particle';
      var color = colors[Math.floor(Math.random() * colors.length)];
      var angle = (Math.PI * 2 * i) / particles + (Math.random() - 0.5) * 0.5;
      var velocity = 60 + Math.random() * 100;
      var tx = Math.cos(angle) * velocity;
      var ty = Math.sin(angle) * velocity;

      particle.style.cssText = [
        'position:fixed',
        'pointer-events:none',
        'z-index:9999',
        'left:' + e.clientX + 'px',
        'top:' + e.clientY + 'px',
        'width:' + (4 + Math.random() * 4) + 'px',
        'height:' + (4 + Math.random() * 4) + 'px',
        'border-radius:50%',
        'background:' + color,
        'box-shadow:0 0 6px ' + color + ', 0 0 12px ' + color,
        'transform:translate(-50%,-50%)',
        'animation:fireworkFade 0.9s ease-out forwards',
        '--tx:' + tx + 'px',
        '--ty:' + ty + 'px'
      ].join(';');
      document.body.appendChild(particle);
      setTimeout(function(p) { p.remove(); }, 900, particle);
    }
  }

  /* 点击时清空爱心轨迹 */
  document.addEventListener('click', function(e) {
    heartTrail.forEach(function(item) { item.el.remove(); });
    heartTrail = [];
    createFireworks(e);
  });

  /* 添加动画样式 */
  var style = document.createElement('style');
  style.textContent = [
    'span.trail-heart { animation: heartFade 0.6s ease-out forwards; }',
    '@keyframes heartFade {',
    '  0% { opacity:1; transform:translate(-50%,-50%) scale(1); }',
    '  100% { opacity:0; transform:translate(calc(-50% + var(--dx,0px)),calc(-50% + var(--dy,-60px))) scale(0.3); }',
    '}',
    'span.firework-particle { animation: fireworkFade 0.9s ease-out forwards; }',
    '@keyframes fireworkFade {',
    '  0% { opacity:1; transform:translate(-50%,-50%) translate(0,0) scale(1); }',
    '  100% { opacity:0; transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(0); }',
    '}'
  ].join('');
  document.head.appendChild(style);
})();
