/* Live2D 桌宠 - 眼睛跟随鼠标 */
(function() {
    const live2d_path = 'https://fastly.jsdelivr.net/npm/live2d-widget@3.1.4/dist/';
    const modelPath = 'https://fastly.jsdelivr.net/gh/Live2D/CubismWebSamples/Samples/Resources/Hiyori/Hiyori.model3.json';

    function loadExternalResource(url, type) {
        return new Promise(function(resolve, reject) {
            var tag;
            if (type === 'css') {
                tag = document.createElement('link');
                tag.rel = 'stylesheet';
                tag.href = url;
            } else if (type === 'js') {
                tag = document.createElement('script');
                tag.src = url;
            }
            if (tag) {
                tag.onload = function() { resolve(url); };
                tag.onerror = function() { reject(url); };
                document.head.appendChild(tag);
            }
        });
    }

    function initLive2D() {
        // Create waifu container
        var waifu = document.createElement('div');
        waifu.id = 'waifu';
        document.body.appendChild(waifu);

        // Create canvas for live2d
        var canvas = document.createElement('canvas');
        canvas.id = 'live2d';
        canvas.width = '200';
        canvas.height = '300';
        canvas.style.cssText = 'position:absolute;bottom:0;right:0;width:200px;height:300px;pointer-events:none;opacity:0.95;';
        waifu.appendChild(canvas);

        loadExternalResource('https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js', 'js').then(function() {
            loadExternalResource(live2d_path + 'live2d.min.js', 'js').then(function() {
                // Initialize Live2D
                if (typeof LAPP !== 'undefined') {
                    LAPP.KEY_FRAME = 60;
                }

                var models = [
                    'https://fastly.jsdelivr.net/gh/Live2D/CubismWebSamples/Samples/Resources/Hiyori/Hiyori.model3.json'
                ];

                var modelIndex = 0;
                var app = null;

                function loadModel(path) {
                    if (app && app.model) {
                        app.model.cleanup();
                        app.model.deleteModel();
                    }

                    // Simple live2d initialization
                    var rect = canvas.getBoundingClientRect();
                    var ratio = Math.min(rect.width / 300, rect.height / 400);

                    window.Live2D.init();

                    var gl = canvas.getContext('webgl', {
                        premultipliedAlpha: true,
                        preserveDrawingBuffer: false
                    });

                    if (!gl) {
                        console.warn('WebGL not supported');
                        return;
                    }

                    // Use pixi-live2d-display if available, otherwise use basic approach
                    loadExternalResource('https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.js', 'js').then(function() {
                        if (typeof PIXI !== 'undefined' && PIXI.live2d) {
                            var model = PIXI.live2d.Model.from(path, {
                                autoInteract: true
                            });
                            model.scale.set(0.25);
                            model.position.set(rect.right - 100, rect.bottom - 150);

                            if (!window.pixiApp) {
                                window.pixiApp = new PIXI.Application({
                                    view: canvas,
                                    width: 300,
                                    height: 400,
                                    transparent: true,
                                    autoDensity: true
                                });
                                window.pixiApp.stage.addChild(model);
                            }

                            // Mouse interaction - eyes follow mouse
                            document.addEventListener('mousemove', function(e) {
                                var centerX = window.innerWidth / 2;
                                var centerY = window.innerHeight / 2;
                                var dx = (e.clientX - centerX) / centerX;
                                var dy = (e.clientY - centerY) / centerY;
                                if (model.viewer) {
                                    model.viewer.setView({ angleX: dx * 10, angleY: dy * 10 });
                                }
                            });

                            window.currentModel = model;
                        }
                    }).catch(function(err) {
                        console.warn('pixi-live2d-display load failed:', err);
                    });
                }

                // Load first model
                loadModel(models[modelIndex]);

                // Toggle button
                var toggleBtn = document.createElement('button');
                toggleBtn.id = 'waifu-toggle';
                toggleBtn.textContent = '看板娘';
                toggleBtn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:10000;background:#ff6b9d;color:#fff;border:none;border-radius:8px;padding:8px 16px;cursor:pointer;font-size:14px;pointer-events:auto;transition:opacity 0.3s;box-shadow:0 2px 8px rgba(255,107,157,0.4);';
                toggleBtn.onclick = function() {
                    var waifuEl = document.getElementById('waifu');
                    if (waifuEl.style.display === 'none') {
                        waifuEl.style.display = 'block';
                        this.textContent = '隐藏';
                    } else {
                        waifuEl.style.display = 'none';
                        this.textContent = '看板娘';
                    }
                };
                document.body.appendChild(toggleBtn);

            }).catch(function(err) {
                console.warn('live2d.min.js load failed:', err);
            });
        }).catch(function(err) {
            console.warn('cubismcore load failed:', err);
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLive2D);
    } else {
        initLive2D();
    }
})();
