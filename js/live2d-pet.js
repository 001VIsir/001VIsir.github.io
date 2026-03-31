/* Live2D 桌宠 - Hiyori 眼睛跟随鼠标 */
(function() {
    var live2d_path = 'https://fastly.jsdelivr.net/npm/live2d-widget@3.1.4/dist/';
    var cubism5Path = 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js';
    var modelUrl = 'https://fastly.jsdelivr.net/gh/Live2D/CubismWebSamples/Samples/Resources/Hiyori/Hiyori.model3.json';

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

    // Create waifu container element
    var waifu = document.createElement('div');
    waifu.id = 'waifu';
    waifu.style.cssText = 'position:fixed;bottom:0;right:0;z-index:9999;pointer-events:none;';
    document.body.appendChild(waifu);

    var canvas = document.createElement('canvas');
    canvas.id = 'live2d-canvas';
    canvas.setAttribute('width', '200');
    canvas.setAttribute('height', '300');
    canvas.style.cssText = 'position:absolute;bottom:0;right:0;width:200px!important;height:300px!important;pointer-events:none;';
    waifu.appendChild(canvas);

    // Load CSS
    loadExternalResource(live2d_path + 'waifu.css', 'css').then(function() {
        // Load Cubism Core
        return loadExternalResource(cubism5Path, 'js');
    }).then(function() {
        // Load Live2D library
        return loadExternalResource(live2d_path + 'live2d.min.js', 'js');
    }).then(function() {
        // Load pixi-live2d-display for Cubism 4 model support
        return loadExternalResource('https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.js', 'js');
    }).then(function() {
        // Initialize after all libs loaded
        initLive2D();
    }).catch(function(err) {
        console.warn('Live2D resource load error:', err);
    });

    function initLive2D() {
        if (typeof Live2D === 'undefined' || typeof PIXI === 'undefined') {
            console.warn('Live2D or PIXI not loaded');
            return;
        }

        Live2D.Cubism2.disable();
        Live2D.Cubism4.enable();

        var app = new PIXI.Application({
            view: canvas,
            width: 200,
            height: 300,
            transparent: true,
            autoDensity: true,
            resolution: window.devicePixelRatio || 1
        });

        PIXI.live2d.Core.internalConfig = PIXI.live2d.Core.internalConfig || {};
        PIXI.live2d.Core.internalConfig.basePath = modelUrl.substring(0, modelUrl.lastIndexOf('/') + 1);

        var model = null;

        try {
            model = PIXI.live2d.Model.from(modelUrl, {
                autoInteract: true,
                motionSync: false
            });
        } catch (e) {
            console.warn('Model load error:', e);
            return;
        }

        model.scale.set(0.18);
        model.position.set(200, 300);
        model.anchor.set(0.5, 1);

        app.stage.addChild(model);

        // Eyes follow mouse
        document.addEventListener('mousemove', function(e) {
            if (!model.internalModel) return;
            var rect = canvas.getBoundingClientRect();
            var relX = (e.clientX - rect.left) / rect.width - 0.5;
            var relY = (e.clientY - rect.top) / rect.height - 0.5;
            var x = relX * 30;
            var y = relY * 15;
            try {
                model.internalModel.coreModel.setParameterValueById(
                    Live2D.Cubism4.Framework.Rendering.CubismModelUserData.MeasureFace("ParamAngleX"),
                    x
                );
                model.internalModel.coreModel.setParameterValueById(
                    Live2D.Cubism4.Framework.Rendering.CubismModelUserData.MeasureFace("ParamAngleY"),
                    y
                );
            } catch (ee) {}
        });

        // Toggle button
        var btn = document.createElement('button');
        btn.id = 'waifu-toggle';
        btn.textContent = '隐藏';
        btn.style.cssText = [
            'position:fixed',
            'bottom:20px',
            'right:20px',
            'z-index:10000',
            'background:#ff6b9d',
            'color:#fff',
            'border:none',
            'border-radius:8px',
            'padding:8px 16px',
            'cursor:pointer',
            'font-size:14px',
            'box-shadow:0 2px 8px rgba(255,107,157,0.4)',
            'pointer-events:auto'
        ].join(';');
        btn.onclick = function() {
            if (waifu.style.display === 'none') {
                waifu.style.display = '';
                btn.textContent = '隐藏';
            } else {
                waifu.style.display = 'none';
                btn.textContent = '看板娘';
            }
        };
        document.body.appendChild(btn);

        window.live2dApp = app;
        window.live2dModel = model;
    }
})();
